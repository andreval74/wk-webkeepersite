# Design: unificar o chat do Keeper e remover o módulo de voz

## Contexto

Hoje existem dois chats do Keeper implementados de forma independente e divergente:

- **`WebKeeper.html`** (página de abertura) — chat centralizado no orbe grande. Sugestões de
  pergunta são uma lista fixa de 6 strings (`KeeperConfig.SUGGESTED_QUESTIONS`), sempre visíveis,
  que não mudam conforme a conversa. Sem módulo de voz.
- **`WebKeeper-site.html`** (dentro do site) — widget flutuante no canto inferior direito.
  Sugestões são dinâmicas: uma função local (`pickFollowUps`, dentro do `class Component`) pontua
  um pool local (`this.replyPool`, 8 itens `{label, kw}`) contra a última resposta do Keeper e
  mostra as 3 melhores, evitando repetir o que já foi perguntado. Tem módulo de voz ativo
  (`speechSynthesis`): fala a saudação e cada resposta, com botão de mudo/áudio no cabeçalho do
  widget — apesar de já se acreditar que a voz estava desativada em todas as telas.

## Objetivo

1. A página de abertura passa a sugerir perguntas de forma dinâmica/contextual, igual ao widget
   do site.
2. As duas páginas passam a ler a mesma lista de sugestões e usar a mesma função para escolhê-las
   — uma única fonte de verdade para "o que sugerir e como escolher", em vez de duas
   implementações divergentes.
3. O módulo de voz é removido por completo do código (não só desligado).

## Não-objetivos

- Não muda o layout do orbe da página de abertura (continua centralizado, como hoje).
- Não muda o prompt do Keeper, o backend PHP (`api/keeper.php`) nem a base de conhecimento
  (`docs/webkeeper-faq.md`).
- Não muda o visual/posição do widget do site.
- Não unifica o *estado* interno dos dois componentes (nomes de variáveis, fluxo de
  `setState`) — cada página mantém seu próprio estado; só a lógica de sugestão é compartilhada
  (abordagem A, ver alternativas abaixo).

## Bug pré-existente encontrado: sugestões invisíveis no desktop

Ao validar o design, descobrimos que em `WebKeeper.html` a fileira de sugestões
(`.keeper-chip-row`) já vem com `display: none` por padrão em `styles.css`, e só é ligada
(`display: flex`) dentro de `@media (max-width: 900px)` — ou seja, hoje as sugestões só aparecem
em telas mobile/tablet; em desktop elas nunca foram exibidas (a saudação e o orbe aparecem
normalmente, só a fileira de chips fica escondida). O widget do site (`WebKeeper-site.html`) não
tem essa restrição — suas sugestões (`chatQuickReplies`) já aparecem em qualquer tamanho de tela.

Requisito confirmado pelo usuário: a partir desta mudança, as sugestões da página de abertura
devem aparecer em **desktop e mobile**, não só mobile. Isso entra no escopo deste trabalho:

- Remove a restrição `display: none` padrão de `.keeper-chip-row` (fica visível em qualquer
  largura de tela).
- A mesma media query de 900px hoje também trava a altura da página
  (`.keeper-page { height: 100vh }`) e liga rolagem interna (`.keeper-main { overflow-y: auto }`)
  especificamente para abrir espaço para os chips no mobile — a base desktop usa
  `overflow: hidden` fixo, dimensionada sem contar com a fileira de chips. Ao tornar os chips
  permanentes, o mesmo ajuste de rolagem/altura precisa se aplicar também no desktop, senão o
  conteúdo pode ficar cortado (não é mais um comportamento exclusivo do breakpoint mobile).

## Alternativas consideradas

- **B — unificar também o estado**: renomear variáveis de estado das duas páginas para serem
  idênticas e extrair a função de enviar mensagem para um helper único. Rejeitada por ora: mexeria
  em ~1500 linhas do `WebKeeper-site.html` que já funcionam, para um ganho que não muda o
  comportamento percebido pelo usuário.
- **C — copiar sem compartilhar**: replicar a lógica dinâmica de sugestão dentro do
  `WebKeeper.html` sem tocar nos arquivos compartilhados. Rejeitada: mantém duas cópias divergentes
  da mesma lógica, o que é exatamente o problema que este design resolve.

## Mudanças por arquivo

### `keeper-config.js`
Substitui `SUGGESTED_QUESTIONS` (6 strings) e o `replyPool` local do site (8 itens `{label, kw}`)
por uma lista única: `KeeperConfig.SUGGESTIONS`, com os 8 itens `{label, kw}` que já existem hoje
no site (mais completos, com palavras-chave por tema: serviços, processo, preço, contato,
parceria/equity, diagnóstico gratuito, modelo SaaS, região atendida).

