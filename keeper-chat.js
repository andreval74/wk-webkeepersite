// Keeper Chat — script compartilhado (comportamento do chat do Keeper).
// Usado em: WebKeeper.html e WebKeeper-site.html.
// Junto com keeper-config.js, evita duplicar a lógica de enviar mensagem,
// interpretar links/negrito na resposta e guardar o histórico de perguntas.
// Cada página mantém sua própria apresentação visual (cores, tamanhos) — este
// arquivo só cuida do comportamento, não do estilo.

(function () {

  var LINK_RE = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  var QA_LOG_KEY = 'keeper_qa_log';

  // Formato neutro de segmento: {text, href, isLink, bold}. Cada página mapeia
  // esse formato para o estilo visual que quiser (cores diferentes por página).
  function parseSegments(text) {
    var chunks = [];
    var lastIndex = 0, m;
    LINK_RE.lastIndex = 0;
    while ((m = LINK_RE.exec(text)) !== null) {
      if (m.index > lastIndex) chunks.push({ raw: text.slice(lastIndex, m.index) });
      chunks.push({ label: m[1], href: m[2] });
      lastIndex = m.index + m[0].length;
    }
    if (lastIndex < text.length) chunks.push({ raw: text.slice(lastIndex) });

    var segments = [];
    chunks.forEach(function (c) {
      if (c.href) {
        segments.push({ text: c.label, href: c.href, isLink: true, bold: false });
      } else {
        c.raw.split(/\*\*(.+?)\*\*/g).forEach(function (t, i) {
          segments.push({ text: t, isLink: false, bold: i % 2 === 1 });
        });
      }
    });
    return segments;
  }

  // Limpeza aplicada à resposta crua do modelo antes de exibir: remove
  // formatação markdown que a UI não renderiza (títulos, listas, crase),
  // asteriscos soltos (mantém só **negrito**) e emojis.
  function postProcessReply(raw) {
    return raw
      .replace(/^#+\s*/gm, '')
      .replace(/^[-*]\s+/gm, '')
      .replace(/`/g, '')
      .replace(/(?<!\*)\*(?!\*)/g, '')
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
      .trim();
  }

  function logQA(question, answer, src) {
    try {
      var log = JSON.parse(localStorage.getItem(QA_LOG_KEY) || '[]');
      var entry = { q: question, a: answer, t: new Date().toISOString() };
      if (src) entry.src = src;
      log.push(entry);
      localStorage.setItem(QA_LOG_KEY, JSON.stringify(log.slice(-200)));
    } catch (e) {}
  }

  // A cada novo visitante/sessão, o Keeper relê o próprio histórico acumulado
  // (deste navegador, das duas interfaces) e injeta os padrões aprendidos
  // direto no prompt que consulta.
  function buildSystemPromptWithMemory(basePrompt) {
    try {
      var log = JSON.parse(localStorage.getItem(QA_LOG_KEY) || '[]');
      if (!log.length) return basePrompt;
      var uniq = [];
      var seen = {};
      for (var i = log.length - 1; i >= 0 && uniq.length < 6; i--) {
        var key = log[i].q.trim().toLowerCase();
        if (seen[key]) continue;
        seen[key] = true;
        uniq.push(log[i]);
      }
      var learned = uniq.reverse().map(function (e) {
        return '- P: ' + e.q + '\n  R aprovada: ' + e.a.replace(/\n+/g, ' ');
      }).join('\n');
      return basePrompt + '\n\nAPRENDIZADO DE CONVERSAS ANTERIORES (use como referência de padrão de resposta; não repita literalmente, adapte ao contexto atual):\n' + learned;
    } catch (e) {
      return basePrompt;
    }
  }

  async function send(opts) {
    var res = await fetch('./api/keeper.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ system: opts.system, messages: opts.apiMessages, max_tokens: opts.maxTokens || 160 })
    });
    var data = await res.json();
    if (!res.ok || !data.reply) throw new Error(data.error || 'Falha na resposta');
    return { reply: postProcessReply(data.reply) };
  }

  window.KeeperChat = {
    parseSegments: parseSegments,
    postProcessReply: postProcessReply,
    logQA: logQA,
    buildSystemPromptWithMemory: buildSystemPromptWithMemory,
    send: send
  };

})();
