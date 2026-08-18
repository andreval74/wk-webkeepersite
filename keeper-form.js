// Keeper Form — lógica do único formulário de contato/orçamento do sistema.
// Usado em: WebKeeper-site.html, na seção #investimento-form (é o único
// formulário do site — WebKeeper.html não tem formulário embutido; quando o
// Keeper precisa oferecer o formulário, ele linka pra essa seção, ver REGRA
// DO FORMULÁRIO em keeper-config.js).
// Fonte única de verdade para: opções de nicho, formatação de WhatsApp,
// validação e envio via Web3Forms.

(function () {

  var WEB3FORMS_KEY = 'a36da754-961e-40ab-920d-af3545dede05';

  var NICHO_OPTIONS = ['Odontologia', 'Estética e Beleza', 'Moda e Vestuário', 'Advocacia', 'Saúde e Clínicas', 'Educação', 'Imobiliário', 'Alimentação e Restaurantes', 'Varejo e E-commerce', 'Serviços Profissionais', 'Indústria', 'Outro'];

  function emptyForm() {
    return { empresa: '', nicho: '', site: '', instagram: '', responsavel: '', whatsapp: '', mensagem: '', consent: false };
  }

  function formatWhatsapp(raw) {
    var digits = (raw || '').replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return '(' + digits.slice(0, 2) + ') ' + digits.slice(2);
    if (digits.length <= 10) return '(' + digits.slice(0, 2) + ') ' + digits.slice(2, 6) + '-' + digits.slice(6);
    return '(' + digits.slice(0, 2) + ') ' + digits.slice(2, 7) + '-' + digits.slice(7);
  }

  function isValidSite(value) {
    var v = (value || '').trim();
    if (!v) return true;
    return /^https?:\/\/.+/.test(v) || /^[\w.-]+\.[a-z]{2,}/i.test(v);
  }

  function isValidInstagram(value) {
    var v = (value || '').trim();
    if (!v) return true;
    return v.replace(/^@/, '').length > 1;
  }

  function validate(f) {
    if (!String(f.empresa || '').trim()) return 'Informe o nome da empresa.';
    if (!String(f.responsavel || '').trim()) return 'Informe seu nome.';
    var waDigits = (f.whatsapp || '').replace(/\D/g, '');
    if (waDigits.length < 10 || waDigits.length > 11) return 'Informe um WhatsApp válido, com DDD.';
    if (f.site && !isValidSite(f.site)) return 'Informe um site (https://...) válido, ou deixe em branco.';
    if (f.instagram && !isValidInstagram(f.instagram)) return 'Informe um usuário do Instagram (@usuario) válido, ou deixe em branco.';
    if (!f.consent) return 'É necessário autorizar a análise das informações e o contato para continuar.';
    return '';
  }

  // Envia pro Web3Forms; segue para a confirmação mesmo em falha de rede (o
  // mesmo comportamento que já existia no formulário do site).
  async function submit(f) {
    try {
      var payload = {
        access_key: WEB3FORMS_KEY,
        subject: 'Novo contato pelo site WebKeeper',
        from_name: 'Site WebKeeper',
        empresa: f.empresa,
        site: f.site || '',
        responsavel: f.responsavel,
        whatsapp: f.whatsapp,
        mensagem: f.mensagem
      };

      if (f.nicho) payload.nicho = f.nicho;
      if (f.instagram) payload.instagram = f.instagram;

      await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) { /* segue para a tela de confirmação mesmo em falha de rede */ }
  }

  window.KeeperForm = {
    NICHO_OPTIONS: NICHO_OPTIONS,
    emptyForm: emptyForm,
    formatWhatsapp: formatWhatsapp,
    validate: validate,
    submit: submit
  };

})();
