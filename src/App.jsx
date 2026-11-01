import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend
} from "recharts";

// ─── PALETTE ────────────────────────────────────────────────────────────────
const C = {
  // Thème clair
  bg:           "#FFF7F9",
  white:        "#FFFFFF",
  sand:         "#FBEEF2",
  sandDark:     "#F3DAE4",
  text:         "#2A1020",
  muted:        "#9A7E8C",
  border:       "#EBD3DD",
  // Thème sombre (référence : écrans de l'app d'origine)
  dBg:          "#0F070D",
  dSheet:       "#120912",
  dSurface:     "#1B0C1A",
  dSurface2:    "#2D0F25",
  dSurface3:    "#3D1733",
  dBorder:      "#2A1427",
  dChipBorder:  "#3E1B36",
  dBand:        "#221321",
  dText:        "#FBF3F6",
  dMuted:       "#B9A4B0",
  // Accents
  primary:      "#E0245E",
  primaryLight: "#F0709A",
  primaryPale:  "rgba(224,36,94,.14)",
  primaryDeep:  "#EE5C8A",
  cta:          "#D91A4C",
  ctaText:      "#1A0510",
  wine:         "#6B1A3A",
  wineDot:      "#7D1A3E",
  wineEdge:     "#C0204F",
  avatarBg:     "#4A1428",
  scrim:        "rgba(5,2,4,.72)",
  secondary:    "#B98A66",
  secondaryPale:"rgba(185,138,102,.16)",
  secondaryDark:"#C99A74",
  rose:         "#F0709A",
  rosePale:     "rgba(240,112,154,.14)",
  sage:         "#6FBF8F",
  sagePale:     "rgba(111,191,143,.15)",
  lavender:     "#A855F7",
  lavenderPale: "rgba(168,85,247,.15)",
  green:        "#6FBF8F", greenPale:  "rgba(111,191,143,.15)",
  yellow:       "#E8B84A", yellowPale: "rgba(232,184,74,.15)",
  red:          "#E8264F", redPale:    "rgba(232,38,79,.14)",
  // Phases (anneau + orbe)
  phMens:       "#EE2A5C",
  phFol:        "#FF3D8F",
  phOvu:        "#FF7A3A",
  phLut:        "#A855F7",
  phMensDim:    "#7A1B40",
  phFolDim:     "#7A1B40",
  phOvuDim:     "#8B4A2B",
  phLutDim:     "#4C2B8C",
  // Icônes de catégories
  icBandage:    "#F58BAE",
  icGut:        "#CC7A4A",
  icSmile:      "#EE4C86",
  icBolt:       "#F2B83E",
  icHeart:      "#EE5C86",
  icHair:       "#8E7BDB",
  icQuest:      "#6E5864",
  icMoon:       "#5B8DEF",
  icSport:      "#EC5F86",
  icFood:       "#E8963E",
  icPill:       "#F77FA0",
  icNote:       "#A07BE0",
  icGlaire:     "#4F86E0",
  icSpot:       "#A8704E",
  icRegles:     "#E04545",
};

// Orbe central : [clair, base, foncé] par phase
const ORB = {
  menstruelle:  { light: "#F8C9D2", base: "#F29BB0", dark: "#E0396A" },
  folliculaire: { light: "#F7BFD6", base: "#F27BB4", dark: "#EC4C9E" },
  ovulatoire:   { light: "#F4CDB5", base: "#F4A074", dark: "#EE7438" },
  luteale:      { light: "#D8BCF5", base: "#B98AF0", dark: "#8A45E8" },
};

// ─── CONSTANTES ─────────────────────────────────────────────────────────────
const SAIGNEMENT_OPTS = [
  { value: "aucun",    label: "Aucun",    color: C.muted },
  { value: "spotting", label: "Spotting", color: C.secondary },
  { value: "faible",   label: "Faible",   color: C.yellow },
  { value: "normal",   label: "Normal",   color: C.primary },
  { value: "abondant", label: "Abondant", color: C.red },
];
// Options affichées dans le formulaire de saisie (sans "Aucun")
const SAIGNEMENT_FORM_OPTS = SAIGNEMENT_OPTS.filter(o => o.value !== "aucun");
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
  { value: "inconnue",        label: "Protection non renseignée", color: C.muted },
];

// ── Pertes ──
const FLUX_OPTS = [
  { value: "leger",         label: "Léger",         color: C.secondary },
  { value: "modere",        label: "Modéré",        color: C.yellow },
  { value: "abondant",      label: "Abondant",      color: C.primary },
  { value: "tres_abondant", label: "Très abondant", color: C.red },
];
const FLUX_TO_SAIGNEMENT = { leger: "faible", modere: "normal", abondant: "abondant", tres_abondant: "abondant" };
const COULEUR_REGLES_OPTS = [
  { value: "marron",     label: "Marron",     color: C.secondaryDark },
  { value: "rouge_vif",  label: "Rouge vif",  color: C.red },
  { value: "rose_pale",  label: "Rose pâle",  color: C.rose },
];
const CAILLOTS_OPTS = [
  { value: "oui", label: "Oui", color: C.red },
  { value: "non", label: "Non", color: C.sage },
];
const SPOTTING_COULEUR_OPTS = [
  { value: "rouge",  label: "Rouge",  color: C.red },
  { value: "marron", label: "Marron", color: C.secondaryDark },
  { value: "rose",   label: "Rosé",   color: C.rose },
];
const QUANTITE_GLAIRE_OPTS = [
  { value: "legere",   label: "Légère",   color: C.secondary },
  { value: "moyenne",  label: "Moyenne",  color: C.yellow },
  { value: "abondante",label: "Abondante",color: C.primary },
];
// Glaire : qualité unique (traduite vers sensation + apparence pour l'algorithme)
const GLAIRE_QUALITE_OPTS = [
  { value: "seche",      label: "Sèche/rien",  color: C.yellow },
  { value: "collante",   label: "Collante",    color: C.secondary },
  { value: "cremeuse",   label: "Crémeuse",    color: C.rose },
  { value: "humide",     label: "Humide",      color: C.primary },
  { value: "blanc_oeuf", label: "Blanc d'œuf", color: C.sage },
];
const GLAIRE_QUALITE_MAP = {
  seche:      ["seche",     "aucune"],
  collante:   ["seche",     "pateuse"],
  cremeuse:   ["humide",    "pateuse"],
  humide:     ["humide",    "aucune"],
  blanc_oeuf: ["lubrifiee", "fertile"],
};
const TEST_OVULATION_OPTS = [
  { value: "negatif",  label: "Négatif",        color: C.muted },
  { value: "presque",  label: "Presque positif",color: C.yellow },
  { value: "positif",  label: "Positif",        color: C.sage },
];

const EMPTY_FORM = {
  date: new Date().toISOString().slice(0, 10),
  temperature: "",
  heure: "",
  saignement: null,
  glaireSensation: null,
  glaireApparence: null,
  quantiteGlaire: null,
  colFermete: null,
  colOuverture: null,
  rapport: null,
  perturbation: "",
  flux: null,
  couleurRegles: null,
  caillots: null,
  spotting: null,
};

const DEFAULT_SETTINGS = {
  prenom: "",
  darkMode: true,
  longueurCycleMoyenne: 28,
  longueurLutealeMoyenne: 14,
  customComplements: [],
  customTraitements: [],
};

