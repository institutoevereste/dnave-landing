// DNAVE — landing page. Sem dependências.
(function () {
  "use strict";

  // ---------- Menu do celular ----------
  var botaoMenu = document.querySelector(".topo__menu");
  var menu = document.getElementById("menu");
  function fechaMenu(devolveFoco) {
    menu.classList.remove("aberto");
    botaoMenu.setAttribute("aria-expanded", "false");
    botaoMenu.querySelector(".sr").textContent = "Abrir menu";
    botaoMenu.querySelector("use").setAttribute("href", "#i-menu");
    if (devolveFoco) botaoMenu.focus();
  }
  botaoMenu.addEventListener("click", function () {
    var abrir = botaoMenu.getAttribute("aria-expanded") !== "true";
    if (!abrir) return fechaMenu(false);
    menu.classList.add("aberto");
    botaoMenu.setAttribute("aria-expanded", "true");
    botaoMenu.querySelector(".sr").textContent = "Fechar menu";
    botaoMenu.querySelector("use").setAttribute("href", "#i-fechar");
    menu.querySelector("a").focus();
  });
  menu.addEventListener("click", function (e) {
    if (e.target.closest("a") && menu.classList.contains("aberto")) fechaMenu(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menu.classList.contains("aberto")) fechaMenu(true);
  });
  window.matchMedia("(min-width: 1100px)").addEventListener("change", function (m) {
    if (m.matches) fechaMenu(false);
  });

  // Borda do topo depois de rolar.
  var topo = document.getElementById("topo");
  function marcaRolagem() { topo.classList.toggle("rolou", window.scrollY > 8); }
  window.addEventListener("scroll", marcaRolagem, { passive: true });
  marcaRolagem();

  // ---------- Vídeo de lançamento ----------
  var video = document.getElementById("filme");
  var figura = video.closest(".filme");
  var botaoSom = figura.querySelector(".filme__som");
  var celular = window.matchMedia("(max-width: 767px)");
  var formatoAtual = null;

  function escolheFormato() {
    var alto = celular.matches;
    var formato = alto ? "alto" : "largo";
    if (formato === formatoAtual) return;
    // Quem já está assistindo com som não perde o vídeo: a troca só acontece
    // antes de começar, com o vídeo pausado ou na prévia sem som (mantendo o ponto).
    var tocando = !video.paused && video.currentTime > 0;
    if (formatoAtual && tocando && !video.muted) return;
    formatoAtual = formato;
    figura.classList.toggle("alto", alto);
    video.poster = video.dataset[alto ? "posterAlto" : "posterLargo"];
    var src = video.dataset[alto ? "srcAlto" : "srcLargo"];
    var source = video.querySelector("source");
    if (source.getAttribute("src") !== src) {
      var ponto = video.currentTime;
      source.setAttribute("src", src);
      video.load();
      if (ponto > 0) {
        video.addEventListener("loadedmetadata", function () { video.currentTime = ponto; }, { once: true });
      }
      if (tocando) video.play().catch(function () {});
    }
  }
  escolheFormato();
  celular.addEventListener("change", escolheFormato);

  // Legenda: o <track> funciona quando a página está num servidor. Aberta direto do disco
  // (file://), o navegador bloqueia o .vtt; aí as falas entram pelo legenda.js.
  // Sem <track> (versão publicada como Artifact, que não serve .vtt), idem.
  function legendaPorScript() {
    var cues = window.DNAVE_LEGENDA;
    if (!cues || typeof VTTCue === "undefined" || video.dataset.legenda === "script") return;
    video.dataset.legenda = "script";
    var tag = video.querySelector("track");
    if (tag) tag.remove();
    var faixa = video.addTextTrack("captions", "Português", "pt-BR");
    cues.forEach(function (c) { faixa.addCue(new VTTCue(c[0], c[1], c[2])); });
    faixa.mode = "showing";
  }
  var trilha = video.querySelector("track");
  if (location.protocol === "file:" || !trilha) {
    legendaPorScript();
  } else if (trilha) {
    trilha.addEventListener("error", legendaPorScript);
    if (trilha.track) trilha.track.mode = "showing";
  }

  // O vídeo não começa sozinho ao abrir a página (ele fica abaixo do topo e pesa no celular).
  // No computador, o fx.js liga a prévia sem som quando o vídeo entra na tela. O botão oferece o som.
  botaoSom.hidden = false;
  botaoSom.addEventListener("click", function () {
    video.muted = false;
    video.currentTime = 0;
    video.play();
    botaoSom.hidden = true;
    video.focus();
  });
  video.addEventListener("volumechange", function () {
    if (!video.muted) botaoSom.hidden = true;
  });

  // ---------- Links que ainda não existem ----------
  // Lojas e cadastro de motoristas: o link entra quando o cliente confirmar.
  document.querySelectorAll("[data-pendente]").forEach(function (link) {
    link.addEventListener("click", function (e) {
      if (link.getAttribute("href") !== "#") return;
      e.preventDefault();
      var bloco = link.closest(".wrap, .rodape__cta");
      var aviso = bloco && bloco.querySelector(".aviso");
      if (aviso) aviso.textContent = link.dataset.pendente;
    });
  });

  // ---------- Modo revisão: abra com ?revisao ou #revisao no fim do endereço ----------
  // (no link do Artifact só o #revisao chega à página)
  if (/[?&]revisao\b/.test(location.search) || location.hash === "#revisao") {
    document.documentElement.classList.add("revisao");
    document.querySelector(".revisao-faixa").hidden = false;
  }
})();
