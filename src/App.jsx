import { useState, useMemo, useEffect, useCallback } from "react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend
} from "recharts";

// ─── PALETTE ────────────────────────────────────────────────────────────────
const C = {
  bg:           "#FDF8F3",
  white:        "#FFFFFF",
  sand:         "#F7F0E8",
  sandDark:     "#EDE3D8",
  primary:      "#E8944A",
  primaryLight: "#F0A96A",
  primaryPale:  "#FDF0E3",
  primaryDeep:  "#B5621C",
  secondary:    "#C4A882",
  secondaryPale:"#F5EEE5",
  secondaryDark:"#9A7A56",
  rose:         "#E87D7D",
  rosePale:     "#FDEAEA",
  sage:         "#8FAF8A",
  sagePale:     "#EBF4E9",
  lavender:     "#A08CBF",
  lavenderPale: "#F0EBF8",
  text:         "#2D2318",
  muted:        "#9A8878",
  border:       "#E8DDD0",
  green:        "#72A870", greenPale:  "#E9F4E8",
  yellow:       "#D4A843", yellowPale: "#FDF4DE",
  red:          "#C96060", redPale:    "#FCEAEA",
};

// ─── CONSTANTES ─────────────────────────────────────────────────────────────
const SAIGNEMENT_OPTS = [
  { value: "aucun",    label: "Aucun",    color: C.muted },
  { value: "spotting", label: "Spotting", color: C.secondary },
  { value: "faible",   label: "Faible",   color: C.yellow },
  { value: "normal",   label: "Normal",   color: C.primary },
  { value: "abondant", label: "Abondant", color: C.red },
];
const SENSATION_OPTS = [
  { value: "seche",      label: "Sèche",      color: C.yellow },
  { value: "humide",     label: "Humide",     color: C.primary },
  { value: "lubrifiee",  label: "Lubrifiée",  color: C.sage },
];
const APPARENCE_OPTS = [
  { value: "aucune",   label: "Aucune",   color: C.muted },
  { value: "pateuse",  label: "Pâteuse",  color: C.yellow },
  { value: "fertile",  label: "Fertile",  color: C.sage },
];
const FERMETE_OPTS = [
  { value: "ferme", label: "Ferme", color: C.primary },
  { value: "mou",   label: "Mou",   color: C.sage },
];
const OUVERTURE_OPTS = [
  { value: "ferme",  label: "Fermé",  color: C.primary },
  { value: "moyen",  label: "Moyen",  color: C.yellow },
  { value: "ouvert", label: "Ouvert", color: C.red },
];
const RAPPORT_OPTS = [
  { value: "sans_protection", label: "Sans protection", color: C.lavender },
  { value: "avec_protection", label: "Avec protection", color: C.sage },
];

const EMPTY_FORM = {
  date: new Date().toISOString().slice(0, 10),
  temperature: "",
  heure: "",
  saignement: null,
  glaireSensation: null,
  glaireApparence: null,
  colFermete: null,
  colOuverture: null,
  rapport: null,
  perturbation: "",
};

const DEFAULT_SETTINGS = {
  prenom: "",
  darkMode: false,
  longueurCycleMoyenne: 28,
  longueurLutealeMoyenne: 14,
};

// ─── STYLES GLOBAUX ─────────────────────────────────────────────────────────
const G = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; }
  html { overflow-x: hidden; }
  body {
    background: var(--bg); font-family: 'DM Sans', sans-serif; color: var(--text-c);
    font-size: 14px; line-height: 1.5;
    overflow-x: hidden;
    -webkit-text-size-adjust: 100%;
  }
  :root {
    --bg: ${C.bg};
    --surface: ${C.white};
    --surface-2: ${C.sand};
    --surface-3: ${C.sandDark};
    --border-c: ${C.border};
    --text-c: ${C.text};
    --muted-c: ${C.muted};
  }
  :root.dark {
    --bg: #1A1410;
    --surface: #241D17;
    --surface-2: #2E2520;
    --surface-3: #3A302A;
    --border-c: #4A3D33;
    --text-c: #F0E8DF;
    --muted-c: #9A8878;
  }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border-c); border-radius: 99px; }
  input, select, textarea {
    font-family: inherit; font-size: 16px; color: var(--text-c);
    background: var(--surface); border: 1px solid var(--border-c);
    border-radius: 10px; padding: 9px 13px; width: 100%; outline: none;
    transition: border-color .2s, box-shadow .2s;
    -webkit-appearance: none;
  }
  input:focus, select:focus, textarea:focus {
    border-color: ${C.primary}; box-shadow: 0 0 0 3px ${C.primaryPale};
  }
  textarea { resize: vertical; min-height: 72px; }
  table { width: 100%; border-collapse: collapse; }
  thead th { padding: 10px 14px; text-align: left; font-weight: 600; font-size: 12px;
    text-transform: uppercase; letter-spacing: .06em; color: var(--muted-c);
    border-bottom: 1px solid var(--border-c); background: var(--surface-2); }
  tbody tr { border-bottom: 1px solid var(--border-c); cursor: pointer; transition: background .15s; }
  tbody tr:hover { background: var(--surface-2); }
  tbody td { padding: 11px 14px; }
  .tbl-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  .anim { animation: fadeUp .35s ease both; }
  .badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 9px; border-radius: 99px; font-size: 12px; font-weight: 500;
    white-space: nowrap;
  }
  .badge-orange { background: ${C.primaryPale}; color: ${C.primaryDeep}; }
  .badge-rose   { background: ${C.rosePale};    color: ${C.rose}; }
  .badge-sage   { background: ${C.sagePale};    color: ${C.sage}; }
  .badge-lav    { background: ${C.lavenderPale};color: ${C.lavender}; }
  .badge-muted  { background: var(--surface-2); color: var(--muted-c); }
  .badge-green  { background: ${C.greenPale};   color: ${C.green}; }
  .badge-red    { background: ${C.redPale};     color: ${C.red}; }
  .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
  @media (max-width: 768px) {
    .form-grid { grid-template-columns: 1fr; }
    .grid-2col { grid-template-columns: 1fr !important; }
    .kpi-grid  { grid-template-columns: 1fr 1fr !important; gap: 10px !important; }
    .hide-mobile { display: none !important; }
    .historique-grid { grid-template-columns: 1fr !important; }
  }
`;

// ─── UTILITAIRES ────────────────────────────────────────────────────────────
const fmt = (d) => d ? new Date(d + "T00:00:00").toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtShort = (d) => d ? new Date(d + "T00:00:00").toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) : "—";

function optLabel(opts, val) {
  return opts.find(o => o.value === val)?.label || val || "—";
}
function optColor(opts, val) {
  return opts.find(o => o.value === val)?.color || C.muted;
}

// ─── ALGORITHME SYMPTOTHERMIQUE ─────────────────────────────────────────────
// Basé sur la Règle Symptothermique :
// 1. Jour sommet = dernier jour avant régression de la glaire
// 2. Températures basses = 6 précédant la hausse (max 1 perturbation)
// 3. Trait bas = plus haute des 6 températures basses
// 4. Trait haut = trait bas + 0.2°C
// 5. 3 températures hautes consécutives après le jour sommet, toutes > trait bas
// 6. Infertilité : si T3 >= trait haut → ce soir ; sinon → 4e soir
// Fertilité certaine : dès changement de glaire (sensation ou apparence)
// Infertilité précoce : 6 premiers jours si cycles >= 26j et jours secs

function analyserCycle(entries) {
  const sorted = [...entries].sort((a, b) => a.jourDuCycle - b.jourDuCycle);

  // ── Jour sommet glaire ──
  // Dernier jour avant régression : dernier jour avec glaire fertile OU humide avant retour au sec
  let jourSommet = null;
  for (let i = sorted.length - 1; i >= 0; i--) {
    const e = sorted[i];
    const hasGlaireHaute = e.glaireSensation === "lubrifiee" || e.glaireSensation === "humide" || e.glaireApparence === "fertile";
    if (hasGlaireHaute) {
      jourSommet = e.jourDuCycle;
      break;
    }
  }

  // ── Début fertilité glaire ──
  // Premier jour où glaire change (humide ou fertile)
  let jourDebutFertiliteGlaire = null;
  for (const e of sorted) {
    if (e.glaireSensation === "lubrifiee" || e.glaireSensation === "humide" || e.glaireApparence === "fertile" || e.glaireApparence === "pateuse") {
      jourDebutFertiliteGlaire = e.jourDuCycle;
      break;
    }
  }

  // ── Analyse thermique ──
  const tempsValides = sorted.filter(e => e.temperature && e.temperature > 35);
  if (tempsValides.length < 6) {
    return {
      jourSommet, jourDebutFertiliteGlaire,
      traitBas: null, traitHaut: null,
      jourOvulation: null, jourDebutInfertilite: null,
      methode: null, confiance: "insuffisant",
    };
  }

  // Chercher la montée thermique : trouver le point où 3 T° consécutives dépassent les 6 précédentes
  let traitBas = null, traitHaut = null, jourOvulation = null, jourDebutInfertilite = null;

  for (let i = 3; i < tempsValides.length; i++) {
    // Les 6 précédentes (ou moins si début de cycle), en excluant max 1 perturbation
    const prevAll = tempsValides.slice(Math.max(0, i - 6), i);
    if (prevAll.length < 3) continue;

    // Baseline = plus haute des températures basses (max 1 perturbation = exclure la plus haute si elle est isolée)
    const prevSorted = [...prevAll].sort((a, b) => b.temp - a.temp);
    const candidatBas = prevSorted.length >= 2 ? prevSorted[1].temp : prevSorted[0].temp; // Tolérance 1 perturbation
    const baseline = Math.max(...prevAll.map(t => t.temp));
    // On utilise le max des températures basses comme trait bas
    const tb = baseline;
    const th = Math.round((tb + 0.2) * 100) / 100;

    // 3 T° hautes consécutives après ce point, toutes > trait bas
    const next3 = tempsValides.slice(i, i + 3);
    if (next3.length < 3) continue;
    if (!next3.every(t => t.temp > tb)) continue;

    // Vérifier cohérence avec le jour sommet si disponible
    // Les 3 T° hautes doivent être après ou au jour sommet
    if (jourSommet && next3[0].day < jourSommet) continue;

    traitBas = tb;
    traitHaut = th;
    jourOvulation = jourSommet || next3[0].day; // Ovulation = jour sommet si connu

    // Déterminer le début de l'infertilité
    const t3 = next3[2].temp;
    if (t3 >= th) {
      // 3e T° haute >= trait haut → infertilité ce soir-là (J du 3e point)
      jourDebutInfertilite = next3[2].day;
    } else {
      // 3e T° haute < trait haut → infertilité 4e soir
      jourDebutInfertilite = next3[2].day + 1;
    }
    break;
  }

  // Infertilité précoce : 6 premiers jours secs (si cycle >= 26j et données disponibles)
  const cycleLen = sorted.length;
  const infertilitePrecoce = cycleLen >= 26 ? 6 : null;

  return {
    jourSommet,
    jourDebutFertiliteGlaire,
    traitBas,
    traitHaut,
    jourOvulation,
    jourDebutInfertilite,
    infertilitePrecoce,
    confiance: jourOvulation ? (jourSommet && traitBas ? "double" : "temperature") : "insuffisant",
  };
}

// Fonction de compatibilité avec l'existant
function detectOvulation(entries) {
  const res = analyserCycle(entries);
  if (!res.jourOvulation) return null;
  return { day: res.jourOvulation, date: null, method: res.confiance };
}

// Calcul proba ovulation pour chaque jour du cycle basé sur historique
function computeOvulationStats(historicalCycles) {
  const ovDays = [];
  historicalCycles.forEach(cycle => {
    const ov = detectOvulation(cycle.entries);
    if (ov) ovDays.push(ov.day);
  });
  if (ovDays.length === 0) return { mean: 14, std: 2, days: [] };
  const mean = ovDays.reduce((a, b) => a + b, 0) / ovDays.length;
  const std = Math.sqrt(ovDays.map(d => (d - mean) ** 2).reduce((a, b) => a + b, 0) / ovDays.length);
  return { mean, std: std || 2, days: ovDays };
}

function gaussianProb(x, mean, std) {
  return Math.exp(-0.5 * ((x - mean) / std) ** 2) / (std * Math.sqrt(2 * Math.PI));
}

function exportCSV(data, filename, columns) {
  const header = columns.map(c => c.label).join(",");
  const rows = data.map(row =>
    columns.map(c => {
      const val = typeof c.key === "function" ? c.key(row) : row[c.key];
      return `"${String(val ?? "").replace(/"/g, '""')}"`;
    }).join(",")
  );
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ─── ATOMS ──────────────────────────────────────────────────────────────────
function Btn({ children, onClick, variant = "primary", size = "md", disabled, style }) {
  const base = {
    display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "inherit",
    fontWeight: 500, fontSize: size === "sm" ? 13 : 14, cursor: disabled ? "not-allowed" : "pointer",
    border: "none", borderRadius: 10, transition: "all .18s", opacity: disabled ? .5 : 1,
    padding: size === "sm" ? "6px 13px" : "9px 18px",
  };
  const variants = {
    primary: { background: C.primary, color: C.white },
    ghost:   { background: "transparent", color: "var(--text-c)", border: `1px solid var(--border-c)` },
    soft:    { background: C.primaryPale, color: C.primaryDeep },
    danger:  { background: C.redPale, color: C.red },
    sage:    { background: C.sagePale, color: C.sage },
  };
  return (
    <button style={{ ...base, ...variants[variant], ...style }} onClick={disabled ? undefined : onClick}>
      {children}
    </button>
  );
}