// ─── STYLES GLOBAUX ─────────────────────────────────────────────────────────
const G = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
  html, body { height: 100%; }
  html { background: var(--bg); }
  body {
    background: var(--bg); font-family: 'DM Sans', sans-serif; color: var(--text-c);
    font-size: 14px; line-height: 1.5;
    overflow-x: hidden;
    -webkit-text-size-adjust: 100%;
  }
  button { font-family: inherit; }
  :root {
    --bg: ${C.bg};
    --sheet: ${C.bg};
    --surface: ${C.white};
    --surface-2: ${C.sand};
    --surface-3: ${C.sandDark};
    --border-c: ${C.border};
    --chip: ${C.sand};
    --chip-b: ${C.border};
    --band: ${C.sand};
    --text-c: ${C.text};
    --muted-c: ${C.muted};
  }
  :root.dark {
    --bg: ${C.dBg};
    --sheet: ${C.dSheet};
    --surface: ${C.dSurface};
    --surface-2: ${C.dSurface2};
    --surface-3: ${C.dSurface3};
    --border-c: ${C.dBorder};
    --chip: ${C.dSurface2};
    --chip-b: ${C.dChipBorder};
    --band: ${C.dBand};
    --text-c: ${C.dText};
    --muted-c: ${C.dMuted};
    color-scheme: dark;
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
  .no-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
  .no-scrollbar::-webkit-scrollbar { display: none; width: 0; height: 0; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  .anim { animation: fadeUp .35s ease backwards; }
  @keyframes sheetUp { from { opacity:0; transform:translateY(36px); } to { opacity:1; transform:translateY(0); } }
  @keyframes floatBlobA { 0%,100% { transform: translate(-5%,-3%) scale(1); } 50% { transform: translate(4%,5%) scale(1.1); } }
  @keyframes floatBlobB { 0%,100% { transform: translate(5%,3%) scale(1.04); } 50% { transform: translate(-4%,-5%) scale(.96); } }
  @keyframes breathe { 0%,100% { transform: scale(1); } 50% { transform: scale(1.012); } }
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

// ─── MOTEUR DE PHASE ─────────────────────────────────────────────────────────
// Détermine la phase du cycle pour un jour donné (réel ou projeté),
// à partir de la durée moyenne de cycle et du jour d'ovulation moyen.
const PHASE_COLORS = {
  menstruelle:  C.phMens,
  folliculaire: C.phFol,
  ovulatoire:   C.phOvu,
  luteale:      C.phLut,
};
const PHASE_LABELS = {
  menstruelle:  "menstruelle",
  folliculaire: "folliculaire",
  ovulatoire:   "ovulatoire",
  luteale:      "lutéale",
};

function getPhaseForDay(jour, avgLen, ovMean, dureeReglesMoy = 5) {
  const ov = Math.round(ovMean);
  const fertileStart = ov - 5;
  const fertileEnd = ov + 1;
  let phase;
  if (jour <= dureeReglesMoy) phase = "menstruelle";
  else if (jour < fertileStart) phase = "folliculaire";
  else if (jour <= fertileEnd) phase = "ovulatoire";
  else phase = "luteale";
  return { phase, color: PHASE_COLORS[phase], label: PHASE_LABELS[phase] };
}

// Bornes des 4 segments (en % du cycle) pour dessiner la roue
function phaseSegments(avgLen, ovMean, dureeReglesMoy = 5) {
  const ov = Math.round(ovMean);
  const fertileStart = Math.max(dureeReglesMoy + 1, ov - 5);
  const fertileEnd = Math.min(avgLen, ov + 1);
  return [
    { phase: "menstruelle",  start: 1, end: dureeReglesMoy },
    { phase: "folliculaire", start: dureeReglesMoy + 1, end: fertileStart - 1 },
    { phase: "ovulatoire",   start: fertileStart, end: fertileEnd },
    { phase: "luteale",      start: fertileEnd + 1, end: avgLen },
  ].filter(s => s.end >= s.start);
}

// ─── DATES (heure locale, jamais UTC) ────────────────────────────────────────
const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const todayStr = () => ymd(new Date());
const addDays = (s, n) => { const d = new Date(s + "T12:00:00"); d.setDate(d.getDate() + n); return ymd(d); };
const diffDays = (a, b) => Math.round((new Date(a + "T12:00:00") - new Date(b + "T12:00:00")) / 86400000);
const nowHHMM = () => { const d = new Date(); return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; };
const fmtHeure = (h) => (h && h.includes(":")) ? h.replace(":", " h ") : "—";
const capFirst = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
const fmtDM = (s) => new Date(s + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
const fmtDMshort = (s) => new Date(s + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
const fmtTemp = (t) => t ? String(t).replace(".", ",") : "";

// ─── GLAIRE : qualité unique ↔ sensation + apparence ─────────────────────────
function glaireQualiteOf(e) {
  if (!e) return null;
  if (e.glaireQualite) return e.glaireQualite;
  const s = e.glaireSensation, a = e.glaireApparence;
  if (!s && !a) return null;
  if (a === "fertile" || s === "lubrifiee") return "blanc_oeuf";
  if (a === "pateuse") return s === "humide" ? "cremeuse" : "collante";
  if (s === "humide") return "humide";
  return "seche";
}

// ─── SYMPTÔMES : catégories (d'après l'app de référence) ─────────────────────
const lv5 = (...l) => l;
const SYM_CATS = [
  { id: "douleurs", label: "Douleurs & inconforts", icon: "bandage", color: C.icBandage, sections: [
    { key: "crampes", title: "Crampes menstruelles", type: "scale", levels: lv5("Aucune", "Légères", "Modérées", "Fortes", "Handicapantes") },
    { key: "corps", title: "Corps", chips: ["Douleurs d'ovulation", "Douleurs anales", "Rétention d'eau", "Allergies", "Poitrine sensible", "Poitrine gonflée", "Mal de dos", "Cervicales", "Articulations", "Très chaud", "Frileuse", "Douleurs pelviennes", "Courbatures", "Tensions musculaires", "Bouffées de chaleur", "Transpiration accrue", "Grippe menstruelle", "Odeur"] },
    { key: "tete", title: "Tête", chips: ["Auras", "Vertiges", "Maux de tête", "Migraine"] },
  ]},
  { id: "digestion", label: "Digestion", icon: "gut", color: C.icGut, sections: [
    { key: "digestion", chips: ["Ballonnée", "Constipée", "Gaz", "Diarrhée", "Transit normal", "Brûlure d'estomac", "Crampes abdominales", "Nausées", "Transit accéléré"] },
  ]},
  { id: "humeur", label: "Humeur & social", icon: "smile", color: C.icSmile, sections: [
    { key: "humeurPlus", title: "Les +", chips: ["Motivée", "Sereine", "Sociable", "Joyeuse", "Optimiste", "Créative", "Productive", "Confiance en soi", "Détendue", "Concentrée"] },
    { key: "humeurNeutre", title: "Neutre", chips: ["Neutre", "Pensive", "Calme"] },
    { key: "humeurMoins", title: "Les -", chips: ["Triste", "Sensible", "Pas productive", "Irritable", "Déconcentrée", "Anxieuse", "Agacée", "Sautes d'humeur", "En colère", "Négative", "Stressée", "Frustrée", "Blasée", "Envie d'être seule", "Coup de mou"] },
  ]},
  { id: "energie", label: "Énergie", icon: "bolt", color: C.icBolt, sections: [
    { key: "energie", type: "scale", levels: lv5("Complètement KO", "Fatiguée", "Normale", "En forme", "Pleine d'énergie") },
  ]},
  { id: "libido", label: "Libido & vie sexuelle", icon: "heart", color: C.icHeart, sections: [
    { key: "libido", title: "Libido", single: true, chips: ["Pas du tout envie", "En veille", "Neutre", "Réceptive", "En montée", "Très envie"] },
    { key: "vie", title: "Vie sexuelle", chips: [
      { value: "avec_protection", label: "Rapport protégé", root: "rapport" },
      { value: "sans_protection", label: "Rapport non protégé", root: "rapport" },
      { value: "inconnue", label: "Rapport · protection non renseignée", root: "rapport" },
      "Plaisir solo", "Rapport douloureux",
    ]},
  ]},
  { id: "peau", label: "Peau & cheveux", icon: "hair", color: C.icHair, sections: [
    { key: "peau", title: "Peau", chips: ["Nouveaux boutons", "Grasse", "Sèche", "Réactive", "Belle"] },
    { key: "cheveux", title: "Cheveux", chips: ["Gras", "Secs", "Brillants", "Perte de cheveux"] },
  ]},
  { id: "inhabituel", label: "Inhabituel", icon: "quest", color: C.icQuest, sections: [
    { key: "inhabituel", chips: ["Alcool", "Maladie", "Voyage", "Décalage horaire", "Choc émotionnel", "Excès de caféine"] },
  ]},
  { id: "sommeil", label: "Sommeil", icon: "moon", color: C.icMoon, sections: [
    { key: "nuit", title: "Nuit", type: "scale", levels: lv5("Horrible", "Mauvaise", "Moyenne", "Bonne", "Excellente") },
    { key: "duree", title: "Durée", single: true, chips: ["Blanche", "Courte", "Normale", "Longue", "Très longue"] },
    { key: "endormissement", title: "Endormissement", single: true, chips: ["Difficulté à s'endormir", "Normal", "Rapide"] },
    { key: "reveil", title: "Réveil", chips: ["Réveils nocturnes", "Réveil difficile", "Bien reposée"] },
  ]},
  { id: "sport", label: "Sport", icon: "sport", color: C.icSport, sections: [
    { key: "seance", title: "Ressenti séance", type: "scale", levels: lv5("Très facile", "Facile", "Moyen", "Difficile", "Très difficile") },
    { key: "force", title: "Force", type: "scale", levels: ["Plus faible que d'habitude", "Normale", "Plus forte que d'habitude"] },
    { key: "motivation", title: "Motivation", type: "scale", levels: ["Aucune envie", "Peu motivée", "Motivée", "Très motivée"] },
  ]},
  { id: "appetit", label: "Appétit & envies", icon: "food", color: C.icFood, sections: [
    { key: "appetit", title: "Appétit", type: "scale", levels: lv5("Appétit coupé", "Faible", "Normal", "Gros appétit", "Tout le temps faim") },
    { key: "envies", title: "Envies", chips: ["Sucre", "Gras", "Féculents", "Viande", "Grignottages"] },
  ]},
  { id: "complements", label: "Compléments", fullTitle: "Compléments alimentaires / Traitements", icon: "pill", color: C.icPill, sections: [
    { key: "complements", title: "Compléments alimentaires", chips: ["Fer", "Magnésium", "Vitamines", "Oméga-3"], custom: "customComplements", addLabel: "Ajouter mon complément" },
    { key: "traitements", title: "Traitements", chips: [], custom: "customTraitements", addLabel: "Ajouter mon traitement" },
  ]},
  { id: "notes", label: "Notes libres", icon: "note", color: C.icNote, special: "notes" },
];

const chipValue = (c) => typeof c === "string" ? c : c.value;
const chipLabel = (c) => typeof c === "string" ? c : c.label;

// Nombre de valeurs saisies dans une catégorie de symptômes
function symCatCount(cat, e) {
  if (!e) return 0;
  if (cat.special === "notes") return e.notesLibres && e.notesLibres.trim() ? 1 : 0;
  const sym = e.sym || {};
  let n = 0;
  cat.sections.forEach(sec => {
    if (sec.type === "scale") { if (typeof sym[sec.key] === "number") n += 1; return; }
    (sec.chips || []).forEach(c => { if (typeof c !== "string" && c.root && e[c.root] === c.value) n += 1; });
    n += (sym[sec.key] || []).length;
  });
  return n;
}
const symCount = (e) => SYM_CATS.reduce((a, c) => a + symCatCount(c, e), 0);
const symCatsFilled = (e) => SYM_CATS.filter(c => symCatCount(c, e) > 0).length;
const sthCount = (e) => !e ? 0 :
  (e.temperature ? 1 : 0) + (glaireQualiteOf(e) ? 1 : 0) + (e.quantiteGlaire ? 1 : 0) +
  (e.testOvulation ? 1 : 0) + (e.colFermete ? 1 : 0) + (e.colOuverture ? 1 : 0);
const pertesCount = (e) => !e ? 0 :
  (e.flux ? 1 : 0) + (e.couleurRegles ? 1 : 0) + (e.caillots ? 1 : 0) + (e.spotting ? 1 : 0) + (glaireQualiteOf(e) ? 1 : 0);

const hasSymptomes = (e) => symCount(e) > 0 || (e && !!e.rapport);
const hasSymptothermie = (e) => sthCount(e) > 0;
const hasPertes = (e) => pertesCount(e) > 0 || (e && !!e.saignement && e.saignement !== "aucun");
const hasAnyData = (e) => !!e && (hasSymptomes(e) || hasSymptothermie(e) || hasPertes(e) || !!e.temperature);
const flowOn = (e) => !!e && (["faible", "normal", "abondant"].includes(e.saignement) || !!e.flux);

// ─── GAMIFICATION ────────────────────────────────────────────────────────────
// Niveau basé sur le nombre total de jours renseignés (données réellement saisies)
const NIVEAUX = [
  { seuil: 0,   nom: "Débutante" },
  { seuil: 50,  nom: "Attentive" },
  { seuil: 150, nom: "Régulière" },
  { seuil: 300, nom: "Experte" },
  { seuil: 500, nom: "Maîtresse du cycle" },
];

function computeGamification(entries) {
  const joursRenseignes = entries.filter(hasAnyData).length;
  const xp = joursRenseignes * 5;
  let niveauIdx = 0;
  for (let i = 0; i < NIVEAUX.length; i++) {
    if (xp >= NIVEAUX[i].seuil) niveauIdx = i;
  }
  const niveau = NIVEAUX[niveauIdx];
  const next = NIVEAUX[niveauIdx + 1];
  const xpMax = next ? next.seuil : niveau.seuil + 200;
  const xpDebutNiveau = niveau.seuil;
  return {
    niveauNum: niveauIdx + 1,
    nom: niveau.nom,
    xp,
    xpMax,
    progres: Math.min(100, Math.round(((xp - xpDebutNiveau) / (xpMax - xpDebutNiveau)) * 100)),
    joursRenseignes,
  };
}

// Série de jours consécutifs renseignés (jusqu'à aujourd'hui, ou hier si aujourd'hui est vide)
function computeStreak(entries) {
  const filled = new Set(entries.filter(hasAnyData).map(e => e.date));
  let d = todayStr();
  if (!filled.has(d)) d = addDays(d, -1);
  let n = 0;
  while (filled.has(d)) { n += 1; d = addDays(d, -1); }
  return n;
}

// ─── STATS DE CYCLE (partagées Accueil / Courbe / Calendrier) ────────────────
function useCycleStats(entries, cycles) {
  return useMemo(() => {
    const currentCycleNum = Math.max(1, ...entries.map(e => e.cycleNum || 1));
    const currentEntries = entries.filter(e => e.cycleNum === currentCycleNum).sort((a, b) => a.date.localeCompare(b.date));
    const cycleStart = currentEntries[0]?.date || todayStr();
    // Durée d'un cycle = écart entre deux débuts de cycle (robuste si les derniers jours ne sont pas saisis)
    const starts = cycles.filter(c => c.dateDebut).map(c => c.dateDebut).sort();
    const lens = starts.slice(1).map((d, i) => diffDays(d, starts[i])).filter(n => n >= 18 && n <= 60).slice(-12);
    const avgLen = lens.length ? Math.min(45, Math.max(21, Math.round(lens.reduce((a, b) => a + b, 0) / lens.length))) : 28;

    const groups = {};
    entries.forEach(e => { (groups[e.cycleNum] = groups[e.cycleNum] || []).push(e); });
    const past = Object.entries(groups).filter(([n]) => parseInt(n) < currentCycleNum);
    const ovStats = computeOvulationStats(past.map(([, ents]) => ({ entries: ents })));
    const ovMean = ovStats.mean || 14;

    // Durée moyenne des règles : jours consécutifs avec flux depuis le J1 de chaque cycle passé
    const durs = [];
    past.forEach(([, ents]) => {
      const sorted = ents.slice().sort((a, b) => a.date.localeCompare(b.date));
      const byDate = {}; sorted.forEach(e => { byDate[e.date] = e; });
      let n = 0;
      while (flowOn(byDate[addDays(sorted[0].date, n)])) n += 1;
      if (n >= 2 && n <= 10) durs.push(n);
    });
    const dureeRegles = durs.length ? Math.min(8, Math.max(2, Math.round(durs.reduce((a, b) => a + b, 0) / durs.length))) : 5;

    const todayCycleDay = Math.max(1, diffDays(todayStr(), cycleStart) + 1);
    return { currentCycleNum, currentEntries, cycleStart, avgLen, ovMean, ovStats, dureeRegles, todayCycleDay };
  }, [entries, cycles]);
}

// Calcule un domaine d'axe Y propre pour les températures :
// arrondi au 0.1, min 36.5, ticks tous les 0.1
function tempAxisProps(data) {
  const temps = data.map(d => d.temp).filter(t => t && t > 0);
  if (temps.length === 0) {
    return { domain: [36.5, 37.5], ticks: [36.5, 36.6, 36.7, 36.8, 36.9, 37.0, 37.1, 37.2, 37.3, 37.4, 37.5] };
  }
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  // Arrondi au 0.1 inférieur/supérieur avec marge
  const lo = Math.min(36.5, Math.floor((min - 0.1) * 10) / 10);
  const hi = Math.max(lo + 0.5, Math.ceil((max + 0.1) * 10) / 10);
  const ticks = [];
  for (let v = lo; v <= hi + 0.0001; v = Math.round((v + 0.1) * 10) / 10) ticks.push(Math.round(v * 10) / 10);
  return { domain: [lo, hi], ticks };
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
          background: "var(--surface)",
          boxShadow: "0 8px 12px -6px rgba(0,0,0,.10)",
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
        <div className="no-scrollbar" style={{
          position: "fixed",
          top: `calc(${TOP} + ${subtitle ? 96 : 80}px)`,
          bottom: 0, left: 0, right: 0,
          zIndex: 1001,
          background: "var(--surface)",
          overflowY: "scroll",
          WebkitOverflowScrolling: "touch",
          padding: "20px 20px 110px",
        }}>
          {children}
        </div>
      </>
    );
  }

  // Desktop
  return (
    <div onClick={onClose} className="no-scrollbar" style={{
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
    else setForm({ ...EMPTY_FORM, date: todayStr() });
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
        </div>

        <div style={{ borderTop: "1px solid var(--border-c)", paddingTop: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted-c)", marginBottom: 12, textTransform: "uppercase", letterSpacing: ".06em" }}>
            Saignements
          </div>
          <PillSelect opts={SAIGNEMENT_FORM_OPTS} value={form.saignement} onChange={v => upd("saignement", v)} nullable />
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

// ─── ICÔNES ──────────────────────────────────────────────────────────────────
function Ico({ name, size = 22, color = "currentColor", sw = 1.8 }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: sw, strokeLinecap: "round", strokeLinejoin: "round", style: { display: "block", flexShrink: 0 } };
  switch (name) {
    case "edit":
      return <svg {...p}><path d="M11 4H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-4" /><path d="M17.6 3.6a2.1 2.1 0 0 1 3 3L12 15.2 8 16l.8-4z" /></svg>;
    case "thermo":
      return <svg {...p}><path d="M10 14.3V5a2 2 0 1 1 4 0v9.3a4 4 0 1 1-4 0z" /><circle cx="12" cy="17" r="1.3" fill={color} stroke="none" /></svg>;
    case "drop":
      return <svg {...p}><path d="M12 3.2c3 3.8 6.2 7.6 6.2 11.3a6.2 6.2 0 1 1-12.4 0c0-3.7 3.2-7.5 6.2-11.3z" /></svg>;
    case "dropFill":
      return <svg {...p} fill={color} stroke="none"><path d="M12 2.8c3.3 4.2 6.6 8 6.6 11.8a6.6 6.6 0 1 1-13.2 0c0-3.8 3.3-7.6 6.6-11.8z" /></svg>;
    case "clock":
      return <svg {...p}><circle cx="12" cy="12" r="8.6" /><path d="M12 7.4V12l3.2 2" /></svg>;
    case "calendarDots":
      return <svg {...p}><rect x="3.5" y="5" width="17" height="15.5" rx="3.2" /><path d="M8 3v4M16 3v4" /><circle cx="8" cy="12" r=".9" fill={color} stroke="none" /><circle cx="12" cy="12" r=".9" fill={color} stroke="none" /><circle cx="16" cy="12" r=".9" fill={color} stroke="none" /><circle cx="8" cy="16" r=".9" fill={color} stroke="none" /><circle cx="12" cy="16" r=".9" fill={color} stroke="none" /></svg>;
    case "chevL": return <svg {...p}><path d="M14.5 5.5 8 12l6.5 6.5" /></svg>;
    case "chevR": return <svg {...p}><path d="M9.5 5.5 16 12l-6.5 6.5" /></svg>;
    case "chevD": return <svg {...p}><path d="M5.5 9.5 12 16l6.5-6.5" /></svg>;
    case "info": return <svg {...p} strokeWidth={1.6}><path d="M12 11v5.2" /><circle cx="12" cy="7.6" r=".6" fill={color} /></svg>;
    case "close": return <svg {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>;
    case "plus": return <svg {...p}><path d="M12 5v14M5 12h14" /></svg>;
    case "chart": return <svg {...p}><path d="M4.5 20V11M10.2 20V4M15.9 20v-6.5M21.5 20H2.5" /></svg>;
    case "history":
      return <svg {...p}><path d="M4.5 12a7.5 7.5 0 1 0 2.4-5.5" /><path d="M4.2 4.8v4h4" /><path d="M12 8.2v4.3l3 2" /></svg>;
    case "cycle":
      return <svg {...p}><path d="M4 16.5 9 11l3.5 3.5L20 6.5" /><path d="M15 6.5h5v5" /></svg>;
    case "more":
      return <svg {...p}><circle cx="6" cy="12" r="1.3" fill={color} stroke="none" /><circle cx="12" cy="12" r="1.3" fill={color} stroke="none" /><circle cx="18" cy="12" r="1.3" fill={color} stroke="none" /></svg>;
    case "sparkle":
      return <svg {...p}><path d="M12 3l1.7 5 5 1.7-5 1.7-1.7 5-1.7-5-5-1.7 5-1.7 2-5z" /></svg>;
    case "gear":
      return <svg {...p}><circle cx="12" cy="12" r="3" /><path d="M12 3.5v2.3M12 18.2v2.3M4.6 7.5l2 1.2M17.4 15.3l2 1.2M3.5 12h2.3M18.2 12h2.3M4.6 16.5l2-1.2M17.4 8.7l2-1.2" /></svg>;
    case "save":
      return <svg {...p}><path d="M12 3.5v10.5M8 10.5l4 4 4-4" /><path d="M5 15.5v3.3A2.2 2.2 0 0 0 7.2 21h9.6a2.2 2.2 0 0 0 2.2-2.2v-3.3" /></svg>;
    default: return null;
  }
}

// Icônes colorées des catégories (pleines / contours, comme la référence)
function CatIcon({ name, size = 34, color }) {
  const s = { width: size, height: size, viewBox: "0 0 24 24", style: { display: "block", flexShrink: 0 } };
  const st = { fill: "none", stroke: color, strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "bandage":
      return <svg {...s}><g transform="rotate(45 12 12)"><rect x="1.5" y="8" width="21" height="8" rx="4" fill={color} /><rect x="8" y="1.5" width="8" height="21" rx="4" fill={color} /></g><rect x="8.8" y="8.8" width="6.4" height="6.4" rx="1.6" transform="rotate(45 12 12)" fill="none" stroke={C.white} strokeOpacity=".65" strokeWidth="1.2" /></svg>;
    case "gut":
      return <svg {...s}><path d="M9 4.5h8a3.4 3.4 0 0 1 0 6.8H9.5a3.4 3.4 0 0 0 0 6.8H17" fill="none" stroke={color} strokeWidth="3.4" strokeLinecap="round" /><path d="M3.2 8.2l2 .9M3.2 12.4h2.2M3.2 16.4l2-.9" {...st} strokeWidth="1.3" /></svg>;
    case "smile":
      return <svg {...s}><circle cx="12" cy="12" r="9.2" {...st} /><circle cx="9" cy="10" r=".95" fill={color} /><circle cx="15" cy="10" r=".95" fill={color} /><path d="M8 14.2c1.1 1.8 2.5 2.6 4 2.6s2.9-.8 4-2.6" {...st} /></svg>;
    case "bolt":
      return <svg {...s}><path d="M13.6 2 5 13.7h5.6L9.8 22 19 9.8h-5.7z" fill={color} /></svg>;
    case "heart":
      return <svg {...s}><path d="M12 20.5S3.5 15.3 3.5 9.2A4.7 4.7 0 0 1 12 6.6a4.7 4.7 0 0 1 8.5 2.6c0 6.1-8.5 11.3-8.5 11.3z" {...st} /></svg>;
    case "hair":
      return <svg {...s}><path d="M4.8 21c-.2-5 .3-9 1.6-11.6a5.5 5.5 0 0 1 9.8 0c1.3 2.6 1.8 6.6 1.6 11.6" {...st} /><path d="M7.8 20c0-4 .4-6.6 1.3-8.2a3 3 0 0 1 5.4 0c.9 1.6 1.3 4.2 1.3 8.2" {...st} /><path d="M20 2.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" fill={color} /></svg>;
    case "quest":
      return <svg {...s}><path d="M8.6 9a3.4 3.4 0 1 1 5.1 2.9c-1 .6-1.7 1.3-1.7 2.6" {...st} /><circle cx="12" cy="18.6" r="1" fill={color} /></svg>;
    case "moon":
      return <svg {...s}><path d="M20.5 14.6A8.8 8.8 0 1 1 9.4 3.5a7.3 7.3 0 0 0 11.1 11.1z" fill={color} /><circle cx="8" cy="11" r=".9" fill={C.white} opacity=".75" /><circle cx="10.6" cy="16.2" r=".7" fill={C.white} opacity=".75" /><circle cx="6.3" cy="14.6" r=".6" fill={C.white} opacity=".75" /></svg>;
    case "sport":
      return <svg {...s}><g transform="rotate(-35 12 12)" {...st} strokeWidth="1.8"><rect x="1.8" y="7.2" width="5.2" height="9.6" rx="1.9" /><rect x="17" y="7.2" width="5.2" height="9.6" rx="1.9" /><path d="M7 12h10M3.8 9.6v4.8M20.2 9.6v4.8" /></g></svg>;
    case "food":
      return <svg {...s}><circle cx="13.2" cy="13" r="5" {...st} /><circle cx="13.2" cy="13" r="2.5" {...st} /><path d="M4.6 4v5.2a2 2 0 0 0 4 0V4M6.6 4v16" {...st} /><path d="M20.8 4c-1.8 1.3-2.7 3.4-2.7 5.8v.2h2.7V20" {...st} /></svg>;
    case "pill":
      return <svg {...s}><g transform="rotate(-45 12 12)" {...st}><rect x="2.5" y="6.8" width="19" height="10.4" rx="5.2" /><path d="M12 6.8v10.4" /></g></svg>;
    case "note":
      return <svg {...s}><path d="M11 4H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-4" {...st} /><path d="M17.6 3.6a2.1 2.1 0 0 1 3 3L12 15.2 8 16l.8-4z" {...st} /><path d="M8 8h3M8 11.5h1.5" {...st} strokeWidth="1.4" /></svg>;
    case "dropFill":
      return <svg {...s}><path d="M12 2.8c3.3 4.2 6.6 8 6.6 11.8a6.6 6.6 0 1 1-13.2 0c0-3.8 3.3-7.6 6.6-11.8z" fill={color} /></svg>;
    case "spot":
      return <svg {...s}><circle cx="6.5" cy="14.5" r="1.9" fill={color} /><circle cx="12.6" cy="16" r="2.5" fill={color} /><circle cx="10.4" cy="7.6" r="1.4" fill={color} /></svg>;
    default: return null;
  }
}

// ─── PRIMITIVES DE SAISIE (feuilles plein écran) ─────────────────────────────
const SHEET_TOP = "calc(env(safe-area-inset-top, 0px) + 10px)";
const SHEET_HEAD = 112;
const SHEET_SIDE = { left: "max(0px, calc(50vw - 240px))", width: "min(100vw, 480px)" };

// iOS Safari : trois éléments position:fixed indépendants (fond, en-tête, zone scrollable)
function Sheet({ open, onClose, head, children, scrollKey }) {
  const scrollRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
    };
  }, [open]);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = 0; }, [scrollKey, open]);
  if (!open) return null;
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: C.scrim, zIndex: 1400 }} />
      <div style={{
        position: "fixed", top: SHEET_TOP, ...SHEET_SIDE, height: SHEET_HEAD, zIndex: 1402,
        background: "var(--sheet)", borderRadius: "34px 34px 0 0", animation: "sheetUp .3s ease both",
      }}>{head}</div>
      <div ref={scrollRef} className="no-scrollbar" style={{
        position: "fixed", top: `calc(${SHEET_TOP} + ${SHEET_HEAD}px)`, bottom: 0, ...SHEET_SIDE, zIndex: 1401,
        background: "var(--sheet)", overflowY: "scroll", WebkitOverflowScrolling: "touch",
        padding: "4px 18px calc(env(safe-area-inset-bottom, 0px) + 48px)", animation: "sheetUp .3s ease both",
      }}>{children}</div>
    </>
  );
}

