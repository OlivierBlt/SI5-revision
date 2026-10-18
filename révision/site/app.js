/* ============ Révisions SI5 — logique du site central ============ */
(function () {
  "use strict";

  const DATA = window.REVISION;
  const MATIERES = DATA.matieres;
  const $ = (s, el = document) => el.querySelector(s);
  const main = $("#main");
  const shell = $("#shell");

  /* ---------- État persistant (navigateur) ---------- */
  const KEY = "revision-site-v1";
  const state = Object.assign(
    { theme: "auto", revises: {}, recents: [], examens: {}, notes: {}, chapitres: {} },
    (() => { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { return {}; } })()
  );
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} };

  /* ---------- Utilitaires ---------- */
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const matiere = (id) => MATIERES.find((m) => m.id === id);
  const rkey = (m, r) => m.id + "/" + r.id;
  const toutes = () => MATIERES.flatMap((m) => m.ressources.map((r) => ({ m, r })));

  const TYPES = {
    examen:     { label: "Examen blanc",  groupe: "Examens blancs",  icon: "examen" },
    qcm:        { label: "QCM",           groupe: "QCM",             icon: "qcm" },
    fiche:      { label: "Fiche",         groupe: "Fiches de cours", icon: "fiche" },
    exercices:  { label: "Exercices",     groupe: "Exercices",       icon: "exercices" },
    flashcards: { label: "Flashcards",    groupe: "Flashcards",      icon: "flashcards" }
  };
  const SLOTS_DE_BASE = ["fiche", "qcm", "examen"];

  function progression(m) {
    const chaps = m.chapitres || [];
    const total = m.ressources.length + chaps.length;
    const faits = m.ressources.filter((r) => state.revises[rkey(m, r)]).length
                + chaps.filter((c) => (state.chapitres[m.id] || {})[c]).length;
    return { faits, total, pct: total ? Math.round((faits / total) * 100) : 0 };
  }

  function joursAvant(iso) {
    if (!iso) return null;
    const d = new Date(iso + "T00:00:00");
    const t = new Date(); t.setHours(0, 0, 0, 0);
    return Math.round((d - t) / 86400000);
  }
  const fmtDate = (iso) => new Date(iso + "T00:00:00").toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "long" });
  const ilYa = (ts) => {
    const min = Math.round((Date.now() - ts) / 60000);
    if (min < 1) return "à l'instant";
    if (min < 60) return "il y a " + min + " min";
    const h = Math.round(min / 60);
    if (h < 24) return "il y a " + h + " h";
    const j = Math.round(h / 24);
    return j === 1 ? "hier" : "il y a " + j + " jours";
  };

  /* ---------- Icônes & illustrations ---------- */
  const ICONS = {
    examen: '<path d="M7 3.5h7l4 4V20a.5.5 0 0 1-.5.5h-10A.5.5 0 0 1 7 20z" /><path d="M14 3.5V8h4M9.5 13.5l2 2 3.5-4"/>',
    qcm: '<rect x="4" y="4.5" width="5" height="5" rx="1.2"/><path d="m5.3 7 1.2 1.2 2-2.2M12 7h8"/><rect x="4" y="14.5" width="5" height="5" rx="1.2"/><path d="M12 17h8"/>',
    fiche: '<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M8 9.5h8M8 13h8M8 16.5h5"/>',
    exercices: '<path d="M15.5 4.5l4 4L9 19l-5 1 1-5z"/><path d="M13 7l4 4"/>',
    flashcards: '<rect x="7" y="7" width="13" height="12" rx="2"/><path d="M4 15V6a2 2 0 0 1 2-2h9"/>',
    open: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    focus: '<path d="M4 9V5a1 1 0 0 1 1-1h4M15 4h4a1 1 0 0 1 1 1v4M20 15v4a1 1 0 0 1-1 1h-4M9 20H5a1 1 0 0 1-1-1v-4"/>',
    reload: '<path d="M19 12a7 7 0 1 1-2.05-4.95M19 4.5V8h-3.5"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>'
  };
  const icon = (name, size = 20) =>
    `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;

  // Illustrations génératives, une par matière (déterministes)
  function motif(kind, vb, fit = "slice") {
    const W = 420, H = 140;
    let s = "";
    if (kind === "grid") {            // pixels + noyau de convolution
      const n = 10, c = 14, ox = 210, oy = 0;
      for (let y = 0; y < n; y++) for (let x = 0; x < 15; x++) {
        const v = (Math.sin(x * 1.3 + y * 0.7) + Math.cos(y * 1.1 - x * 0.4) + 2) / 4;
        s += `<rect x="${ox + x * c}" y="${oy + y * c}" width="${c - 2}" height="${c - 2}" rx="2" fill="currentColor" opacity="${(v * 0.55 + 0.05).toFixed(2)}"/>`;
      }
      s += `<rect x="${ox + 4 * c - 3}" y="${3 * c - 3}" width="${3 * c + 4}" height="${3 * c + 4}" rx="5" fill="none" stroke="currentColor" stroke-width="2.5"/>`;
      s += `<path d="M${ox + 7 * c + 2} ${4.5 * c} C ${ox + 10 * c} ${4.5 * c}, ${ox + 10 * c} ${8 * c}, ${ox + 12.4 * c} ${8 * c}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="4 4"/>`;
    } else if (kind === "dots") {     // nuage de points + frontière de décision
      let seed = 7; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
      for (let i = 0; i < 46; i++) {
        const a = i % 2 === 0;
        const x = (a ? 250 : 340) + (rnd() - 0.5) * 120, y = (a ? 40 : 95) + (rnd() - 0.5) * 70;
        s += a ? `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.2" fill="currentColor" opacity=".75"/>`
               : `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/>`;
      }
      s += `<path d="M215 128 L 410 6" stroke="currentColor" stroke-width="2.2" stroke-dasharray="7 5"/>`;
    } else if (kind === "states") {   // gridworld avec politique
      const c = 30, ox = 238, oy = 6, cols = 6, rows = 4;
      const pol = ["→→→→↓G", "↑■→→↓T", "↑→→→→↑", "↑↑←←↑↑"];
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        const ch = pol[y][x], X = ox + x * c, Y = oy + y * c;
        if (ch === "■") { s += `<rect x="${X + 2}" y="${Y + 2}" width="${c - 4}" height="${c - 4}" rx="4" fill="currentColor" opacity=".55"/>`; continue; }
        s += `<rect x="${X + 2}" y="${Y + 2}" width="${c - 4}" height="${c - 4}" rx="4" fill="currentColor" opacity="${ch === "G" ? .9 : ch === "T" ? .35 : .1}"/>`;
        const cx = X + c / 2, cy = Y + c / 2;
        const d = { "→": [1, 0], "←": [-1, 0], "↑": [0, -1], "↓": [0, 1] }[ch];
        if (d) {
          const x1 = cx - d[0] * 7, y1 = cy - d[1] * 7, x2 = cx + d[0] * 7, y2 = cy + d[1] * 7;
          s += `<path d="M${x1} ${y1} L${x2} ${y2} M${x2 - d[0] * 4 - d[1] * 4} ${y2 - d[1] * 4 - d[0] * 4} L${x2} ${y2} L${x2 - d[0] * 4 + d[1] * 4} ${y2 - d[1] * 4 + d[0] * 4}" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
        }
      }
    } else if (kind === "graph") {    // graphe de connaissances (triplets)
      const N = [[250, 40], [318, 22], [390, 52], [290, 98], [360, 112], [228, 112], [406, 104]];
      const E = [[0, 1], [1, 2], [0, 3], [3, 4], [2, 4], [3, 5], [4, 6], [1, 3]];
      E.forEach(([a, b]) => { s += `<line x1="${N[a][0]}" y1="${N[a][1]}" x2="${N[b][0]}" y2="${N[b][1]}" stroke="currentColor" stroke-width="1.6" opacity=".6"/>`; });
      N.forEach(([x, y], i) => {
        s += i % 3 === 0
          ? `<rect x="${x - 14}" y="${y - 8}" width="28" height="16" rx="3" fill="currentColor" opacity=".85"/>`
          : `<circle cx="${x}" cy="${y}" r="${i === 3 ? 11 : 8}" fill="var(--surface)" stroke="currentColor" stroke-width="2"/>`;
      });
    }
    return `<svg viewBox="${vb || `0 0 ${W} ${H}`}" preserveAspectRatio="xMaxYMid ${fit}" aria-hidden="true">${s}</svg>`;
  }

  /* ---------- Thème ---------- */
  function appliquerTheme() {
    const t = state.theme;
    if (t === "light" || t === "dark") document.documentElement.setAttribute("data-theme", t);
    else document.documentElement.removeAttribute("data-theme");
    document.querySelectorAll("[data-theme-set]").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.themeSet === t)));
    const f = $("#reader-frame");
    if (f && f.contentWindow) f.contentWindow.postMessage({ revisionTheme: t }, "*");
  }
  document.querySelectorAll("[data-theme-set]").forEach((b) =>
    b.addEventListener("click", () => { state.theme = b.dataset.themeSet; save(); appliquerTheme(); })
  );

  /* ---------- Navigation latérale ---------- */
  function renderNav(route) {
    $("#navMatieres").innerHTML = MATIERES.map((m) => {
      const n = m.ressources.length;
      const actif = route.m === m.id;
      return `<a class="nav__item${actif ? " is-active" : ""}" href="#/m/${m.id}" style="--c:${m.couleur}">
        <span class="nav__dot"></span><span class="nav__name">${esc(m.court)}</span>
        ${n ? `<span class="nav__count">${n}</span>` : `<span class="nav__soon">bientôt</span>`}
      </a>`;
    }).join("");
    $('[data-nav="home"]').classList.toggle("is-active", route.view === "home");
  }

  /* ---------- Vue : tableau de bord ---------- */
  function viewHome() {
    const h = new Date().getHours();
    const salut = h < 5 || h >= 18 ? "Bonsoir" : "Bonjour";
    const aujourd = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
    const all = toutes();
    const nbRevises = all.filter(({ m, r }) => state.revises[rkey(m, r)]).length;
    const prets = MATIERES.filter((m) => m.ressources.length).length;

    // Reprendre
    const recent = state.recents.map((x) => { const [mid, rid] = x.k.split("/"); const m = matiere(mid); const r = m && m.ressources.find((r) => r.id === rid); return r ? { m, r, ts: x.ts } : null; }).find(Boolean);
    const sugg = recent || all.find(({ m, r }) => !state.revises[rkey(m, r)]) || all[0];
    const resume = sugg ? `
      <a class="resume" href="#/r/${sugg.m.id}/${sugg.r.id}" style="--c:${sugg.m.couleur}">
        <span class="resume__icon">${icon(TYPES[sugg.r.type]?.icon || "fiche", 24)}</span>
        <span><span class="resume__title">${esc(sugg.r.titre)}</span><br>
          <span class="resume__meta">${esc(sugg.m.nom)} · ${recent ? "ouvert " + ilYa(recent.ts) : "pas encore ouvert"}</span></span>
        <span class="resume__go">${recent ? "Reprendre" : "Commencer"} →</span>
      </a>` : "";

    // Échéances
    const ech = MATIERES.map((m) => ({ m, d: state.examens[m.id], j: joursAvant(state.examens[m.id]) }))
      .filter((x) => x.d && x.j >= 0).sort((a, b) => a.j - b.j);
    const echeances = ech.length
      ? `<div class="deadlines">${ech.map(({ m, d, j }) => `
          <a class="deadline" href="#/m/${m.id}" style="--c:${m.couleur}">
            <span class="deadline__j">${j === 0 ? "Auj." : "J-" + j}</span>
            <span><b>${esc(m.nom)}</b></span>
            <span class="deadline__date">${fmtDate(d)}</span>
          </a>`).join("")}</div>`
      : `<p class="hint">Aucune date d'examen enregistrée. Ouvre une matière et renseigne la date de l'examen pour voir le compte à rebours ici.</p>`;

    main.innerHTML = `<div class="page">
      <div class="hello">
        <div>
          <p class="eyebrow">${esc(aujourd)}</p>
          <h1 class="h1">${salut}. On révise quoi aujourd'hui ?</h1>
        </div>
        <div class="stats">
          <div class="stat"><b>${all.length}</b><span>ressources</span></div>
          <div class="stat"><b>${nbRevises}</b><span>révisées</span></div>
          <div class="stat"><b>${prets}/${MATIERES.length}</b><span>matières prêtes</span></div>
        </div>
      </div>

      ${resume ? `<section class="section"><div class="section__head"><h2 class="h2">Reprendre</h2></div>${resume}</section>` : ""}

      <section class="section">
        <div class="section__head"><h2 class="h2">Matières</h2><p>${MATIERES.length} cours ce semestre</p></div>
        <div class="grid">${MATIERES.map(carteMatiere).join("")}</div>
      </section>

      <section class="section">
        <div class="section__head"><h2 class="h2">Prochains examens</h2></div>
        ${echeances}
      </section>
    </div>`;
  }

  function carteMatiere(m) {
    const p = progression(m);
    const n = m.ressources.length;
    const types = [...new Set(m.ressources.map((r) => TYPES[r.type]?.label || r.type))];
    const j = joursAvant(state.examens[m.id]);
    return `<a class="mcard" href="#/m/${m.id}" style="--c:${m.couleur}">
      <div class="mcard__art">${motif(m.motif, null, "meet")}<span class="mcard__tag">${esc(m.court)}</span></div>
      <div class="mcard__body">
        <div class="mcard__name">${esc(m.nom)}</div>
        <p class="mcard__desc">${esc(m.description)}</p>
        <div class="mcard__foot">
          <div class="mcard__row">
            <span>${n ? `<b>${n}</b> ressource${n > 1 ? "s" : ""} · ${esc(types.join(", "))}` : "Contenu à venir"}</span>
            <span>${j != null && j >= 0 ? `<b>J-${j}</b>` : p.total ? `<b>${p.pct}%</b>` : ""}</span>
          </div>
          <div class="bar"><i style="width:${p.pct}%"></i></div>
        </div>
      </div>
    </a>`;
  }

  /* ---------- Vue : matière ---------- */
  function viewMatiere(m) {
    const p = progression(m);
    const parType = {};
    m.ressources.forEach((r) => (parType[r.type] = parType[r.type] || []).push(r));
    const ordre = Object.keys(TYPES).filter((t) => parType[t]);
    const manquants = SLOTS_DE_BASE.filter((t) => !parType[t]);

    const groupes = ordre.map((t) => `
      <div class="rgroup">
        <h3 class="rgroup__title">${esc(TYPES[t].groupe)} <span class="count">${parType[t].length}</span></h3>
        <div class="rlist">${parType[t].map((r) => carteRessource(m, r)).join("")}</div>
      </div>`).join("");

    const slots = manquants.length && m.ressources.length ? `
      <div class="rgroup">
        <h3 class="rgroup__title">À venir</h3>
        <div class="rlist">${manquants.map((t) => `
          <div class="slot"><span class="slot__icon">${icon(TYPES[t].icon, 18)}</span>
            <span><b>${esc(TYPES[t].groupe)}</b>Pas encore de ${esc(TYPES[t].label.toLowerCase())} pour cette matière.</span></div>`).join("")}
        </div>
      </div>` : "";

    const vide = !m.ressources.length ? `
      <div class="empty">
        <div class="empty__art">${motif(m.motif, "200 0 220 140", "meet")}</div>
        <h3>Le contenu arrive bientôt</h3>
        <p>Les fiches, QCM et examens blancs de ${esc(m.nom)} apparaîtront ici. Dépose la page dans <code>matieres/${esc(m.id)}/</code> et ajoute-la dans <code>site/contenu.js</code>.</p>
      </div>
      <div class="rgroup" style="margin-top:24px"><div class="rlist">${SLOTS_DE_BASE.map((t) => `
        <div class="slot"><span class="slot__icon">${icon(TYPES[t].icon, 18)}</span>
          <span><b>${esc(TYPES[t].groupe)}</b>À venir</span></div>`).join("")}</div></div>` : "";

    const chaps = m.chapitres || [];
    const coches = state.chapitres[m.id] || {};

    main.innerHTML = `<div class="page" style="--c:${m.couleur}">
      <section class="hero">
        <div class="hero__art">${motif(m.motif)}</div>
        <div class="hero__inner">
          <p class="eyebrow">${esc(m.court)} · Polytech SI5</p>
          <h1 class="h1">${esc(m.nom)}</h1>
          <p class="lede" style="color:var(--ink-2)">${esc(m.description)}</p>
          <div class="hero__meta">
            <span class="chip chip--mono">${m.ressources.length} ressource${m.ressources.length > 1 ? "s" : ""}</span>
            <label class="dateinput">Examen
              <input type="date" id="examDate" value="${esc(state.examens[m.id] || "")}" aria-label="Date de l'examen">
            </label>
            <span class="chip chip--mono" id="countdown" ${state.examens[m.id] ? "" : "hidden"}></span>
          </div>
          ${p.total ? `<div class="hero__progress"><span>Progression · <b id="pctTxt">${p.faits}/${p.total}</b> (révisions + chapitres)</span><div class="bar"><i id="pctBar" style="width:${p.pct}%"></i></div></div>` : ""}
        </div>
      </section>

      <div class="section layout2">
        <div>${groupes}${slots}${vide}</div>
        <aside>
          <div class="panel">
            <h3>Chapitres revus</h3>
            ${chaps.length
              ? `<div class="chapters">${chaps.map((c) => `<button class="chip" data-chap="${esc(c)}" aria-pressed="${!!coches[c]}">${esc(c)}</button>`).join("")}</div>`
              : `<p style="margin:0;color:var(--muted);font-size:13.5px">Les chapitres s'afficheront ici une fois ajoutés dans <code style="font-family:var(--f-mono);font-size:12px">site/contenu.js</code>.</p>`}
          </div>
          <div class="panel">
            <h3>Mes notes</h3>
            <textarea class="notes" id="notes" placeholder="Points à retenir, formules, pièges à éviter…">${esc(state.notes[m.id] || "")}</textarea>
            <div class="saved" id="saved"></div>
          </div>
        </aside>
      </div>
    </div>`;

    // Interactions
    const majProgress = () => {
      const q = progression(m);
      if ($("#pctTxt")) { $("#pctTxt").textContent = q.faits + "/" + q.total; $("#pctBar").style.width = q.pct + "%"; }
    };
    const majCountdown = () => {
      const el = $("#countdown"); const d = state.examens[m.id];
      if (!d) { el.hidden = true; return; }
      const j = joursAvant(d); el.hidden = false;
      el.textContent = j > 0 ? "dans " + j + " jour" + (j > 1 ? "s" : "") : j === 0 ? "aujourd'hui !" : "passé";
    };
    majCountdown();
    $("#examDate").addEventListener("change", (e) => {
      if (e.target.value) state.examens[m.id] = e.target.value; else delete state.examens[m.id];
      save(); majCountdown();
    });
    main.querySelectorAll("[data-chap]").forEach((b) => b.addEventListener("click", () => {
      const c = b.dataset.chap; state.chapitres[m.id] = state.chapitres[m.id] || {};
      state.chapitres[m.id][c] = !state.chapitres[m.id][c];
      b.setAttribute("aria-pressed", String(state.chapitres[m.id][c])); save(); majProgress();
    }));
    let tm;
    $("#notes").addEventListener("input", (e) => {
      state.notes[m.id] = e.target.value; clearTimeout(tm);
      $("#saved").textContent = "…";
      tm = setTimeout(() => { save(); $("#saved").textContent = "Enregistré dans ce navigateur"; }, 400);
    });
    main.querySelectorAll("[data-revise]").forEach((b) => b.addEventListener("click", () => {
      basculerRevise(b.dataset.revise); viewMatiere(m);
    }));
  }

  function carteRessource(m, r) {
    const k = rkey(m, r);
    const fait = !!state.revises[k];
    const vu = state.recents.find((x) => x.k === k);
    return `<article class="rcard">
      <span class="rcard__icon">${icon(TYPES[r.type]?.icon || "fiche", 22)}</span>
      <div>
        <h4 class="rcard__title">${esc(r.titre)} ${fait ? `<span class="badge-ok">Révisé</span>` : ""}</h4>
        <p class="rcard__desc">${esc(r.description || "")}</p>
        ${r.tags?.length ? `<div class="rcard__tags">${r.tags.map((t) => `<span class="chip chip--mono">${esc(t)}</span>`).join("")}</div>` : ""}
        <div class="rcard__actions">
          <a class="btn btn--c" href="#/r/${m.id}/${r.id}">${icon("arrow", 16)} Ouvrir</a>
          <button class="btn" data-revise="${k}" aria-pressed="${fait}">${icon("check", 16)} ${fait ? "Révisé" : "Marquer révisé"}</button>
          <a class="btn" href="${encodeURI(r.fichier)}" target="_blank" rel="noopener">${icon("open", 16)} Nouvel onglet</a>
          ${vu ? `<span style="color:var(--muted);font-size:12.5px">Ouvert ${ilYa(vu.ts)}</span>` : ""}
        </div>
      </div>
    </article>`;
  }

  function basculerRevise(k) {
    if (state.revises[k]) delete state.revises[k]; else state.revises[k] = Date.now();
    save();
  }

  /* ---------- Vue : lecteur ---------- */
  function viewReader(m, r) {
    const k = rkey(m, r);
    state.recents = [{ k, ts: Date.now() }, ...state.recents.filter((x) => x.k !== k)].slice(0, 12);
    save();
    const src = encodeURI(r.fichier) + (state.theme !== "auto" ? "?theme=" + state.theme : "");
    const fait = !!state.revises[k];
    main.innerHTML = `<div class="reader" style="--c:${m.couleur}">
      <div class="reader__bar">
        <a class="iconbtn" href="#/m/${m.id}" aria-label="Retour à la matière">${icon("back", 18)}</a>
        <div class="crumbs">
          <a href="#/m/${m.id}"><span class="nav__dot" style="display:inline-block;margin-right:6px"></span>${esc(m.court)}</a>
          <span class="sep">/</span><strong>${esc(r.titre)}</strong>
        </div>
        <div class="reader__actions">
          <button class="btn" id="rv" aria-pressed="${fait}">${icon("check", 16)} <span>${fait ? "Révisé" : "Marquer révisé"}</span></button>
          <button class="iconbtn" data-action="focus" title="Mode concentration (masquer le menu)" aria-label="Mode concentration">${icon("focus", 18)}</button>
          <button class="iconbtn" id="reload" title="Recharger" aria-label="Recharger">${icon("reload", 18)}</button>
          <a class="iconbtn" href="${encodeURI(r.fichier)}" target="_blank" rel="noopener" title="Ouvrir dans un nouvel onglet" aria-label="Nouvel onglet">${icon("open", 18)}</a>
        </div>
      </div>
      <div class="reader__frame"><iframe id="reader-frame" src="${src}" title="${esc(r.titre)}"></iframe></div>
    </div>`;
    const f = $("#reader-frame");
    f.addEventListener("load", () => f.contentWindow && f.contentWindow.postMessage({ revisionTheme: state.theme }, "*"));
    $("#rv").addEventListener("click", (e) => {
      basculerRevise(k); const on = !!state.revises[k];
      e.currentTarget.setAttribute("aria-pressed", String(on));
      e.currentTarget.querySelector("span").textContent = on ? "Révisé" : "Marquer révisé";
    });
    $("#reload").addEventListener("click", () => { f.src = f.src; });
  }

  /* ---------- Routeur ---------- */
  function parse() {
    const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
    if (parts[0] === "m" && matiere(parts[1])) return { view: "matiere", m: parts[1] };
    if (parts[0] === "r" && matiere(parts[1])) {
      const r = matiere(parts[1]).ressources.find((x) => x.id === parts[2]);
      if (r) return { view: "reader", m: parts[1], r: parts[2] };
    }
    return { view: "home" };
  }
  function route() {
    const rt = parse();
    shell.classList.remove("nav-open");
    if (rt.view !== "reader") shell.classList.remove("is-focus");
    renderNav(rt);
    if (rt.view === "home") { viewHome(); document.title = DATA.titre; }
    else if (rt.view === "matiere") { const m = matiere(rt.m); viewMatiere(m); document.title = m.court + " · " + DATA.titre; }
    else { const m = matiere(rt.m); const r = m.ressources.find((x) => x.id === rt.r); viewReader(m, r); document.title = r.titre + " · " + m.court; }
    window.scrollTo(0, 0);
    main.focus({ preventScroll: true });
  }
  window.addEventListener("hashchange", route);

  /* ---------- Menu mobile & mode concentration ---------- */
  $("#openNav").addEventListener("click", () => shell.classList.add("nav-open"));
  $("#scrim").addEventListener("click", () => shell.classList.remove("nav-open"));
  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-action]");
    if (!a) return;
    if (a.dataset.action === "search") ouvrirPalette();
    if (a.dataset.action === "focus") shell.classList.toggle("is-focus");
  });

  /* ---------- Palette de recherche ---------- */
  const pal = $("#palette"), pin = $("#paletteInput"), plist = $("#paletteList");
  let sel = 0, items = [];
  const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  function indexRecherche() {
    const out = [{ titre: "Tableau de bord", sous: "Accueil", href: "#/", kind: "page", c: "var(--ink)" }];
    MATIERES.forEach((m) => {
      out.push({ titre: m.nom, sous: m.court + (m.ressources.length ? "" : " · contenu à venir"), href: "#/m/" + m.id, kind: "matière", c: m.couleur, txt: m.description + " " + (m.chapitres || []).join(" ") });
      m.ressources.forEach((r) => out.push({ titre: r.titre, sous: m.nom, href: `#/r/${m.id}/${r.id}`, kind: TYPES[r.type]?.label || r.type, c: m.couleur, txt: (r.description || "") + " " + (r.tags || []).join(" ") + " " + m.court }));
    });
    return out;
  }
  function filtrer() {
    const q = norm(pin.value.trim());
    const all = indexRecherche();
    items = !q ? all : all.filter((x) => q.split(/\s+/).every((w) => norm(x.titre + " " + x.sous + " " + (x.txt || "")).includes(w)));
    sel = Math.min(sel, Math.max(0, items.length - 1));
    plist.innerHTML = items.length ? items.map((x, i) => `<li><a href="${x.href}" class="${i === sel ? "is-sel" : ""}" data-i="${i}" style="--c:${x.c}">
      <span class="nav__dot"></span><span><span class="p-title">${esc(x.titre)}</span><br><span class="p-sub">${esc(x.sous)}</span></span>
      <span class="p-kind">${esc(x.kind)}</span></a></li>`).join("")
      : `<li class="palette__empty">Rien trouvé pour « ${esc(pin.value)} »</li>`;
  }
  function ouvrirPalette() { pal.hidden = false; pin.value = ""; sel = 0; filtrer(); pin.focus(); }
  function fermerPalette() { pal.hidden = true; }
  pin.addEventListener("input", () => { sel = 0; filtrer(); });
  pal.addEventListener("click", (e) => { if (e.target === pal || e.target.closest("a")) fermerPalette(); });
  pal.addEventListener("mousemove", (e) => {
    const a = e.target.closest("a[data-i]"); if (!a || +a.dataset.i === sel) return;
    sel = +a.dataset.i; plist.querySelectorAll("a").forEach((x, i) => x.classList.toggle("is-sel", i === sel));
  });
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); pal.hidden ? ouvrirPalette() : fermerPalette(); return; }
    if (pal.hidden) {
      if (e.key === "/" && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); ouvrirPalette(); }
      return;
    }
    if (e.key === "Escape") fermerPalette();
    else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault(); if (!items.length) return;
      sel = (sel + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
      plist.querySelectorAll("a").forEach((x, i) => x.classList.toggle("is-sel", i === sel));
      plist.querySelector(".is-sel")?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter" && items[sel]) { location.hash = items[sel].href; fermerPalette(); }
  });

  /* ---------- Démarrage ---------- */
  appliquerTheme();
  route();
})();