function Card({ children, style, noPad }) {
  return (
    <div style={{
      background: "var(--surface)", borderRadius: 18, border: "1px solid var(--border-c)",
      padding: noPad ? 0 : 24, overflow: noPad ? "hidden" : undefined, ...style
    }}>
      {children}
    </div>
  );
}

function KPI({ label, value, sub, color, icon }) {
  const c = color || C.primary;
  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border-c)", borderRadius: 16,
      padding: "20px 22px", display: "flex", flexDirection: "column", gap: 6,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-c)", textTransform: "uppercase", letterSpacing: ".06em" }}>
          {label}
        </span>
        {icon && <span style={{ fontSize: 18, opacity: .7 }}>{icon}</span>}
      </div>
      <div style={{ fontFamily: "Cormorant Garamond", fontSize: 34, fontWeight: 600, color: c, lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: "var(--muted-c)" }}>{sub}</div>}
    </div>
  );
}

function PageTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h1 style={{ fontFamily: "Cormorant Garamond", fontSize: 32, fontWeight: 600, color: "var(--text-c)", lineHeight: 1.1 }}>
        {children}
      </h1>
      {sub && <p style={{ color: "var(--muted-c)", marginTop: 6, fontSize: 14 }}>{sub}</p>}
    </div>
  );
}

function Field({ label, children, full }) {
  return (
    <div style={{ gridColumn: full ? "1 / -1" : undefined, display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "var(--muted-c)", textTransform: "uppercase", letterSpacing: ".05em" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Modal({ open, onClose, title, subtitle, children }) {
  const isMob = typeof window !== "undefined" && window.innerWidth <= 768;
  useEffect(() => {
    if (!open) return;
    // iOS Safari : bloquer le scroll sans décaler la page
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    const handle = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handle);
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
      document.removeEventListener("keydown", handle);
    };
  }, [open, onClose]);
  if (!open) return null;

  if (isMob) {
    // Sur iOS Safari : tout en position:fixed, jamais d'absolute imbriqué
    // Header fixé en haut du sheet, contenu fixé dessous
    const TOP = "8%"; // le sheet commence à 8% du haut = 92% de hauteur
    return (
      <>
        {/* Fond sombre */}
        <div onClick={onClose} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 1000,
        }} />
        {/* Handle bar */}
        <div style={{
          position: "fixed", top: TOP, left: 0, right: 0, zIndex: 1002,
          display: "flex", justifyContent: "center", padding: "10px 0",
          background: "var(--surface)", borderRadius: "20px 20px 0 0",
        }}>
          <div style={{ width: 36, height: 4, borderRadius: 99, background: "var(--border-c)" }} />
        </div>
        {/* Header titre */}
        <div style={{
          position: "fixed", top: `calc(${TOP} + 28px)`, left: 0, right: 0, zIndex: 1002,
          padding: "8px 20px 12px",
          borderBottom: "1px solid var(--border-c)",
          background: "var(--surface)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <div style={{ fontFamily: "Cormorant Garamond", fontSize: 20, fontWeight: 600 }}>{title}</div>
            {subtitle && <div style={{ fontSize: 12, color: "var(--muted-c)", marginTop: 1 }}>{subtitle}</div>}
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "none", fontSize: 22, cursor: "pointer",
            color: "var(--muted-c)", lineHeight: 1, padding: "6px 8px",
          }}>✕</button>
        </div>
        {/* Zone de contenu scrollable — fixed avec top calculé */}
        <div style={{
          position: "fixed",
          top: `calc(${TOP} + ${subtitle ? 96 : 80}px)`,
          bottom: 0, left: 0, right: 0,
          zIndex: 1001,
          background: "var(--surface)",
          overflowY: "scroll",
          WebkitOverflowScrolling: "touch",
          padding: "16px 20px 100px",
        }}>
          {children}
        </div>
      </>
    );
  }

  // Desktop
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "flex-start", justifyContent: "center", zIndex: 1000,
      padding: "40px 16px 40px", overflowY: "auto",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "var(--surface)", borderRadius: 20, width: "100%", maxWidth: 600,
        boxShadow: "0 24px 64px rgba(0,0,0,.18)", marginBottom: 16, flexShrink: 0,
      }}>
        <div style={{ padding: "22px 26px 18px", borderBottom: "1px solid var(--border-c)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontFamily: "Cormorant Garamond", fontSize: 22, fontWeight: 600 }}>{title}</div>
            {subtitle && <div style={{ fontSize: 13, color: "var(--muted-c)", marginTop: 3 }}>{subtitle}</div>}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--muted-c)", padding: "0 4px" }}>✕</button>
        </div>
        <div style={{ padding: "22px 26px" }}>{children}</div>
      </div>
    </div>
  );
}

function ConfirmDialog({ open, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div onClick={onCancel} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 1100
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "var(--surface)", borderRadius: 16, padding: 28, maxWidth: 360, width: "90%",
        boxShadow: "0 16px 48px rgba(0,0,0,.2)"
      }}>
        <div style={{ fontWeight: 600, marginBottom: 10 }}>Confirmer</div>
        <p style={{ color: "var(--muted-c)", fontSize: 14, marginBottom: 22 }}>{message}</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Btn variant="ghost" onClick={onCancel}>Annuler</Btn>
          <Btn variant="danger" onClick={onConfirm}>Supprimer</Btn>
        </div>
      </div>
    </div>
  );
}

