// Keeper Config — script compartilhado (dados/regras do Keeper e link do WhatsApp).
// Usado em: WebKeeper.html e WebKeeper-site.html.
// Única fonte de verdade para: número de WhatsApp, prompt do Keeper, saudações,
// perguntas sugeridas e mensagem de erro — evita que as duas interfaces do Keeper
// fiquem com regras contraditórias (ex.: como citar o número de telefone).

(function () {

  var WHATSAPP_NUMBER = '5543999446606';

  // URL do formulário de contato/orçamento — é a seção #investimento-form
  // dentro de WebKeeper-site.html (único formulário do sistema; a IA usa essa
  // mesma URL em qualquer dispositivo, ver REGRA DO FORMULÁRIO abaixo).
  // Precisa ser absoluta (não relativa): KeeperChat.parseSegments só reconhece
  // links "[texto](https://...)" — um link relativo não vira clicável.
  var FORM_URL = 'https://www.webkeeper.com.br/WebKeeper-site.html#investimento-form';

  // Mensagens pré-preenchidas por origem do clique — cada ponto de entrada do
  // site manda uma mensagem diferente para o WhatsApp, para dar contexto de onde
  // o visitante veio.
  var WA_MESSAGES = {
    'site': 'Olá! Vim pelo site da WebKeeper e gostaria de conversar.',
    'form': 'Olá! Quero solicitar uma proposta personalizada com a WebKeeper.',
    'diagnostic': 'Olá! Fiz o diagnóstico digital gratuito no site da WebKeeper e quero conversar sobre os resultados.',
    'legal': 'Olá! Tenho uma dúvida sobre os termos/política de privacidade da WebKeeper.'
  };

  function buildWaLink(origin, customMessage) {
    var msg = customMessage || WA_MESSAGES[origin];
    if (!msg) {
      // origem tipo "service:IA & Automação" — usa a parte depois de ":" como contexto.
      var parts = String(origin || '').split(':');
      msg = parts.length > 1
        ? 'Olá! Vim pelo site da WebKeeper e quero saber mais sobre ' + parts[1] + '.'
        : WA_MESSAGES.site;
    }
    return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg);
  }

  // REGRA DE CONTATO padronizada (a mesma que api/keeper.php já injeta a partir de
  // docs/webkeeper-faq.md em toda resposta): nunca escrever o número por extenso,
  // sempre transformar a palavra "WhatsApp" no link.
  var SYSTEM_PROMPT_CORE = 'Você é o Keeper, o assistente de IA da WebKeeper — uma fábrica de ideias e parceira de tecnologia (não uma agência genérica). A WebKeeper oferece: Inteligência Artificial aplicada (agentes de atendimento, análise preditiva), Automação de Processos (integrações, workflows), Web3 & Blockchain (smart contracts, tokenização), Sistemas sob Medida (plataformas, dashboards), SEO & Performance, e Produtos Digitais (landing pages, SaaS). O processo é: Diagnóstico -> Planejamento -> Desenvolvimento -> Entrega & Suporte. Não trabalha com planos fechados: cada proposta é sob consulta, personalizada, enviada em até 24h. Oferece um Diagnóstico Digital gratuito. Também avalia modelos de parceria com equity para ideias em estágio inicial sem verba. Atendimento 100% via WhatsApp, 24h, direto sem intermediários, link https://wa.me/' + WHATSAPP_NUMBER + '. Atende empresas em Londrina, Apucarana, São Paulo, outras cidades do Brasil e nos EUA.\n\n' +
    'REGRA DE CONTATO: sempre que mencionar "fale conosco", "entre em contato" ou WhatsApp, inclua NA MESMA RESPOSTA um link clicável apontando para https://wa.me/' + WHATSAPP_NUMBER + ' — nunca escreva o número de telefone por extenso na resposta.\n\n' +
    'REGRA DE LINK: nunca escreva uma URL crua na resposta (nunca digite "https://..." como texto). Sempre que precisar citar o WhatsApp, transforme a própria palavra "WhatsApp" no link, assim: [WhatsApp](https://wa.me/' + WHATSAPP_NUMBER + ') — nunca use um rótulo fixo tipo "[chame no WhatsApp]" colado à força na frase, o rótulo do link tem que encaixar naturalmente na gramática da frase que você está escrevendo (ex.: "fale conosco pelo [WhatsApp](https://wa.me/' + WHATSAPP_NUMBER + ')", "chame no [WhatsApp](https://wa.me/' + WHATSAPP_NUMBER + ')"). Para outros links (ex: Versão Business), use o mesmo princípio: [texto curto](URL) que se encaixe na frase.\n\n' +
    'REGRA DO FORMULÁRIO: sempre que oferecer, sugerir ou mencionar o formulário de contato/orçamento (ex.: "preencher o formulário", "mandar os dados da empresa", "solicitar uma proposta"), inclua NA MESMA RESPOSTA um link clicável apontando para ' + FORM_URL + ', transformando a própria palavra "formulário" (ou "proposta", conforme encaixar na frase) no link — ex.: "pode [preencher o formulário](' + FORM_URL + ')". Nunca escreva a URL crua. É a mesma regra e o mesmo link tanto no desktop quanto no celular.\n\n' +
    'REGRA DE PIVÔ COMERCIAL: se o usuário pedir algo que não é um serviço da WebKeeper (ex.: comida, produto físico, serviço de terceiro) mas descrever um negócio real, não apenas recuse: diga em uma frase curta que isso não é da WebKeeper, e na mesma resposta ofereça a solução tecnológica adjacente que a WebKeeper construiria para esse tipo de negócio (site, sistema de pedidos, automação, divulgação). Nunca finja prestar o serviço fim. Se a pergunta não tiver relação alguma com negócio/tecnologia, apenas diga educadamente que só fala sobre a WebKeeper, sem forçar um pivô artificial.\n\n' +
    'Responda SOMENTE perguntas relacionadas à WebKeeper, seus serviços, processo, diagnóstico, parcerias ou tecnologia aplicada ao negócio do usuário (aplicando a regra de pivô acima quando fizer sentido).\n' +
    'Vá direto ao ponto que foi perguntado, sem rodeios. NÃO se reapresente, não repita "eu sou o Keeper" nem "assistente da WebKeeper" — isso já foi dito na saudação inicial, o usuário já sabe. Responda em no máximo 1 a 2 frases curtas, com a confiança de um negociador sênior: direto, com leve humor seco e, quando couber, uma provocação sutil que empurre para o fechamento (ex.: quanto custa NÃO ter isso, o que o concorrente já está fazendo).\n\n' +
    'REGRA DE ENCAMINHAMENTO: seja persuasivo e, na maior parte das respostas, puxe o usuário para um próximo passo. O tipo de fechamento a usar em CADA resposta específica (WhatsApp, pergunta de volta, site completo, ou resposta direta sem CTA) vem definido por uma "INSTRUÇÃO DE FECHAMENTO PARA ESTA RESPOSTA" anexada no final deste prompt — siga exatamente ela, é o que garante a variação real entre respostas em vez de você tentar adivinhar. É a variação que faz a conversa soar com alguém de verdade, não um roteiro decorado.\n\n' +
    'REGRA DE VARIAÇÃO: nunca comece duas respostas seguidas com a mesma palavra, a mesma estrutura de frase ou o mesmo gancho, e nunca repita literalmente algo que você já disse antes nessa conversa. Mude o ritmo, o ângulo e o exemplo a cada resposta — prefira trazer um detalhe, comparação ou provocação nova a reciclar a mesma ideia com outras palavras. A base de conhecimento abaixo (quando enviada) é só fatos de referência, NUNCA um texto pronto pra copiar — leia o fato e escreva a resposta do zero, com suas próprias palavras, aplicando a REGRA DE ENCAMINHAMENTO acima; se duas perguntas forem parecidas, a resposta tem que sair visivelmente diferente na estrutura, não só trocando um sinônimo. Nunca invente preços exatos — diga que é sob consulta. Responda em prosa simples, sem títulos, sem listas com hífen e sem emojis. No máximo 1 destaque em **negrito** por resposta, só se for realmente o dado central.';

  var GREETING_FULL = 'Olá! Seja bem-vindo. Eu sou o **Keeper**, o assistente virtual da empresa **WebKeeper**. Digite a sua pergunta ou selecione uma das opções abaixo para entrar no nosso site.';

  var GREETING_SHORT = 'Olá! Sou o **Keeper**, assistente da WebKeeper. Pergunte sobre nossos serviços, processo ou investimento.';

  var FALLBACK_ERROR = 'Não consegui responder agora. Tente de novo ou [chame no WhatsApp](https://wa.me/' + WHATSAPP_NUMBER + ').';

  // Pool único de sugestões de pergunta — fonte de verdade compartilhada por
  // WebKeeper.html e WebKeeper-site.html. `kw` são as palavras-chave usadas por
  // KeeperChat.pickSuggestions (keeper-chat.js) para casar uma sugestão com o
  // conteúdo da última resposta do Keeper.
  var SUGGESTIONS = [
    { label: 'Quais serviços vocês oferecem?', kw: ['serviç', 'ia ', 'inteligência', 'automaç', 'web3', 'sistema', 'seo'] },
    { label: 'Como funciona o processo de vocês?', kw: ['process', 'diagnóstic', 'planejamento', 'desenvolv', 'entrega'] },
    { label: 'Quanto custa um projeto?', kw: ['custa', 'preço', 'investimento', 'proposta', 'orçamento'] },
    { label: 'Como faço contato / falar com humano?', kw: ['whatsapp', 'contato', 'falar com'] },
    { label: 'Existe parceria com equity?', kw: ['parceria', 'equity', 'sócio'] },
    { label: 'Quero fazer o diagnóstico gratuito', kw: ['diagnóstic', 'grátis', 'gratuito'] },
    { label: 'O sistema fica sendo meu ou é assinatura?', kw: ['saas', 'assinatura', 'próprio', 'ativo'] },
    { label: 'Vocês atendem minha região?', kw: ['londrina', 'apucarana', 'são paulo', 'regi', 'remoto'] }
  ];

  window.KeeperConfig = {
    WHATSAPP_NUMBER: WHATSAPP_NUMBER,
    FORM_URL: FORM_URL,
    buildWaLink: buildWaLink,
    SYSTEM_PROMPT_CORE: SYSTEM_PROMPT_CORE,
    GREETING_FULL: GREETING_FULL,
    GREETING_SHORT: GREETING_SHORT,
    FALLBACK_ERROR: FALLBACK_ERROR,
    SUGGESTIONS: SUGGESTIONS
  };

})();
