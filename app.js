/* ============================================================
   Expediente de Estudio — Seguimiento de Oposición Tributario
   Vanilla JS, localStorage persistence. No build step required.
   ============================================================ */

const PLAN_START = "2026-07-20";
const PLAN_END = "2026-08-31";

const WEEKS = [
  { id: "S1", range: "20-26 Jul", start: "2026-07-20", end: "2026-07-26", temas: "T12 · T13", foco: "Embargos (Art.169 LGT) y Sanciones (Art.188/191 LGT)" },
  { id: "S2", range: "27 Jul-2 Ago", start: "2026-07-27", end: "2026-08-02", temas: "T14", foco: "Revisión: reposición (1 mes), reclamaciones (6m/1a)" },
  { id: "S3", range: "3-9 Ago", start: "2026-08-03", end: "2026-08-09", temas: "T15 · T16", foco: "IRPF: rentas exentas Art.7, autoliquidaciones rectificativas" },
  { id: "S4", range: "10-16 Ago", start: "2026-08-10", end: "2026-08-16", temas: "T18 · T19", foco: "IVA: hecho imponible, prorrata, SII" },
  { id: "S5", range: "17-23 Ago", start: "2026-08-17", end: "2026-08-23", temas: "T17 · T20", foco: "Sociedades (devengo IS) y Aduanas" },
  { id: "S6", range: "24-31 Ago", start: "2026-08-24", end: "2026-08-31", temas: "Repaso gral.", foco: "Consolidación T12-T20 + simulacros" },
];

const TEMAS = [
  { id: "T1", nombre: "Principios Tributarios", grupo: "Base" },
  { id: "T2", nombre: "AEAT", grupo: "Base" },
  { id: "T3", nombre: "Tema 3", grupo: "Base" },
  { id: "T4", nombre: "Tema 4", grupo: "Base" },
  { id: "T5", nombre: "Tema 5", grupo: "Base" },
  { id: "T6", nombre: "Tema 6", grupo: "Base" },
  { id: "T7", nombre: "Tema 7", grupo: "Base" },
  { id: "T8", nombre: "Tema 8", grupo: "Base" },
  { id: "T9", nombre: "Tema 9", grupo: "Base" },
  { id: "T10", nombre: "Tema 10", grupo: "Base" },
  { id: "T11", nombre: "Tema 11", grupo: "Base" },
  { id: "T12", nombre: "Embargos y Responsables", grupo: "Nuevo" },
  { id: "T13", nombre: "Potestad Sancionadora", grupo: "Nuevo" },
  { id: "T14", nombre: "Revisión Administrativa", grupo: "Nuevo" },
  { id: "T15", nombre: "IRPF (I)", grupo: "Nuevo" },
  { id: "T16", nombre: "IRPF (II)", grupo: "Nuevo" },
  { id: "T17", nombre: "Sociedades", grupo: "Nuevo" },
  { id: "T18", nombre: "IVA (I)", grupo: "Nuevo" },
  { id: "T19", nombre: "IVA (II)", grupo: "Nuevo" },
  { id: "T20", nombre: "Aduanas", grupo: "Nuevo" },
];

const ESTADOS = ["Pendiente", "Estudiado", "Repasado", "Dominado"];

const BLOQUES = [
  { key: "b1", label: "Bloque 1 · Arrastre Evolutivo", sub: "45 min — micro-arrastre T12-T20 + macro-arrastre base" },
  { key: "b2", label: "Bloque 2 · Máxima Literalidad", sub: "105 min — tema nuevo: artículos, plazos, cuantías" },
  { key: "b3", label: "Bloque 3 · Supuestos y Test", sub: "60 min — test difícil + caso práctico" },
];

const BAR_COLORS = { green: "#2F6D4F", gold: "#A97A2F", red: "#A13D2C", line: "#CFC3A3" };

