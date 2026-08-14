# CLAUDE.md

Este arquivo orienta o Claude Code (claude.ai/code) ao trabalhar neste repositório.

## Visão geral

Site institucional estático + widget de chat com IA da WebKeeper (estúdio de tecnologia
brasileiro). Sem build, sem gerenciador de pacotes, sem framework de testes — HTML/CSS/JS puro
servido pelo XAMPP (Apache + PHP), mais um backend PHP pequeno para o assistente de chat
("Keeper").

## Comandos

- **Rodar localmente**: iniciar o Apache do XAMPP e abrir `http://localhost/wk-webkeepersite/<arquivo>`.
  Não existe dev server nem script npm.
- **Checar sintaxe PHP**: `C:/xampp/php/php.exe -l api/keeper.php` (ou qualquer outro `.php`).
- Não há linter, formatter nem suíte de testes automatizada configurados.

## Arquitetura

### Estrutura das páginas

`index.html` redireciona direto para `WebKeeper.html` (tela de entrada com o widget de chat do
Keeper). De lá, "Entrar no site" leva para `WebKeeper-site.html`, a landing page institucional
completa. `politica-de-privacidade.html` e `termos-de-uso.html` são páginas legais independentes.

### Runtime de template ("dc")

`WebKeeper.html`, `WebKeeper-site.html`, `politica-de-privacidade.html` e `termos-de-uso.html`
seguem todos o mesmo padrão: um bloco `<x-dc>...</x-dc>` com o template HTML, seguido de
`<script type="text/x-dc" data-dc-script>` contendo `class Component extends DCLogic { ... }`
(estilo classe React: `state`, `renderVals()` como equivalente do `render`, métodos de ciclo de
vida). Esse template é interpretado e renderizado no navegador pelo `support.js`.

`support.js` é um bundle **gerado** ("GENERATED from dc-runtime/src/*.ts — do not edit") a partir
de um projeto externo `dc-runtime` que não faz parte deste repositório — tratar como arquivo
vendorizado e não editar manualmente. Sintaxe de template usada nos blocos `<x-dc>`:
interpolação `{{ expr }}`, `<sc-if value="{{ }}">`, `<sc-for list="{{ }}" as="item">`,
`ref="{{ }}"` e props de evento como `onClick="{{ handler }}"`.

`image-slot.js` (`<image-slot>`) e `doc-page.js` (`<doc-page>`) são custom elements copiados de um
scaffold "omelette starter" (também vendorizados — marcados com `@ds-adherence-ignore`, com um
bloco de documentação de uso no topo de cada arquivo). Imagens soltas em `<image-slot>` são
persistidas no sidecar `.image-slots.state.json` pela ferramenta de autoria; fora dessa
ferramenta, o slot é só uma imagem estática via `src`.

### Keeper (assistente de chat com IA)

Dividido em scripts compartilhados para que `WebKeeper.html` e `WebKeeper-site.html` não divirjam
em comportamento:

- **`keeper-config.js`** — fonte única de verdade para o número de WhatsApp, mensagens
  pré-preenchidas por ponto de entrada, o system prompt do assistente, saudações, mensagem de
  erro de fallback e perguntas sugeridas.
- **`keeper-chat.js`** — comportamento compartilhado: converte `[texto](url)`/`**negrito**` em
  segmentos de renderização, remove markdown/emoji que a UI não exibe, registra pares de
  pergunta/resposta no `localStorage` (`keeper_qa_log`) e reinjeta os mais recentes no system
  prompt como exemplos "aprendidos", além de fazer o POST para `api/keeper.php`.
- **`keeper-orb.js` / `keeper-orb.html`** — o visual animado do orbe usado no widget de chat.
- **`api/keeper.php`** — backend. Recebe `{messages, system, max_tokens}`, monta um *subconjunto
  relevante* de `docs/webkeeper-faq.md` como contexto (as perguntas mais pontuadas por
  palavra-chave, não o arquivo inteiro — mandar as 110+ perguntas do FAQ em toda requisição
  estourava o limite de tokens/minuto do Groq), decide de forma determinística um "modo de
  fechamento" (link do WhatsApp / pergunta de volta / apontar pro site / sem CTA) contando quantos
  turnos do assistente já ocorreram, em vez de confiar que o modelo varia sozinho, e então chama a
  API de chat completions da Groq.
- **`api/config.php`** — define `GROQ_API_KEY` e `GROQ_MODEL`. Está no `.gitignore` e não existe
  até ser criado localmente; `api/keeper.php` exige que ele exista.
- **`docs/webkeeper-faq.md`** — base de conhecimento: dados oficiais de contato, a regra de
  contato ("sempre transformar a palavra WhatsApp em link, nunca escrever o número por extenso"),
  a regra de pivô comercial (redirecionar pedidos fora de escopo para um serviço adjacente da
  WebKeeper), temas proibidos e os pares de perguntas frequentes.

### Outros documentos

- `docs/github.md` — log de sincronização com um projeto externo de ferramenta de design (não é
  para manter manualmente; só registra quais seções foram copiadas de onde).
- `docs/prompt-landing-page-webkeeper.md`, `docs/base-conhecimento-benchmark-lp.md`,
  `docs/textos-landing-page-webkeeper.md` — material de copy/referência de marketing, não
  consumido pelo código.