const roundBtn = {
  width: 36, height: 36, borderRadius: "50%", border: "1px solid var(--border-c)", background: "var(--surface)",
  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, padding: 0,
  color: "var(--text-c)",
};

function SheetHead({ dateLabel, title, sub, onDone, onBack, icon, iconColor, onInfo }) {
  return (
    <div>
      <div style={{ textAlign: "center", color: C.primaryLight, fontSize: 14.5, fontWeight: 500, paddingTop: 20, letterSpacing: ".01em" }}>{dateLabel}</div>
      {onBack ? (
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 18px 0" }}>
          <button onClick={onBack} aria-label="Retour" style={roundBtn}><Ico name="chevL" size={18} color={C.primaryLight} sw={2.6} /></button>
          {icon && <CatIcon name={icon} size={38} color={iconColor} />}
          <div style={{ flex: 1, fontSize: 21, fontWeight: 600, lineHeight: 1.2, minWidth: 0 }}>{title}</div>
          {onInfo && <button onClick={onInfo} aria-label="Informations" style={{ ...roundBtn, width: 30, height: 30 }}><Ico name="info" size={17} color={C.dMuted} /></button>}
        </div>
      ) : (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 18px 0" }}>
          <div>
            <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.15, letterSpacing: "-.01em" }}>{title}</div>
            <div style={{ color: C.primaryLight, fontSize: 15, marginTop: 2 }}>{sub}</div>
          </div>
          <button onClick={onDone} style={{
            height: 40, padding: "0 22px", borderRadius: 20, border: "none", background: C.cta, color: C.ctaText,
            fontSize: 15, fontWeight: 600, cursor: "pointer",
          }}>Terminé</button>
        </div>
      )}
    </div>
  );
}

function Panel({ title, right, children }) {
  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border-c)", borderRadius: 28,
      padding: "16px 14px 18px", marginBottom: 16,
    }}>
      {(title || right) && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, minHeight: 24 }}>
          <div style={{ fontSize: 16.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 12 }}>{title}</div>
          {right}
        </div>
      )}
      {children}
    </div>
  );
}

function Chip({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      height: 42, padding: "0 16px", borderRadius: 99, cursor: "pointer",
      border: `1px solid ${active ? "transparent" : "var(--chip-b)"}`,
      background: active ? C.cta : "var(--chip)", color: active ? C.ctaText : "var(--text-c)",
      fontSize: 14.5, fontWeight: active ? 600 : 500, transition: "background .15s, color .15s",
      display: "inline-flex", alignItems: "center", gap: 8, whiteSpace: "nowrap",
    }}>{label}</button>
  );
}

function ChipWrap({ children }) {
  return <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>{children}</div>;
}

// Curseur à N crans (« Choisis un niveau »)
function ScaleField({ levels, value, onChange }) {
  const n = levels.length;
  const sel = typeof value === "number" && value >= 0 && value < n;
  const labelStyle = { position: "absolute", top: 40, fontSize: 13, color: "var(--muted-c)", textAlign: "center", width: 104, lineHeight: 1.25 };
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 34 }}>
        <span style={{
          display: "inline-flex", alignItems: "center", height: 34, padding: "0 15px", borderRadius: 99,
          fontSize: 14.5, fontWeight: 600,
          background: sel ? C.cta : "var(--chip)", color: sel ? C.ctaText : "var(--text-c)",
          border: `1px solid ${sel ? "transparent" : "var(--chip-b)"}`,
        }}>{sel ? levels[value] : "Choisis un niveau"}</span>
        {sel && (
          <button onClick={() => onChange(null)} aria-label="Effacer" style={{ background: "none", border: "none", padding: "6px 12px", color: "var(--muted-c)", cursor: "pointer" }}>
            <Ico name="close" size={17} />
          </button>
        )}
      </div>
      <div style={{ position: "relative", margin: "18px 30px 0", height: 36 }}>
        <div style={{ position: "absolute", left: 18, right: 18, top: 17, height: 2, background: C.wine, borderRadius: 2 }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "space-between" }}>
          {levels.map((lab, i) => {
            const on = sel && value === i;
            return (
              <button key={i} onClick={() => onChange(on ? null : i)} aria-label={lab} style={{
                width: 36, height: 36, background: "none", border: "none", padding: 0, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{
                  width: on ? 24 : 9, height: on ? 24 : 9, borderRadius: "50%", boxSizing: "border-box",
                  border: `${on ? 2 : 1.6}px solid ${on ? C.cta : C.wineEdge}`,
                  background: on ? "transparent" : C.wineDot,
                  boxShadow: on ? `0 0 14px ${C.cta}66` : "none",
                  display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s",
                }}>{on && <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.cta }} />}</span>
              </button>
            );
          })}
        </div>
        <div style={{ ...labelStyle, left: 18, transform: "translateX(-50%)" }}>{levels[0]}</div>
        <div style={{ ...labelStyle, right: 18, transform: "translateX(50%)" }}>{levels[n - 1]}</div>
      </div>
      <div style={{ height: 40 }} />
    </div>
  );
}

// Tuile de catégorie (grille 2 colonnes)
function CatTile({ icon, color, label, summary, filled, onClick, wide }) {
  return (
    <button onClick={onClick} style={{
      gridColumn: wide ? "1 / -1" : undefined, height: 127, borderRadius: 27, cursor: "pointer",
      border: `1px solid ${filled ? C.cta + "66" : "var(--border-c)"}`,
      background: filled ? C.cta + "1f" : "var(--surface)",
      display: "flex", alignItems: "center", gap: 12, padding: "0 12px 0 16px", textAlign: "left",
      color: "var(--text-c)", overflow: "hidden",
    }}>
      <span style={{ width: 38, display: "flex", justifyContent: "center", flexShrink: 0 }}>
        <CatIcon name={icon} size={wide ? 34 : 36} color={color} />
      </span>
      <span style={{ minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 15, fontWeight: 600, lineHeight: 1.25 }}>{label}</span>
        {summary && <span style={{ display: "block", fontSize: 13, color: C.primaryLight, marginTop: 4, lineHeight: 1.3 }}>{summary}</span>}
      </span>
    </button>
  );
}

function InfoSheet({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: C.scrim, zIndex: 1600, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: 480, background: "var(--sheet)", border: "1px solid var(--border-c)", borderBottom: "none",
        borderRadius: "28px 28px 0 0", padding: "22px 22px calc(env(safe-area-inset-bottom, 0px) + 28px)", animation: "sheetUp .25s ease both",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 19, fontWeight: 700 }}>{title}</div>
          <button onClick={onClose} aria-label="Fermer" style={{ ...roundBtn, width: 32, height: 32 }}><Ico name="close" size={16} /></button>
        </div>
        <div style={{ fontSize: 14.5, lineHeight: 1.6, color: "var(--muted-c)" }}>{children}</div>
      </div>
    </div>
  );
}

// État d'un formulaire de saisie : enregistre à chaque modification, id stable
function useEntryForm(open, entry, date, onSave) {
  const formRef = useRef({});
  const idRef = useRef(null);
  const [form, setForm] = useState({});
  useEffect(() => {
    if (!open) return;
    formRef.current = entry ? { ...entry } : {};
    idRef.current = entry?.id || `e_${date}_${Date.now()}`;
    setForm(formRef.current);
  }, [open, date]);
  const patch = (p) => {
    formRef.current = { ...formRef.current, ...p };
    setForm(formRef.current);
    onSave({ ...formRef.current, date, id: idRef.current });
  };
  return { form, patch, formRef };
}

// ─── FEUILLE SYMPTÔMES ───────────────────────────────────────────────────────
function SymptomesSheet({ open, onClose, onSave, entry, date, dateLabel, settings, onUpdateSettings }) {
  const { form, patch, formRef } = useEntryForm(open, entry, date, onSave);
  const [catId, setCatId] = useState(null);
  const [note, setNote] = useState("");
  const [adding, setAdding] = useState(null);
  const [draft, setDraft] = useState("");
  useEffect(() => { if (open) { setCatId(null); setNote(entry?.notesLibres || ""); setAdding(null); setDraft(""); } }, [open, date]);

  const sym = form.sym || {};
  const cat = SYM_CATS.find(c => c.id === catId);

  const setSym = (key, value) => {
    const next = { ...(formRef.current.sym || {}) };
    if (value == null || (Array.isArray(value) && !value.length)) delete next[key]; else next[key] = value;
    const p = { sym: next };
    if (key === "inhabituel") p.perturbation = (value || []).join(", ");
    patch(p);
  };
  const toggle = (sec, item) => {
    if (typeof item !== "string" && item.root) {
      patch({ [item.root]: formRef.current[item.root] === item.value ? null : item.value });
      return;
    }
    const cur = formRef.current.sym?.[sec.key] || [];
    const has = cur.includes(item);
    setSym(sec.key, sec.single ? (has ? [] : [item]) : (has ? cur.filter(x => x !== item) : [...cur, item]));
  };
  const isOn = (sec, item) => (typeof item !== "string" && item.root)
    ? form[item.root] === item.value
    : (sym[sec.key] || []).includes(item);

  const commitNote = () => {
    if ((formRef.current.notesLibres || "") !== note) patch({ notesLibres: note });
  };
  const back = () => { if (cat?.special === "notes") commitNote(); setCatId(null); setAdding(null); };
  const done = () => { if (cat?.special === "notes") commitNote(); onClose(); };

  const addCustom = (sec) => {
    const v = draft.trim();
    if (!v) { setAdding(null); return; }
    const list = settings[sec.custom] || [];
    if (!list.includes(v) && !sec.chips.includes(v)) onUpdateSettings({ [sec.custom]: [...list, v] });
    const cur = formRef.current.sym?.[sec.key] || [];
    if (!cur.includes(v)) setSym(sec.key, [...cur, v]);
    setDraft(""); setAdding(null);
  };

  const head = cat ? (
    <SheetHead dateLabel={dateLabel} title={cat.fullTitle || cat.label} icon={cat.special === "notes" ? null : cat.icon}
      iconColor={cat.color} onBack={back} />
  ) : (
    <SheetHead dateLabel={dateLabel} title="Symptômes" sub={`${symCatsFilled(form)}/${SYM_CATS.length} renseignés`} onDone={done} />
  );

  return (
    <Sheet open={open} onClose={done} head={head} scrollKey={catId}>
      {!cat && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {SYM_CATS.map(c => (
            <CatTile key={c.id} icon={c.icon} color={c.color} label={c.label}
              filled={symCatCount(c, form) > 0} onClick={() => setCatId(c.id)} />
          ))}
        </div>
      )}

      {cat && cat.special === "notes" && (
        <div>
          <textarea value={note} maxLength={1000} placeholder="Écrire une note..."
            onChange={e => setNote(e.target.value)} onBlur={commitNote}
            style={{ height: 160, minHeight: 160, resize: "none", borderRadius: 28, padding: "20px 18px", fontSize: 16, lineHeight: 1.5, background: "var(--surface)" }} />
          <div style={{ textAlign: "right", color: "var(--muted-c)", fontSize: 15, padding: "10px 4px 0" }}>{note.length}/1000</div>
        </div>
      )}

      {cat && !cat.special && cat.sections.map(sec => {
        const items = sec.custom ? [...sec.chips, ...(settings[sec.custom] || [])] : sec.chips;
        return (
          <Panel key={sec.key} title={sec.title}>
            {sec.type === "scale" ? (
              <ScaleField levels={sec.levels} value={typeof sym[sec.key] === "number" ? sym[sec.key] : null} onChange={v => setSym(sec.key, v)} />
            ) : (
              <ChipWrap>
                {items.map(item => (
                  <Chip key={chipValue(item)} label={chipLabel(item)} active={isOn(sec, item)} onClick={() => toggle(sec, item)} />
                ))}
                {sec.custom && adding !== sec.key && (
                  <Chip label={`+  ${sec.addLabel}`} onClick={() => { setAdding(sec.key); setDraft(""); }} />
                )}
                {sec.custom && adding === sec.key && (
                  <div style={{ display: "flex", gap: 8, width: "100%" }}>
                    <input autoFocus value={draft} onChange={e => setDraft(e.target.value)} maxLength={40}
                      onKeyDown={e => { if (e.key === "Enter") addCustom(sec); }} placeholder="Nom"
                      style={{ borderRadius: 99, height: 42, padding: "0 16px", background: "var(--chip)", borderColor: "var(--chip-b)" }} />
                    <button onClick={() => addCustom(sec)} style={{ height: 42, padding: "0 18px", borderRadius: 99, border: "none", background: C.cta, color: C.ctaText, fontWeight: 600, fontSize: 14.5, cursor: "pointer" }}>Ajouter</button>
                  </div>
                )}
              </ChipWrap>
            )}
          </Panel>
        );
      })}
    </Sheet>
  );
}