/* ---------------- Date helpers ---------------- */
function toISO(d) { return d.toISOString().slice(0, 10); }
function parseISO(s) { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); }
function isScheduledDay(d) { return d.getDay() !== 0; }
function weekLabelFor(iso) { return WEEKS.find(w => iso >= w.start && iso <= w.end) || null; }
function fmtLong(iso) { return parseISO(iso).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" }); }
function fmtDow(iso) { return parseISO(iso).toLocaleDateString("es-ES", { weekday: "short" }).replace(".", ""); }

function buildSchedule() {
  const out = [];
  let cur = parseISO(PLAN_START);
  const end = parseISO(PLAN_END);
  while (cur <= end) {
    if (isScheduledDay(cur)) out.push(toISO(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}
const SCHEDULE = buildSchedule();

function clampToPlan(iso) {
  if (iso < PLAN_START) return PLAN_START;
  if (iso > PLAN_END) return PLAN_END;
  return iso;
}
function nearestScheduled(iso) {
  let d = parseISO(clampToPlan(iso));
  const end = parseISO(PLAN_END);
  while (d <= end && !isScheduledDay(d)) d.setDate(d.getDate() + 1);
  return toISO(d);
}

/* ---------------- Storage ---------------- */
function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore */ }
  return fallback;
}
function saveJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch (e) { console.error("storage error", key, e); }
}

/* ---------------- State ---------------- */
let logs = loadJSON("logs-diarios", {});
let temas = loadJSON("temas-estado", (() => {
  const t0 = {};
  TEMAS.forEach(tm => { t0[tm.id] = tm.grupo === "Nuevo" ? "Pendiente" : "Estudiado"; });
  return t0;
})());
let cursor = nearestScheduled(toISO(new Date()));
let activeTab = "hoy";

function updateLog(iso, patch) {
  logs[iso] = Object.assign({ b1: false, b2: false, b3: false, nota: "" }, logs[iso] || {}, patch);
  saveJSON("logs-diarios", logs);
  render();
}
function cycleTema(id) {
  const idx = ESTADOS.indexOf(temas[id] || "Pendiente");
  temas[id] = ESTADOS[(idx + 1) % ESTADOS.length];
  saveJSON("temas-estado", temas);
  render();
}

/* ---------------- Stats ---------------- */
function computeStats() {
  const today = toISO(new Date());
  const pastScheduled = SCHEDULE.filter(d => d <= today);
  let completed = 0;
  pastScheduled.forEach(d => {
    const l = logs[d];
    if (l && l.b1 && l.b2 && l.b3) completed++;
  });
  let streak = 0;
  for (let i = pastScheduled.length - 1; i >= 0; i--) {
    const l = logs[pastScheduled[i]];
    if (l && l.b1 && l.b2 && l.b3) streak++;
    else break;
  }
  const weekly = WEEKS.map(w => {
    const days = SCHEDULE.filter(d => d >= w.start && d <= w.end && d <= today);
    const done = days.filter(d => { const l = logs[d]; return l && l.b1 && l.b2 && l.b3; }).length;
    const pct = days.length ? Math.round((done / days.length) * 100) : null;
    return Object.assign({}, w, { done, total: days.length, pct });
  });
  const dominados = TEMAS.filter(t => temas[t.id] === "Dominado").length;
  return { completed, totalPast: pastScheduled.length, streak, weekly, dominados };
}

/* ---------------- Render: Hoy ---------------- */
function renderHoy() {
  const wLabel = weekLabelFor(cursor);
  const curLog = logs[cursor] || { b1: false, b2: false, b3: false, nota: "" };
  const allDone = curLog.b1 && curLog.b2 && curLog.b3;
  const curIdx = SCHEDULE.indexOf(cursor);
  const canPrev = curIdx > 0;
  const canNext = curIdx < SCHEDULE.length - 1;

  const el = document.createElement("div");
  el.innerHTML = `
    <div class="day-nav">
      <button class="nav-btn" id="prev-day" ${canPrev ? "" : "disabled"}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <div style="text-align:center">
        <div class="day-title">${fmtLong(cursor)}</div>
        ${wLabel ? `<div class="day-week">${wLabel.id} · ${wLabel.temas} — ${wLabel.foco}</div>` : ""}
      </div>
      <button class="nav-btn" id="next-day" ${canNext ? "" : "disabled"}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
      </button>
    </div>

    <div class="status-card">
      <div class="stamp ${allDone ? "done" : ""}"><span>${allDone ? "CONFORME" : "PEND."}</span></div>
      <div style="flex:1">
        <div class="status-title ${allDone ? "done" : ""}">${allDone ? "Jornada completa" : "Jornada en curso"}</div>
        <div class="status-sub">${allDone ? "Los tres bloques quedan sellados como conformes." : "Marca los tres bloques al completarlos para sellar el día."}</div>
      </div>
    </div>

    ${BLOQUES.map(b => `
      <label class="bloque-row" data-key="${b.key}">
        <input type="checkbox" data-key="${b.key}" ${curLog[b.key] ? "checked" : ""}>
        <div>
          <div class="bloque-label ${curLog[b.key] ? "done" : ""}">${b.label}</div>
          <div class="bloque-sub">${b.sub}</div>
        </div>
      </label>
    `).join("")}

    <div style="margin-top:16px">
      <div class="section-label">Notas del día</div>
      <textarea class="notas" id="notas-input" placeholder="Artículos que fallaron, dudas, tiempo real invertido…">${curLog.nota || ""}</textarea>
    </div>
  `;

  el.querySelector("#prev-day").onclick = () => { if (canPrev) { cursor = SCHEDULE[curIdx - 1]; render(); } };
  el.querySelector("#next-day").onclick = () => { if (canNext) { cursor = SCHEDULE[curIdx + 1]; render(); } };
  el.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.onchange = (e) => updateLog(cursor, { [cb.dataset.key]: e.target.checked });
  });
  el.querySelector("#notas-input").onblur = (e) => updateLog(cursor, { nota: e.target.value });
  return el;
}

