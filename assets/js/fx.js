// DNAVe — landing 3D: efeitos de profundidade e demonstrações interativas. Sem dependências.
// Roda depois do main.js. Quem pede menos movimento (prefers-reduced-motion) fica com a página parada:
// as demonstrações continuam funcionando, só os efeitos de ponteiro e de rolagem não ligam.
(function () {
  "use strict";

  var raiz = document.documentElement;
  var calmo = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ponteiroFino = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var todos = function (seletor, el) { return Array.prototype.slice.call((el || document).querySelectorAll(seletor)); };
  var limita = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  // ---------- 1. Linha de progresso da rolagem ----------
  var barra = document.querySelector(".progresso i");
  function progresso() {
    var max = raiz.scrollHeight - window.innerHeight;
    barra.style.setProperty("--pg", max > 0 ? (window.scrollY / max).toFixed(4) : "0");
  }
  if (barra) {
    window.addEventListener("scroll", progresso, { passive: true });
    window.addEventListener("resize", progresso);
    progresso();
  }

  // ---------- 2. Entrada dos blocos ao rolar ----------
  // Só entra animado o que está abaixo da dobra; o que já aparece ao abrir a página não pisca.
  if (!calmo && "IntersectionObserver" in window) {
    var olho = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("visto");
        olho.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    var seletor = ".cabeca > *, .modalidade, .categoria, .preferencias li, .passos li, .recursos > li, .trilhas li, " +
      ".demo, .comercio, .academy__cabeca, .filme, .foto-alta, .duas-colunas > div > .sobre, " +
      ".duas-colunas > div > h2, .duas-colunas > div > .cabeca__lead, .rodape__cta > *";
    todos(seletor).forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) return;
      var irmaos = todos(":scope > .rv", el.parentElement).length;
      el.style.transitionDelay = Math.min(irmaos, 5) * 70 + "ms";
      el.classList.add("rv");
      olho.observe(el);
    });
  }

  // ---------- 3. Palco 3D do hero ----------
  // A cena gira com o ponteiro; sem ponteiro (celular ou mouse parado), balança devagar sozinha.
  var palco = document.querySelector("[data-palco]");
  if (palco && !calmo) {
    var cena = palco.querySelector(".palco__cena");
    var hero = palco.closest(".hero");
    var BASE_Y = -14, BASE_X = 5;
    var alvo = { x: BASE_X, y: BASE_Y }, atual = { x: BASE_X, y: BASE_Y };
    var ultimoPonteiro = -1e9, rodando = false, aVista = true, inicio = performance.now();

    var quadro = function (agora) {
      if (!aVista) { rodando = false; return; }
      if (agora - ultimoPonteiro > 2500) {
        var t = (agora - inicio) / 1000;
        alvo.y = BASE_Y + Math.sin(t * 0.45) * 9;
        alvo.x = BASE_X + Math.sin(t * 0.33 + 1) * 3;
      }
      // ao rolar para baixo, o celular deita um pouco para trás
      var rolagem = limita(window.scrollY / (hero.offsetHeight * 0.8), 0, 1);
      atual.x += (alvo.x + rolagem * 14 - atual.x) * 0.06;
      atual.y += (alvo.y - atual.y) * 0.06;
      cena.style.setProperty("--rx", atual.x.toFixed(2) + "deg");
      cena.style.setProperty("--ry", atual.y.toFixed(2) + "deg");
      requestAnimationFrame(quadro);
    };
    if (ponteiroFino) {
      hero.addEventListener("pointermove", function (e) {
        var r = palco.getBoundingClientRect();
        var nx = limita((e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2), -1, 1);
        var ny = limita((e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2), -1, 1);
        alvo.y = BASE_Y + nx * 16;
        alvo.x = BASE_X - ny * 9;
        ultimoPonteiro = performance.now();
      });
    }
    new IntersectionObserver(function (entradas) {
      aVista = entradas[0].isIntersecting;
      if (aVista && !rodando) { rodando = true; requestAnimationFrame(quadro); }
    }).observe(palco);
  }

  // ---------- 4. Cartões que inclinam com o ponteiro ----------
  if (ponteiroFino && !calmo) {
    todos("[data-tilt]").forEach(function (el) {
      var forca = el.dataset.tilt === "suave" ? 0.45 : 1;
      var a = { x: 0, y: 0 }, al = { x: 0, y: 0 }, id = 0;
      function passo() {
        a.x += (al.x - a.x) * 0.18;
        a.y += (al.y - a.y) * 0.18;
        el.style.setProperty("--tx", a.x.toFixed(2) + "deg");
        el.style.setProperty("--ty", a.y.toFixed(2) + "deg");
        id = Math.abs(al.x - a.x) + Math.abs(al.y - a.y) > 0.02 ? requestAnimationFrame(passo) : 0;
      }
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var px = limita((e.clientX - r.left) / r.width, 0, 1), py = limita((e.clientY - r.top) / r.height, 0, 1);
        al.x = (0.5 - py) * 10 * forca;
        al.y = (px - 0.5) * 12 * forca;
        el.style.setProperty("--gx", (px * 100).toFixed(1) + "%");
        el.style.setProperty("--gy", (py * 100).toFixed(1) + "%");
        el.classList.add("ativo");
        if (!id) id = requestAnimationFrame(passo);
      });
      el.addEventListener("pointerleave", function () {
        al.x = al.y = 0;
        el.classList.remove("ativo");
        if (!id) id = requestAnimationFrame(passo);
      });
    });

    // ---------- 5. Luz que segue o ponteiro nas seções escuras ----------
    todos("[data-luz]").forEach(function (secao) {
      var ultimo = null;
      secao.addEventListener("pointermove", function (e) {
        var agendado = ultimo !== null;
        ultimo = e;
        if (agendado) return;
        requestAnimationFrame(function () {
          var r = secao.getBoundingClientRect();
          secao.style.setProperty("--lx", (ultimo.clientX - r.left).toFixed(0) + "px");
          secao.style.setProperty("--ly", (ultimo.clientY - r.top).toFixed(0) + "px");
          ultimo = null;
        });
      });
    });
  }

  // ---------- 6. Tela "Escolha uma viagem" (hero) ----------
  var app = document.querySelector(".app");
  if (app) {
    var linhas = todos(".linha", app);
    var mais = app.querySelector(".app-mais");
    var verMais = app.querySelector(".app-vermais");
    var rotuloMais = verMais.querySelector("span");
    var confirmar = app.querySelector(".app-confirmar");
    var lista = app.querySelector(".app-lista");
    var escolhida = "Econômico";
    var rotuloFechado = rotuloMais.textContent; // "Ver mais categorias (n)", como está no HTML

    var abre = function (aberto) {
      mais.hidden = !aberto;
      verMais.setAttribute("aria-expanded", String(aberto));
      rotuloMais.textContent = aberto ? "Mostrar menos" : rotuloFechado;
    };
    var escolhe = function (nome, mostra) {
      escolhida = nome;
      app.classList.remove("chamando");
      confirmar.textContent = "Confirmar " + nome;
      linhas.forEach(function (l) {
        var sim = l.dataset.cat === nome;
        l.setAttribute("aria-pressed", String(sim));
        if (!sim || !mostra) return;
        if (mais.contains(l)) abre(true);
        lista.scrollTo({ top: l.offsetTop - lista.offsetTop - 8, behavior: calmo ? "auto" : "smooth" });
      });
    };

    linhas.forEach(function (l) {
      l.addEventListener("click", function () { escolhe(l.dataset.cat, false); });
    });
    verMais.addEventListener("click", function () {
      var abrir = verMais.getAttribute("aria-expanded") !== "true";
      abre(abrir);
      if (abrir) return;
      // ao recolher, a escolha não pode ficar numa linha escondida
      var marcada = app.querySelector('.linha[aria-pressed="true"]');
      if (marcada && mais.contains(marcada)) escolhe("Econômico", false);
      lista.scrollTo({ top: 0 });
    });
    // cartões flutuantes do palco: escolhem a categoria na tela
    todos("[data-escolhe]").forEach(function (b) {
      b.addEventListener("click", function () { escolhe(b.dataset.escolhe, true); });
    });
    // "Confirmar": a NAVE percorre a rota do mapa e o botão avisa; depois volta ao estado de escolha
    confirmar.addEventListener("click", function () {
      if (app.classList.contains("chamando")) return;
      var nome = escolhida;
      app.classList.add("chamando");
      confirmar.textContent = "Sua NAVE está a caminho";
      window.setTimeout(function () {
        if (!app.classList.contains("chamando") || escolhida !== nome) return;
        app.classList.remove("chamando");
        confirmar.textContent = "Confirmar " + nome;
      }, 3400);
    });
  }

  // ---------- 7. Preferências de acessibilidade: chaves de verdade ----------
  var chaves = todos("[data-chaves] .chave");
  var cartoes = todos(".preferencias li");
  var sincroniza = function () {
    chaves.forEach(function (c, i) {
      if (cartoes[i]) cartoes[i].classList.toggle("ligada", c.getAttribute("aria-checked") === "true");
    });
  };
  chaves.forEach(function (c) {
    c.addEventListener("click", function () {
      c.setAttribute("aria-checked", String(c.getAttribute("aria-checked") !== "true"));
      sincroniza();
    });
  });
  sincroniza();

  // ---------- 8. Explorar: "Qual km você quer?" ----------
  var raio = document.getElementById("raio-km");
  if (raio) {
    var saida = document.getElementById("raio-saida");
    var lugares = todos(".app__lugares li[data-km]");
    var pinos = todos(".radar__pino");
    var circulo = document.querySelector(".radar__circ");
    var aplica = function () {
      var km = Number(raio.value), n = 0;
      lugares.forEach(function (li) {
        var dentro = Number(li.dataset.km) <= km;
        li.hidden = !dentro;
        if (dentro) n++;
      });
      pinos.forEach(function (p) { p.classList.toggle("dentro", Number(p.dataset.km) <= km); });
      circulo.style.setProperty("--r", ((km - 1) / 9).toFixed(3));
      saida.textContent = "até " + km + " km · " + n + (n === 1 ? " lugar" : " lugares");
    };
    raio.addEventListener("input", aplica);
    aplica();
  }

  // ---------- 9. Vídeo de lançamento: a prévia sem som só roda quando está à vista ----------
  var video = document.getElementById("filme");
  if (video && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entradas) {
      if (!video.muted) return; // quem ligou o som decide quando pausar
      if (!entradas[0].isIntersecting) video.pause();
      else if (!calmo) video.play().catch(function () {});
    }, { threshold: 0.25 }).observe(video);
  }
})();