// ─── FEUILLE SYMPTOTHERMIE ───────────────────────────────────────────────────
function SymptothermieSheet({ open, onClose, onSave, entry, date, dateLabel, onOpenCourbe }) {
  const { form, patch, formRef } = useEntryForm(open, entry, date, onSave);
  const [tempStr, setTempStr] = useState("");
  const [info, setInfo] = useState(false);
  useEffect(() => { if (open) { setTempStr(fmtTemp(entry?.temperature)); setInfo(false); } }, [open, date]);

  const commitTemp = () => {
    const raw = tempStr.trim();
    if (!raw) { if (formRef.current.temperature) patch({ temperature: null }); return; }
    const v = parseFloat(raw.replace(",", "."));
    if (isNaN(v) || v < 34 || v > 42) { setTempStr(fmtTemp(formRef.current.temperature)); return; }
    const r = Math.round(v * 100) / 100;
    setTempStr(fmtTemp(r));
    patch({ temperature: r, heure: formRef.current.heure || nowHHMM() });
  };
  const done = () => { commitTemp(); onClose(); };

  const qualite = glaireQualiteOf(form);
  const setQualite = (v) => {
    const same = qualite === v;
    const m = !same && v ? GLAIRE_QUALITE_MAP[v] : [null, null];
    patch({ glaireQualite: same ? null : v, glaireSensation: m[0], glaireApparence: m[1] });
  };
  const quantIdx = QUANTITE_GLAIRE_OPTS.findIndex(o => o.value === form.quantiteGlaire);
  const renseignes = (form.temperature ? 1 : 0) + ((qualite || form.quantiteGlaire) ? 1 : 0) + (form.testOvulation ? 1 : 0);
  const heure = form.heure || nowHHMM();
  const subLabel = dateLabel.replace(" · ", ", ");

  const head = <SheetHead dateLabel={subLabel} title="Symptothermie" sub={`${renseignes}/3 renseignés`} onDone={done} />;

  return (
    <Sheet open={open} onClose={done} head={head}>
      <button onClick={() => { commitTemp(); onOpenCourbe(); }} style={{
        width: "100%", height: 46, borderRadius: 22, border: "1px solid var(--border-c)", background: "var(--surface)",
        display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 18px", marginBottom: 16, cursor: "pointer",
        color: C.primaryLight, fontSize: 16, fontWeight: 500,
      }}>
        Voir ma courbe <Ico name="chevR" size={18} color={C.primaryLight} sw={2.4} />
      </button>

      <Panel title="Mesure">
        <div style={{ display: "flex", alignItems: "center", gap: 14, minHeight: 48 }}>
          <Ico name="clock" size={23} color={C.primaryDeep} />
          <div style={{ flex: 1, fontSize: 17, fontWeight: 600 }}>Heure</div>
          <div style={{ position: "relative", fontSize: 17, fontWeight: 600 }}>
            {fmtHeure(heure)}
            <input type="time" value={heure} onChange={e => e.target.value && patch({ heure: e.target.value })}
              aria-label="Heure de la prise" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, padding: 0, border: "none" }} />
          </div>
        </div>
        <div style={{ height: 1, background: "var(--border-c)", margin: "8px 0" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 14, minHeight: 56 }}>
          <Ico name="thermo" size={23} color={C.primaryDeep} />
          <div style={{ flex: 1, fontSize: 17, fontWeight: 600 }}>Température</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, height: 40, padding: "0 12px", borderRadius: 14, border: "1px solid var(--chip-b)", background: "var(--chip)" }}>
            <input value={tempStr} inputMode="decimal" placeholder="__,__" aria-label="Température"
              onChange={e => setTempStr(e.target.value.replace(/[^0-9.,]/g, "").slice(0, 5))}
              onBlur={commitTemp} onKeyDown={e => { if (e.key === "Enter") e.target.blur(); }}
              style={{ width: 58, border: "none", background: "transparent", padding: 0, textAlign: "right", fontSize: 17, fontWeight: 600, borderRadius: 0, boxShadow: "none" }} />
            <span style={{ fontSize: 17, fontWeight: 600 }}>°C</span>
          </div>
        </div>
      </Panel>

      <Panel title={<><CatIcon name="dropFill" size={26} color={C.icGlaire} />Glaire cervicale</>}
        right={<button onClick={() => setInfo(true)} aria-label="Informations" style={{ ...roundBtn, width: 30, height: 30 }}><Ico name="info" size={17} color={C.dMuted} /></button>}>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Qualité</div>
        <ChipWrap>
          {GLAIRE_QUALITE_OPTS.map(o => <Chip key={o.value} label={o.label} active={qualite === o.value} onClick={() => setQualite(o.value)} />)}
        </ChipWrap>
        <div style={{ height: 1, background: "var(--border-c)", margin: "18px 0 16px" }} />
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Quantité</div>
        <ScaleField levels={QUANTITE_GLAIRE_OPTS.map(o => o.label)} value={quantIdx >= 0 ? quantIdx : null}
          onChange={i => patch({ quantiteGlaire: i == null ? null : QUANTITE_GLAIRE_OPTS[i].value })} />
      </Panel>

      <Panel title="Test d'ovulation">
        <ChipWrap>
          {TEST_OVULATION_OPTS.map(o => <Chip key={o.value} label={o.label} active={form.testOvulation === o.value}
            onClick={() => patch({ testOvulation: form.testOvulation === o.value ? null : o.value })} />)}
        </ChipWrap>
      </Panel>

      <Panel title="Col de l'utérus">
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Fermeté</div>
        <ChipWrap>
          {FERMETE_OPTS.map(o => <Chip key={o.value} label={o.label} active={form.colFermete === o.value}
            onClick={() => patch({ colFermete: form.colFermete === o.value ? null : o.value })} />)}
        </ChipWrap>
        <div style={{ fontSize: 16, fontWeight: 600, margin: "18px 0 12px" }}>Ouverture</div>
        <ChipWrap>
          {OUVERTURE_OPTS.map(o => <Chip key={o.value} label={o.label} active={form.colOuverture === o.value}
            onClick={() => patch({ colOuverture: form.colOuverture === o.value ? null : o.value })} />)}
        </ChipWrap>
      </Panel>

      <InfoSheet open={info} onClose={() => setInfo(false)} title="Glaire cervicale">
        La glaire évolue au fil du cycle : sèche ou absente après les règles, puis collante, crémeuse, humide, et enfin
        « blanc d'œuf » (filante, très fertile) autour de l'ovulation. Note la meilleure qualité observée dans la journée.
      </InfoSheet>
    </Sheet>
  );
}

// ─── FEUILLE PERTES ──────────────────────────────────────────────────────────
function PertesSheet({ open, onClose, onSave, entry, date, dateLabel }) {
  const { form, patch, formRef } = useEntryForm(open, entry, date, onSave);
  const [screen, setScreen] = useState(null); // "regles" | "glaire" | "spotting"
  const [info, setInfo] = useState(null);
  useEffect(() => { if (open) { setScreen(null); setInfo(null); } }, [open, date]);

  const patchPertes = (p) => {
    const m = { ...formRef.current, ...p };
    // Garde le champ « saignement » (utilisé par l'algorithme et les tableaux) cohérent
    const derived = m.flux ? FLUX_TO_SAIGNEMENT[m.flux] : (m.spotting ? "spotting" : null);
    const wasDerived = !!(formRef.current.flux || formRef.current.spotting);
    if (derived) p.saignement = derived; else if (wasDerived) p.saignement = null;
    patch(p);
  };
  const pickOne = (key, value) => patchPertes({ [key]: formRef.current[key] === value ? null : value });

  const qualite = glaireQualiteOf(form);
  const setQualite = (v) => {
    const same = qualite === v;
    const m = !same && v ? GLAIRE_QUALITE_MAP[v] : [null, null];
    patch({ glaireQualite: same ? null : v, glaireSensation: m[0], glaireApparence: m[1] });
  };
  const fluxIdx = FLUX_OPTS.findIndex(o => o.value === form.flux);
  const reglesFilled = !!(form.flux || form.couleurRegles || form.caillots);
  const reglesSummary = [FLUX_OPTS.find(o => o.value === form.flux)?.label, COULEUR_REGLES_OPTS.find(o => o.value === form.couleurRegles)?.label,
    form.caillots === "oui" ? "Caillots" : null].filter(Boolean).join(", ");
  const renseignes = (reglesFilled ? 1 : 0) + (qualite ? 1 : 0) + (form.spotting ? 1 : 0);

  const heads = {
    regles:   <SheetHead dateLabel={dateLabel} title="Règles" icon="dropFill" iconColor={C.icRegles} onBack={() => setScreen(null)} />,
    glaire:   <SheetHead dateLabel={dateLabel} title="Glaire cervicale" icon="dropFill" iconColor={C.icGlaire} onBack={() => setScreen(null)} onInfo={() => setInfo("glaire")} />,
    spotting: <SheetHead dateLabel={dateLabel} title="Spotting" icon="spot" iconColor={C.icSpot} onBack={() => setScreen(null)} onInfo={() => setInfo("spotting")} />,
  };
  const head = screen ? heads[screen] : <SheetHead dateLabel={dateLabel} title="Pertes" sub={`${renseignes}/3 renseignés`} onDone={onClose} />;

  return (
    <Sheet open={open} onClose={onClose} head={head} scrollKey={screen}>
      {!screen && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <CatTile icon="dropFill" color={C.icRegles} label="Règles" summary={reglesSummary} filled={reglesFilled} onClick={() => setScreen("regles")} />
          <CatTile icon="dropFill" color={C.icGlaire} label="Glaire cervicale" filled={false} summary={qualite ? GLAIRE_QUALITE_OPTS.find(o => o.value === qualite)?.label : null} onClick={() => setScreen("glaire")} />
          <CatTile icon="spot" color={C.icSpot} label="Spotting" wide summary={form.spotting ? SPOTTING_COULEUR_OPTS.find(o => o.value === form.spotting)?.label : null} filled={false} onClick={() => setScreen("spotting")} />
        </div>
      )}

      {screen === "regles" && (
        <>
          <Panel title="Flux">
            <ScaleField levels={FLUX_OPTS.map(o => o.label)} value={fluxIdx >= 0 ? fluxIdx : null}
              onChange={i => patchPertes({ flux: i == null ? null : FLUX_OPTS[i].value })} />
          </Panel>
          <Panel title="Couleur">
            <ChipWrap>{COULEUR_REGLES_OPTS.map(o => <Chip key={o.value} label={o.label} active={form.couleurRegles === o.value} onClick={() => pickOne("couleurRegles", o.value)} />)}</ChipWrap>
          </Panel>
          <Panel title="Caillots">
            <ChipWrap>{CAILLOTS_OPTS.map(o => <Chip key={o.value} label={o.label} active={form.caillots === o.value} onClick={() => pickOne("caillots", o.value)} />)}</ChipWrap>
          </Panel>
        </>
      )}

      {screen === "glaire" && (
        <Panel>
          <ChipWrap>{GLAIRE_QUALITE_OPTS.map(o => <Chip key={o.value} label={o.label} active={qualite === o.value} onClick={() => setQualite(o.value)} />)}</ChipWrap>
        </Panel>
      )}

      {screen === "spotting" && (
        <Panel>
          <ChipWrap>{SPOTTING_COULEUR_OPTS.map(o => <Chip key={o.value} label={o.label} active={form.spotting === o.value} onClick={() => pickOne("spotting", o.value)} />)}</ChipWrap>
        </Panel>
      )}

      <InfoSheet open={info === "glaire"} onClose={() => setInfo(null)} title="Glaire cervicale">
        Sèche ou absente après les règles, la glaire devient collante, crémeuse, puis humide et enfin « blanc d'œuf »
        (filante, très fertile) autour de l'ovulation. Note la meilleure qualité observée dans la journée.
      </InfoSheet>
      <InfoSheet open={info === "spotting"} onClose={() => setInfo(null)} title="Spotting">
        Petits saignements en dehors des règles, parfois autour de l'ovulation ou en fin de cycle. Indique simplement leur couleur.
      </InfoSheet>
    </Sheet>
  );
}