function Empty({ icon, title, sub, action }) {
  return (
    <div style={{ textAlign: "center", padding: "64px 24px", color: "var(--muted-c)" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
      <div style={{ fontFamily: "Cormorant Garamond", fontSize: 22, fontWeight: 600, color: "var(--text-c)", marginBottom: 8 }}>{title}</div>
      <p style={{ fontSize: 14, maxWidth: 340, margin: "0 auto 22px" }}>{sub}</p>
      {action}
    </div>
  );
}

// Sélecteur à pills pour les options
function PillSelect({ opts, value, onChange, nullable }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
      {nullable && value && (
        <button onClick={() => onChange(null)} style={{
          padding: "5px 12px", borderRadius: 99, border: `1px solid var(--border-c)`,
          background: "transparent", fontSize: 12, cursor: "pointer", color: "var(--muted-c)"
        }}>✕ Aucun</button>
      )}
      {opts.map(o => {
        const active = value === o.value;
        return (
          <button key={o.value} onClick={() => onChange(active ? null : o.value)} style={{
            padding: "5px 14px", borderRadius: 99, border: `1.5px solid ${active ? o.color : "var(--border-c)"}`,
            background: active ? o.color + "22" : "transparent", color: active ? o.color : "var(--muted-c)",
            fontSize: 13, fontWeight: active ? 600 : 400, cursor: "pointer", transition: "all .15s"
          }}>{o.label}</button>
        );
      })}
    </div>
  );
}

// Badge coloré pour afficher une valeur
function ValBadge({ opts, val }) {
  if (!val) return <span style={{ color: "var(--muted-c)" }}>—</span>;
  const c = optColor(opts, val);
  const l = optLabel(opts, val);
  return <span className="badge" style={{ background: c + "22", color: c }}>{l}</span>;
}

// ─── DONNÉES MODAL ───────────────────────────────────────────────────────────
function DataModal({ open, onClose, onLoad, hasUnsaved, entries, cycles, settings }) {
  const [flash, setFlash] = useState(false);

  const save = () => {
    const blob = new Blob([JSON.stringify({ entries, cycles, settings, exportedAt: new Date().toISOString() }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `mo-data-${new Date().toISOString().slice(0, 10)}.json`; a.click();
    URL.revokeObjectURL(url);
    setFlash(true);
    setTimeout(() => setFlash(false), 2500);
  };

  const load = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        onLoad(data);
        onClose();
      } catch { alert("Fichier invalide."); }
    };
    reader.readAsText(file);
  };

  return (
    <Modal open={open} onClose={onClose} title="Données" subtitle="Sauvegarde et restauration">
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Card style={{ background: "var(--surface-2)" }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>💾 Sauvegarder</div>
          <p style={{ fontSize: 13, color: "var(--muted-c)", marginBottom: 14 }}>
            Télécharge un fichier JSON avec toutes tes données et paramètres.
            {hasUnsaved && <span style={{ color: C.primary, marginLeft: 6, fontWeight: 600 }}>· Modifications non sauvegardées</span>}
          </p>
          <Btn onClick={save} variant={flash ? "sage" : "primary"}>
            {flash ? "✓ Sauvegardé !" : "Télécharger mes données"}
          </Btn>
        </Card>
        <Card style={{ background: "var(--surface-2)" }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>📂 Charger</div>
          <p style={{ fontSize: 13, color: "var(--muted-c)", marginBottom: 14 }}>
            Charge un fichier JSON précédemment exporté. Remplace toutes les données actuelles.
          </p>
          <label style={{
            display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 18px",
            background: "var(--surface-3)", border: `1px solid var(--border-c)`, borderRadius: 10,
            cursor: "pointer", fontWeight: 500, fontSize: 14,
          }}>
            📁 Choisir un fichier
            <input type="file" accept=".json" onChange={load} style={{ display: "none" }} />
          </label>
        </Card>
      </div>
    </Modal>
  );
}

// ─── FORMULAIRE D'ENTRÉE ─────────────────────────────────────────────────────
function EntryModal({ open, onClose, onSave, editEntry, cycleNum }) {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (editEntry) setForm({ ...EMPTY_FORM, ...editEntry });
    else setForm({ ...EMPTY_FORM, date: new Date().toISOString().slice(0, 10) });
  }, [editEntry, open]);

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.date) return;
    onSave({ ...form, id: editEntry?.id || Date.now(), cycleNum });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}
      title={editEntry ? "Modifier l'entrée" : "Nouvelle entrée"}
      subtitle={editEntry ? fmt(editEntry.date) : fmt(form.date)}>
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div className="form-grid">
          <Field label="Date">
            <input type="date" value={form.date} onChange={e => upd("date", e.target.value)} />
          </Field>
          <Field label="Température (°C)">
            <input type="number" step="0.01" min="35" max="39" placeholder="ex: 36.80"
              value={form.temperature} onChange={e => upd("temperature", e.target.value ? parseFloat(e.target.value) : "")} />
          </Field>
          <Field label="Heure de prise">
            <input type="text" placeholder="ex: 7h00" value={form.heure} onChange={e => upd("heure", e.target.value)} />
          </Field>
        </div>

        <div style={{ borderTop: "1px solid var(--border-c)", paddingTop: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted-c)", marginBottom: 12, textTransform: "uppercase", letterSpacing: ".06em" }}>
            Saignements
          </div>
          <PillSelect opts={SAIGNEMENT_OPTS} value={form.saignement} onChange={v => upd("saignement", v)} nullable />
        </div>

        <div style={{ borderTop: "1px solid var(--border-c)", paddingTop: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted-c)", marginBottom: 12, textTransform: "uppercase", letterSpacing: ".06em" }}>
            Glaire cervicale
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div>
              <div style={{ fontSize: 12, color: "var(--muted-c)", marginBottom: 6 }}>Sensation</div>
              <PillSelect opts={SENSATION_OPTS} value={form.glaireSensation} onChange={v => upd("glaireSensation", v)} nullable />
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--muted-c)", marginBottom: 6 }}>Apparence</div>
              <PillSelect opts={APPARENCE_OPTS} value={form.glaireApparence} onChange={v => upd("glaireApparence", v)} nullable />
            </div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--border-c)", paddingTop: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted-c)", marginBottom: 12, textTransform: "uppercase", letterSpacing: ".06em" }}>
            Col utérin
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div>
              <div style={{ fontSize: 12, color: "var(--muted-c)", marginBottom: 6 }}>Fermeté</div>
              <PillSelect opts={FERMETE_OPTS} value={form.colFermete} onChange={v => upd("colFermete", v)} nullable />
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--muted-c)", marginBottom: 6 }}>Ouverture</div>
              <PillSelect opts={OUVERTURE_OPTS} value={form.colOuverture} onChange={v => upd("colOuverture", v)} nullable />
            </div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--border-c)", paddingTop: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted-c)", marginBottom: 12, textTransform: "uppercase", letterSpacing: ".06em" }}>
            Rapport sexuel
          </div>
          <PillSelect opts={RAPPORT_OPTS} value={form.rapport} onChange={v => upd("rapport", v)} nullable />
        </div>

        <div style={{ borderTop: "1px solid var(--border-c)", paddingTop: 18 }}>
          <Field label="Perturbation / Note">
            <textarea placeholder="Alcool, stress, nuit agitée, voyage, maladie…" value={form.perturbation}
              onChange={e => upd("perturbation", e.target.value)} />
          </Field>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
          <Btn variant="ghost" onClick={onClose}>Annuler</Btn>
          <Btn onClick={handleSave}>Enregistrer</Btn>
        </div>
      </div>
    </Modal>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
function Dashboard({ entries, cycles, settings }) {
  const cycleGroups = useMemo(() => {
    const groups = {};
    entries.forEach(e => {
      if (!groups[e.cycleNum]) groups[e.cycleNum] = [];
      groups[e.cycleNum].push(e);
    });
    return groups;
  }, [entries]);

  const currentCycleNum = useMemo(() => Math.max(0, ...entries.map(e => e.cycleNum || 0)), [entries]);
  const currentEntries = cycleGroups[currentCycleNum] || [];

  const ovStats = useMemo(() => {
    const historicalCycles = Object.entries(cycleGroups)
      .filter(([n]) => parseInt(n) < currentCycleNum)
      .map(([, ents]) => ({ entries: ents }));
    return computeOvulationStats(historicalCycles);
  }, [cycleGroups, currentCycleNum]);

  const currentOv = useMemo(() => detectOvulation(currentEntries), [currentEntries]);

  const todayCycleDay = useMemo(() => {
    if (!currentEntries.length) return null;
    const today = new Date().toISOString().slice(0, 10);
    const start = currentEntries[0]?.date;
    if (!start) return null;
    const diff = Math.floor((new Date(today) - new Date(start)) / 86400000) + 1;
    return diff > 0 ? diff : null;
  }, [currentEntries]);

  const cycleLengths = useMemo(() => {
    return cycles
      .filter(c => c.dateFin && c.dateDebut)
      .map(c => ({
        cycle: `C${c.cycleNum}`,
        jours: Math.floor((new Date(c.dateFin) - new Date(c.dateDebut)) / 86400000) + 1,
      }));
  }, [cycles]);

  const avgCycleLen = cycleLengths.length
    ? Math.round(cycleLengths.reduce((s, c) => s + c.jours, 0) / cycleLengths.length)
    : 28;

  // Probabilités d'ovulation pour le cycle actuel (jours 1-40)
  const ovProbs = useMemo(() => {
    if (!ovStats.days.length) return [];
    return Array.from({ length: 40 }, (_, i) => i + 1).map(day => ({
      jour: day,
      probabilite: Math.round(gaussianProb(day, ovStats.mean, ovStats.std) * 1000) / 10,
    }));
  }, [ovStats]);

  // Prochaine ovulation estimée
  const nextOvDay = Math.round(ovStats.mean);
  const daysToOv = todayCycleDay ? nextOvDay - todayCycleDay : null;
  const fertileWindow = { start: nextOvDay - 5, end: nextOvDay + 1 };

  // Phase actuelle
  const getPhase = (day) => {
    if (!day) return null;
    if (day <= 5) return { label: "Menstruation", color: C.red };
    if (day < fertileWindow.start) return { label: "Phase folliculaire", color: C.yellow };
    if (day <= fertileWindow.end) return { label: "Fenêtre fertile", color: C.sage };
    return { label: "Phase lutéale", color: C.lavender };
  };

  const currentPhase = getPhase(todayCycleDay);

  // Températures du cycle actuel pour graphique
  const tempData = currentEntries
    .filter(e => e.temperature && e.jourDuCycle)
    .map(e => ({ jour: e.jourDuCycle, temp: e.temperature, date: fmtShort(e.date) }));

  return (
    <div className="anim">
      <PageTitle sub={`Cycle ${currentCycleNum} · Jour ${todayCycleDay || "?"} sur ~${avgCycleLen}`}>
        Tableau de bord
      </PageTitle>

      <div className="kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14, marginBottom: 28 }}>
        <KPI label="Jour du cycle" value={todayCycleDay || "?"} icon="📅"
          sub={currentPhase?.label} color={currentPhase?.color || C.primary} />
        <KPI label="Ovulation estimée"
          value={daysToOv !== null ? (daysToOv > 0 ? `J+${daysToOv}` : daysToOv === 0 ? "Aujourd'hui" : `J${daysToOv}`) : `J${nextOvDay}`}
          icon="✨" color={C.sage}
          sub={`Historique : J${Math.round(ovStats.mean)} (±${Math.round(ovStats.std)} j)`} />
        <KPI label="Durée moy. cycle" value={`${avgCycleLen}j`} icon="🔄"
          sub={`Sur ${cycleLengths.length} cycles`} color={C.primary} />
        <KPI label="Cycles suivis" value={currentCycleNum} icon="🌙"
          sub={`Depuis ${entries.length > 0 ? new Date(entries[0].date).toLocaleDateString("fr-FR", { month: "long", year: "numeric" }) : "—"}`}
          color={C.lavender} />
      </div>

      {/* Phase actuelle */}
      {currentPhase && (
        <Card style={{ marginBottom: 22, padding: "18px 24px", background: currentPhase.color + "15", border: `1px solid ${currentPhase.color}40` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 28 }}>
              {currentPhase.label === "Fenêtre fertile" ? "🌿" :
               currentPhase.label === "Menstruation" ? "🌹" :
               currentPhase.label === "Phase folliculaire" ? "🌱" : "🌙"}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 16, color: currentPhase.color }}>{currentPhase.label}</div>
              <div style={{ fontSize: 13, color: "var(--muted-c)", marginTop: 2 }}>
                {currentPhase.label === "Fenêtre fertile"
                  ? `Jours fertiles estimés : J${fertileWindow.start} → J${fertileWindow.end}`
                  : currentPhase.label === "Phase lutéale"
                  ? "Après l'ovulation · Phase stable"
                  : currentPhase.label === "Menstruation"
                  ? "Début du cycle"
                  : `Ovulation estimée autour du J${nextOvDay}`}
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 22 }}>
        {/* Température du cycle actuel */}
        <Card>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Température — cycle en cours</div>
          <div style={{ fontSize: 12, color: "var(--muted-c)", marginBottom: 16 }}>
            {currentOv ? `Ovulation confirmée J${currentOv.day}` : "Ovulation non encore détectée"}
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={tempData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-c)" />
              <XAxis dataKey="jour" tick={{ fontSize: 11 }} />
              <YAxis domain={["dataMin - 0.1", "dataMax + 0.1"]} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: "var(--surface)", border: `1px solid var(--border-c)`, borderRadius: 10, fontSize: 12 }}
                formatter={(v) => [`${v}°C`, "Température"]}
              />
              {currentOv && <ReferenceLine x={currentOv.day} stroke={C.sage} strokeDasharray="4 2" label={{ value: "Ov.", fill: C.sage, fontSize: 10 }} />}
              <Line type="monotone" dataKey="temp" stroke={C.primary} strokeWidth={2} dot={{ r: 3, fill: C.primary }} connectNulls={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Probabilité ovulation */}
        <Card>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Probabilité d'ovulation par jour</div>
          <div style={{ fontSize: 12, color: "var(--muted-c)", marginBottom: 16 }}>
            Basé sur {ovStats.days.length} cycles historiques
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={ovProbs} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-c)" />
              <XAxis dataKey="jour" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: "var(--surface)", border: `1px solid var(--border-c)`, borderRadius: 10, fontSize: 12 }}
                formatter={(v) => [`${v}%`, "Probabilité"]}
              />
              {todayCycleDay && <ReferenceLine x={todayCycleDay} stroke={C.primary} strokeDasharray="4 2" label={{ value: "Auj.", fill: C.primary, fontSize: 10 }} />}
              <defs>
                <linearGradient id="ovGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.sage} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={C.sage} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="probabilite" stroke={C.sage} fill="url(#ovGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Longueurs des cycles historiques */}
      {cycleLengths.length > 3 && (
        <Card>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Durée des cycles</div>
          <div style={{ fontSize: 12, color: "var(--muted-c)", marginBottom: 16 }}>Historique complet</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={cycleLengths} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-c)" />
              <XAxis dataKey="cycle" tick={{ fontSize: 10 }} />
              <YAxis domain={[20, 45]} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "var(--surface)", border: `1px solid var(--border-c)`, borderRadius: 10, fontSize: 12 }}
                formatter={(v) => [`${v} jours`, "Durée"]} />
              <ReferenceLine y={avgCycleLen} stroke={C.primary} strokeDasharray="4 2" />
              <Bar dataKey="jours" fill={C.primaryPale} stroke={C.primary} strokeWidth={1.5} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}