### `keeper-chat.js`
Adiciona `KeeperChat.pickSuggestions(pool, lastReplyText, askedLabels, count)`: função pura,
generalizada a partir do `pickFollowUps` que hoje só existe dentro do `WebKeeper-site.html`.
Pontua cada item do pool por palavras-chave presentes na última resposta, prioriza os que batem,
completa até `count` com o restante do pool (na ordem em que aparece), e nunca repete um `label`
já presente em `askedLabels`.

### `WebKeeper.html`
- Troca a linha fixa de 6 chips por `KeeperChat.pickSuggestions(KeeperConfig.SUGGESTIONS,
  <texto da última resposta>, <perguntas já feitas>, 3)`, recalculada a cada resposta — mesmo
  padrão de exibição usado no site (3 sugestões, dinâmicas).
- O autocomplete fantasma do campo de texto (Tab-complete) passa a casar com essas sugestões
  dinâmicas em vez da lista fixa antiga.
- Orbe, estados de humor (idle/surpreso/pensando), animação de burst e todo o resto do visual
  continuam inalterados.
- CSS: `.keeper-chip-row` deixa de ter `display: none` como padrão, e o ajuste de altura/rolagem
  que hoje só existe em `@media (max-width: 900px)` passa a valer também no desktop (ver seção
  "Bug pré-existente" acima).

### `WebKeeper-site.html`
- Troca `this.replyPool` / `pickFollowUps` locais pela config e função compartilhadas
  (`KeeperConfig.SUGGESTIONS` / `KeeperChat.pickSuggestions`) — mesmo resultado visual, fonte
  única de dados e lógica.
- Remove por completo o módulo de voz:
  - Estado: `voiceEnabled`, `voices`, `selectedVoiceURI`.
  - Métodos: `toggleVoice()`, `pickVoice()`, `speak()` (e o `speakNext` interno).
  - Chamada a `loadVoices()` / `window.speechSynthesis.onvoiceschanged` no `componentDidMount`.
  - Chamadas a `this.speak(...)` após saudação/resposta/fallback em `toggleChat()` e `sendChat()`.
  - `window.speechSynthesis.cancel()` em `toggleChat()` e `componentWillUnmount()`.
  - Bloco do botão de mudo/áudio no cabeçalho do widget (`<button onClick="{{ toggleVoice }}">`)
    e seus dois ícones SVG.
  - Bindings correspondentes em `renderVals()` (`voiceEnabled`, `toggleVoice`, `voiceLabel`,
    `voiceColor`).

## Comportamento esperado após a mudança

- Abrir `WebKeeper.html`: aparecem 3 sugestões iniciais (as primeiras do pool, já que ainda não
  há resposta para pontuar contra). Ao perguntar algo, as sugestões seguintes mudam conforme o
  conteúdo da resposta recebida, sem repetir o que já foi perguntado.
- Abrir `WebKeeper-site.html`: mesmo comportamento de sugestões de antes (sem mudança visível),
  porém sem nenhum áudio, sem botão de mudo/áudio no cabeçalho do widget.

## Verificação

Não há suíte de testes automatizada neste projeto (site estático + PHP, sem build). Verificação
é manual via XAMPP:
1. `C:/xampp/php/php.exe -l api/keeper.php` — garantir que o backend PHP não foi tocado e continua
   válido (não deve ser necessário, já que este design não mexe em `api/`).
2. Abrir `http://localhost/wk-webkeepersite/WebKeeper.html`: enviar 2–3 perguntas, confirmar que
   as sugestões mudam conforme a resposta e que o autocomplete fantasma continua funcionando —
   testar em viewport desktop (>900px) e mobile (<900px), confirmando que a fileira de sugestões
   aparece e nada fica cortado/sem rolagem nos dois casos.
3. Abrir `http://localhost/wk-webkeepersite/WebKeeper-site.html`: abrir o widget, confirmar mesmo
   comportamento de sugestões, confirmar ausência total de áudio e do botão de voz no cabeçalho.
4. Checar o console do navegador nas duas páginas em busca de erros (ex.: referência a
   `KeeperConfig.SUGGESTED_QUESTIONS` ou `this.replyPool` esquecida em algum lugar).

## Riscos

- Baixo: a mudança de dados (`SUGGESTED_QUESTIONS` → `SUGGESTIONS`) é um rename dentro de um
  objeto de config consumido só por estes dois arquivos HTML, ambos editados neste mesmo trabalho.
- Remoção do módulo de voz é uma remoção pura de código (sem substituição), risco de deixar uma
  referência solta é mitigado pela checagem de console no passo de verificação.