// ─── ROUE DE PHASE (écran d'accueil) ─────────────────────────────────────────
function describeArc(cx, cy, r, startAngle, endAngle) {
  const toXY = (ang) => {
    const rad = (ang - 90) * Math.PI / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };
  const start = toXY(startAngle);
  const end = toXY(endAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

const PHASE_DIM = { menstruelle: C.phMensDim, folliculaire: C.phFolDim, ovulatoire: C.phOvuDim, luteale: C.phLutDim };
const RING_GAP = 11; // degrés laissés entre deux phases

function PhaseWheel({ avgLen, ovMean, dureeRegles, curseurJour, onChange, size = 300 }) {
  const svgRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const cx = size / 2, cy = size / 2, r = size / 2 - 14;
  const segments = phaseSegments(avgLen, ovMean, dureeRegles);

  const dayToAngle = (day) => (Math.min(day, avgLen) / avgLen) * 360;
  const angleToDay = (angle) => Math.min(avgLen, Math.max(1, Math.round((angle / 360) * avgLen)));

  const handlePointer = useCallback((clientX, clientY) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scale = rect.width / size;
    const x = (clientX - rect.left) / scale - cx;
    const y = (clientY - rect.top) / scale - cy;
    let angle = Math.atan2(y, x) * 180 / Math.PI + 90;
    if (angle < 0) angle += 360;
    onChange(angleToDay(angle));
  }, [avgLen, size]);

  useEffect(() => {
    if (!dragging) return;
    const move = (e) => {
      if (e.cancelable) e.preventDefault();
      const p = e.touches ? e.touches[0] : e;
      handlePointer(p.clientX, p.clientY);
    };
    const up = () => setDragging(false);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("touchend", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
    };
  }, [dragging, handlePointer]);

  const active = getPhaseForDay(curseurJour, avgLen, ovMean, dureeRegles).phase;
  const handleAngle = dayToAngle(curseurJour);
  const rad = (handleAngle - 90) * Math.PI / 180;
  const hx = cx + r * Math.cos(rad);
  const hy = cy + r * Math.sin(rad);
  const handleColor = PHASE_COLORS[active];

  // Repère « fin des règles » quand on n'est plus en phase menstruelle
  const mens = segments.find(s => s.phase === "menstruelle");
  const mRad = mens ? (dayToAngle(mens.end) - 90) * Math.PI / 180 : 0;
  const mx = cx + r * Math.cos(mRad), my = cy + r * Math.sin(mRad);

  return (
    <svg ref={svgRef} viewBox={`0 0 ${size} ${size}`} width="100%" height="100%" style={{ display: "block", touchAction: "none", overflow: "visible" }}>
      {segments.map((s, i) => {
        const a0 = ((s.start - 1) / avgLen) * 360 + RING_GAP / 2;
        const a1 = (s.end / avgLen) * 360 - RING_GAP / 2;
        if (a1 <= a0) return null;
        const on = s.phase === active;
        return (
          <path key={i} d={describeArc(cx, cy, r, a0, a1)} fill="none" strokeLinecap="round"
            stroke={on ? PHASE_COLORS[s.phase] : PHASE_DIM[s.phase]} strokeWidth={on ? 4.6 : 2.2}
            style={{ transition: "stroke .4s ease, stroke-width .4s ease" }} />
        );
      })}

      {mens && active !== "menstruelle" && (
        <g style={{ pointerEvents: "none" }}>
          <circle cx={mx} cy={my} r={7} fill="none" stroke={C.phMensDim} strokeWidth={1.6} />
          <circle cx={mx} cy={my} r={2.4} fill={C.phMens} />
        </g>
      )}

      <g style={{ cursor: "grab" }} onMouseDown={() => setDragging(true)} onTouchStart={() => setDragging(true)}>
        <circle cx={hx} cy={hy} r={24} fill="transparent" />
        <circle cx={hx} cy={hy} r={13.5} style={{ fill: "var(--bg)" }} />
        <circle cx={hx} cy={hy} r={11.5} fill={handleColor} />
        <text x={hx} y={hy + 3.6} textAnchor="middle" fontSize="10.5" fontWeight="700" fill={C.white}
          style={{ pointerEvents: "none", fontFamily: "'DM Sans', sans-serif" }}>J{curseurJour}</text>
      </g>
    </svg>
  );
}

// Orbe central : disque pastel aux bords flous, taches et traînées plus saturées
function Orb({ phase, label }) {
  const o = ORB[phase];
  return (
    <>
      <div style={{
        position: "absolute", inset: "11%", borderRadius: "50%", overflow: "hidden",
        background: `radial-gradient(circle at 62% 16%, ${o.light} 0%, ${o.base} 62%)`,
        WebkitMaskImage: "radial-gradient(circle closest-side, #000 93%, transparent 100%)",
        maskImage: "radial-gradient(circle closest-side, #000 93%, transparent 100%)",
        transition: "background .6s ease",
      }}>
        <div style={{ position: "absolute", left: "14%", top: "16%", width: "42%", height: "34%", borderRadius: "50%", background: o.dark, opacity: .8, filter: "blur(24px)", animation: "floatBlobA 13s ease-in-out infinite", transition: "background .6s ease" }} />
        <div style={{ position: "absolute", left: "58%", top: "46%", width: "34%", height: "30%", borderRadius: "50%", background: o.dark, opacity: .55, filter: "blur(22px)", animation: "floatBlobB 15s ease-in-out infinite", transition: "background .6s ease" }} />
        <div style={{ position: "absolute", left: "26%", top: "72%", width: "48%", height: "26%", borderRadius: "50%", background: o.dark, opacity: .85, filter: "blur(22px)", animation: "floatBlobA 17s ease-in-out infinite", transition: "background .6s ease" }} />
        <div style={{ position: "absolute", left: "6%", top: "35%", width: "88%", height: "9%", borderRadius: "50%", background: C.white, opacity: .32, filter: "blur(10px)", transform: "rotate(-7deg)" }} />
        <div style={{ position: "absolute", left: "10%", top: "49%", width: "80%", height: "7%", borderRadius: "50%", background: C.white, opacity: .22, filter: "blur(9px)", transform: "rotate(-5deg)" }} />
      </div>
      <div style={{
        position: "absolute", inset: "11%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        pointerEvents: "none", animation: "breathe 7s ease-in-out infinite",
      }}>
        <div style={{ fontSize: 11, letterSpacing: ".3em", fontWeight: 500, color: C.white, opacity: .82, paddingLeft: ".3em" }}>PHASE</div>
        <div style={{ fontSize: "clamp(22px, 6.6vw, 27px)", fontWeight: 700, color: C.white, letterSpacing: "-.01em", marginTop: 5 }}>{label}</div>
        <div style={{ width: 28, height: 2.5, background: C.white, opacity: .85, marginTop: 14, borderRadius: 99 }} />
      </div>
    </>
  );
}

// ─── ÉCRAN D'ACCUEIL ─────────────────────────────────────────────────────────
const headBtn = {
  width: 42, height: 42, borderRadius: "50%", border: "1px solid var(--border-c)", background: "var(--surface)",
  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, padding: 0,
  color: "var(--muted-c)",
};

function Accueil({ entries, cycles, settings, onSave, onUpdateSettings, onNavigate, focusDate, onFocusConsumed }) {
  const { currentCycleNum, cycleStart, avgLen, ovMean, dureeRegles, todayCycleDay } = useCycleStats(entries, cycles);
  const today = todayStr();

  const [curseurJour, setCurseurJour] = useState(todayCycleDay);
  useEffect(() => { setCurseurJour(todayCycleDay); }, [todayCycleDay]);
  useEffect(() => {
    if (!focusDate) return;
    const d = diffDays(focusDate, cycleStart) + 1;
    if (d >= 1) setCurseurJour(d);
    onFocusConsumed && onFocusConsumed();
  }, [focusDate]);

  const curseurDate = addDays(cycleStart, curseurJour - 1);
  const phaseInfo = getPhaseForDay(curseurJour, avgLen, ovMean, dureeRegles);
  const isToday = curseurDate === today;
  const isFuture = curseurDate > today;
  const joursAvantRegles = avgLen - curseurJour + 1;
  const entryForCurseur = entries.find(e => e.date === curseurDate);
  const streak = useMemo(() => computeStreak(entries), [entries]);

  const [modalOuvert, setModalOuvert] = useState(null);

  const handleSave = (data) => onSave({ ...(entryForCurseur || {}), ...data, date: curseurDate, cycleNum: currentCycleNum });

  const dm = fmtDM(curseurDate);
  const weekday = capFirst(new Date(curseurDate + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long" }));
  const dateLabel = isToday ? `Aujourd'hui · ${dm}` : `${weekday} · ${dm}`;
  const dateLine = isToday ? `Aujourd'hui, ${dm}` : `${weekday} ${dm}`;

  const cards = [
    { id: "symptomes", label: "Symptômes", icon: "edit", n: symCount(entryForCurseur), fem: false },
    { id: "symptothermie", label: "Symptothermie", icon: "thermo", n: sthCount(entryForCurseur), fem: true },
    { id: "pertes", label: "Pertes", icon: "drop", n: pertesCount(entryForCurseur), fem: true },
  ];
  const status = (c) => isFuture ? "Le jour J" : c.n > 0 ? `${c.n} enregistré${c.fem ? "e" : ""}${c.n > 1 ? "s" : ""}` : "Non renseigné";

  const pillText = phaseInfo.phase === "menstruelle" ? `J${curseurJour} des règles`
    : joursAvantRegles > 0 ? `J-${joursAvantRegles} avant règles` : "Règles imminentes";

  const initial = (settings.prenom || "M").trim().charAt(0).toUpperCase();

  return (
    <div className="anim" style={{ display: "flex", flexDirection: "column", alignItems: "center", maxWidth: 440, margin: "0 auto" }}>
      <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0, fontSize: 27, fontWeight: 700, letterSpacing: "-.01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          Hello{settings.prenom ? ` ${settings.prenom}` : ""}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 3, color: C.primaryDeep, fontWeight: 700, fontSize: 18, marginRight: 4 }}>
          <Ico name="dropFill" size={20} color={C.primaryDeep} />{streak}
        </div>
        <button onClick={() => onNavigate("calendrier")} aria-label="Calendrier" style={headBtn}><Ico name="calendarDots" size={21} color="var(--muted-c)" /></button>
        <button onClick={() => onNavigate("params")} aria-label="Profil" style={{ ...headBtn, background: C.avatarBg, border: "none", color: C.primaryLight, fontSize: 19, fontWeight: 600 }}>{initial}</button>
      </div>

      <div style={{
        marginTop: 26, padding: "9px 20px", borderRadius: 99, background: "var(--surface)", border: "1px solid var(--border-c)",
        fontSize: 13.5, fontWeight: 600, color: "var(--muted-c)", letterSpacing: ".07em", textTransform: "uppercase",
      }}>{pillText}</div>

      <div style={{ position: "relative", width: "100%", maxWidth: 336, aspectRatio: "1", marginTop: 26, padding: 0 }}>
        <PhaseWheel avgLen={avgLen} ovMean={ovMean} dureeRegles={dureeRegles} curseurJour={curseurJour} onChange={setCurseurJour} />
        <Orb phase={phaseInfo.phase} label={phaseInfo.label} />
      </div>

      <div style={{ marginTop: 26, fontSize: 16.5, color: "var(--muted-c)" }}>{dateLine}</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, width: "100%", marginTop: 28 }}>
        {cards.map(c => (
          <button key={c.id} onClick={() => !isFuture && setModalOuvert(c.id)} disabled={isFuture} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 7, padding: "18px 6px 17px",
            borderRadius: 22, border: "1px solid var(--border-c)", background: "var(--surface)", color: "var(--text-c)",
            cursor: isFuture ? "default" : "pointer", opacity: isFuture ? 0.5 : 1, minWidth: 0,
          }}>
            <span style={{ width: 32, height: 32, borderRadius: "50%", background: phaseInfo.color + "33", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 3 }}>
              <Ico name={c.icon} size={18} color={phaseInfo.color} />
            </span>
            <span style={{ fontSize: 14.5, fontWeight: 600 }}>{c.label}</span>
            <span style={{ fontSize: 12.5, color: c.n > 0 && !isFuture ? C.primaryLight : "var(--muted-c)" }}>{status(c)}</span>
          </button>
        ))}
      </div>

      <SymptomesSheet open={modalOuvert === "symptomes"} onClose={() => setModalOuvert(null)} onSave={handleSave}
        entry={entryForCurseur} date={curseurDate} dateLabel={dateLabel} settings={settings} onUpdateSettings={onUpdateSettings} />
      <SymptothermieSheet open={modalOuvert === "symptothermie"} onClose={() => setModalOuvert(null)} onSave={handleSave}
        entry={entryForCurseur} date={curseurDate} dateLabel={dateLabel} onOpenCourbe={() => { setModalOuvert(null); onNavigate("courbe"); }} />
      <PertesSheet open={modalOuvert === "pertes"} onClose={() => setModalOuvert(null)} onSave={handleSave}
        entry={entryForCurseur} date={curseurDate} dateLabel={dateLabel} />
    </div>
  );
}

