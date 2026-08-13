<?php
/**
 * api/keeper.php — backend do chat do Keeper (assistente de IA).
 * Recebe POST { messages, system, max_tokens } de WebKeeper.html, monta o
 * contexto a partir de docs/webkeeper-faq.md (base de conhecimento) e
 * repassa para a API da Groq usando a chave em api/config.php (fora do
 * git, ver .gitignore).
 */
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

require __DIR__ . '/config.php';

$body = json_decode(file_get_contents('php://input'), true);
if (!is_array($body) || empty($body['messages']) || !is_array($body['messages'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Requisição inválida']);
    exit;
}

$system = isset($body['system']) ? (string) $body['system'] : '';
$maxTokens = isset($body['max_tokens']) ? min((int) $body['max_tokens'], 512) : 160;

function faqExtractSection(string $md, string $heading): string {
    if (preg_match('/^## ' . preg_quote($heading, '/') . '\s*\n(.*?)(?=\n## |\z)/ms', $md, $m)) {
        return trim($m[1]);
    }
    return '';
}

function faqExtractQaPairs(string $md): array {
    $md = preg_replace('/## Log de perguntas.*/s', '', $md);
    preg_match_all('/\*\*(.+?)\*\*\n(.+?)(?=\n\*\*|\n#|\z)/s', $md, $matches, PREG_SET_ORDER);
    $pairs = [];
    foreach ($matches as $m) {
        $a = trim($m[2]);
        if ($a === '') continue;
        $pairs[] = ['q' => trim($m[1]), 'a' => $a];
    }
    return $pairs;
}

function faqNormalizeWords(string $text): array {
    $text = mb_strtolower($text, 'UTF-8');
    $text = preg_replace('/[^\p{L}\p{N}\s]/u', ' ', $text);
    return array_values(array_filter(preg_split('/\s+/', $text)));
}

// Só envia ao modelo as perguntas do FAQ relevantes para a mensagem atual — mandar o
// arquivo inteiro (110+ perguntas) em toda requisição estourava o limite de tokens/minuto do Groq.
function faqBuildContext(string $faqPath, string $lastUserMessage): string {
    if (!is_readable($faqPath)) return '';
    $md = file_get_contents($faqPath);

    $always = [];
    foreach (['Dados de contato oficiais', 'Regra de contato (aplicar sempre)', 'Regra de pivô comercial (aplicar sempre que a pergunta for "fora do escopo")', 'O que o Keeper NUNCA deve responder'] as $heading) {
        $sec = faqExtractSection($md, $heading);
        if ($sec !== '') $always[] = "## $heading\n$sec";
    }

    $pairs = faqExtractQaPairs($md);
    $queryWords = faqNormalizeWords($lastUserMessage);
    foreach ($pairs as &$p) {
        $entryWords = faqNormalizeWords($p['q'] . ' ' . $p['a']);
        $score = 0;
        foreach ($queryWords as $w) {
            if (mb_strlen($w) < 3) continue;
            if (in_array($w, $entryWords, true)) $score++;
        }
        $p['score'] = $score;
    }
    unset($p);
    usort($pairs, fn($a, $b) => $b['score'] <=> $a['score']);
    $top = array_filter(array_slice($pairs, 0, 8), fn($p) => $p['score'] > 0);
    if (!$top) $top = array_slice($pairs, 0, 4);
    $qaText = implode("\n\n", array_map(fn($p) => '**' . $p['q'] . "**\n" . $p['a'], $top));

    return implode("\n\n", $always) . "\n\n## Perguntas relacionadas\n" . $qaText;
}

$lastUserMessage = '';
foreach (array_reverse($body['messages']) as $m) {
    if (($m['role'] ?? '') !== 'assistant') { $lastUserMessage = (string) ($m['content'] ?? ''); break; }
}
$faqContext = faqBuildContext(__DIR__ . '/../docs/webkeeper-faq.md', $lastUserMessage);
if ($faqContext !== '') {
    $system .= "\n\nBASE DE CONHECIMENTO (fatos de referência — use apenas o que for relevante, nunca cite este cabeçalho nem mencione que é um arquivo, e NUNCA copie estas frases literalmente: reescreva com suas próprias palavras):\n" . $faqContext;
}

// Rotação determinística do fechamento: em vez de confiar só na IA pra "lembrar" de variar
// (o que falhou nos testes — ela sempre puxava pro WhatsApp), o backend decide por código
// qual tipo de fechamento usar nesta resposta específica, alternando com base em quantas
// respostas do assistente já existem na conversa. Independe de sessão/cookie.
$assistantTurns = 0;
foreach ($body['messages'] as $m) {
    if (($m['role'] ?? '') === 'assistant') $assistantTurns++;
}
$closingModes = [
    'whatsapp' => 'Feche esta resposta puxando o usuário pro WhatsApp — inclua o link embutido naturalmente na frase, transformando a palavra "WhatsApp" no link (ex.: "fale conosco pelo [WhatsApp](https://wa.me/5543999446606)").',
    'pergunta' => 'Feche esta resposta SEM nenhum link de WhatsApp — em vez disso, devolva ao usuário uma pergunta curta e específica pra entender melhor a necessidade ou o negócio dele.',
    'site'     => 'Feche esta resposta sugerindo conhecer o site completo da WebKeeper pra ver mais detalhes, cases e serviços — sem mencionar WhatsApp nem incluir link nesta resposta.',
    'direto'   => 'Não feche com nenhum convite, pergunta ou link desta vez — apenas responda de forma direta e completa, sem CTA no final.',
];
$modeKeys = array_keys($closingModes);
if ($assistantTurns === 0) {
    $firstTurnOptions = ['whatsapp', 'pergunta', 'site'];
    $mode = $firstTurnOptions[array_rand($firstTurnOptions)];
} else {
    $mode = $modeKeys[$assistantTurns % count($modeKeys)];
}
$system .= "\n\nINSTRUÇÃO DE FECHAMENTO PARA ESTA RESPOSTA (obrigatória, tem prioridade sobre qualquer exemplo do FAQ ou do prompt principal — exceto se esta resposta for uma recusa por segurança/regra de nunca-responder, aí ignore esta instrução e apenas recuse normalmente): " . $closingModes[$mode];

$messages = [];
if ($system !== '') {
    $messages[] = ['role' => 'system', 'content' => $system];
}
foreach (array_slice($body['messages'], -20) as $m) {
    if (!isset($m['role'], $m['content'])) continue;
    $role = $m['role'] === 'assistant' ? 'assistant' : 'user';
    $messages[] = ['role' => $role, 'content' => (string) substr($m['content'], 0, 4000)];
}

if (count($messages) === (int) ($system !== '')) {
    http_response_code(400);
    echo json_encode(['error' => 'Nenhuma mensagem válida']);
    exit;
}

$payload = json_encode([
    'model' => GROQ_MODEL,
    'messages' => $messages,
    'max_tokens' => $maxTokens,
    'temperature' => 0.7,
]);

$ch = curl_init('https://api.groq.com/openai/v1/chat/completions');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Authorization: Bearer ' . GROQ_API_KEY,
    ],
    CURLOPT_POSTFIELDS => $payload,
    CURLOPT_TIMEOUT => 25,
]);
$response = curl_exec($ch);
$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($response === false) {
    http_response_code(502);
    echo json_encode(['error' => 'Falha ao conectar à API: ' . $curlError]);
    exit;
}

$data = json_decode($response, true);

if ($status < 200 || $status >= 300) {
    http_response_code(502);
    echo json_encode(['error' => $data['error']['message'] ?? 'Erro na API do Groq']);
    exit;
}

$reply = $data['choices'][0]['message']['content'] ?? null;
if ($reply === null) {
    http_response_code(502);
    echo json_encode(['error' => 'Resposta vazia da API']);
    exit;
}

echo json_encode(['reply' => $reply]);