// ─── SUIVI DU CYCLE ACTUEL ───────────────────────────────────────────────────
function CycleActuel({ entries, cycles, onAdd, onEdit, onDelete, currentCycleNum, isMobile }) {
  const [editEntry, setEditEntry] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [dupeDialog, setDupeDialog] = useState(null); // { existing, incoming }

  const cycleEntries = useMemo(() =>
    entries.filter(e => e.cycleNum === currentCycleNum).sort((a, b) => a.date.localeCompare(b.date)),
    [entries, currentCycleNum]
  );

  const tempData = cycleEntries
    .filter(e => e.temperature && e.jourDuCycle)
    .map(e => ({
      jour: e.jourDuCycle,
      temp: e.temperature,
      date: fmtShort(e.date),
      fertile: e.glaireApparence === "fertile" ? e.temperature : null,
    }));

  const openNew = () => { setEditEntry(null); setModalOpen(true); };
  const openEdit = (e) => { setEditEntry(e); setModalOpen(true); };

  const handleSave = (entry) => {
    if (editEntry) {
      onEdit(entry);
      return;
    }
    // Nouvelle entrée : vérifier si la date existe déjà dans ce cycle
    const existing = cycleEntries.find(e => e.date === entry.date);
    const hasData = existing && Object.entries(existing).some(([k, v]) =>
      !["id","date","cycleNum","jourDuCycle"].includes(k) && v !== null && v !== "" && v !== undefined
    );
    if (existing && hasData) {
      setDupeDialog({ existing, incoming: entry });
    } else if (existing) {
      // Entrée existante vide → on remplace silencieusement
      onEdit({ ...entry, id: existing.id, cycleNum: existing.cycleNum, jourDuCycle: existing.jourDuCycle });
    } else {
      onAdd(entry);
    }
  };

  return (
    <div className="anim">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <PageTitle sub={`${cycleEntries.length} jours enregistrés`}>
          Cycle {currentCycleNum} — En cours
        </PageTitle>
        <Btn onClick={openNew}>＋ Nouvelle entrée</Btn>
      </div>

      {cycleEntries.length === 0 ? (
        <Empty icon="🌸" title="Aucune entrée pour ce cycle"
          sub="Commence à enregistrer tes observations quotidiennes."
          action={<Btn onClick={openNew}>＋ Première entrée</Btn>} />
      ) : (
        <>
          {/* Graphique sticky */}
          <div style={{
            position: "sticky", top: isMobile ? 56 : 0, zIndex: 50,
            background: "var(--bg)", paddingBottom: 12, paddingTop: 4,
            marginBottom: 8,
          }}>
            <Card style={{ boxShadow: "0 4px 20px rgba(0,0,0,.07)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <div style={{ fontWeight: 600 }}>Courbe de température</div>
                <div style={{ fontSize: 12, color: "var(--muted-c)" }}>Points verts = glaire fertile</div>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={tempData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-c)" />
                  <XAxis dataKey="jour" tick={{ fontSize: 11 }} />
                  <YAxis domain={["dataMin - 0.1", "dataMax + 0.1"]} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "var(--surface)", border: `1px solid var(--border-c)`, borderRadius: 10, fontSize: 12 }}
                    formatter={(v, n) => n === "temp" ? [`${v}°C`, "Température"] : [`${v}°C`, "Fertile"]} />
                  <Line type="monotone" dataKey="temp" stroke={C.primary} strokeWidth={2} dot={{ r: 3, fill: C.primary }} connectNulls={false} />
                  <Line type="monotone" dataKey="fertile" stroke={C.sage} strokeWidth={0} dot={{ r: 6, fill: C.sage }} connectNulls={false} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Tableau desktop / Cartes mobile */}
          <Card noPad>
            {isMobile ? (
              <div>
                {cycleEntries.map(e => (
                  <div key={e.id} onClick={() => openEdit(e)} style={{
                    padding: "14px 16px", borderBottom: "1px solid var(--border-c)",
                    cursor: "pointer", transition: "background .15s",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontFamily: "Cormorant Garamond", fontSize: 22, fontWeight: 600, color: C.primary, minWidth: 32 }}>
                          J{e.jourDuCycle}
                        </span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{fmt(e.date)}</div>
                          {e.temperature && (
                            <div style={{ fontFamily: "Cormorant Garamond", fontSize: 17, fontWeight: 600, color: C.primaryDeep }}>
                              {e.temperature}°C
                              {e.heure && <span style={{ fontSize: 12, color: "var(--muted-c)", fontFamily: "DM Sans", fontWeight: 400, marginLeft: 6 }}>{e.heure}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                      <button onClick={ev => { ev.stopPropagation(); setConfirmId(e.id); }}
                        style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 16, padding: "0 4px" }}>✕</button>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 }}>
                      {e.saignement      && <ValBadge opts={SAIGNEMENT_OPTS} val={e.saignement} />}
                      {e.glaireSensation && <ValBadge opts={SENSATION_OPTS}  val={e.glaireSensation} />}
                      {e.glaireApparence && <ValBadge opts={APPARENCE_OPTS}  val={e.glaireApparence} />}
                      {e.colFermete      && <ValBadge opts={FERMETE_OPTS}    val={e.colFermete} />}
                      {e.colOuverture    && <ValBadge opts={OUVERTURE_OPTS}  val={e.colOuverture} />}
                      {e.rapport         && <ValBadge opts={RAPPORT_OPTS}    val={e.rapport} />}
                    </div>
                    {e.perturbation && (
                      <div style={{ fontSize: 12, color: "var(--muted-c)", marginTop: 5, fontStyle: "italic" }}>
                        {e.perturbation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="tbl-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>J</th>
                      <th>Date</th>
                      <th>Temp.</th>
                      <th>Saignement</th>
                      <th>Glaire sensation</th>
                      <th>Glaire apparence</th>
                      <th>Col</th>
                      <th>Rapport</th>
                      <th>Note</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cycleEntries.map(e => (
                      <tr key={e.id} onClick={() => openEdit(e)}>
                        <td style={{ fontWeight: 600, color: C.primary, fontFamily: "Cormorant Garamond", fontSize: 16 }}>
                          {e.jourDuCycle || "—"}
                        </td>
                        <td style={{ whiteSpace: "nowrap", fontSize: 13 }}>{fmtShort(e.date)}</td>
                        <td style={{ fontWeight: e.temperature ? 600 : 400, fontFamily: e.temperature ? "Cormorant Garamond" : "inherit", fontSize: e.temperature ? 16 : 14 }}>
                          {e.temperature ? `${e.temperature}°` : "—"}
                        </td>
                        <td><ValBadge opts={SAIGNEMENT_OPTS} val={e.saignement} /></td>
                        <td><ValBadge opts={SENSATION_OPTS} val={e.glaireSensation} /></td>
                        <td><ValBadge opts={APPARENCE_OPTS} val={e.glaireApparence} /></td>
                        <td>
                          {e.colFermete || e.colOuverture ? (
                            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                              {e.colFermete && <ValBadge opts={FERMETE_OPTS} val={e.colFermete} />}
                              {e.colOuverture && <ValBadge opts={OUVERTURE_OPTS} val={e.colOuverture} />}
                            </div>
                          ) : "—"}
                        </td>
                        <td><ValBadge opts={RAPPORT_OPTS} val={e.rapport} /></td>
                        <td style={{ fontSize: 12, color: "var(--muted-c)", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {e.perturbation || "—"}
                        </td>
                        <td onClick={ev => { ev.stopPropagation(); setConfirmId(e.id); }}>
                          <span style={{ color: C.muted, cursor: "pointer", fontSize: 16 }}>✕</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}

      <EntryModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave}
        editEntry={editEntry} cycleNum={currentCycleNum} />
      <ConfirmDialog open={!!confirmId}
        message="Supprimer cette entrée ? Cette action est irréversible."
        onConfirm={() => { onDelete(confirmId); setConfirmId(null); }}
        onCancel={() => setConfirmId(null)} />

      {/* Dialog doublon de date */}
      {dupeDialog && (
        <div onClick={() => setDupeDialog(null)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, padding: 24
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "var(--surface)", borderRadius: 18, padding: 28, maxWidth: 420, width: "100%",
            boxShadow: "0 24px 64px rgba(0,0,0,.2)"
          }}>
            <div style={{ fontFamily: "Cormorant Garamond", fontSize: 22, fontWeight: 600, marginBottom: 8 }}>
              Entrée existante
            </div>
            <p style={{ color: "var(--muted-c)", fontSize: 14, marginBottom: 22, lineHeight: 1.6 }}>
              Il y a déjà une entrée pour le <strong>{fmt(dupeDialog.incoming.date)}</strong>. Que veux-tu faire ?
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button onClick={() => {
                onEdit({ ...dupeDialog.incoming, id: dupeDialog.existing.id, cycleNum: dupeDialog.existing.cycleNum, jourDuCycle: dupeDialog.existing.jourDuCycle });
                setDupeDialog(null);
              }} style={{
                padding: "12px 18px", borderRadius: 12, border: `1.5px solid ${C.primary}`,
                background: C.primaryPale, color: C.primaryDeep, fontFamily: "inherit",
                fontSize: 14, fontWeight: 600, cursor: "pointer", textAlign: "left"
              }}>
                Remplacer — écraser les données existantes
              </button>
              <button onClick={() => {
                // Fusionner : les nouvelles valeurs écrasent les nulls de l'existante
                const merged = { ...dupeDialog.existing };
                Object.entries(dupeDialog.incoming).forEach(([k, v]) => {
                  if (!["id","cycleNum","jourDuCycle"].includes(k) && v !== null && v !== "" && v !== undefined) {
                    merged[k] = v;
                  }
                });
                onEdit(merged);
                setDupeDialog(null);
              }} style={{
                padding: "12px 18px", borderRadius: 12, border: `1.5px solid var(--border-c)`,
                background: "var(--surface-2)", color: "var(--text-c)", fontFamily: "inherit",
                fontSize: 14, fontWeight: 500, cursor: "pointer", textAlign: "left"
              }}>
                Fusionner — compléter les champs manquants
              </button>
              <button onClick={() => setDupeDialog(null)} style={{
                padding: "10px 18px", borderRadius: 12, border: "none",
                background: "transparent", color: "var(--muted-c)", fontFamily: "inherit",
                fontSize: 14, cursor: "pointer", textAlign: "left"
              }}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── HISTORIQUE ──────────────────────────────────────────────────────────────
function Historique({ entries, cycles, isMobile }) {
  const [selectedCycle, setSelectedCycle] = useState(null);
  const [search, setSearch] = useState("");
  // Ajustements manuels par cycle : { [cycleNum]: { jourSommet, jourDebutInfertilite } }
  const [adjustments, setAdjustments] = useState(() => {
    try { return JSON.parse(localStorage.getItem("mo_adjustments") || "{}"); } catch { return {}; }
  });

  const saveAdjustment = (cycleNum, key, value) => {
    setAdjustments(prev => {
      const next = { ...prev, [cycleNum]: { ...(prev[cycleNum] || {}), [key]: value } };
      localStorage.setItem("mo_adjustments", JSON.stringify(next));
      return next;
    });
  };

  const cycleGroups = useMemo(() => {
    const groups = {};
    entries.forEach(e => {
      if (!groups[e.cycleNum]) groups[e.cycleNum] = [];
      groups[e.cycleNum].push(e);
    });
    return groups;
  }, [entries]);

  const sortedCycles = useMemo(() =>
    cycles.slice().sort((a, b) => b.cycleNum - a.cycleNum),
    [cycles]
  );

  const toggle = (num) => {
    setSelectedCycle(prev => prev === num ? null : num);
    setSearch("");
  };

  return (
    <div className="anim">
      <PageTitle sub={`${cycles.length} cycles · ${entries.length} entrées totales`}>
        Historique
      </PageTitle>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {sortedCycles.map(c => {
          const ents = (cycleGroups[c.cycleNum] || []).sort((a, b) => a.jourDuCycle - b.jourDuCycle);
          const open = selectedCycle === c.cycleNum;

          // Analyse symptothermique
          const analyse = analyserCycle(ents);
          const adj = adjustments[c.cycleNum] || {};
          const jourSommet = adj.jourSommet ?? analyse.jourSommet;
          const jourInfertilite = adj.jourDebutInfertilite ?? analyse.jourDebutInfertilite;
          const jourFertilite = analyse.jourDebutFertiliteGlaire;

          const filteredEnts = search
            ? ents.filter(e =>
                (e.perturbation || "").toLowerCase().includes(search.toLowerCase()) ||
                (e.saignement || "").toLowerCase().includes(search.toLowerCase()) ||
                (e.date || "").includes(search)
              )
            : ents;

          const tempData = ents
            .filter(e => e.temperature && e.jourDuCycle)
            .map(e => ({
              jour: e.jourDuCycle,
              temp: e.temperature,
              fertile: (e.glaireSensation === "lubrifiee" || e.glaireSensation === "humide" || e.glaireApparence === "fertile") ? e.temperature : null,
            }));

          // Label confiance
          const confianceLabel = { double: "Double confirmation ✓✓", temperature: "Temp. seule", insuffisant: "Données insuffisantes" };
          const confianceColor = { double: C.sage, temperature: C.yellow, insuffisant: C.muted };

          return (
            <div key={c.cycleNum} style={{ borderRadius: 16, border: `1px solid ${open ? C.primary + "50" : "var(--border-c)"}`, overflow: "hidden", transition: "border-color .2s" }}>
              {/* En-tête */}
              <div onClick={() => toggle(c.cycleNum)} style={{
                padding: "14px 18px", cursor: "pointer",
                background: open ? C.primaryPale : "var(--surface)",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                transition: "background .15s",
              }}>
                <div>
                  <div style={{ fontFamily: "Cormorant Garamond", fontSize: 18, fontWeight: 600, color: open ? C.primaryDeep : "var(--text-c)" }}>
                    Cycle {c.cycleNum}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted-c)", marginTop: 2, display: "flex", flexWrap: "wrap", gap: 8 }}>
                    <span>{fmt(c.dateDebut)} → {fmt(c.dateFin)}</span>
                    {jourSommet && <span style={{ color: C.sage }}>· J.sommet J{jourSommet}</span>}
                    {jourInfertilite && <span style={{ color: C.lavender }}>· Infertile J{jourInfertilite}</span>}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ fontWeight: 600, color: C.primary, fontSize: 15 }}>{ents.length}j</div>
                  <span style={{ color: "var(--muted-c)", fontSize: 18, transform: open ? "rotate(180deg)" : "none", transition: "transform .2s", lineHeight: 1 }}>▾</span>
                </div>
              </div>

              {/* Contenu déplié */}
              {open && (
                <div style={{ borderTop: `1px solid var(--border-c)`, background: "var(--surface)" }}>

                  {/* ── Analyse symptothermique ── */}
                  <div style={{ padding: "16px 18px 0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted-c)", textTransform: "uppercase", letterSpacing: ".05em" }}>
                        Analyse symptothermique
                      </div>
                      {analyse.confiance && (
                        <span style={{ fontSize: 11, color: confianceColor[analyse.confiance], background: confianceColor[analyse.confiance] + "20", padding: "2px 8px", borderRadius: 99 }}>
                          {confianceLabel[analyse.confiance]}
                        </span>
                      )}
                    </div>

                    {/* Zones de fertilité */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                      {analyse.infertilitePrecoce && (
                        <div style={{ padding: "6px 12px", borderRadius: 10, background: C.lavenderPale, border: `1px solid ${C.lavender}40`, fontSize: 12 }}>
                          <span style={{ color: C.lavender, fontWeight: 600 }}>Infertile J1-J{analyse.infertilitePrecoce}</span>
                          <span style={{ color: "var(--muted-c)", marginLeft: 4 }}>premiers jours secs</span>
                        </div>
                      )}
                      {jourFertilite && (
                        <div style={{ padding: "6px 12px", borderRadius: 10, background: C.yellowPale, border: `1px solid ${C.yellow}40`, fontSize: 12 }}>
                          <span style={{ color: C.yellow, fontWeight: 600 }}>Fertile dès J{jourFertilite}</span>
                          <span style={{ color: "var(--muted-c)", marginLeft: 4 }}>changement glaire</span>
                        </div>
                      )}
                      {jourInfertilite && (
                        <div style={{ padding: "6px 12px", borderRadius: 10, background: C.sagePale, border: `1px solid ${C.sage}40`, fontSize: 12 }}>
                          <span style={{ color: C.sage, fontWeight: 600 }}>Infertile dès J{jourInfertilite}</span>
                          <span style={{ color: "var(--muted-c)", marginLeft: 4 }}>{analyse.traitHaut ? `3e T° ${analyse.confiance === "double" ? "≥" : "<"} ${analyse.traitHaut}°` : "thermique"}</span>
                        </div>
                      )}
                      {analyse.traitBas && (
                        <div style={{ padding: "6px 12px", borderRadius: 10, background: "var(--surface-2)", border: `1px solid var(--border-c)`, fontSize: 12, color: "var(--muted-c)" }}>
                          Trait bas <strong>{analyse.traitBas}°</strong> · Trait haut <strong>{analyse.traitHaut}°</strong>
                        </div>
                      )}
                    </div>

                    {/* Graphique température avec traits */}
                    {tempData.length > 0 && (
                      <ResponsiveContainer width="100%" height={160}>
                        <LineChart data={tempData} margin={{ top: 4, right: 8, bottom: 0, left: -22 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-c)" />
                          <XAxis dataKey="jour" tick={{ fontSize: 10 }} />
                          <YAxis domain={["dataMin - 0.15", "dataMax + 0.15"]} tick={{ fontSize: 10 }} />
                          <Tooltip contentStyle={{ background: "var(--surface)", border: `1px solid var(--border-c)`, borderRadius: 10, fontSize: 12 }}
                            formatter={(v, n) => n === "temp" ? [`${v}°C`, "Température"] : [`${v}°C`, "Fertile"]} />
                          {/* Trait bas */}
                          {analyse.traitBas && <ReferenceLine y={analyse.traitBas} stroke={C.primary} strokeDasharray="6 3" strokeWidth={1.5} label={{ value: `TB ${analyse.traitBas}°`, fill: C.primary, fontSize: 9, position: "right" }} />}
                          {/* Trait haut */}
                          {analyse.traitHaut && <ReferenceLine y={analyse.traitHaut} stroke={C.sage} strokeDasharray="6 3" strokeWidth={1.5} label={{ value: `TH ${analyse.traitHaut}°`, fill: C.sage, fontSize: 9, position: "right" }} />}
                          {/* Jour sommet */}
                          {jourSommet && <ReferenceLine x={jourSommet} stroke={C.yellow} strokeWidth={2} label={{ value: `S`, fill: C.yellow, fontSize: 10, position: "top" }} />}
                          {/* Début infertilité */}
                          {jourInfertilite && <ReferenceLine x={jourInfertilite} stroke={C.sage} strokeWidth={2} label={{ value: `I`, fill: C.sage, fontSize: 10, position: "top" }} />}
                          {/* Début fertilité */}
                          {jourFertilite && <ReferenceLine x={jourFertilite} stroke={C.yellow} strokeDasharray="4 2" strokeWidth={1.5} label={{ value: `F`, fill: C.yellow, fontSize: 10, position: "top" }} />}
                          <Line type="monotone" dataKey="temp" stroke={C.primary} strokeWidth={2} dot={{ r: 3, fill: C.primary }} connectNulls={false} />
                          <Line type="monotone" dataKey="fertile" stroke={C.sage} strokeWidth={0} dot={{ r: 5, fill: C.sage }} connectNulls={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}

                    {/* Légende */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 8, marginBottom: 4, fontSize: 11, color: "var(--muted-c)" }}>
                      <span><span style={{ color: C.primary }}>─</span> Trait bas (TB)</span>
                      <span><span style={{ color: C.sage }}>─</span> Trait haut (TB+0.2°)</span>
                      <span><span style={{ color: C.yellow }}>│</span> S = Jour sommet</span>
                      <span><span style={{ color: C.sage }}>│</span> I = Début infertilité</span>
                      <span><span style={{ color: C.sage, fontSize: 8 }}>●</span> Glaire fertile</span>
                    </div>
                  </div>

                  {/* ── Ajustement manuel ── */}
                  <div style={{ padding: "12px 18px", borderTop: `1px solid var(--border-c)`, borderBottom: `1px solid var(--border-c)` }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted-c)", marginBottom: 10, textTransform: "uppercase", letterSpacing: ".05em" }}>
                      Ajustement manuel
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <label style={{ fontSize: 12, color: "var(--muted-c)", whiteSpace: "nowrap" }}>Jour sommet (S)</label>
                        <input type="number" min="1" max="40"
                          value={jourSommet || ""}
                          onChange={e => saveAdjustment(c.cycleNum, "jourSommet", e.target.value ? parseInt(e.target.value) : null)}
                          style={{ width: 64, textAlign: "center", padding: "5px 8px" }}
                          placeholder="auto" />
                        {adj.jourSommet && <button onClick={() => saveAdjustment(c.cycleNum, "jourSommet", null)} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 13 }}>✕</button>}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <label style={{ fontSize: 12, color: "var(--muted-c)", whiteSpace: "nowrap" }}>Début infertilité (I)</label>
                        <input type="number" min="1" max="45"
                          value={jourInfertilite || ""}
                          onChange={e => saveAdjustment(c.cycleNum, "jourDebutInfertilite", e.target.value ? parseInt(e.target.value) : null)}
                          style={{ width: 64, textAlign: "center", padding: "5px 8px" }}
                          placeholder="auto" />
                        {adj.jourDebutInfertilite && <button onClick={() => saveAdjustment(c.cycleNum, "jourDebutInfertilite", null)} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 13 }}>✕</button>}
                      </div>
                    </div>
                  </div>

                  {/* ── Recherche + export ── */}
                  <div style={{ padding: "12px 18px", display: "flex", gap: 10, alignItems: "center" }}>
                    <input placeholder="Chercher…" value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1 }} />
                    <Btn variant="ghost" size="sm" onClick={() => {
                      exportCSV(ents, `mo-cycle${c.cycleNum}.csv`, [
                        { label: "Date", key: "date" },
                        { label: "Jour", key: "jourDuCycle" },
                        { label: "Température", key: "temperature" },
                        { label: "Saignement", key: row => optLabel(SAIGNEMENT_OPTS, row.saignement) },
                        { label: "Glaire sensation", key: row => optLabel(SENSATION_OPTS, row.glaireSensation) },
                        { label: "Glaire apparence", key: row => optLabel(APPARENCE_OPTS, row.glaireApparence) },
                        { label: "Col fermeté", key: row => optLabel(FERMETE_OPTS, row.colFermete) },
                        { label: "Col ouverture", key: row => optLabel(OUVERTURE_OPTS, row.colOuverture) },
                        { label: "Rapport", key: row => optLabel(RAPPORT_OPTS, row.rapport) },
                        { label: "Perturbation", key: "perturbation" },
                      ]);
                    }}>⬇ CSV</Btn>
                  </div>

                  {/* ── Tableau / Cartes ── */}
                  {isMobile ? (
                    <div style={{ borderTop: `1px solid var(--border-c)` }}>
                      {filteredEnts.map(e => {
                        const isFertile = jourFertilite && jourInfertilite && e.jourDuCycle >= jourFertilite && e.jourDuCycle < jourInfertilite;
                        const isInfertile = jourInfertilite && e.jourDuCycle >= jourInfertilite;
                        const isPrecoce = analyse.infertilitePrecoce && e.jourDuCycle <= analyse.infertilitePrecoce && !jourFertilite;
                        return (
                          <div key={e.id} style={{
                            padding: "12px 18px", borderBottom: `1px solid var(--border-c)`,
                            borderLeft: `3px solid ${isFertile ? C.yellow : isInfertile || isPrecoce ? C.sage : "transparent"}`,
                          }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <span style={{ fontFamily: "Cormorant Garamond", fontSize: 20, fontWeight: 600, color: C.primary }}>J{e.jourDuCycle}</span>
                                <span style={{ fontSize: 13 }}>{fmtShort(e.date)}</span>
                                {e.jourDuCycle === jourSommet && <span style={{ fontSize: 10, background: C.yellowPale, color: C.yellow, padding: "1px 6px", borderRadius: 99, fontWeight: 600 }}>Sommet</span>}
                                {e.jourDuCycle === jourInfertilite && <span style={{ fontSize: 10, background: C.sagePale, color: C.sage, padding: "1px 6px", borderRadius: 99, fontWeight: 600 }}>Infertile</span>}
                              </div>
                              {e.temperature && <span style={{ fontFamily: "Cormorant Garamond", fontSize: 17, fontWeight: 600, color: analyse.traitBas && e.temperature > analyse.traitBas ? C.sage : C.primaryDeep }}>{e.temperature}°</span>}
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                              {e.saignement      && <ValBadge opts={SAIGNEMENT_OPTS} val={e.saignement} />}
                              {e.glaireSensation && <ValBadge opts={SENSATION_OPTS}  val={e.glaireSensation} />}
                              {e.glaireApparence && <ValBadge opts={APPARENCE_OPTS}  val={e.glaireApparence} />}
                              {e.colFermete      && <ValBadge opts={FERMETE_OPTS}    val={e.colFermete} />}
                              {e.colOuverture    && <ValBadge opts={OUVERTURE_OPTS}  val={e.colOuverture} />}
                              {e.rapport         && <ValBadge opts={RAPPORT_OPTS}    val={e.rapport} />}
                            </div>
                            {e.perturbation && <div style={{ fontSize: 12, color: "var(--muted-c)", marginTop: 5, fontStyle: "italic" }}>{e.perturbation}</div>}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="tbl-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>J</th><th>Date</th><th>T°</th><th>Phase</th><th>Saign.</th>
                            <th>Glaire</th><th>Col</th><th>Rapport</th><th>Note</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredEnts.map(e => {
                            const isFertile = jourFertilite && jourInfertilite && e.jourDuCycle >= jourFertilite && e.jourDuCycle < jourInfertilite;
                            const isInfertile = jourInfertilite && e.jourDuCycle >= jourInfertilite;
                            const isPrecoce = analyse.infertilitePrecoce && e.jourDuCycle <= analyse.infertilitePrecoce && !jourFertilite;
                            const isHaute = analyse.traitBas && e.temperature && e.temperature > analyse.traitBas;
                            return (
                              <tr key={e.id} style={{ cursor: "default", borderLeft: `3px solid ${isFertile ? C.yellow : isInfertile || isPrecoce ? C.sage : "transparent"}` }}>
                                <td style={{ fontWeight: 600, color: C.primary, fontFamily: "Cormorant Garamond", fontSize: 15 }}>
                                  {e.jourDuCycle}
                                  {e.jourDuCycle === jourSommet && <span style={{ marginLeft: 4, fontSize: 10, color: C.yellow }}>S</span>}
                                </td>
                                <td style={{ fontSize: 12, whiteSpace: "nowrap" }}>{fmtShort(e.date)}</td>
                                <td style={{ fontFamily: "Cormorant Garamond", fontSize: 15, fontWeight: 500, color: isHaute ? C.sage : "var(--text-c)" }}>
                                  {e.temperature ? `${e.temperature}°` : "—"}
                                </td>
                                <td style={{ fontSize: 11 }}>
                                  {isFertile ? <span style={{ color: C.yellow, fontWeight: 600 }}>Fertile</span>
                                  : (isInfertile || isPrecoce) ? <span style={{ color: C.sage, fontWeight: 600 }}>Infertile</span>
                                  : <span style={{ color: "var(--muted-c)" }}>—</span>}
                                </td>
                                <td><ValBadge opts={SAIGNEMENT_OPTS} val={e.saignement} /></td>
                                <td>
                                  {e.glaireSensation || e.glaireApparence ? (
                                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                                      {e.glaireSensation && <ValBadge opts={SENSATION_OPTS} val={e.glaireSensation} />}
                                      {e.glaireApparence && <ValBadge opts={APPARENCE_OPTS} val={e.glaireApparence} />}
                                    </div>
                                  ) : "—"}
                                </td>
                                <td>
                                  {e.colFermete || e.colOuverture ? (
                                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                                      {e.colFermete && <ValBadge opts={FERMETE_OPTS} val={e.colFermete} />}
                                      {e.colOuverture && <ValBadge opts={OUVERTURE_OPTS} val={e.colOuverture} />}
                                    </div>
                                  ) : "—"}
                                </td>
                                <td><ValBadge opts={RAPPORT_OPTS} val={e.rapport} /></td>
                                <td style={{ fontSize: 12, color: "var(--muted-c)", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {e.perturbation || "—"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── PARAMÈTRES ──────────────────────────────────────────────────────────────
function Parametres({ settings, onUpdate, onNewCycle, currentCycleNum }) {
  const upd = (k, v) => onUpdate({ ...settings, [k]: v });

  return (
    <div className="anim">
      <PageTitle sub="Personnalisation et configuration">Paramètres</PageTitle>

      <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 560 }}>
        <Card>
          <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 15 }}>Profil</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="Prénom">
              <input value={settings.prenom} onChange={e => upd("prenom", e.target.value)} placeholder="Ton prénom" />
            </Field>
          </div>
        </Card>

        <Card>
          <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 15 }}>Apparence</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontWeight: 500 }}>Mode sombre</div>
              <div style={{ fontSize: 12, color: "var(--muted-c)" }}>Adapte l'interface à la nuit</div>
            </div>
            <button onClick={() => upd("darkMode", !settings.darkMode)} style={{
              width: 46, height: 26, borderRadius: 99, border: "none", cursor: "pointer",
              background: settings.darkMode ? C.primary : C.sandDark, position: "relative", transition: "background .2s"
            }}>
              <span style={{
                position: "absolute", top: 3, left: settings.darkMode ? 22 : 3,
                width: 20, height: 20, borderRadius: "50%", background: C.white,
                transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.2)"
              }} />
            </button>
          </div>
        </Card>

        <Card>
          <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 15 }}>Nouveau cycle</div>
          <p style={{ fontSize: 13, color: "var(--muted-c)", marginBottom: 10, lineHeight: 1.6 }}>
            À utiliser le premier jour de tes règles (cycle {currentCycleNum + 1}).
          </p>
          <div style={{ fontSize: 13, background: C.sagePale, border: `1px solid ${C.sage}40`, borderRadius: 10, padding: "10px 14px", marginBottom: 16, color: C.sage.replace("8F", "5A"), lineHeight: 1.6 }}>
            💾 Un fichier de sauvegarde sera automatiquement téléchargé. Enregistre-le dans ton Drive ou envoie-le par mail pour ne pas perdre tes données.
          </div>
          <Btn variant="soft" onClick={() => {
            if (confirm(`Commencer le cycle ${currentCycleNum + 1} aujourd'hui ?\n\nUn fichier de sauvegarde sera téléchargé automatiquement.`)) {
              onNewCycle();
            }
          }}>
            🌱 Démarrer le cycle {currentCycleNum + 1}
          </Btn>
        </Card>

        <Card>
          <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 15 }}>À propos de Mo</div>
          <p style={{ fontSize: 13, color: "var(--muted-c)", lineHeight: 1.7 }}>
            Mo est une application de suivi de cycle basée sur la méthode symptothermique.
            Elle analyse tes températures basales et observations cervicales pour estimer
            l'ovulation et les phases de ton cycle.<br /><br />
            <strong>Tes données restent sur ton appareil.</strong> Utilise l'export JSON pour les sauvegarder.
          </p>
        </Card>
      </div>
    </div>
  );
}

// ─── ONBOARDING ──────────────────────────────────────────────────────────────
function Onboarding({ onStart, onLoadData, onSettings }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: 24
    }}>
      <div style={{
        background: "var(--surface)", borderRadius: 24, padding: "40px 36px", maxWidth: 460, width: "100%",
        boxShadow: "0 32px 80px rgba(0,0,0,.22)"
      }}>
        <div style={{ fontFamily: "Cormorant Garamond", fontSize: 42, fontWeight: 600, color: C.primary, marginBottom: 4 }}>Mo</div>
        <div style={{ fontSize: 16, color: "var(--muted-c)", marginBottom: 28 }}>Suivi de cycle · Symptothermie</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
          {[
            "Courbe de température basale",
            "Suivi glaire cervicale & col",
            "Détection ovulation automatique",
            "Fenêtre fertile estimée"
          ].map(f => (
            <div key={f} style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 14 }}>
              <span style={{ color: C.sage, fontWeight: 600 }}>✓</span>
              <span>{f}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Btn onClick={onStart}>Commencer directement</Btn>
          <Btn variant="ghost" onClick={onLoadData}>📂 Charger mes données</Btn>
          <Btn variant="ghost" onClick={onSettings}>⚙ Configurer d'abord</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── NAVIGATION ──────────────────────────────────────────────────────────────
const NAVS = [
  { id: "dashboard", label: "Tableau de bord", icon: "◈" },
  { id: "cycle",     label: "Cycle actuel",    icon: "🌸" },
  { id: "historique",label: "Historique",       icon: "📖" },
  { id: "params",    label: "Paramètres",       icon: "⚙" },
];

// ─── PERSISTANCE ─────────────────────────────────────────────────────────────
const STORAGE_KEY = "mo_data_v1";

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function saveToStorage(entries, cycles, settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ entries, cycles, settings, savedAt: new Date().toISOString() }));
  } catch (e) {
    console.warn("localStorage indisponible:", e);
  }
}

// ─── APP ROOT ────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("dashboard");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dataModalOpen, setDataModalOpen] = useState(false);
  const [hasUnsaved, setHasUnsaved] = useState(false);

  // Init state depuis localStorage si dispo, sinon vide
  const stored = useMemo(() => loadFromStorage(), []);
  const [entries, setEntries] = useState(stored?.entries || []);
  const [cycles, setCycles] = useState(stored?.cycles || []);
  const [settings, setSettings] = useState({ ...DEFAULT_SETTINGS, ...(stored?.settings || {}) });
  const [showOnboarding, setShowOnboarding] = useState(!stored || stored.entries?.length === 0);

  // Sauvegarde auto dans localStorage à chaque changement de données
  useEffect(() => {
    if (entries.length === 0 && cycles.length === 0) return;
    saveToStorage(entries, cycles, settings);
    setHasUnsaved(true);
  }, [entries, cycles, settings]);

  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", settings.darkMode);
  }, [settings.darkMode]);

  const currentCycleNum = useMemo(() =>
    Math.max(1, ...entries.map(e => e.cycleNum || 1)),
    [entries]
  );

  const handleAdd = useCallback((entry) => {
    const cycleNum = currentCycleNum;
    const cycleEntries = entries.filter(e => e.cycleNum === cycleNum).sort((a, b) => a.date.localeCompare(b.date));
    const startDate = cycleEntries[0]?.date || entry.date;
    const dayNum = Math.floor((new Date(entry.date) - new Date(startDate)) / 86400000) + 1;
    const newEntry = { ...entry, cycleNum, jourDuCycle: dayNum };
    setEntries(prev => [...prev.filter(e => e.id !== newEntry.id), newEntry]);

    // Update cycle bounds
    setCycles(prev => {
      const existing = prev.find(c => c.cycleNum === cycleNum);
      const allDates = [...cycleEntries.map(e => e.date), entry.date].sort();
      const updated = { cycleNum, dateDebut: allDates[0], dateFin: allDates[allDates.length - 1], nbJours: allDates.length };
      if (existing) return prev.map(c => c.cycleNum === cycleNum ? updated : c);
      return [...prev, updated];
    });
  }, [entries, currentCycleNum]);

  const handleEdit = useCallback((entry) => {
    setEntries(prev => prev.map(e => e.id === entry.id ? entry : e));
  }, []);

  const handleDelete = useCallback((id) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  const handleNewCycle = useCallback(() => {
    const newNum = currentCycleNum + 1;
    const today = new Date().toISOString().slice(0, 10);

    // Snapshot des données actuelles AVANT mutation — pour la sauvegarde
    const prevCycleEntries = entries.filter(e => e.cycleNum === currentCycleNum && e.date < today);
    const prevDates = prevCycleEntries.map(e => e.date).sort();
    const updatedPrevCycle = cycles.map(c => c.cycleNum === currentCycleNum
      ? { ...c, dateFin: prevDates[prevDates.length - 1] || c.dateDebut, nbJours: prevDates.length }
      : c
    );
    const snapshotEntries = entries.filter(e => !(e.cycleNum === currentCycleNum && e.date >= today));
    const snapshotData = {
      entries: snapshotEntries,
      cycles: updatedPrevCycle,
      settings,
      exportedAt: new Date().toISOString(),
      meta: { totalCycles: currentCycleNum, cycleTermine: currentCycleNum, dateExport: today }
    };

    // Téléchargement automatique de la sauvegarde
    const blob = new Blob([JSON.stringify(snapshotData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mo-sauvegarde-avant-cycle${newNum}-${today}.json`;
    a.click();
    URL.revokeObjectURL(url);

    // Mutation du state
    setEntries(prev => {
      const trimmed = prev.filter(e => !(e.cycleNum === currentCycleNum && e.date >= today));
      const newEntry = {
        id: Date.now(), date: today, cycleNum: newNum, jourDuCycle: 1,
        temperature: null, saignement: null,
        glaireSensation: null, glaireApparence: null,
        colFermete: null, colOuverture: null,
        rapport: null, perturbation: null, heure: null,
      };
      return [...trimmed, newEntry];
    });

    setCycles(prev => {
      const updatedPrev = prev.map(c => c.cycleNum === currentCycleNum
        ? { ...c, dateFin: prevDates[prevDates.length - 1] || c.dateDebut, nbJours: prevDates.length, nbEntrees: prevDates.length }
        : c
      );
      return [...updatedPrev, { cycleNum: newNum, dateDebut: today, dateFin: today, nbJours: 1, nbEntrees: 1 }];
    });

    setView("cycle");
  }, [currentCycleNum, entries, cycles, settings]);

  const handleLoad = useCallback((data) => {
    const newEntries = data.entries || [];
    const newCycles = data.cycles || [];
    const newSettings = { ...DEFAULT_SETTINGS, ...(data.settings || {}) };
    setEntries(newEntries);
    setCycles(newCycles);
    setSettings(newSettings);
    saveToStorage(newEntries, newCycles, newSettings);
    setHasUnsaved(false);
    setShowOnboarding(false);
  }, []);

  const navigate = (id) => { setView(id); setDrawerOpen(false); };

  const Sidebar = () => (
    <div style={{
      width: 240, flexShrink: 0, display: "flex", flexDirection: "column",
      padding: "32px 16px 24px", borderRight: "1px solid var(--border-c)", height: "100vh",
      position: "sticky", top: 0, overflow: "auto", background: "var(--surface)",
    }}>
      <div style={{ padding: "0 8px 28px" }}>
        <div style={{ fontFamily: "Cormorant Garamond", fontSize: 36, fontWeight: 600, color: C.primary, lineHeight: 1 }}>Mo</div>
        <div style={{ fontSize: 12, color: "var(--muted-c)", marginTop: 3 }}>
          {settings.prenom ? `Bonjour, ${settings.prenom}` : "Suivi de cycle"}
        </div>
      </div>
      <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
        {NAVS.map(n => {
          const active = view === n.id;
          return (
            <button key={n.id} onClick={() => navigate(n.id)} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
              borderRadius: 12, border: "none", cursor: "pointer", fontFamily: "inherit",
              fontSize: 14, fontWeight: active ? 600 : 400, textAlign: "left",
              background: active ? C.primaryPale : "transparent",
              color: active ? C.primaryDeep : "var(--text-c)",
              transition: "all .15s",
            }}>
              <span style={{ opacity: .8 }}>{n.icon}</span>
              {n.label}
            </button>
          );
        })}
      </nav>

      {/* Mini résumé */}
      {entries.length > 0 && (
        <div style={{ margin: "16px 8px", padding: "14px", background: C.primaryPale, borderRadius: 12, border: `1px solid ${C.primary}30` }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.primaryDeep, marginBottom: 6, textTransform: "uppercase", letterSpacing: ".05em" }}>
            Cycle {currentCycleNum}
          </div>
          <div style={{ fontSize: 12, color: C.primaryDeep }}>
            {entries.filter(e => e.cycleNum === currentCycleNum).length} entrées
          </div>
        </div>
      )}

      <button onClick={() => setDataModalOpen(true)} style={{
        display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
        borderRadius: 12, border: `1px solid var(--border-c)`, cursor: "pointer",
        fontFamily: "inherit", fontSize: 14, background: "transparent", color: "var(--muted-c)",
        marginTop: 8, position: "relative"
      }}>
        💾 Données
        {hasUnsaved && <span style={{
          width: 7, height: 7, borderRadius: "50%", background: C.primary,
          position: "absolute", top: 9, right: 12
        }} />}
      </button>
    </div>
  );

  // Mobile topbar + drawer
  const MobileHeader = () => (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, height: 56,
      background: "var(--surface)", borderBottom: "1px solid var(--border-c)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 18px", zIndex: 100,
    }}>
      <div style={{ fontFamily: "Cormorant Garamond", fontSize: 28, fontWeight: 600, color: C.primary }}>Mo</div>
      <div style={{ fontSize: 13, fontWeight: 500 }}>{NAVS.find(n => n.id === view)?.label}</div>
      <button onClick={() => setDrawerOpen(true)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "var(--text-c)" }}>☰</button>
    </div>
  );

  const Drawer = () => (
    <>
      <div onClick={() => setDrawerOpen(false)} style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 200,
        opacity: drawerOpen ? 1 : 0, pointerEvents: drawerOpen ? "auto" : "none", transition: "opacity .2s"
      }} />
      <div style={{
        position: "fixed", top: 0, left: 0, bottom: 0, width: 260,
        background: "var(--surface)", zIndex: 201, padding: "24px 16px",
        transform: drawerOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform .25s ease", boxShadow: "4px 0 24px rgba(0,0,0,.12)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, padding: "0 8px" }}>
          <div style={{ fontFamily: "Cormorant Garamond", fontSize: 30, fontWeight: 600, color: C.primary }}>Mo</div>
          <button onClick={() => setDrawerOpen(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--muted-c)" }}>✕</button>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {NAVS.map(n => {
            const active = view === n.id;
            return (
              <button key={n.id} onClick={() => navigate(n.id)} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "11px 14px",
                borderRadius: 12, border: "none", cursor: "pointer", fontFamily: "inherit",
                fontSize: 14, fontWeight: active ? 600 : 400, textAlign: "left",
                background: active ? C.primaryPale : "transparent", color: active ? C.primaryDeep : "var(--text-c)",
              }}>
                {n.icon} {n.label}
              </button>
            );
          })}
        </nav>
        <button onClick={() => { setDataModalOpen(true); setDrawerOpen(false); }} style={{
          display: "flex", alignItems: "center", gap: 8, padding: "11px 14px",
          borderRadius: 12, border: `1px solid var(--border-c)`, cursor: "pointer",
          fontFamily: "inherit", fontSize: 14, background: "transparent", color: "var(--muted-c)",
          marginTop: 16, width: "100%", position: "relative"
        }}>
          💾 Données
          {hasUnsaved && <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.primary, position: "absolute", top: 12, right: 14 }} />}
        </button>
      </div>
    </>
  );

  // Bannière iOS — s'affiche uniquement sur Safari iOS, pas déjà installée, pas déjà fermée
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
  const [iosBannerDismissed, setIosBannerDismissed] = useState(() => localStorage.getItem("mo_ios_banner") === "1");
  const showIOSBanner = isIOS && !isStandalone && !iosBannerDismissed && isMobile;

  const dismissIOSBanner = () => {
    localStorage.setItem("mo_ios_banner", "1");
    setIosBannerDismissed(true);
  };

  return (
    <>
      <style>{G}</style>

      {/* Bannière installation iOS */}
      {showIOSBanner && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 500,
          background: "var(--surface)", borderTop: `2px solid ${C.primary}`,
          padding: "16px 18px 28px", boxShadow: "0 -4px 24px rgba(0,0,0,.12)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img src="/icon-192.png" style={{ width: 36, height: 36, borderRadius: 8 }} alt="" />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Installer Mo sur ton iPhone</div>
                <div style={{ fontSize: 12, color: "var(--muted-c)" }}>Accès rapide depuis l'écran d'accueil</div>
              </div>
            </div>
            <button onClick={dismissIOSBanner} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--muted-c)", padding: "0 4px" }}>✕</button>
          </div>
          <div style={{ fontSize: 13, color: "var(--text-c)", lineHeight: 1.6, background: C.primaryPale, borderRadius: 10, padding: "10px 14px" }}>
            1. Appuie sur le bouton <strong>Partager</strong> <span style={{ fontSize: 16 }}>⎙</span> en bas de Safari<br />
            2. Fais défiler et choisis <strong>"Sur l'écran d'accueil"</strong><br />
            3. Appuie sur <strong>Ajouter</strong> — c'est tout !
          </div>
        </div>
      )}

      {showOnboarding && entries.length === 0 && (
        <Onboarding
          onStart={() => setShowOnboarding(false)}
          onLoadData={() => { setShowOnboarding(false); setDataModalOpen(true); }}
          onSettings={() => { setShowOnboarding(false); setView("params"); }}
        />
      )}
      <div style={{ display: "flex", minHeight: "100vh" }}>
        {!isMobile && <Sidebar />}
        {isMobile && <MobileHeader />}
        {isMobile && <Drawer />}
        <main className={isMobile ? "page-padding" : ""} style={{ flex: 1, padding: isMobile ? "76px 16px 40px" : "44px 52px", maxWidth: isMobile ? undefined : 1100 }}>
          {view === "dashboard"  && <Dashboard entries={entries} cycles={cycles} settings={settings} />}
          {view === "cycle"      && <CycleActuel entries={entries} cycles={cycles} onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete} currentCycleNum={currentCycleNum} isMobile={isMobile} />}
          {view === "historique" && <Historique entries={entries} cycles={cycles} isMobile={isMobile} />}
          {view === "params"     && <Parametres settings={settings} onUpdate={setSettings} onNewCycle={handleNewCycle} currentCycleNum={currentCycleNum} />}
        </main>
      </div>
      <DataModal open={dataModalOpen} onClose={() => setDataModalOpen(false)}
        onLoad={handleLoad} hasUnsaved={hasUnsaved}
        entries={entries} cycles={cycles} settings={settings} />
    </>
  );
}
