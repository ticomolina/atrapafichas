/* ATRAPA FICHAS — motor del juego
   Los parámetros editables están en datos.js */
(() => {
  "use strict";

  const D = window.ATRAPA_DATOS;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // ---------- utilidades ----------
  const azar = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const elegir = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const mezclar = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };
  const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
  const guardado = {
    leer(k, def) { try { const v = localStorage.getItem(k); return v === null ? def : JSON.parse(v); } catch { return def; } },
    escribir(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  };

  // ---------- SVG reutilizables ----------
  const SVG_ESTRELLA = '<svg viewBox="0 0 100 100"><path class="estrella-forma" d="M50 5 L62 36 L95 38 L69 59 L78 92 L50 74 L22 92 L31 59 L5 38 L38 36 Z"/></svg>';
  const SVG_CORAZON = '<svg class="corazon" viewBox="0 0 100 96"><path d="M50 88 C20 66 6 50 6 32 C6 18 17 8 30 8 C39 8 46 13 50 20 C54 13 61 8 70 8 C83 8 94 18 94 32 C94 50 80 66 50 88 Z"/><ellipse class="brillo" cx="28" cy="28" rx="10" ry="7" transform="rotate(-30 28 28)"/></svg>';
  const SVG_TILDE = '<svg class="tilde" viewBox="0 0 100 100"><path d="M20 52 L42 74 L84 24" fill="none" stroke="#fff" stroke-width="28" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 52 L42 74 L84 24" fill="none" stroke="#3DBB2B" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  // =====================================================
  //  SONIDO (sintetizado, suave, sin archivos)
  // =====================================================
  const Sonido = {
    ctx: null,
    silencio: guardado.leer("atrapa_silencio", false),
    iniciar() {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) this.ctx = new AC();
      }
      if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
    },
    nota(freq, inicio, dur, { tipo = "sine", vol = 0.18, hasta = null } = {}) {
      if (this.silencio || !this.ctx) return;
      const t = this.ctx.currentTime + inicio;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = tipo;
      o.frequency.setValueAtTime(freq, t);
      if (hasta) o.frequency.exponentialRampToValueAtTime(hasta, t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(this.ctx.destination);
      o.start(t);
      o.stop(t + dur + 0.05);
    },
    acierto() { this.nota(784, 0, 0.14); this.nota(1175, 0.07, 0.22, { vol: 0.14 }); },
    error() { this.nota(330, 0, 0.32, { tipo: "triangle", vol: 0.2, hasta: 196 }); },
    objetivoListo() { this.nota(1047, 0, 0.12, { vol: 0.12 }); this.nota(1319, 0.08, 0.12, { vol: 0.12 }); this.nota(1568, 0.16, 0.25, { vol: 0.12 }); },
    nivel() { [523, 659, 784, 1047].forEach((f, i) => this.nota(f, i * 0.11, 0.3, { vol: 0.16 })); },
    estrella(i) { this.nota(880 + i * 220, 0, 0.18, { vol: 0.12 }); },
    fin() { [784, 659, 523, 392].forEach((f, i) => this.nota(f, i * 0.16, 0.35, { tipo: "triangle", vol: 0.16 })); },
    record() {
      [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) =>
        this.nota(f, i * 0.13, i === 6 ? 0.6 : 0.22, { tipo: "triangle", vol: 0.18 }));
    },
    alternar() {
      this.silencio = !this.silencio;
      guardado.escribir("atrapa_silencio", this.silencio);
      pintarBotonesSonido();
      if (!this.silencio) { this.iniciar(); this.acierto(); }
    }
  };
  function pintarBotonesSonido() {
    $$(".boton-sonido").forEach((b) => b.classList.toggle("silencio", Sonido.silencio));
  }

  // =====================================================
  //  FONDOS
  // =====================================================
  const fondo = $("#fondo");
  const POS_DECO = [
    { l: 6, t: 8, s: 14 }, { l: 72, t: 5, s: 16 }, { l: 40, t: 14, s: 10 },
    { l: 84, t: 30, s: 12 }, { l: 2, t: 34, s: 11 }, { l: 60, t: 22, s: 9 }
  ];
  function ponerFondo(tema) {
    const f = tema ? tema.fondo : null;
    fondo.classList.toggle("inicio", !tema);
    fondo.classList.remove("con-imagen");
    const deco = $(".fondo-deco", fondo);
    deco.innerHTML = "";
    if (!f) {
      fondo.style.background = "";
      ["✨", "⭐", "☁️", "✨", "⭐", "☁️"].forEach((e, i) => agregarDeco(deco, e, POS_DECO[i]));
      return;
    }
    if (f.imagen) {
      fondo.classList.add("con-imagen");
      fondo.style.background = `url("${f.imagen}") center / cover no-repeat, ${f.cielo[1]}`;
      return;
    }
    fondo.style.background = `linear-gradient(${f.cielo[0]}, ${f.cielo[1]})`;
    $(".loma-atras", fondo).style.background = f.suelo[0];
    $(".loma-adelante", fondo).style.background = f.suelo[1];
    f.deco.forEach((e, i) => agregarDeco(deco, e, POS_DECO[i]));
  }
  function agregarDeco(cont, emoji, p) {
    const s = document.createElement("span");
    s.textContent = emoji;
    s.style.left = p.l + "vw";
    s.style.top = p.t + "vh";
    s.style.fontSize = p.s + "vmin";
    cont.appendChild(s);
  }

  // =====================================================
  //  GENERADOR DE NIVELES
  // =====================================================
  function paramsNivel(n) {
    return D.niveles[Math.min(n, D.niveles.length - 1)];
  }

  // Posiciones en capas: cada capa se corre media ficha y se achica (pirámide)
  function armarCapas(p) {
    const pos = [];
    for (let z = 0; z < p.capas; z++) {
      const off = z * 0.5;
      for (let y = off; y <= p.filas - 1 - off + 1e-6; y++) {
        for (let x = off; x <= p.columnas - 1 - off + 1e-6; x++) {
          if (z === 0 || Math.random() < p.densidad) pos.push({ x, y, z });
        }
      }
    }
    return pos;
  }

  const seTocan = (a, b) => Math.abs(a.x - b.x) < 0.999 && Math.abs(a.y - b.y) < 0.999;

  // ¿Esta ficha tiene alguna ficha encima (que siga en el tablero)?
  function estaTapada(f, lista, quitada) {
    for (const o of lista) {
      if (o !== f && o.z > f.z && !quitada(o) && seTocan(o, f)) return true;
    }
    return false;
  }

  function generarNivel(p, tema) {
    const nObj = Math.min(p.objetivos, 4);
    let pos, cant, T, nTrampa;
    for (let intento = 0; intento < 60; intento++) {
      pos = armarCapas(p);
      cant = Array.from({ length: nObj }, () => azar(p.cantidad[0], p.cantidad[1]));
      T = cant.reduce((a, b) => a + b, 0);
      nTrampa = Math.max(1, p.distintos - nObj);
      if (T + nTrampa <= pos.length) break;
    }
    // Si el tablero quedó chico, recortamos cantidades (nunca debería pasar con datos razonables)
    while (T + nTrampa > pos.length && T > nObj) {
      const i = cant.indexOf(Math.max(...cant)); cant[i]--; T--;
    }

    // Emojis objetivo y emojis "trampa"
    const pool = mezclar(tema.emojis.slice());
    const objetivos = pool.slice(0, nObj);
    const usados = new Set(objetivos);
    const gruposObj = (tema.parecidos || []).filter((g) => g.some((e) => usados.has(e)));
    const trampas = [];
    while (trampas.length < nTrampa) {
      let e = null;
      if (Math.random() < p.parecidos) {
        const c = gruposObj.flat().filter((x) => !usados.has(x));
        if (c.length) e = elegir(c);
      }
      if (!e) {
        const c = pool.filter((x) => !usados.has(x));
        if (!c.length) break;
        e = elegir(c);
      }
      usados.add(e);
      trampas.push(e);
    }

    // Elegimos qué fichas serán objetivo simulando que se van sacando:
    // así toda ficha objetivo queda tapada solo por otras fichas objetivo
    // y el nivel siempre se puede completar.
    const elegidas = new Set();
    const maxZ = p.capas - 1;
    for (let k = 0; k < T; k++) {
      const libres = pos.filter((f) => !elegidas.has(f) && !estaTapada(f, pos, (o) => elegidas.has(o)));
      // leve preferencia por fichas de capas bajas, para que haya que "excavar"
      const pesos = libres.map((f) => 1 + (maxZ - f.z) * 0.6);
      let r = Math.random() * pesos.reduce((a, b) => a + b, 0);
      let idx = 0;
      while ((r -= pesos[idx]) > 0) idx++;
      elegidas.add(libres[Math.min(idx, libres.length - 1)]);
    }

    const emojisObj = mezclar(objetivos.flatMap((e, i) => Array(cant[i]).fill(e)));
    const fichasObj = mezclar([...elegidas]);
    fichasObj.forEach((f, i) => (f.emoji = emojisObj[i]));

    const resto = mezclar(pos.filter((f) => !elegidas.has(f)));
    resto.forEach((f, i) => (f.emoji = i < trampas.length ? trampas[i] : elegir(trampas.length ? trampas : objetivos)));

    return {
      fichas: pos,
      objetivos: objetivos.map((e, i) => ({ emoji: e, total: cant[i], restante: cant[i], pendientes: cant[i] }))
    };
  }

  // =====================================================
  //  ESTADO
  // =====================================================
  const E = {
    nivel: 0, estrellas: 0, vidas: D.vidas, errores: 0,
    tema: null, fichas: [], objetivos: [],
    bloqueado: true, vuelos: [], jugando: false
  };
  let record = guardado.leer("atrapa_record", 0);

  // ---------- pantallas ----------
  function mostrarPantalla(id) {
    $$(".pantalla").forEach((p) => p.classList.toggle("activa", p.id === id));
  }
  function mostrarCapa(id, si = true) { $("#" + id).classList.toggle("activa", si); }

  // =====================================================
  //  INICIO
  // =====================================================
  function armarInicio() {
    const colores = ["#FF6FA8", "#FF9F2E", "#FFC92E", "#5DCB3B", "#3FA9F5", "#9B6BE8"];
    const t = $(".titulo-arcoiris");
    t.innerHTML = "";
    let k = 0;
    ["ATRAPA", "FICHAS"].forEach((pal) => {
      const linea = document.createElement("span");
      linea.className = "linea";
      [...pal].forEach((l) => {
        const s = document.createElement("span");
        s.className = "letra";
        s.textContent = l;
        s.style.color = colores[k % colores.length];
        s.style.animationDelay = (k * 0.12) + "s";
        k++;
        linea.appendChild(s);
      });
      t.appendChild(linea);
    });

    // pila decorativa
    const pila = $(".pila-inicio");
    pila.innerHTML = "";
    const emojis = ["🐱", "🎃", "🍎", "⭐", "🐶", "🍎", "⭐", "🐱", "🚀", "🐠", "🐮"];
    const lugares = [
      [8, 52, -8], [58, 48, 10], [30, 58, 4], [2, 22, -12], [64, 18, 8],
      [36, 30, -4], [18, 6, 6], [50, 0, -10], [30, 0, 3], [72, 60, -6], [10, 70, 12]
    ];
    const zona = pila.getBoundingClientRect();
    const t0 = Math.min(zona.width * 0.3, zona.height * 0.34);
    lugares.forEach(([l, tp, r], i) => {
      const f = crearFichaDom(emojis[i], t0);
      f.style.left = l + "%";
      f.style.top = tp + "%";
      f.style.transform = `rotate(${r}deg)`;
      f.style.zIndex = i < 3 ? 1 : i;
      if (i < 3 || i > 8) f.classList.add("tapada");
      pila.appendChild(f);
    });
    $(".record-num").textContent = record;
    ponerFondo(null);
  }

  function crearFichaDom(emoji, t) {
    const d = document.createElement("div");
    d.className = "ficha";
    d.style.setProperty("--t", t + "px");
    const s = document.createElement("span");
    s.className = "emoji";
    s.textContent = emoji;
    d.appendChild(s);
    return d;
  }

  // =====================================================
  //  PARTIDA
  // =====================================================
  function nuevaPartida() {
    E.nivel = 0;
    E.estrellas = 0;
    E.vidas = D.vidas;
    E.tema = elegir(D.tematicas);
    E.jugando = true;
    E.partida = (E.partida || 0) + 1;
    mostrarCapa("capa-pausa", false);
    mostrarCapa("capa-festejo", false);
    mostrarCapa("capa-fin", false);
    mostrarPantalla("pantalla-juego");
    pintarEstrellas();
    pintarVidas();
    iniciarNivel();
  }

  function iniciarNivel() {
    if (E.nivel > 0 && E.nivel % D.cambiarTematicaCada === 0) {
      const otras = D.tematicas.filter((t) => t.id !== E.tema.id);
      E.tema = elegir(otras.length ? otras : D.tematicas);
    }
    ponerFondo(E.tema);
    const { fichas, objetivos } = generarNivel(paramsNivel(E.nivel), E.tema);
    E.fichas = fichas;
    E.objetivos = objetivos;
    E.errores = 0;
    E.vuelos = [];
    pintarObjetivos();
    pintarTablero(true);
    pintarNivel();
    E.bloqueado = false;
  }

  // ---------- selector de nivel ----------
  // Cambiar de nivel arranca ese nivel de cero; se conservan las estrellas y las vidas.
  function pintarNivel() {
    $(".nivel-num").textContent = E.nivel + 1;
    $("#btn-nivel-menos").disabled = E.nivel <= 0;
    $("#btn-nivel-mas").disabled = E.nivel >= D.niveles.length - 1;
  }
  function cambiarNivel(delta) {
    Sonido.iniciar();
    if (!E.jugando || E.bloqueado) return; // no durante el festejo ni el fin
    const n = Math.max(0, Math.min(D.niveles.length - 1, E.nivel + delta));
    if (n === E.nivel) return;
    E.nivel = n;
    Sonido.estrella(0);
    iniciarNivel();
  }

  // ---------- barra de objetivos ----------
  function pintarObjetivos() {
    const cont = $(".objetivos");
    cont.innerHTML = "";
    E.objetivos.forEach((o) => {
      const d = document.createElement("div");
      d.className = "objetivo";
      d.innerHTML = `<span class="emoji" style="font-family:var(--emoji)">${o.emoji}</span><span class="contador"><b>${o.restante}</b></span>${SVG_TILDE}`;
      o.el = d;
      cont.appendChild(d);
    });
  }

  function pintarVidas(rompe = -1) {
    const cont = $(".vidas");
    if (cont.children.length !== D.vidas) {
      cont.innerHTML = SVG_CORAZON.repeat(D.vidas);
    }
    $$(".corazon", cont).forEach((c, i) => {
      c.classList.toggle("perdido", i >= E.vidas);
      if (i === rompe) { c.classList.remove("rompe"); void c.offsetWidth; c.classList.add("rompe"); }
    });
  }

  function pintarEstrellas(salta = false) {
    $(".estrellas-num").textContent = E.estrellas;
    const c = $(".estrella-contador");
    if (salta) { c.classList.remove("salto"); void c.offsetWidth; c.classList.add("salto"); }
  }

  // ---------- tablero ----------
  const ELEVACION = 0.1; // cuánto "sube" visualmente cada capa (en fichas)
  const HUECO = 0.06;    // separación entre fichas (en fichas)

  function medidas() {
    const p = paramsNivel(E.nivel);
    const zona = $(".tablero-zona").getBoundingClientRect();
    const ancho = p.columnas;
    const alto = p.filas + 0.15;
    const t = Math.floor(Math.min(zona.width / ancho, zona.height / alto, 150));
    return { t, ancho, alto, maxZ: p.capas - 1 };
  }

  function pintarTablero(conEntrada = false) {
    const tab = $(".tablero");
    const { t, ancho, alto, maxZ } = medidas();
    tab.style.width = ancho * t + "px";
    tab.style.height = alto * t + "px";
    if (conEntrada) tab.innerHTML = "";
    const tam = t * (1 - HUECO);
    E.fichas.forEach((f) => {
      if (f.fuera) return;
      if (!f.el) {
        f.el = crearFichaDom(f.emoji, tam);
        f.el._ficha = f;
        if (conEntrada) {
          f.el.classList.add("entra");
          f.el.style.animationDelay = (f.z * 0.18 + Math.random() * 0.15).toFixed(2) + "s";
          f.el.addEventListener("animationend", () => f.el && f.el.classList.remove("entra"), { once: true });
        }
        tab.appendChild(f.el);
      }
      f.el.style.setProperty("--t", tam + "px");
      f.el.style.left = (f.x * t + (t - tam) / 2) + "px";
      f.el.style.top = ((f.y - f.z * ELEVACION + maxZ * ELEVACION) * t + (t - tam) / 2) + "px";
      f.el.style.zIndex = f.z * 100 + Math.round(f.y * 2);
    });
    // la altura total incluye la elevación de las capas
    tab.style.height = (alto + maxZ * ELEVACION) * t + "px";
    actualizarTapadas();
  }

  function actualizarTapadas() {
    const fuera = (o) => o.fuera;
    E.fichas.forEach((f) => {
      if (f.fuera) return;
      f.tapada = estaTapada(f, E.fichas, fuera);
      f.el.classList.toggle("tapada", f.tapada);
    });
  }

  // ---------- toques ----------
  function tocar(ev) {
    const el = ev.target.closest(".ficha");
    if (!el || !el._ficha) return;
    ev.preventDefault();
    Sonido.iniciar();
    if (E.bloqueado) return;
    const f = el._ficha;
    if (f.fuera || f.tapada) return; // las tapadas no se pueden tocar

    const obj = E.objetivos.find((o) => o.emoji === f.emoji && o.pendientes > 0);
    if (obj) acertar(f, obj);
    else equivocarse(f);
  }

  function acertar(f, obj) {
    obj.pendientes--;
    f.fuera = true;
    Sonido.acierto();
    const vuelo = volar(f, obj).then(() => {
      obj.restante--;
      obj.el.querySelector(".contador b").textContent = obj.restante;
      obj.el.classList.remove("golpe"); void obj.el.offsetWidth; obj.el.classList.add("golpe");
      if (obj.restante === 0) {
        obj.el.classList.add("hecho");
        Sonido.objetivoListo();
      }
    });
    E.vuelos.push(vuelo);
    actualizarTapadas();

    if (E.objetivos.every((o) => o.pendientes === 0)) {
      E.bloqueado = true;
      const id = E.partida;
      Promise.all(E.vuelos).then(() => esperar(450)).then(() => completarNivel(id));
    }
  }

  function volar(f, obj) {
    const el = f.el;
    f.el = null;
    const desde = el.getBoundingClientRect();
    const hasta = obj.el.getBoundingClientRect();
    el.classList.remove("tapada", "entra", "tiembla");
    el.classList.add("ficha-volando");
    el.style.left = desde.left + "px";
    el.style.top = desde.top + "px";
    el.style.zIndex = 50;
    document.body.appendChild(el);
    const dx = hasta.left + hasta.width / 2 - (desde.left + desde.width / 2);
    const dy = hasta.top + hasta.height / 2 - (desde.top + desde.height / 2);
    const esc = Math.max(0.4, (hasta.width * 0.8) / desde.width);
    const anim = el.animate([
      { transform: "translate(0,0) scale(1) rotate(0)" },
      { transform: `translate(${dx * 0.35}px, ${dy * 0.35 - 60}px) scale(1.2) rotate(-12deg)`, offset: 0.35 },
      { transform: `translate(${dx}px, ${dy}px) scale(${esc}) rotate(0)`, opacity: 0.9 }
    ], { duration: 620, easing: "cubic-bezier(.45,0,.4,1)", fill: "forwards" });
    return anim.finished.catch(() => {}).then(() => el.remove());
  }

  function equivocarse(f) {
    E.vidas--;
    E.errores++;
    Sonido.error();
    f.el.classList.remove("tiembla"); void f.el.offsetWidth; f.el.classList.add("tiembla");
    pintarVidas(E.vidas);
    if (navigator.vibrate) { try { navigator.vibrate(80); } catch {} }
    if (E.vidas <= 0) {
      E.bloqueado = true;
      const id = E.partida;
      esperar(900).then(() => { if (id === E.partida && E.jugando) finPartida(); });
    }
  }

  // ---------- fin de nivel ----------
  async function completarNivel(id) {
    const vigente = () => id === E.partida && E.jugando;
    while (vigente() && $("#capa-pausa").classList.contains("activa")) await esperar(200);
    if (!vigente()) return;
    const ganadas = E.errores === 0 ? D.estrellas.sinErrores : E.errores === 1 ? D.estrellas.unError : D.estrellas.masErrores;
    const cont = $(".festejo-estrellas");
    const maxEstrellas = D.estrellas.sinErrores;
    cont.innerHTML = "";
    for (let i = 0; i < maxEstrellas; i++) {
      const w = document.createElement("div");
      w.innerHTML = SVG_ESTRELLA;
      const s = w.firstChild;
      if (i >= ganadas) s.classList.add("vacia");
      cont.appendChild(s);
    }
    mostrarCapa("capa-festejo");
    Sonido.nivel();
    confeti(1400, 70);
    const svgs = $$("svg", cont);
    for (let i = 0; i < svgs.length; i++) {
      await esperar(300);
      if (!vigente()) return;
      svgs[i].classList.add("ver");
      if (i < ganadas) {
        Sonido.estrella(i);
        E.estrellas++;
        pintarEstrellas(true);
      }
    }
    await esperar(Math.max(600, D.duracionFestejo - 300 * svgs.length));
    if (!vigente()) return;
    mostrarCapa("capa-festejo", false);
    E.nivel++;
    iniciarNivel();
  }

  // ---------- fin de partida ----------
  function finPartida() {
    E.jugando = false;
    const nuevo = E.estrellas > record;
    if (nuevo) {
      record = E.estrellas;
      guardado.escribir("atrapa_record", record);
    }
    const tit = $(".fin-titulo");
    tit.textContent = nuevo ? "¡NUEVO RÉCORD!" : "¡BUEN JUEGO!";
    tit.classList.toggle("record", nuevo);
    $(".fin-estrellas-num").textContent = E.estrellas;
    $(".fin-record-num").textContent = record;
    mostrarCapa("capa-fin");
    if (nuevo) { Sonido.record(); confeti(4500, 220); }
    else Sonido.fin();
  }

  // ---------- pausa ----------
  function pausar() {
    if (!E.jugando || $("#capa-festejo").classList.contains("activa") || $("#capa-fin").classList.contains("activa")) return;
    E.pausaPrevio = E.bloqueado;
    E.bloqueado = true;
    mostrarCapa("capa-pausa");
  }
  function seguir() {
    mostrarCapa("capa-pausa", false);
    E.bloqueado = E.pausaPrevio || false;
  }
  function irAlInicio() {
    E.jugando = false;
    E.bloqueado = true;
    mostrarCapa("capa-pausa", false);
    mostrarCapa("capa-fin", false);
    mostrarCapa("capa-festejo", false);
    mostrarPantalla("pantalla-inicio");
    armarInicio();
  }

  // =====================================================
  //  CONFETI
  // =====================================================
  const lienzo = $("#confeti");
  const cx = lienzo.getContext("2d");
  let particulas = [];
  let animando = false;
  function confeti(duracion, cantidad) {
    lienzo.width = innerWidth * devicePixelRatio;
    lienzo.height = innerHeight * devicePixelRatio;
    const colores = ["#FF6FA8", "#FF9F2E", "#FFC92E", "#5DCB3B", "#3FA9F5", "#9B6BE8"];
    const fin = performance.now() + duracion;
    for (let i = 0; i < cantidad; i++) {
      particulas.push({
        x: Math.random() * lienzo.width,
        y: -Math.random() * lienzo.height * 0.5,
        vx: (Math.random() - 0.5) * 4 * devicePixelRatio,
        vy: (2 + Math.random() * 4) * devicePixelRatio,
        r: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        w: (8 + Math.random() * 10) * devicePixelRatio,
        h: (5 + Math.random() * 6) * devicePixelRatio,
        c: elegir(colores),
        fin
      });
    }
    if (!animando) { animando = true; requestAnimationFrame(cuadro); }
  }
  function cuadro(ahora) {
    cx.clearRect(0, 0, lienzo.width, lienzo.height);
    particulas = particulas.filter((p) => p.y < lienzo.height + 40 && (ahora < p.fin || p.y > -40));
    particulas.forEach((p) => {
      p.x += p.vx; p.y += p.vy; p.r += p.vr; p.vy += 0.03;
      cx.save();
      cx.translate(p.x, p.y);
      cx.rotate(p.r);
      cx.fillStyle = p.c;
      cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      cx.restore();
    });
    if (particulas.length) requestAnimationFrame(cuadro);
    else { animando = false; cx.clearRect(0, 0, lienzo.width, lienzo.height); }
  }

  // =====================================================
  //  EVENTOS
  // =====================================================
  $(".tablero").addEventListener("pointerdown", tocar);
  $("#btn-jugar").addEventListener("click", () => { Sonido.iniciar(); nuevaPartida(); });
  $("#btn-casa").addEventListener("click", irAlInicio);
  $("#btn-nivel-menos").addEventListener("click", () => cambiarNivel(-1));
  $("#btn-nivel-mas").addEventListener("click", () => cambiarNivel(1));
  $("#btn-seguir").addEventListener("click", seguir);
  $("#btn-otra-vez").addEventListener("click", nuevaPartida);
  $("#btn-inicio").addEventListener("click", irAlInicio);
  $("#btn-fin-otra").addEventListener("click", nuevaPartida);
  $("#btn-fin-inicio").addEventListener("click", irAlInicio);
  $$(".boton-sonido").forEach((b) => b.addEventListener("click", () => Sonido.alternar()));
  document.addEventListener("contextmenu", (e) => e.preventDefault());
  document.addEventListener("visibilitychange", () => { if (document.hidden) pausar(); });

  let tResize;
  addEventListener("resize", () => {
    clearTimeout(tResize);
    tResize = setTimeout(() => {
      if ($("#pantalla-juego").classList.contains("activa")) pintarTablero();
      else armarInicio();
    }, 120);
  });

  // ---------- instalar la app ----------
  // Chrome/Android avisa cuando la app se puede instalar: ahí mostramos el botón.
  let avisoInstalar = null;
  addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    avisoInstalar = e;
    $("#btn-instalar").hidden = false;
  });
  $("#btn-instalar").addEventListener("click", async () => {
    if (!avisoInstalar) return;
    avisoInstalar.prompt();
    await avisoInstalar.userChoice.catch(() => {});
    avisoInstalar = null;
    $("#btn-instalar").hidden = true;
  });
  addEventListener("appinstalled", () => { $("#btn-instalar").hidden = true; });

  // arranque
  pintarBotonesSonido();
  document.fonts && document.fonts.ready.then(armarInicio);
  armarInicio();

  // para pruebas desde la consola
  window.__atrapa = { E, generarNivel, paramsNivel };
})();