// ─── COURBE SYMPTOTHERMIE ────────────────────────────────────────────────────
function Courbe({ entries, cycles, onBack, onNavigate }) {
  const { currentEntries, cycleStart, avgLen, ovMean, dureeRegles, todayCycleDay } = useCycleStats(entries, cycles);
  const byDay = useMemo(() => {
    const m = {};
    currentEntries.forEach(e => { m[diffDays(e.date, cycleStart) + 1] = e; });
    return m;
  }, [currentEntries, cycleStart]);
  const N = Math.max(3, todayCycleDay, ...Object.keys(byDay).map(Number));
  const [sel, setSel] = useState(todayCycleDay);
  const [expanded, setExpanded] = useState(true);
  const wrapRef = useRef(null);
  const scrollRef = useRef(null);
  const [W, setW] = useState(340);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const upd = () => setW(el.clientWidth || 340);
    upd();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(upd);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const colW = expanded ? Math.max(52, Math.floor(W / Math.min(N, 7))) : Math.max(14, Math.floor(W / N));
  const svgW = Math.max(W, colW * N);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollLeft = Math.max(0, (sel - 0.5) * colW - W / 2);
  }, [expanded, colW, W]);

  const H = 300, LAB = 40, padTop = 53, padBottom = 23;
  const temps = Object.entries(byDay).filter(([, e]) => e.temperature > 35).map(([d, e]) => ({ d: +d, t: +e.temperature }));
  const minT = temps.length ? Math.min(...temps.map(x => x.t)) : 36.2;
  const maxT = temps.length ? Math.max(...temps.map(x => x.t)) : 36.8;
  let lo = 35.6; while (minT < lo + 0.05) lo = Math.round((lo - 0.6) * 10) / 10;
  let hi = lo + 1.8; while (maxT > hi - 0.05) hi = Math.round((hi + 0.6) * 10) / 10;
  const ticks = []; for (let v = lo; v <= hi + 0.01; v = Math.round((v + 0.6) * 10) / 10) ticks.push(v);
  const yOf = (t) => padTop + ((hi - t) / (hi - lo)) * (H - padTop - padBottom);
  const xOf = (d) => (d - 0.5) * colW;

  const phaseOf = (d) => getPhaseForDay(d, avgLen, ovMean, dureeRegles);
  const runs = [];
  for (let d = 1; d <= N; d++) {
    const p = phaseOf(d).phase;
    if (runs.length && runs[runs.length - 1].phase === p) runs[runs.length - 1].end = d; else runs.push({ phase: p, start: d, end: d });
  }
  const segs = [];
  temps.forEach((pt, i) => {
    if (i > 0 && temps[i - 1].d === pt.d - 1) segs[segs.length - 1].push(pt); else segs.push([pt]);
  });

  const ana = useMemo(() => analyserCycle(currentEntries), [currentEntries]);
  const selEntry = byDay[sel];
  const selDate = addDays(cycleStart, sel - 1);
  const selPhase = phaseOf(sel);
  const qual = glaireQualiteOf(selEntry);
  const qualLabel = qual ? GLAIRE_QUALITE_OPTS.find(o => o.value === qual)?.label : null;
  const testLabel = TEST_OVULATION_OPTS.find(o => o.value === selEntry?.testOvulation)?.label;
  const rows = [
    ["Température", selEntry?.temperature ? `${fmtTemp(selEntry.temperature)} °C` : "Non renseignée"],
    ["Glaire cervicale", qualLabel || "Non renseignée"],
    ["Test d'ovulation", testLabel || "Non renseigné"],
  ];
  const phaseName = (p) => p === "menstruelle" ? "Règles" : capFirst(PHASE_LABELS[p]);
  const lastLabel = todayCycleDay === N && cycleStart !== todayStr() ? "aujourd'hui" : fmtDMshort(addDays(cycleStart, N - 1));

  return (
    <div className="anim" style={{ maxWidth: 480, margin: "0 auto" }}>
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", height: 44, marginBottom: 18 }}>
        <button onClick={onBack} aria-label="Retour" style={{ ...roundBtn, position: "absolute", left: 0, width: 40, height: 40 }}><Ico name="chevL" size={20} color="var(--text-c)" sw={2.4} /></button>
        <div style={{ fontSize: 24, fontWeight: 700 }}>Symptothermie</div>
      </div>

      <div style={{ background: "var(--surface)", border: "1px solid var(--border-c)", borderRadius: 28, overflow: "hidden" }}>
        <div style={{ padding: "18px 18px 14px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
          <div>
            <div style={{ fontSize: 21, fontWeight: 700 }}>Cycle en cours</div>
            <div style={{ fontSize: 13.5, color: "var(--muted-c)", marginTop: 3 }}>
              {fmtDMshort(cycleStart)} – {lastLabel} · Jour {todayCycleDay}
            </div>
          </div>
          <button onClick={() => setExpanded(v => !v)} style={{ background: "none", border: "none", color: "var(--muted-c)", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, padding: "4px 0", whiteSpace: "nowrap" }}>
            {expanded ? "Réduire la courbe" : "Agrandir la courbe"}
            <span style={{ display: "inline-flex", transform: expanded ? "none" : "rotate(180deg)" }}><Ico name="chevD" size={16} sw={2.4} /></span>
          </button>
        </div>
        <div style={{ height: 1, background: "var(--border-c)", margin: "0 18px" }} />

        <div ref={wrapRef} style={{ position: "relative", marginTop: 14 }}>
          <div ref={scrollRef} className="no-scrollbar" style={{ overflowX: svgW > W ? "auto" : "hidden", WebkitOverflowScrolling: "touch" }}>
            <svg width={svgW} height={H + LAB} style={{ display: "block" }}>
              {Array.from({ length: N }, (_, i) => i + 1).map(d => (
                <rect key={"bg" + d} x={(d - 1) * colW} y={0} width={colW + 0.5} height={H} fill={PHASE_COLORS[phaseOf(d).phase] + "40"} />
              ))}
              {runs.map((r, i) => {
                const x0 = (r.start - 1) * colW, w = (r.end - r.start + 1) * colW;
                return (
                  <g key={"run" + i}>
                    <rect x={x0} y={0} width={w} height={3.5} fill={PHASE_COLORS[r.phase]} />
                    {w >= 56 && <text x={x0 + w / 2} y={27} textAnchor="middle" fontSize="13" fontWeight="700" fill={PHASE_COLORS[r.phase]} style={{ fontFamily: "'DM Sans', sans-serif" }}>{phaseName(r.phase)}</text>}
                  </g>
                );
              })}
              {ticks.map(t => <line key={"g" + t} x1={0} x2={svgW} y1={yOf(t)} y2={yOf(t)} stroke={C.white} strokeOpacity=".05" />)}
              {ana.traitBas && [ana.traitBas, ana.traitHaut].map((v, i) => v >= lo && v <= hi && (
                <line key={"tr" + i} x1={0} x2={svgW} y1={yOf(v)} y2={yOf(v)} stroke={C.primaryLight} strokeOpacity=".55" strokeDasharray="5 5" strokeWidth="1.2" />
              ))}
              <line x1={xOf(sel)} x2={xOf(sel)} y1={0} y2={H} stroke={C.primary} strokeWidth="1.6" strokeDasharray="4 4" />
              {segs.map((s, i) => (
                <polyline key={"l" + i} points={s.map(p => `${xOf(p.d)},${yOf(p.t)}`).join(" ")} fill="none" stroke={C.primaryLight} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
              ))}
              {temps.map(p => <circle key={"p" + p.d} cx={xOf(p.d)} cy={yOf(p.t)} r={4.6} fill={C.primaryLight} style={{ stroke: "var(--surface)" }} strokeWidth="2" />)}
              {Array.from({ length: N }, (_, i) => i + 1).map(d => (
                <g key={"x" + d} onClick={() => setSel(d)} style={{ cursor: "pointer" }}>
                  <rect x={(d - 1) * colW} y={0} width={colW} height={H + LAB} fill="transparent" />
                  {(expanded || d === 1 || d % 5 === 0 || d === N || d === sel) && (
                    <text x={xOf(d)} y={H + 28} textAnchor="middle" fontSize="13" fontWeight={d === sel ? 700 : 600}
                      fill={d === sel ? C.primary : C.dMuted} style={{ fontFamily: "'DM Sans', sans-serif" }}>J{d}</text>
                  )}
                </g>
              ))}
            </svg>
          </div>
          {ticks.map(t => (
            <div key={"y" + t} style={{
              position: "absolute", left: 14, top: yOf(t) - 14, height: 28, display: "flex", alignItems: "center", padding: "0 11px",
              borderRadius: 99, background: C.phMens + "38", color: C.primaryDeep, fontSize: 13, fontWeight: 700, pointerEvents: "none",
            }}>{fmtTemp(t.toFixed(1))}°</div>
          ))}
        </div>

        <div style={{ borderTop: "1px solid var(--border-c)", padding: "18px 18px 8px", marginTop: 6 }}>
          <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>J{sel} · {fmtDMshort(selDate)} · Phase {selPhase.label}</div>
          {rows.map(([k, v], i) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 0", borderBottom: i < rows.length - 1 ? "1px solid var(--border-c)" : "none" }}>
              <span style={{ color: "var(--muted-c)", fontSize: 15 }}>{k}</span>
              <span style={{ fontSize: 16, fontWeight: 600, textAlign: "right" }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ height: 10 }} />
      </div>

      <button onClick={() => onNavigate("historique")} style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "26px 8px 8px",
        background: "none", border: "none", color: "var(--text-c)", fontSize: 18, fontWeight: 600, cursor: "pointer", textAlign: "left",
      }}>
        Voir les courbes précédentes <Ico name="chevR" size={20} color="var(--muted-c)" />
      </button>
    </div>
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
    const today = todayStr();
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
              <YAxis {...tempAxisProps(tempData)} tick={{ fontSize: 11 }} tickFormatter={v => v.toFixed(1)} />
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
            position: "sticky", top: isMobile ? 0 : 0, zIndex: 50,
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
                  <YAxis {...tempAxisProps(tempData)} tick={{ fontSize: 11 }} tickFormatter={v => v.toFixed(1)} />
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
function Historique({ entries, cycles, isMobile, onDeleteCycle }) {
  const [selectedCycle, setSelectedCycle] = useState(null);
  const [search, setSearch] = useState("");
  const [confirmDeleteCycle, setConfirmDeleteCycle] = useState(null);
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
                          <YAxis {...tempAxisProps(tempData)} tick={{ fontSize: 10 }} tickFormatter={v => v.toFixed(1)} />
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

                  {/* ── Recherche + actions ── */}
                  <div style={{ padding: "12px 18px", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <input placeholder="Chercher…" value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 140 }} />
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
                    <Btn variant="danger" size="sm" onClick={() => setConfirmDeleteCycle(c.cycleNum)}>🗑 Supprimer</Btn>
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
      <ConfirmDialog
        open={confirmDeleteCycle !== null}
        message={`Supprimer le cycle ${confirmDeleteCycle} et toutes ses entrées ? Cette action est irréversible.`}
        onConfirm={() => { onDeleteCycle(confirmDeleteCycle); setConfirmDeleteCycle(null); setSelectedCycle(null); }}
        onCancel={() => setConfirmDeleteCycle(null)}
      />
    </div>
  );
}

// ─── CALENDRIER MENSUEL ──────────────────────────────────────────────────────
function Calendrier({ entries, cycles, onBack, onPickDate }) {
  const { avgLen, ovMean, dureeRegles } = useCycleStats(entries, cycles);
  const today = todayStr();
  const HDR = 142, ROW_H = 120, MONTH_H = 56;

  const sortedCycles = useMemo(() => cycles.filter(c => c.dateDebut).slice().sort((a, b) => a.dateDebut.localeCompare(b.dateDebut)), [cycles]);
  const byDate = useMemo(() => { const m = {}; entries.forEach(e => { m[e.date] = e; }); return m; }, [entries]);
  const ovByCycle = useMemo(() => {
    const groups = {}, m = {};
    entries.forEach(e => { (groups[e.cycleNum] = groups[e.cycleNum] || []).push(e); });
    Object.entries(groups).forEach(([n, ents]) => { const ov = detectOvulation(ents); if (ov) m[n] = ov.day; });
    return m;
  }, [entries]);

  // Phase d'une date : cycle réel (passé) ou projection à partir du dernier cycle
  const infoFor = useCallback((dateStr) => {
    let cyc = null;
    for (const c of sortedCycles) { if (dateStr >= c.dateDebut) cyc = c; else break; }
    if (!cyc) return null;
    const isLast = cyc === sortedCycles[sortedCycles.length - 1];
    const abs = diffDays(dateStr, cyc.dateDebut) + 1;
    let jour = abs, ovDay = ovByCycle[cyc.cycleNum] || Math.round(ovMean);
    if (isLast && abs > avgLen + 7) { jour = ((abs - 1) % avgLen) + 1; ovDay = Math.round(ovMean); }
    const phase = getPhaseForDay(jour, avgLen, ovDay, dureeRegles).phase;
    return { phase, jour, ovDay };
  }, [sortedCycles, ovByCycle, ovMean, avgLen, dureeRegles]);

  // Construction des lignes : un bandeau de mois puis les semaines (jours du mois uniquement)
  const { rows, tops } = useMemo(() => {
    const first = sortedCycles[0]?.dateDebut || today;
    const nowD = new Date(today + "T12:00:00");
    const fD = new Date(first + "T12:00:00");
    let y = fD.getFullYear(), m = fD.getMonth();
    const endD = new Date(nowD.getFullYear(), nowD.getMonth() + 2, 1);
    const endY = endD.getFullYear(), endM = endD.getMonth();
    const out = [];
    let guard = 0;
    while ((y < endY || (y === endY && m <= endM)) && guard++ < 80) {
      const dim = new Date(y, m + 1, 0).getDate();
      const firstDow = (new Date(y, m, 1).getDay() + 6) % 7;
      const label = new Date(y, m, 1).toLocaleDateString("fr-FR", { month: "long" });
      out.push({ type: "month", key: `m${y}-${m}`, y, m, label: capFirst(label), col: firstDow, h: MONTH_H });
      let day = 1;
      while (day <= dim) {
        const cells = Array(7).fill(null);
        let dow = (new Date(y, m, day).getDay() + 6) % 7;
        while (dow < 7 && day <= dim) { cells[dow] = day; dow++; day++; }
        out.push({ type: "week", key: `w${y}-${m}-${day}`, y, m, cells, h: ROW_H });
      }
      m++; if (m > 11) { m = 0; y++; }
    }
    const t = []; let acc = 0;
    out.forEach(r => { t.push(acc); acc += r.h; });
    return { rows: out, tops: t };
  }, [sortedCycles, today]);

  const [curMonth, setCurMonth] = useState({ y: +today.slice(0, 4), m: +today.slice(5, 7) - 1 });
  const listRef = useRef(null);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const idx = rows.findIndex(r => r.type === "month" && r.y === +today.slice(0, 4) && r.m === +today.slice(5, 7) - 1);
    const base = el.getBoundingClientRect().top + window.scrollY;
    if (idx >= 0) window.scrollTo(0, base + tops[idx] - HDR + 8);
  }, [rows]);

  useEffect(() => {
    const onScroll = () => {
      const el = listRef.current;
      if (!el) return;
      const y = window.scrollY - (el.getBoundingClientRect().top + window.scrollY) + HDR + 4;
      let i = 0;
      while (i < rows.length - 1 && tops[i + 1] <= y) i++;
      const r = rows[Math.max(0, i)];
      if (r) setCurMonth(prev => (prev.y === r.y && prev.m === r.m) ? prev : { y: r.y, m: r.m });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [rows, tops]);

  const monthTitle = capFirst(new Date(curMonth.y, curMonth.m, 1).toLocaleDateString("fr-FR", { month: "long", year: "numeric" }));
  const pad = "0 16px";

  const renderWeek = (r) => {
    const days = r.cells.map(d => {
      if (!d) return null;
      const ds = `${r.y}-${String(r.m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      return { d, ds, info: infoFor(ds), e: byDate[ds] };
    });
    // Bandeaux de phase : séries consécutives de même phase
    const bands = [];
    days.forEach((x, i) => {
      if (!x || !x.info) return;
      const last = bands[bands.length - 1];
      if (last && last.phase === x.info.phase && last.end === i - 1) { last.end = i; if (x.info.jour === x.info.ovDay) last.ovAt = i; }
      else bands.push({ phase: x.info.phase, start: i, end: i, ovAt: x.info.jour === x.info.ovDay ? i : null });
    });
    return (
      <div key={r.key} style={{ height: r.h, borderBottom: "1px solid var(--border-c)", padding: pad, boxSizing: "border-box" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", paddingTop: 14 }}>
          {days.map((x, i) => {
            if (!x) return <div key={i} />;
            const isToday = x.ds === today, future = x.ds > today, period = flowOn(x.e) && !isToday;
            return (
              <button key={i} onClick={() => !future && onPickDate(x.ds)} style={{
                background: "none", border: "none", padding: 0, textAlign: "center", color: "inherit", cursor: future ? "default" : "pointer",
              }}>
                <div style={{
                  width: 38, height: 38, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center",
                  borderRadius: isToday ? 12 : "50%", fontSize: 19, fontWeight: isToday || period ? 700 : 500,
                  background: isToday ? "var(--text-c)" : period ? C.cta : "transparent",
                  color: isToday ? "var(--bg)" : period ? C.white : future ? "var(--muted-c)" : "var(--text-c)",
                  opacity: future ? 0.55 : 1, boxShadow: period ? `0 0 16px ${C.cta}66` : "none",
                }}>{x.d}</div>
                <div style={{ height: 5, width: 5, borderRadius: "50%", margin: "6px auto 0", background: hasAnyData(x.e) ? C.primaryDeep : "transparent" }} />
              </button>
            );
          })}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginTop: 12 }}>
          {bands.map((b, i) => {
            const isMens = b.phase === "menstruelle";
            const span = b.end - b.start + 1;
            return (
              <div key={i} style={{
                gridColumn: `${b.start + 1} / span ${span}`, margin: "0 4px", height: 32, borderRadius: 16, position: "relative",
                background: isMens ? C.cta : "var(--band)", color: isMens ? C.white : "var(--muted-c)",
                display: "flex", alignItems: "center", padding: "0 12px", fontSize: 14, fontWeight: isMens ? 700 : 500,
                overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", opacity: days[b.start]?.ds > today && !isMens ? 0.8 : 1,
              }}>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{capFirst(isMens ? "Règles" : PHASE_LABELS[b.phase])}</span>
                {b.ovAt != null && (
                  <span style={{ position: "absolute", top: 7, width: 4, height: 18, borderRadius: 2, background: C.phOvu, left: `calc(${((b.ovAt - b.start) + 0.5) / span * 100}% - 2px)` }} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: "var(--bg)", height: HDR, padding: "0 16px" }}>
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", height: 64, paddingTop: 10 }}>
          <button onClick={onBack} aria-label="Retour" style={{ ...roundBtn, position: "absolute", left: 0, top: 14, width: 40, height: 40 }}><Ico name="chevL" size={20} color="var(--text-c)" sw={2.4} /></button>
          <div style={{ fontSize: 24, fontWeight: 700 }}>Calendrier</div>
        </div>
        <div style={{ fontSize: 22, fontWeight: 600, height: 44, display: "flex", alignItems: "flex-end", paddingBottom: 6 }}>{monthTitle}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", height: 32, alignItems: "center" }}>
          {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
            <div key={i} style={{ textAlign: "center", fontSize: 15, fontWeight: 600, color: "var(--muted-c)" }}>{d}</div>
          ))}
        </div>
      </div>

      <div ref={listRef}>
        {rows.map(r => r.type === "month" ? (
          <div key={r.key} style={{ height: r.h, padding: pad, boxSizing: "border-box", display: "grid", gridTemplateColumns: "repeat(7, 1fr)", alignItems: "end" }}>
            <div style={{ gridColumn: `${r.col + 1} / -1`, borderBottom: "1px solid var(--border-c)", height: "100%", display: "flex", alignItems: "center", paddingBottom: 2 }}>
              <span style={{ fontSize: 22, fontWeight: 600, color: C.primaryDeep }}>{r.label}</span>
            </div>
          </div>
        ) : renderWeek(r))}
        <div style={{ height: 60 }} />
      </div>
    </div>
  );
}

// ─── ANALYSE ──────────────────────────────────────────────────────────────────
function Analyse({ entries, cycles }) {
  const gami = useMemo(() => computeGamification(entries), [entries]);

  const cycleLengths = useMemo(() => cycles
    .filter(c => c.dateFin && c.dateDebut)
    .map(c => Math.floor((new Date(c.dateFin) - new Date(c.dateDebut)) / 86400000) + 1),
    [cycles]
  );
  const avgLen = cycleLengths.length ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length) : null;
  const stdLen = cycleLengths.length > 1
    ? Math.round(Math.sqrt(cycleLengths.map(l => (l - avgLen) ** 2).reduce((a, b) => a + b, 0) / cycleLengths.length))
    : null;
  const regulariteLabel = stdLen === null ? null : stdLen <= 2 ? "Très régulier" : stdLen <= 5 ? "Régulier" : "Variable";

  // Durée moyenne des règles (nb de jours consécutifs avec saignement/flux en début de cycle)
  const cycleGroups = useMemo(() => {
    const g = {};
    entries.forEach(e => { (g[e.cycleNum] = g[e.cycleNum] || []).push(e); });
    return g;
  }, [entries]);
  const dureesRegles = Object.values(cycleGroups).map(ents => {
    const sorted = ents.slice().sort((a, b) => a.jourDuCycle - b.jourDuCycle);
    let count = 0;
    for (const e of sorted) {
      if (e.saignement || e.flux) count++;
      else if (count > 0) break;
    }
    return count;
  }).filter(n => n > 0);
  const avgRegles = dureesRegles.length ? Math.round(dureesRegles.reduce((a, b) => a + b, 0) / dureesRegles.length) : null;

  const sortedCycles = cycles.slice().sort((a, b) => b.cycleNum - a.cycleNum);

  return (
    <div className="anim">
      <PageTitle sub={`Niveau ${gami.niveauNum} · ${gami.joursRenseignes} jours renseignés`}>Analyse</PageTitle>

      <Card style={{ marginBottom: 20, background: C.primaryPale, border: `1px solid ${C.primary}30` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div>
            <div style={{ fontFamily: "Cormorant Garamond", fontSize: 20, fontWeight: 600, color: C.primaryDeep }}>{gami.nom}</div>
            <div style={{ fontSize: 12, color: C.primaryDeep }}>Niveau {gami.niveauNum}</div>
          </div>
          <div style={{ fontSize: 13, color: C.primaryDeep, fontWeight: 600 }}>{gami.xp} / {gami.xpMax} XP</div>
        </div>
        <div style={{ width: "100%", height: 8, borderRadius: 99, background: C.white, overflow: "hidden" }}>
          <div style={{ width: `${gami.progres}%`, height: "100%", background: C.primary, borderRadius: 99, transition: "width .3s" }} />
        </div>
      </Card>

      <div className="kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 22 }}>
        <KPI label="Cycle" value={avgLen ? `${avgLen}j` : "—"} sub={regulariteLabel || "Pas assez de données"} icon="🔄" />
        <KPI label="Règles" value={avgRegles ? `${avgRegles}j` : "—"} sub="Durée moyenne" icon="🌹" color={C.red} />
        <KPI label="Régularité" value={stdLen !== null ? `±${stdLen}j` : "—"}
          sub={cycleLengths.length < 3 ? `${cycleLengths.length}/3 cycles nécessaires` : regulariteLabel}
          icon="📊" color={C.sage} />
      </div>

      <Card>
        <div style={{ fontWeight: 600, marginBottom: 12 }}>Historique des durées de cycle</div>
        {cycleLengths.length === 0 ? (
          <div style={{ fontSize: 13, color: "var(--muted-c)" }}>Aucun cycle complet enregistré.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {sortedCycles.slice(0, 8).map(c => {
              const len = c.dateFin && c.dateDebut ? Math.floor((new Date(c.dateFin) - new Date(c.dateDebut)) / 86400000) + 1 : null;
              return (
                <div key={c.cycleNum} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                  <span style={{ color: "var(--muted-c)" }}>Cycle {c.cycleNum}</span>
                  <span style={{ fontFamily: "Cormorant Garamond", fontSize: 16, fontWeight: 600, color: C.primary }}>{len ? `${len}j` : "en cours"}</span>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── ASSISTANT ───────────────────────────────────────────────────────────────
// Moteur de prédiction basé sur historique + longueur moyenne + variabilité

function predictCycles(entries, cycles, nbFuturs = 6) {
  // Longueur moyenne des cycles complets
  const lengths = cycles
    .filter(c => c.dateFin && c.dateDebut)
    .map(c => Math.floor((new Date(c.dateFin) - new Date(c.dateDebut)) / 86400000) + 1);
  const avgLen = lengths.length ? Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length) : 28;
  const stdLen = lengths.length > 1
    ? Math.round(Math.sqrt(lengths.map(l => (l - avgLen) ** 2).reduce((a, b) => a + b, 0) / lengths.length))
    : 3;

  // Ovulation moyenne (jour dans le cycle)
  const cycleGroups = {};
  entries.forEach(e => { (cycleGroups[e.cycleNum] = cycleGroups[e.cycleNum] || []).push(e); });
  const ovStats = computeOvulationStats(
    Object.values(cycleGroups).map(ents => ({ entries: ents }))
  );

  // Dernier cycle démarré
  const lastCycle = cycles.slice().sort((a, b) => b.cycleNum - a.cycleNum)[0];
  if (!lastCycle) return null;
  const lastStart = new Date(lastCycle.dateDebut);

  // Générer les N prochains cycles prévus
  const predictions = [];
  for (let i = 0; i < nbFuturs; i++) {
    const cycleStart = new Date(lastStart.getTime() + i * avgLen * 86400000);
    const cycleEnd = new Date(cycleStart.getTime() + (avgLen - 1) * 86400000);
    const ovDay = new Date(cycleStart.getTime() + (Math.round(ovStats.mean) - 1) * 86400000);
    const fertileStart = new Date(ovDay.getTime() - 5 * 86400000);
    const fertileEnd = new Date(ovDay.getTime() + 1 * 86400000);
    // Durée règles typique 4-6 jours
    const reglesEnd = new Date(cycleStart.getTime() + 4 * 86400000);
    predictions.push({
      cycleNum: lastCycle.cycleNum + i,
      debut: cycleStart,
      fin: cycleEnd,
      reglesDebut: cycleStart,
      reglesFin: reglesEnd,
      ovulation: ovDay,
      fertileDebut: fertileStart,
      fertileFin: fertileEnd,
    });
  }

  return { predictions, avgLen, stdLen, ovMean: Math.round(ovStats.mean), ovStd: Math.round(ovStats.std) };
}

const fmtLong = (d) => d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const fmtMedium = (d) => d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });

// ─── Réponses aux questions ──────────────────────────────────────────────────

function repondrePeriodes(prediction) {
  if (!prediction) return { text: "Pas encore assez de données pour prédire.", details: [] };
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const futures = prediction.predictions.filter(p => p.reglesFin >= now);
  return {
    text: futures.length ? `Tes prochaines périodes de menstruation prévues :` : "Pas de prédiction disponible.",
    details: futures.slice(0, 4).map(p => ({
      titre: `Cycle ${p.cycleNum}`,
      valeur: `${fmtMedium(p.reglesDebut)} → ${fmtMedium(p.reglesFin)}`,
      sub: `≈ ${Math.ceil((p.reglesDebut - now) / 86400000)} jours`,
    })),
    footer: `Basé sur ${prediction.avgLen}j de cycle moyen (±${prediction.stdLen}j)`,
  };
}

function repondreOvulation(prediction) {
  if (!prediction) return { text: "Pas assez de données.", details: [] };
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const futures = prediction.predictions.filter(p => p.ovulation >= now);
  return {
    text: `Prochaines ovulations estimées :`,
    details: futures.slice(0, 3).map(p => ({
      titre: `Cycle ${p.cycleNum}`,
      valeur: fmtLong(p.ovulation),
      sub: `Fenêtre fertile : ${fmtMedium(p.fertileDebut)} → ${fmtMedium(p.fertileFin)}`,
    })),
    footer: `Ovulation historique : J${prediction.ovMean} (±${prediction.ovStd}j)`,
  };
}

function repondreFertiliteDate(prediction, date) {
  if (!prediction) return { text: "Pas assez de données.", details: [] };
  if (!date) return { text: "Choisis une date pour vérifier.", details: [] };
  const target = new Date(date + "T00:00:00");
  // Trouver le cycle qui contient cette date
  for (const p of prediction.predictions) {
    if (target >= p.debut && target <= p.fin) {
      const isRegles = target >= p.reglesDebut && target <= p.reglesFin;
      const isFertile = target >= p.fertileDebut && target <= p.fertileFin;
      const isOvulation = target.toDateString() === p.ovulation.toDateString();
      let phase, color, sub;
      if (isRegles) { phase = "🌹 Menstruation"; color = "red"; sub = "Période de règles"; }
      else if (isOvulation) { phase = "✨ Ovulation"; color = "sage"; sub = "Jour d'ovulation estimé"; }
      else if (isFertile) { phase = "🌿 Fenêtre fertile"; color = "sage"; sub = "Période de fertilité"; }
      else if (target < p.fertileDebut) { phase = "🌱 Phase folliculaire"; color = "yellow"; sub = "Avant l'ovulation"; }
      else { phase = "🌙 Phase lutéale"; color = "lavender"; sub = "Après l'ovulation, stable"; }
      const dayInCycle = Math.floor((target - p.debut) / 86400000) + 1;
      return {
        text: `Le ${fmtLong(target)} :`,
        details: [{
          titre: phase,
          valeur: `Jour ${dayInCycle} du cycle ${p.cycleNum}`,
          sub, color,
        }],
        footer: null,
      };
    }
  }
  return { text: `La date ${fmtLong(target)} est trop éloignée pour une prédiction fiable.`, details: [] };
}

function repondreJoursRestants(prediction, entries, currentCycleNum) {
  if (!prediction) return { text: "Pas assez de données.", details: [] };
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const currentEnts = entries.filter(e => e.cycleNum === currentCycleNum).sort((a, b) => a.date.localeCompare(b.date));
  if (!currentEnts.length) return { text: "Aucune entrée pour ce cycle.", details: [] };
  const debut = new Date(currentEnts[0].date + "T00:00:00");
  const jourActuel = Math.floor((now - debut) / 86400000) + 1;
  const prochainDebut = prediction.predictions.find(p => p.debut > now);
  if (!prochainDebut) return { text: "Pas de prédiction disponible.", details: [] };
  const joursAvant = Math.ceil((prochainDebut.debut - now) / 86400000);
  return {
    text: `Tu es au jour ${jourActuel} de ton cycle actuel.`,
    details: [{
      titre: "Prochaines règles estimées",
      valeur: fmtLong(prochainDebut.debut),
      sub: joursAvant === 0 ? "Aujourd'hui" : joursAvant === 1 ? "Demain" : `Dans ${joursAvant} jours`,
    }],
    footer: null,
  };
}

// ─── Composant Assistant ─────────────────────────────────────────────────────

function Assistant({ entries, cycles, currentCycleNum }) {
  const [question, setQuestion] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");

  const prediction = useMemo(() => predictCycles(entries, cycles), [entries, cycles]);

  const questions = [
    { id: "periodes",      icon: "🌹", label: "Quand seront mes prochaines règles ?" },
    { id: "ovulation",     icon: "✨", label: "Quand seront mes prochaines ovulations ?" },
    { id: "fertilite",     icon: "🌿", label: "Suis-je fertile à une date précise ?" },
    { id: "restants",      icon: "⏳", label: "Où en suis-je dans mon cycle actuel ?" },
  ];

  let reponse = null;
  if (question === "periodes")  reponse = repondrePeriodes(prediction);
  if (question === "ovulation") reponse = repondreOvulation(prediction);
  if (question === "fertilite") reponse = repondreFertiliteDate(prediction, selectedDate);
  if (question === "restants")  reponse = repondreJoursRestants(prediction, entries, currentCycleNum);

  const colorMap = { red: C.red, sage: C.sage, yellow: C.yellow, lavender: C.lavender };

  return (
    <div className="anim">
      <PageTitle sub="Pose une question sur ton cycle">Assistant</PageTitle>

      {!prediction && (
        <Card style={{ background: C.primaryPale, border: `1px solid ${C.primary}40`, marginBottom: 20 }}>
          <div style={{ fontSize: 14, color: C.primaryDeep }}>
            📊 Il faut au moins un cycle complet pour utiliser l'assistant.
          </div>
        </Card>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        {questions.map(q => (
          <button key={q.id} onClick={() => { setQuestion(q.id); setSelectedDate(""); }} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "14px 18px",
            borderRadius: 14, border: `1.5px solid ${question === q.id ? C.primary : "var(--border-c)"}`,
            background: question === q.id ? C.primaryPale : "var(--surface)",
            cursor: "pointer", fontFamily: "inherit", textAlign: "left", fontSize: 14,
            color: question === q.id ? C.primaryDeep : "var(--text-c)",
            fontWeight: question === q.id ? 600 : 400,
            transition: "all .15s",
          }}>
            <span style={{ fontSize: 20 }}>{q.icon}</span>
            {q.label}
          </button>
        ))}
      </div>

      {/* Sélecteur de date pour la fertilité */}
      {question === "fertilite" && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted-c)", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".05em" }}>
            Choisis une date
          </div>
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
            min={todayStr()} />
        </Card>
      )}

      {/* Réponse */}
      {reponse && (
        <Card style={{ background: "var(--surface-2)" }}>
          <div style={{ fontSize: 15, fontWeight: 500, marginBottom: reponse.details.length ? 16 : 0, lineHeight: 1.5 }}>
            {reponse.text}
          </div>

          {reponse.details.map((d, i) => (
            <div key={i} style={{
              padding: "14px 16px", background: "var(--surface)", borderRadius: 12,
              marginBottom: 10, border: `1px solid ${d.color ? colorMap[d.color] + "40" : "var(--border-c)"}`,
              borderLeft: `3px solid ${d.color ? colorMap[d.color] : C.primary}`,
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted-c)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>
                {d.titre}
              </div>
              <div style={{ fontFamily: "Cormorant Garamond", fontSize: 22, fontWeight: 600, color: d.color ? colorMap[d.color] : C.primaryDeep, lineHeight: 1.2 }}>
                {d.valeur}
              </div>
              {d.sub && <div style={{ fontSize: 12, color: "var(--muted-c)", marginTop: 4 }}>{d.sub}</div>}
            </div>
          ))}

          {reponse.footer && (
            <div style={{ fontSize: 12, color: "var(--muted-c)", marginTop: 10, fontStyle: "italic", textAlign: "center" }}>
              {reponse.footer}
            </div>
          )}
        </Card>
      )}

      <div style={{ marginTop: 32, padding: "14px 18px", background: "var(--surface-2)", borderRadius: 12, fontSize: 12, color: "var(--muted-c)", lineHeight: 1.6 }}>
        <strong>À propos des prédictions :</strong> ces estimations sont basées sur ton historique de cycles et la méthode symptothermique. La régularité et la précision augmentent avec le nombre de cycles enregistrés. Elles ne remplacent pas une consultation médicale.
      </div>
    </div>
  );
}

// ─── PARAMÈTRES ──────────────────────────────────────────────────────────────
function Parametres({ settings, onUpdate, onNewCycle, currentCycleNum, entries }) {
  const upd = (k, v) => onUpdate({ ...settings, [k]: v });
  const gami = useMemo(() => computeGamification(entries || []), [entries]);

  return (
    <div className="anim">
      <PageTitle sub="Personnalisation et configuration">Paramètres</PageTitle>

      <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 560 }}>
        <Card>
          <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 15 }}>Niveau {gami.niveauNum} · {gami.nom}</div>
          <div style={{ fontSize: 12, color: "var(--muted-c)", marginBottom: 10 }}>{gami.xp}/{gami.xpMax} XP · {gami.joursRenseignes} jours renseignés</div>
          <div style={{ height: 6, borderRadius: 99, background: "var(--surface-2)", overflow: "hidden" }}>
            <div style={{ width: `${gami.progres}%`, height: "100%", background: C.primary, borderRadius: 99 }} />
          </div>
        </Card>

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
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
          <img src="/logo.png" alt="Mo" style={{ width: 96, height: 96, display: "block", marginBottom: 8 }} />
          <div style={{ fontFamily: "Cormorant Garamond", fontSize: 28, fontWeight: 600, color: C.primaryDeep }}>Mo</div>
          <div style={{ fontSize: 14, color: "var(--muted-c)" }}>Suivi de cycle · Symptothermie</div>
        </div>
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
  { id: "accueil",    label: "Accueil",          icon: "◉" },
  { id: "cycle",      label: "Cycle actuel",     icon: "🌸" },
  { id: "calendrier", label: "Calendrier",       icon: "📅" },
  { id: "historique", label: "Historique",       icon: "📖" },
  { id: "analyse",    label: "Analyse",          icon: "📊" },
  { id: "assistant",  label: "Assistant",        icon: "✦" },
  { id: "params",     label: "Paramètres",       icon: "⚙" },
];

// ─── ICÔNES DE NAVIGATION (ligne, minimalistes) ──────────────────────────────
function NavIcon({ name, size = 22, color = "currentColor" }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "home":
      return <svg {...p}><circle cx="12" cy="12" r="8.2" /><circle cx="12" cy="12" r="2.4" fill={color} stroke="none" /></svg>;
    case "cycle":
      return <svg {...p}><path d="M12 3.2c3 3.8 6.2 7.6 6.2 11.3a6.2 6.2 0 1 1-12.4 0c0-3.7 3.2-7.5 6.2-11.3z" /></svg>;
    case "calendar":
      return <svg {...p}><rect x="3.5" y="5" width="17" height="15.5" rx="3" /><path d="M8 3v4M16 3v4M3.5 10h17" /></svg>;
    case "history":
      return <svg {...p}><path d="M4.5 12a7.5 7.5 0 1 0 2.4-5.5" /><path d="M4.2 4.8v4h4" /><path d="M12 8.2v4.3l3 2" /></svg>;
    case "more":
      return <svg {...p}><circle cx="6" cy="12" r="1.3" fill={color} stroke="none" /><circle cx="12" cy="12" r="1.3" fill={color} stroke="none" /><circle cx="18" cy="12" r="1.3" fill={color} stroke="none" /></svg>;
    case "chart":
      return <svg {...p}><path d="M4.5 20V11M10.2 20V4M15.9 20v-6.5M21.5 20H2.5" /></svg>;
    case "sparkle":
      return <svg {...p}><path d="M12 3l1.7 5 5 1.7-5 1.7-1.7 5-1.7-5-5-1.7 5-1.7 2-5z" /></svg>;
    case "gear":
      return <svg {...p}><circle cx="12" cy="12" r="3" /><path d="M12 3.5v2.3M12 18.2v2.3M4.6 7.5l2 1.2M17.4 15.3l2 1.2M3.5 12h2.3M18.2 12h2.3M4.6 16.5l2-1.2M17.4 8.7l2-1.2" /></svg>;
    case "save":
      return <svg {...p}><path d="M12 3.5v10.5M8 10.5l4 4 4-4" /><path d="M5 15.5v3.3A2.2 2.2 0 0 0 7.2 21h9.6a2.2 2.2 0 0 0 2.2-2.2v-3.3" /></svg>;
    default:
      return null;
  }
}

const BOTTOM_NAV_H = 96;

function BottomNav({ view, onNavigate, onMore, hasUnsaved }) {
  const items = [
    { id: "cycle",      icon: "cycle",   label: "Cycle" },
    { id: "historique", icon: "history", label: "Historique" },
    { id: "accueil",    center: true },
    { id: "analyse",    icon: "chart",   label: "Analyse" },
    { id: "more",       icon: "more",    label: "Plus" },
  ];
  return (
    <div style={{
      position: "fixed", left: 14, right: 14, bottom: "calc(14px + env(safe-area-inset-bottom, 0px))", zIndex: 300,
      maxWidth: 452, margin: "0 auto", height: 68, borderRadius: 34,
      background: "var(--surface)", border: "1px solid var(--border-c)",
      display: "grid", gridTemplateColumns: "1fr 1fr 1.25fr 1fr 1fr", alignItems: "center", padding: "0 6px",
      boxShadow: "0 10px 30px rgba(0,0,0,.35)",
    }}>
      {items.map(it => {
        if (it.center) {
          const active = view === it.id;
          return (
            <button key={it.id} onClick={() => onNavigate(it.id)} aria-label="Accueil" style={{
              justifySelf: "center", width: 60, height: 54, borderRadius: 20, cursor: "pointer",
              background: "var(--surface-2)", border: `1px solid ${active ? C.cta + "88" : "var(--chip-b)"}`,
              display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
            }}>
              <span style={{
                width: 36, height: 36, borderRadius: "50%",
                background: `radial-gradient(circle at 34% 30%, ${C.white}cc 0%, ${C.primaryLight} 24%, ${C.phOvu} 56%, ${C.phLut} 100%)`,
                boxShadow: `0 0 14px ${C.primaryLight}44`,
              }} />
            </button>
          );
        }
        const active = it.id !== "more" && view === it.id;
        const col = active ? C.primaryLight : "var(--muted-c)";
        return (
          <button key={it.id} onClick={() => it.id === "more" ? onMore() : onNavigate(it.id)} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "none", border: "none",
            cursor: "pointer", padding: "4px 0", color: col, position: "relative",
          }}>
            <Ico name={it.icon} size={24} color={col} sw={1.6} />
            <span style={{ fontSize: 12, fontWeight: 600 }}>{it.label}</span>
            {it.id === "more" && hasUnsaved && (
              <span style={{ position: "absolute", top: 2, right: "28%", width: 6, height: 6, borderRadius: "50%", background: C.cta }} />
            )}
          </button>
        );
      })}
    </div>
  );
}

function PlusSheet({ open, onClose, onNavigate, onOpenData, hasUnsaved }) {
  const items = [
    { id: "calendrier", icon: "calendarDots", label: "Calendrier" },
    { id: "assistant",  icon: "sparkle",      label: "Assistant" },
    { id: "params",     icon: "gear",         label: "Paramètres" },
  ];
  return (
    <Modal open={open} onClose={onClose} title="Plus">
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map(it => (
          <button key={it.id} onClick={() => { onNavigate(it.id); onClose(); }} style={{
            display: "flex", alignItems: "center", gap: 14, padding: "14px 14px",
            borderRadius: 14, border: "none", background: "var(--surface-2)", cursor: "pointer",
            fontFamily: "inherit", fontSize: 15, color: "var(--text-c)", textAlign: "left",
          }}>
            <Ico name={it.icon} size={20} color={C.primaryLight} />
            {it.label}
          </button>
        ))}
        <button onClick={() => { onOpenData(); onClose(); }} style={{
          display: "flex", alignItems: "center", gap: 14, padding: "14px 14px",
          borderRadius: 14, border: "none", background: "var(--surface-2)", cursor: "pointer",
          fontFamily: "inherit", fontSize: 15, color: "var(--text-c)", textAlign: "left", position: "relative",
        }}>
          <Ico name="save" size={20} color={C.primaryLight} />
          Données
          {hasUnsaved && <span style={{ position: "absolute", top: 16, right: 16, width: 7, height: 7, borderRadius: "50%", background: C.cta }} />}
        </button>
      </div>
    </Modal>
  );
}

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
  const [view, setView] = useState("accueil");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [plusOpen, setPlusOpen] = useState(false);
  const [dataModalOpen, setDataModalOpen] = useState(false);
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [focusDate, setFocusDate] = useState(null);

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

  // Recalcule jourDuCycle pour toutes les entrées d'un cycle + met à jour les bornes
  const recomputeCycle = useCallback((allEntries, cycleNum) => {
    const cycleEnts = allEntries.filter(e => e.cycleNum === cycleNum).sort((a, b) => a.date.localeCompare(b.date));
    if (cycleEnts.length === 0) return { entries: allEntries, cycleInfo: null };
    const startDate = cycleEnts[0].date;
    const others = allEntries.filter(e => e.cycleNum !== cycleNum);
    const updated = cycleEnts.map(e => {
      const diff = Math.floor((new Date(e.date) - new Date(startDate)) / 86400000) + 1;
      return { ...e, jourDuCycle: diff };
    });
    const dates = cycleEnts.map(e => e.date);
    const cycleInfo = {
      cycleNum,
      dateDebut: dates[0],
      dateFin: dates[dates.length - 1],
      nbJours: Math.floor((new Date(dates[dates.length - 1]) - new Date(dates[0])) / 86400000) + 1,
      nbEntrees: cycleEnts.length,
    };
    return { entries: [...others, ...updated], cycleInfo };
  }, []);

  const handleAdd = useCallback((entry) => {
    const cycleNum = currentCycleNum;
    const merged = [...entries.filter(e => e.id !== entry.id), { ...entry, cycleNum }];
    const { entries: recomputed, cycleInfo } = recomputeCycle(merged, cycleNum);
    setEntries(recomputed);
    setCycles(prev => {
      const exists = prev.find(c => c.cycleNum === cycleNum);
      if (exists) return prev.map(c => c.cycleNum === cycleNum ? { ...c, ...cycleInfo } : c);
      return [...prev, cycleInfo];
    });
  }, [entries, currentCycleNum, recomputeCycle]);

  const handleEdit = useCallback((entry) => {
    const merged = entries.map(e => e.id === entry.id ? entry : e);
    const { entries: recomputed, cycleInfo } = recomputeCycle(merged, entry.cycleNum);
    setEntries(recomputed);
    if (cycleInfo) {
      setCycles(prev => prev.map(c => c.cycleNum === entry.cycleNum ? { ...c, ...cycleInfo } : c));
    }
  }, [entries, recomputeCycle]);

  const handleDelete = useCallback((id) => {
    const toDelete = entries.find(e => e.id === id);
    if (!toDelete) return;
    const merged = entries.filter(e => e.id !== id);
    const { entries: recomputed, cycleInfo } = recomputeCycle(merged, toDelete.cycleNum);
    setEntries(recomputed);
    if (cycleInfo) {
      setCycles(prev => prev.map(c => c.cycleNum === toDelete.cycleNum ? { ...c, ...cycleInfo } : c));
    } else {
      // Si plus aucune entrée dans ce cycle, on supprime aussi le cycle
      setCycles(prev => prev.filter(c => c.cycleNum !== toDelete.cycleNum));
    }
  }, [entries, recomputeCycle]);

  // Suppression d'un cycle entier
  const handleDeleteCycle = useCallback((cycleNum) => {
    setEntries(prev => prev.filter(e => e.cycleNum !== cycleNum));
    setCycles(prev => prev.filter(c => c.cycleNum !== cycleNum));
  }, []);

  const handleNewCycle = useCallback(() => {
    const newNum = currentCycleNum + 1;
    const today = todayStr();

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

  const navigate = (id) => { setView(id); setPlusOpen(false); window.scrollTo(0, 0); };
  const pickDate = (ds) => { setFocusDate(ds); navigate("accueil"); };
  const updateSettings = useCallback((patch) => setSettings(s => ({ ...s, ...patch })), []);
  const fullBleed = view === "calendrier";
  const hideNav = view === "calendrier" || view === "courbe";

  const Sidebar = () => (
    <div style={{
      width: 240, flexShrink: 0, display: "flex", flexDirection: "column",
      padding: "32px 16px 24px", borderRight: "1px solid var(--border-c)", height: "100vh",
      position: "sticky", top: 0, overflow: "auto", background: "var(--surface)",
    }}>
      <div style={{ padding: "0 8px 28px", display: "flex", alignItems: "center", gap: 12 }}>
        <img src="/logo.png" alt="Mo" style={{ width: 52, height: 52, display: "block" }} />
        <div>
          <div style={{ fontFamily: "Cormorant Garamond", fontSize: 22, fontWeight: 600, color: C.primaryDeep, lineHeight: 1 }}>Mo</div>
          <div style={{ fontSize: 12, color: "var(--muted-c)", marginTop: 3 }}>
            {settings.prenom ? `Bonjour, ${settings.prenom}` : "Suivi de cycle"}
          </div>
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
          position: "fixed", left: 0, right: 0, zIndex: 500,
          bottom: isMobile ? `calc(${BOTTOM_NAV_H}px + env(safe-area-inset-bottom, 0px))` : 0,
          background: "var(--surface)", borderTop: `2px solid ${C.primary}`,
          padding: "16px 18px 20px", boxShadow: "0 -4px 24px rgba(0,0,0,.12)",
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
        <main style={{
          flex: 1,
          padding: fullBleed ? 0 : isMobile ? `18px 16px calc(${hideNav ? 0 : BOTTOM_NAV_H}px + env(safe-area-inset-bottom, 0px) + 28px)` : "44px 52px",
          maxWidth: isMobile ? undefined : 1100, minWidth: 0,
        }}>
          {view === "accueil"    && <Accueil entries={entries} cycles={cycles} settings={settings} onSave={handleAdd} onUpdateSettings={updateSettings} onNavigate={navigate} focusDate={focusDate} onFocusConsumed={() => setFocusDate(null)} />}
          {view === "courbe"     && <Courbe entries={entries} cycles={cycles} onBack={() => navigate("accueil")} onNavigate={navigate} />}
          {view === "cycle"      && <CycleActuel entries={entries} cycles={cycles} onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete} currentCycleNum={currentCycleNum} isMobile={isMobile} />}
          {view === "calendrier" && <Calendrier entries={entries} cycles={cycles} onBack={() => navigate("accueil")} onPickDate={pickDate} />}
          {view === "historique" && <Historique entries={entries} cycles={cycles} isMobile={isMobile} onDeleteCycle={handleDeleteCycle} />}
          {view === "analyse"    && <Analyse entries={entries} cycles={cycles} />}
          {view === "assistant"  && <Assistant entries={entries} cycles={cycles} currentCycleNum={currentCycleNum} />}
          {view === "params"     && <Parametres settings={settings} onUpdate={setSettings} onNewCycle={handleNewCycle} currentCycleNum={currentCycleNum} entries={entries} />}
        </main>
      </div>
      {isMobile && !hideNav && (
        <BottomNav view={view} onNavigate={navigate} onMore={() => setPlusOpen(true)} hasUnsaved={hasUnsaved} />
      )}
      <PlusSheet open={plusOpen} onClose={() => setPlusOpen(false)} onNavigate={navigate}
        onOpenData={() => setDataModalOpen(true)} hasUnsaved={hasUnsaved} />
      <DataModal open={dataModalOpen} onClose={() => setDataModalOpen(false)}
        onLoad={handleLoad} hasUnsaved={hasUnsaved}
        entries={entries} cycles={cycles} settings={settings} />
    </>
  );
}