/* ---------------- Render: Semana ---------------- */
function renderSemana() {
  const today = toISO(new Date());
  const el = document.createElement("div");
  WEEKS.forEach(w => {
    const days = SCHEDULE.filter(d => d >= w.start && d <= w.end);
    const block = document.createElement("div");
    block.className = "week-block";
    block.innerHTML = `
      <div class="week-head">
        <div class="week-title">${w.id} · ${w.range}</div>
        <div class="week-temas">${w.temas}</div>
      </div>
      <div class="week-foco">${w.foco}</div>
      <div class="week-grid">
        ${days.map(d => {
          const l = logs[d];
          const done = l && l.b1 && l.b2 && l.b3;
          const partial = l && (l.b1 || l.b2 || l.b3) && !done;
          const isFuture = d > today;
          let cls = "day-cell";
          if (done) cls += " done";
          else if (partial) cls += " partial";
          else if (isFuture) cls += " future";
          else cls += " empty";
          return `<div class="${cls}" title="${fmtLong(d)}">
                    <div class="num">${parseISO(d).getDate()}</div>
                    <div class="dow">${fmtDow(d)}</div>
                  </div>`;
        }).join("")}
      </div>
    `;
    el.appendChild(block);
  });
  return el;
}

/* ---------------- Render: Temario ---------------- */
function renderTemario() {
  const el = document.createElement("div");
  el.innerHTML = `<div class="hint">Toca un tema para avanzar su estado: Pendiente → Estudiado → Repasado → Dominado.</div>`;

  function group(title, list) {
    const g = document.createElement("div");
    g.className = "group";
    g.innerHTML = `<div class="section-label">${title}</div>`;
    list.forEach(t => {
      const estado = temas[t.id] || "Pendiente";
      const btn = document.createElement("button");
      btn.className = "tema-row";
      btn.innerHTML = `
        <span class="tema-name"><span class="tema-id">${t.id}</span>${t.nombre}</span>
        <span class="pill pill-${estado}">${estado}</span>
      `;
      btn.onclick = () => cycleTema(t.id);
      g.appendChild(btn);
    });
    return g;
  }

  el.appendChild(group("Temas nuevos (T12-T20)", TEMAS.filter(t => t.grupo === "Nuevo")));
  el.appendChild(group("Base (T1-T11)", TEMAS.filter(t => t.grupo === "Base")));
  return el;
}

/* ---------------- Render: Evolución ---------------- */
function renderEvolucion() {
  const stats = computeStats();
  const el = document.createElement("div");

  const maxBar = 100;
  const bars = stats.weekly.map(w => {
    const pct = w.pct === null ? 0 : w.pct;
    const color = w.total === 0 ? BAR_COLORS.line : (pct >= 80 ? BAR_COLORS.green : pct >= 50 ? BAR_COLORS.gold : BAR_COLORS.red);
    const heightPct = w.total === 0 ? 3 : Math.max(pct, 3);
    return `
      <div class="bar-col">
        <div class="bar-pct">${w.total === 0 ? "—" : pct + "%"}</div>
        <div class="bar-fill" style="height:${heightPct}%; background:${color};"></div>
        <div class="bar-name">${w.id}</div>
      </div>
    `;
  }).join("");

  el.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value" style="color:${BAR_COLORS.gold}">${stats.streak}<span class="stat-suffix">días</span></div>
        <div class="stat-label">Racha actual</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color:${BAR_COLORS.green}">${stats.completed}/${stats.totalPast}</div>
        <div class="stat-label">Jornadas cumplidas</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color:${BAR_COLORS.red}">${stats.dominados}<span class="stat-suffix">/20</span></div>
        <div class="stat-label">Temas dominados</div>
      </div>
    </div>

    <div class="section-label">Cumplimiento semanal</div>
    <div class="chart-box">
      <div class="bar-chart">${bars}</div>
      <div class="chart-legend">Verde ≥ 80% de cumplimiento semanal · Ocre 50-79% · Rojo &lt; 50%. Semanas futuras en gris.</div>
    </div>

    <div class="section-label" style="margin-top:24px">Copia de seguridad</div>
    <div class="backup-box">
      <p class="backup-text">Exporta tus datos para llevarlos a otro navegador u ordenador, o impórtalos aquí si vienes de otro dispositivo.</p>
      <div class="backup-actions">
        <button class="backup-btn" id="export-btn">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
          Exportar datos
        </button>
        <button class="backup-btn" id="import-btn">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
          Importar datos
        </button>
        <input type="file" id="import-file" accept="application/json" style="display:none">
      </div>
      <div id="backup-msg" class="backup-msg"></div>
    </div>
  `;

  el.querySelector("#export-btn").onclick = exportData;
  const fileInput = el.querySelector("#import-file");
  el.querySelector("#import-btn").onclick = () => fileInput.click();
  fileInput.onchange = (e) => {
    if (e.target.files && e.target.files[0]) importData(e.target.files[0]);
  };

  return el;
}

/* ---------------- Export / Import ---------------- */
function exportData() {
  const payload = {
    app: "expediente-estudio-oposicion",
    version: 1,
    exportedAt: new Date().toISOString(),
    logsDiarios: logs,
    temasEstado: temas,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = toISO(new Date());
  a.href = url;
  a.download = `expediente-estudio-backup-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showBackupMsg("Copia exportada correctamente.", false);
}

function importData(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (!data || typeof data !== "object" || !("logsDiarios" in data) || !("temasEstado" in data)) {
        throw new Error("Formato no reconocido");
      }
      const proceed = window.confirm(
        "Esto reemplazará los datos actuales guardados en este navegador por los del archivo importado. ¿Continuar?"
      );
      if (!proceed) return;
      logs = data.logsDiarios || {};
      temas = data.temasEstado || temas;
      saveJSON("logs-diarios", logs);
      saveJSON("temas-estado", temas);
      showBackupMsg("Datos importados correctamente.", false);
      render();
    } catch (err) {
      showBackupMsg("No se pudo leer el archivo. Comprueba que es un backup válido.", true);
    }
  };
  reader.readAsText(file);
}

function showBackupMsg(text, isError) {
  const msg = document.getElementById("backup-msg");
  if (!msg) return;
  msg.textContent = text;
  msg.className = "backup-msg" + (isError ? " error" : " ok");
  setTimeout(() => { if (msg) { msg.textContent = ""; msg.className = "backup-msg"; } }, 4000);
}

/* ---------------- Main render / router ---------------- */
function render() {
  const content = document.getElementById("content");
  content.innerHTML = "";
  const renderers = { hoy: renderHoy, semana: renderSemana, temario: renderTemario, evolucion: renderEvolucion };
  content.appendChild(renderers[activeTab]());

  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tab === activeTab);
  });

  const stats = computeStats();
  document.getElementById("streak-count").textContent = stats.streak;
}

document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.onclick = () => { activeTab = btn.dataset.tab; render(); };
});

render();
