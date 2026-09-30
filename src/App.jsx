import { useState, useMemo, useEffect, useCallback, useRef } from "react";
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
];

// ── Pertes : détail des règles ──
const FLUX_OPTS = [
  { value: "leger",       label: "Léger",       color: C.secondary },
  { value: "modere",      label: "Modéré",      color: C.yellow },
  { value: "abondant",    label: "Abondant",    color: C.primary },
  { value: "tres_abondant", label: "Très abondant", color: C.red },
];
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
];
const QUANTITE_GLAIRE_OPTS = [
  { value: "legere",   label: "Légère",   color: C.secondary },
  { value: "moyenne",  label: "Moyenne",  color: C.yellow },
  { value: "abondante",label: "Abondante",color: C.primary },
];

// ── Symptômes génériques ──
const HUMEUR_OPTS = [
  { value: "sereine",  label: "Sereine",  color: C.sage },
  { value: "irritable",label: "Irritable",color: C.yellow },
  { value: "triste",   label: "Triste",   color: C.lavender },
  { value: "anxieuse", label: "Anxieuse", color: C.red },
];
const ENERGIE_OPTS = [
  { value: "en_forme", label: "En forme", color: C.sage },
  { value: "normale",  label: "Normale",  color: C.yellow },
  { value: "fatiguee", label: "Fatiguée", color: C.red },
];
const LIBIDO_OPTS = [
  { value: "haute",  label: "Haute",  color: C.sage },
  { value: "normale",label: "Normale",color: C.yellow },
  { value: "basse",  label: "Basse",  color: C.muted },
];
const SOMMEIL_OPTS = [
  { value: "bon",      label: "Bon",      color: C.sage },
  { value: "moyen",    label: "Moyen",    color: C.yellow },
  { value: "difficile",label: "Difficile",color: C.red },
];
const DIGESTION_OPTS = [
  { value: "normale",   label: "Normale",   color: C.sage },
  { value: "ballonnee", label: "Ballonnée", color: C.yellow },
  { value: "douloureuse", label: "Douloureuse", color: C.red },
];
const PEAU_OPTS = [
  { value: "nette",  label: "Nette",  color: C.sage },
  { value: "grasse", label: "Grasse", color: C.yellow },
  { value: "boutons",label: "Boutons",color: C.red },
];
const APPETIT_OPTS = [
  { value: "normal", label: "Normal", color: C.sage },
  { value: "envies", label: "Envies", color: C.yellow },
  { value: "faible", label: "Faible", color: C.muted },
];
const DOULEURS_OPTS = [
  { value: "aucune",  label: "Aucune",  color: C.sage },
  { value: "legeres", label: "Légères", color: C.yellow },
  { value: "fortes",  label: "Fortes",  color: C.red },
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
  // Pertes détaillées
  flux: null,
  couleurRegles: null,
  caillots: null,
  spotting: null,
  // Symptômes
  humeur: null,
  energie: null,
  libido: null,
  sommeil: null,
  digestion: null,
  peau: null,
  appetit: null,
  douleurs: null,
  notesLibres: "",
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
  @keyframes floatBlobA { 0%,100% { transform: translate(-6%,-4%) scale(1); } 50% { transform: translate(4%,6%) scale(1.12); } }
  @keyframes floatBlobB { 0%,100% { transform: translate(6%,4%) scale(1.05); } 50% { transform: translate(-5%,-6%) scale(0.96); } }
  @keyframes breathe { 0%,100% { transform: scale(1); } 50% { transform: scale(1.015); } }
  @keyframes ringPulse { 0%,100% { opacity: .55; } 50% { opacity: .95; } }
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
  menstruelle:  C.red,
  folliculaire: C.primary,
  ovulatoire:   C.sage,
  luteale:      C.lavender,
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
  const joursRenseignes = entries.filter(e =>
    e.temperature || e.saignement || e.glaireSensation || e.glaireApparence ||
    e.humeur || e.energie || e.sommeil || e.digestion || e.peau || e.appetit || e.libido
  ).length;
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

// Une entrée a des données "Symptômes" / "Symptothermie" / "Pertes" ?
function hasSymptomes(e) {
  if (!e) return false;
  return !!(e.humeur || e.energie || e.libido || e.sommeil || e.digestion || e.peau || e.appetit || e.douleurs || e.notesLibres);
}
function hasSymptothermie(e) {
  if (!e) return false;
  return !!(e.temperature || e.glaireSensation || e.glaireApparence || e.colFermete || e.colOuverture);
}
function hasPertes(e) {
  if (!e) return false;
  return !!(e.saignement || e.flux || e.spotting || e.glaireApparence);
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

// ─── MODAL SYMPTÔMES ─────────────────────────────────────────────────────────
function SymptomesModal({ open, onClose, onSave, entry, date }) {
  const [form, setForm] = useState({});
  useEffect(() => {
    if (open) setForm(entry || {});
  }, [open, entry]);
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const handleSave = () => { onSave({ ...(entry || {}), ...form, date, id: entry?.id || `sym_${date}_${Date.now()}` }); onClose(); };

  const blocks = [
    { key: "humeur",   label: "Humeur",   opts: HUMEUR_OPTS },
    { key: "energie",  label: "Énergie",  opts: ENERGIE_OPTS },
    { key: "libido",   label: "Libido & vie sexuelle", opts: LIBIDO_OPTS },
    { key: "sommeil",  label: "Sommeil",  opts: SOMMEIL_OPTS },
    { key: "digestion",label: "Digestion",opts: DIGESTION_OPTS },
    { key: "peau",     label: "Peau",     opts: PEAU_OPTS },
    { key: "appetit",  label: "Appétit & envies", opts: APPETIT_OPTS },
    { key: "douleurs", label: "Douleurs & inconforts", opts: DOULEURS_OPTS },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Symptômes" subtitle={fmt(date)}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {blocks.map(b => (
          <div key={b.key}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted-c)", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".05em" }}>{b.label}</div>
            <PillSelect opts={b.opts} value={form[b.key]} onChange={v => upd(b.key, v)} nullable />
          </div>
        ))}

        {form.libido && (
          <div style={{ marginTop: -8 }}>
            <div style={{ fontSize: 12, color: "var(--muted-c)", marginBottom: 8 }}>Rapport sexuel</div>
            <PillSelect opts={RAPPORT_OPTS} value={form.rapport} onChange={v => upd("rapport", v)} nullable />
          </div>
        )}

        <Field label="Notes libres">
          <textarea placeholder="Alcool, stress, nuit agitée, voyage, maladie…" value={form.notesLibres || ""}
            onChange={e => upd("notesLibres", e.target.value)} />
        </Field>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
          <Btn variant="ghost" onClick={onClose}>Annuler</Btn>
          <Btn onClick={handleSave}>Enregistrer</Btn>
        </div>
      </div>
    </Modal>
  );
}

// ─── MODAL SYMPTOTHERMIE ─────────────────────────────────────────────────────
function SymptothermieModal({ open, onClose, onSave, entry, date }) {
  const [form, setForm] = useState({});
  useEffect(() => {
    if (open) setForm(entry || {});
  }, [open, entry]);
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const handleSave = () => { onSave({ ...(entry || {}), ...form, date, id: entry?.id || `sth_${date}_${Date.now()}` }); onClose(); };

  return (
    <Modal open={open} onClose={onClose} title="Symptothermie" subtitle={fmt(date)}>
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div className="form-grid">
          <Field label="Heure de prise">
            <input type="text" placeholder="ex: 7h00" value={form.heure || ""} onChange={e => upd("heure", e.target.value)} />
          </Field>
          <Field label="Température (°C)">
            <input type="number" step="0.01" min="35" max="39" placeholder="ex: 36.80"
              value={form.temperature || ""} onChange={e => upd("temperature", e.target.value ? parseFloat(e.target.value) : "")} />
          </Field>
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
            <div>
              <div style={{ fontSize: 12, color: "var(--muted-c)", marginBottom: 6 }}>Quantité</div>
              <PillSelect opts={QUANTITE_GLAIRE_OPTS} value={form.quantiteGlaire} onChange={v => upd("quantiteGlaire", v)} nullable />
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

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
          <Btn variant="ghost" onClick={onClose}>Annuler</Btn>
          <Btn onClick={handleSave}>Enregistrer</Btn>
        </div>
      </div>
    </Modal>
  );
}

// ─── MODAL PERTES ────────────────────────────────────────────────────────────
function PertesModal({ open, onClose, onSave, entry, date }) {
  const [form, setForm] = useState({});
  useEffect(() => {
    if (open) setForm(entry || {});
  }, [open, entry]);
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const handleSave = () => { onSave({ ...(entry || {}), ...form, date, id: entry?.id || `prt_${date}_${Date.now()}` }); onClose(); };

  return (
    <Modal open={open} onClose={onClose} title="Pertes" subtitle={fmt(date)}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted-c)", marginBottom: 12, textTransform: "uppercase", letterSpacing: ".06em" }}>
            Règles — Flux
          </div>
          <PillSelect opts={FLUX_OPTS} value={form.flux} onChange={v => upd("flux", v)} nullable />
        </div>

        {form.flux && (
          <>
            <div>
              <div style={{ fontSize: 12, color: "var(--muted-c)", marginBottom: 8 }}>Couleur</div>
              <PillSelect opts={COULEUR_REGLES_OPTS} value={form.couleurRegles} onChange={v => upd("couleurRegles", v)} nullable />
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--muted-c)", marginBottom: 8 }}>Caillots</div>
              <PillSelect opts={CAILLOTS_OPTS} value={form.caillots} onChange={v => upd("caillots", v)} nullable />
            </div>
          </>
        )}

        <div style={{ borderTop: "1px solid var(--border-c)", paddingTop: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted-c)", marginBottom: 12, textTransform: "uppercase", letterSpacing: ".06em" }}>
            Spotting
          </div>
          <PillSelect opts={SPOTTING_COULEUR_OPTS} value={form.spotting} onChange={v => upd("spotting", v)} nullable />
        </div>

        <div style={{ borderTop: "1px solid var(--border-c)", paddingTop: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted-c)", marginBottom: 12, textTransform: "uppercase", letterSpacing: ".06em" }}>
            Glaire cervicale — Apparence
          </div>
          <PillSelect opts={APPARENCE_OPTS} value={form.glaireApparence} onChange={v => upd("glaireApparence", v)} nullable />
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
          <Btn variant="ghost" onClick={onClose}>Annuler</Btn>
          <Btn onClick={handleSave}>Enregistrer</Btn>
        </div>
      </div>
    </Modal>
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

function PhaseWheel({ avgLen, ovMean, curseurJour, onChange, size = 260 }) {
  const svgRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const cx = size / 2, cy = size / 2, r = size / 2 - 16;
  const segments = phaseSegments(avgLen, ovMean);
  const uid = useRef(`w${Math.random().toString(36).slice(2, 8)}`).current;

  const dayToAngle = (day) => ((day - 1) / avgLen) * 360;
  const angleToDay = (angle) => {
    const day = Math.round((angle / 360) * avgLen) + 1;
    return Math.min(avgLen, Math.max(1, day));
  };

  const handlePointer = useCallback((clientX, clientY) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = clientX - rect.left - cx;
    const y = clientY - rect.top - cy;
    let angle = Math.atan2(y, x) * 180 / Math.PI + 90;
    if (angle < 0) angle += 360;
    onChange(angleToDay(angle));
  }, [avgLen]);

  useEffect(() => {
    if (!dragging) return;
    const move = (e) => {
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

  const handleAngle = dayToAngle(curseurJour);
  const handleRad = (handleAngle - 90) * Math.PI / 180;
  const hx = cx + r * Math.cos(handleRad);
  const hy = cy + r * Math.sin(handleRad);
  const handleColor = PHASE_COLORS[getPhaseForDay(curseurJour, avgLen, ovMean).phase];

  return (
    <svg ref={svgRef} width={size} height={size} style={{ touchAction: "none", overflow: "visible" }}>
      <defs>
        <filter id={`glow-${uid}`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="4.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {segments.map((s, i) => (
          <linearGradient key={i} id={`grad-${uid}-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={PHASE_COLORS[s.phase]} stopOpacity="0.65" />
            <stop offset="100%" stopColor={PHASE_COLORS[s.phase]} stopOpacity="1" />
          </linearGradient>
        ))}
      </defs>

      {/* Glow layer (blurred, derrière) — avec espacement entre phases */}
      {segments.map((s, i) => {
        const rawStart = dayToAngle(s.start);
        const rawEnd = dayToAngle(s.end + 1);
        const gap = Math.min(14, Math.max(4, (rawEnd - rawStart) * 0.4));
        const startA = rawStart + gap / 2;
        const endA = rawEnd - gap / 2;
        return (
          <path key={"g" + i}
            d={describeArc(cx, cy, r, startA, endA)}
            fill="none" stroke={PHASE_COLORS[s.phase]} strokeWidth={9} strokeLinecap="round"
            opacity={0.35} filter={`url(#glow-${uid})`} />
        );
      })}
      {/* Arc net — avec espacement entre phases */}
      {segments.map((s, i) => {
        const rawStart = dayToAngle(s.start);
        const rawEnd = dayToAngle(s.end + 1);
        const gap = Math.min(14, Math.max(4, (rawEnd - rawStart) * 0.4));
        const startA = rawStart + gap / 2;
        const endA = rawEnd - gap / 2;
        return (
          <path key={i}
            d={describeArc(cx, cy, r, startA, endA)}
            fill="none" stroke={`url(#grad-${uid}-${i})`} strokeWidth={5} strokeLinecap="round" />
        );
      })}

      {/* Halo derrière le curseur */}
      <circle cx={hx} cy={hy} r={18} fill={handleColor} opacity={0.25} filter={`url(#glow-${uid})`} />
      <circle cx={hx} cy={hy} r={12.5}
        fill={handleColor}
        stroke="var(--surface)" strokeWidth={3.5}
        style={{ cursor: "grab", filter: "drop-shadow(0 2px 6px rgba(0,0,0,.2))" }}
        onMouseDown={() => setDragging(true)}
        onTouchStart={() => setDragging(true)}
      />
      <circle cx={hx} cy={hy} r={4} fill="var(--surface)" opacity={0.9} style={{ pointerEvents: "none" }} />
    </svg>
  );
}

// ─── ÉCRAN D'ACCUEIL ─────────────────────────────────────────────────────────
function Accueil({ entries, cycles, settings, onSaveSymptomes, onSaveSymptothermie, onSavePertes }) {
  const currentCycleNum = useMemo(() => Math.max(1, ...entries.map(e => e.cycleNum || 1)), [entries]);
  const currentEntries = useMemo(() =>
    entries.filter(e => e.cycleNum === currentCycleNum).sort((a, b) => a.date.localeCompare(b.date)),
    [entries, currentCycleNum]
  );

  const cycleLengths = cycles.filter(c => c.dateFin && c.dateDebut)
    .map(c => Math.floor((new Date(c.dateFin) - new Date(c.dateDebut)) / 86400000) + 1);
  const avgLen = cycleLengths.length ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length) : 28;

  const cycleGroups = useMemo(() => {
    const g = {};
    entries.forEach(e => { (g[e.cycleNum] = g[e.cycleNum] || []).push(e); });
    return g;
  }, [entries]);
  const ovStats = useMemo(() => {
    const hist = Object.entries(cycleGroups).filter(([n]) => parseInt(n) < currentCycleNum).map(([, ents]) => ({ entries: ents }));
    return computeOvulationStats(hist);
  }, [cycleGroups, currentCycleNum]);
  const ovMean = ovStats.mean || 14;

  const todayCycleDay = useMemo(() => {
    if (!currentEntries.length) return 1;
    const today = new Date().toISOString().slice(0, 10);
    const start = currentEntries[0]?.date;
    if (!start) return 1;
    const diff = Math.floor((new Date(today) - new Date(start)) / 86400000) + 1;
    return Math.max(1, diff);
  }, [currentEntries]);

  const [curseurJour, setCurseurJour] = useState(todayCycleDay);
  useEffect(() => { setCurseurJour(todayCycleDay); }, [todayCycleDay]);

  const curseurDate = useMemo(() => {
    const start = currentEntries[0]?.date || new Date().toISOString().slice(0, 10);
    const d = new Date(start + "T00:00:00");
    d.setDate(d.getDate() + (curseurJour - 1));
    return d.toISOString().slice(0, 10);
  }, [currentEntries, curseurJour]);

  const phaseInfo = getPhaseForDay(curseurJour, avgLen, ovMean);
  const isToday = curseurDate === new Date().toISOString().slice(0, 10);
  const isFuture = curseurDate > new Date().toISOString().slice(0, 10);
  const joursAvantRegles = avgLen - curseurJour + 1;

  const entryForCurseur = entries.find(e => e.date === curseurDate);

  const gami = useMemo(() => computeGamification(entries), [entries]);

  const [modalOuvert, setModalOuvert] = useState(null); // "symptomes" | "symptothermie" | "pertes"

  const statusLabel = (has, filled) => isFuture ? "Le jour J" : filled ? "Terminé" : "Non renseigné";

  const cards = [
    { id: "symptomes", label: "Symptômes", icon: "📝", filled: hasSymptomes(entryForCurseur) },
    { id: "symptothermie", label: "Symptothermie", icon: "🌡️", filled: hasSymptothermie(entryForCurseur) },
    { id: "pertes", label: "Pertes", icon: "💧", filled: hasPertes(entryForCurseur) },
  ];

  const handleSave = (category, data) => {
    const merged = { ...(entryForCurseur || {}), ...data, date: curseurDate, cycleNum: currentCycleNum };
    if (category === "symptomes") onSaveSymptomes(merged);
    if (category === "symptothermie") onSaveSymptothermie(merged);
    if (category === "pertes") onSavePertes(merged);
  };

  const dateLabel = new Date(curseurDate + "T00:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="anim" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: "Cormorant Garamond", fontSize: 26, fontWeight: 600 }}>
            Bonjour{settings.prenom ? `, ${settings.prenom}` : ""}
          </div>
          <div style={{ fontSize: 12, color: "var(--muted-c)", marginTop: 2 }}>
            Niveau {gami.niveauNum} · {gami.nom}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: "var(--muted-c)" }}>{gami.xp}/{gami.xpMax} XP</div>
          <div style={{ width: 80, height: 5, borderRadius: 99, background: "var(--surface-2)", marginTop: 4, overflow: "hidden" }}>
            <div style={{ width: `${gami.progres}%`, height: "100%", background: C.primary, borderRadius: 99 }} />
          </div>
        </div>
      </div>

      <div style={{
        padding: "6px 16px", borderRadius: 99, background: "var(--surface-2)",
        fontSize: 12, fontWeight: 600, color: "var(--muted-c)", letterSpacing: ".04em",
        marginBottom: 20, textTransform: "uppercase",
      }}>
        {phaseInfo.phase === "menstruelle" && curseurJour <= 1 ? "J1 des règles" :
         phaseInfo.phase === "menstruelle" ? `J${curseurJour} des règles` :
         joursAvantRegles > 0 ? `J-${joursAvantRegles} avant règles` : "Règles imminentes"}
      </div>

      <div style={{ position: "relative", width: 260, height: 260, marginBottom: 4 }}>
        <PhaseWheel avgLen={avgLen} ovMean={ovMean} curseurJour={curseurJour} onChange={setCurseurJour} size={260} />

        {/* Orbe central : blobs flous animés + verre dépoli */}
        <div style={{ position: "absolute", inset: 42, borderRadius: "50%", overflow: "hidden" }}>
          <div style={{
            position: "absolute", inset: "-20%", borderRadius: "50%",
            background: `radial-gradient(circle, ${phaseInfo.color}90 0%, ${phaseInfo.color}00 65%)`,
            filter: "blur(22px)", animation: "floatBlobA 9s ease-in-out infinite",
            transition: "background 0.6s ease",
          }} />
          <div style={{
            position: "absolute", inset: "-15%", borderRadius: "50%",
            background: `radial-gradient(circle, ${phaseInfo.color}60 0%, transparent 70%)`,
            filter: "blur(28px)", animation: "floatBlobB 11s ease-in-out infinite",
            transition: "background 0.6s ease",
          }} />
          <div style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            background: `radial-gradient(circle at 32% 28%, ${C.white}55, transparent 45%),
                         radial-gradient(circle at 70% 75%, ${phaseInfo.color}45, transparent 55%),
                         radial-gradient(circle at 50% 50%, ${phaseInfo.color}22, ${phaseInfo.color}08 70%)`,
            border: `1px solid ${phaseInfo.color}35`,
            boxShadow: `inset 0 2px 24px ${phaseInfo.color}25, 0 8px 32px ${phaseInfo.color}30`,
            transition: "background 0.6s ease, border-color 0.6s ease",
          }} />
        </div>

        {/* Contenu texte centré, animation respiration douce */}
        <div style={{
          position: "absolute", inset: 42, borderRadius: "50%",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          pointerEvents: "none", animation: "breathe 6s ease-in-out infinite",
        }}>
          <div style={{ fontSize: 10.5, color: "var(--muted-c)", textTransform: "uppercase", letterSpacing: ".18em", fontWeight: 600 }}>Phase</div>
          <div style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 24, fontWeight: 700, color: phaseInfo.color,
            textTransform: "capitalize", letterSpacing: "-.01em", marginTop: 4,
            textShadow: `0 1px 16px ${phaseInfo.color}35`, transition: "color 0.6s ease",
          }}>
            {phaseInfo.label}
          </div>
          <div style={{ width: 26, height: 3, background: phaseInfo.color, opacity: 0.55, marginTop: 10, borderRadius: 99, transition: "background 0.6s ease" }} />
        </div>
      </div>

      <div style={{ fontSize: 13, color: "var(--muted-c)", marginBottom: 24, textTransform: "capitalize" }}>
        {isToday ? "Aujourd'hui, " : ""}{dateLabel}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, width: "100%", marginBottom: 20 }}>
        {cards.map(c => (
          <button key={c.id} onClick={() => !isFuture && setModalOuvert(c.id)} disabled={isFuture} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
            padding: "16px 10px", borderRadius: 16, border: "1px solid var(--border-c)",
            background: c.filled ? phaseInfo.color + "18" : "var(--surface)",
            cursor: isFuture ? "default" : "pointer", opacity: isFuture ? 0.5 : 1,
          }}>
            <span style={{ fontSize: 20 }}>{c.icon}</span>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{c.label}</span>
            <span style={{ fontSize: 11, color: c.filled ? phaseInfo.color : "var(--muted-c)" }}>
              {statusLabel(true, c.filled)}
            </span>
          </button>
        ))}
      </div>

      <SymptomesModal open={modalOuvert === "symptomes"} onClose={() => setModalOuvert(null)}
        onSave={(d) => handleSave("symptomes", d)} entry={entryForCurseur} date={curseurDate} />
      <SymptothermieModal open={modalOuvert === "symptothermie"} onClose={() => setModalOuvert(null)}
        onSave={(d) => handleSave("symptothermie", d)} entry={entryForCurseur} date={curseurDate} />
      <PertesModal open={modalOuvert === "pertes"} onClose={() => setModalOuvert(null)}
        onSave={(d) => handleSave("pertes", d)} entry={entryForCurseur} date={curseurDate} />
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
function Calendrier({ entries, cycles }) {
  const [monthOffset, setMonthOffset] = useState(0);

  const cycleGroups = useMemo(() => {
    const g = {};
    entries.forEach(e => { (g[e.cycleNum] = g[e.cycleNum] || []).push(e); });
    return g;
  }, [entries]);

  const cycleLengths = cycles.filter(c => c.dateFin && c.dateDebut)
    .map(c => Math.floor((new Date(c.dateFin) - new Date(c.dateDebut)) / 86400000) + 1);
  const avgLen = cycleLengths.length ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length) : 28;
  const ovStats = useMemo(() => computeOvulationStats(Object.values(cycleGroups).map(ents => ({ entries: ents }))), [cycleGroups]);

  const now = new Date();
  const viewDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const monthLabel = viewDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDow = (viewDate.getDay() + 6) % 7; // lundi = 0

  // Trouver, pour chaque cycle connu, sa date de début pour situer les jours
  const sortedCycles = cycles.slice().sort((a, b) => a.cycleNum - b.cycleNum);

  const phaseForDate = (dateStr) => {
    // Cycle réel qui contient cette date
    const cyc = sortedCycles.find(c => dateStr >= c.dateDebut && dateStr <= c.dateFin);
    if (cyc) {
      const start = new Date(cyc.dateDebut);
      const d = new Date(dateStr);
      const jour = Math.floor((d - start) / 86400000) + 1;
      return getPhaseForDay(jour, avgLen, ovStats.mean);
    }
    // Sinon, projection depuis le dernier cycle connu
    const last = sortedCycles[sortedCycles.length - 1];
    if (!last) return null;
    const lastStart = new Date(last.dateDebut);
    const d = new Date(dateStr);
    const diffFromStart = Math.floor((d - lastStart) / 86400000);
    if (diffFromStart < 0) return null;
    const jourDansProjection = ((diffFromStart % avgLen) + avgLen) % avgLen + 1;
    return getPhaseForDay(jourDansProjection, avgLen, ovStats.mean);
  };

  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="anim">
      <PageTitle sub="Vue d'ensemble par phase">Calendrier</PageTitle>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <button onClick={() => setMonthOffset(m => m - 1)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--muted-c)" }}>‹</button>
          <div style={{ fontFamily: "Cormorant Garamond", fontSize: 20, fontWeight: 600, textTransform: "capitalize" }}>{monthLabel}</div>
          <button onClick={() => setMonthOffset(m => m + 1)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--muted-c)" }}>›</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 6 }}>
          {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
            <div key={i} style={{ textAlign: "center", fontSize: 11, color: "var(--muted-c)", fontWeight: 600 }}>{d}</div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
          {cells.map((d, i) => {
            if (!d) return <div key={i} />;
            const dateStr = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            const phase = phaseForDate(dateStr);
            const isToday = dateStr === todayStr;
            return (
              <div key={i} style={{
                aspectRatio: "1", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: isToday ? 700 : 500,
                background: phase ? phase.color + "22" : "var(--surface-2)",
                color: phase ? phase.color : "var(--muted-c)",
                border: isToday ? `1.5px solid ${phase ? phase.color : C.primary}` : "1px solid transparent",
              }}>
                {d}
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 18, fontSize: 11, color: "var(--muted-c)" }}>
          {Object.entries(PHASE_LABELS).map(([key, label]) => (
            <span key={key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: PHASE_COLORS[key] }} />
              <span style={{ textTransform: "capitalize" }}>{label}</span>
            </span>
          ))}
        </div>
      </Card>

      <div style={{ fontSize: 12, color: "var(--muted-c)", marginTop: 14, textAlign: "center" }}>
        Les jours au-delà de l'historique réel sont des projections basées sur ta moyenne de cycle.
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
            min={new Date().toISOString().slice(0, 10)} />
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

const BOTTOM_NAV_H = 62;

function BottomNav({ view, onNavigate, onMore, hasUnsaved }) {
  const items = [
    { id: "historique", icon: "history",  label: "Historique" },
    { id: "cycle",       icon: "cycle",    label: "Cycle" },
    { id: "accueil",     icon: "home",     label: "Accueil", center: true },
    { id: "calendrier",  icon: "calendar", label: "Calendrier" },
    { id: "more",        icon: "more",     label: "Plus" },
  ];
  return (
    <div style={{
      position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 300,
      height: `calc(${BOTTOM_NAV_H}px + env(safe-area-inset-bottom, 0px))`,
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
      background: "var(--surface)", borderTop: "1px solid var(--border-c)",
      display: "flex", alignItems: "center", justifyContent: "space-around",
      boxShadow: "0 -4px 20px rgba(0,0,0,.06)",
    }}>
      {items.map(it => {
        if (it.center) {
          const active = view === it.id;
          return (
            <button key={it.id} onClick={() => onNavigate(it.id)} style={{
              width: 54, height: 54, borderRadius: "50%", border: "none", cursor: "pointer",
              marginTop: -24, flexShrink: 0, padding: 3,
              background: `conic-gradient(from 200deg, ${C.rose}, ${C.primary}, ${C.sage}, ${C.lavender}, ${C.rose})`,
              boxShadow: active ? `0 6px 20px ${C.primary}60` : "0 3px 12px rgba(0,0,0,.18)",
              transform: active ? "scale(1.04)" : "scale(1)",
              transition: "all .2s",
            }}>
              <span style={{
                width: "100%", height: "100%", borderRadius: "50%", background: "var(--surface)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <NavIcon name="home" size={18} color={active ? C.primaryDeep : "var(--muted-c)"} />
              </span>
            </button>
          );
        }
        const active = it.id !== "more" && view === it.id;
        return (
          <button key={it.id} onClick={() => it.id === "more" ? onMore() : onNavigate(it.id)} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            background: "none", border: "none", cursor: "pointer", padding: "4px 8px",
            color: active ? C.primary : "var(--muted-c)", position: "relative", minWidth: 44,
          }}>
            <NavIcon name={it.icon} size={21} color={active ? C.primary : "var(--muted-c)"} />
            <span style={{ fontSize: 10, fontWeight: active ? 600 : 500 }}>{it.label}</span>
            {it.id === "more" && hasUnsaved && (
              <span style={{ position: "absolute", top: 0, right: 6, width: 6, height: 6, borderRadius: "50%", background: C.primary }} />
            )}
          </button>
        );
      })}
    </div>
  );
}

function PlusSheet({ open, onClose, onNavigate, onOpenData, hasUnsaved }) {
  const items = [
    { id: "analyse",   icon: "chart",   label: "Analyse" },
    { id: "assistant", icon: "sparkle", label: "Assistant" },
    { id: "params",    icon: "gear",    label: "Paramètres" },
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
            <NavIcon name={it.icon} size={20} color={C.primary} />
            {it.label}
          </button>
        ))}
        <button onClick={() => { onOpenData(); onClose(); }} style={{
          display: "flex", alignItems: "center", gap: 14, padding: "14px 14px",
          borderRadius: 14, border: "none", background: "var(--surface-2)", cursor: "pointer",
          fontFamily: "inherit", fontSize: 15, color: "var(--text-c)", textAlign: "left", position: "relative",
        }}>
          <NavIcon name="save" size={20} color={C.primary} />
          Données
          {hasUnsaved && <span style={{ position: "absolute", top: 16, right: 16, width: 7, height: 7, borderRadius: "50%", background: C.primary }} />}
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

  const navigate = (id) => { setView(id); setPlusOpen(false); };

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
          padding: isMobile ? `18px 16px calc(${BOTTOM_NAV_H}px + env(safe-area-inset-bottom, 0px) + 28px)` : "44px 52px",
          maxWidth: isMobile ? undefined : 1100,
        }}>
          {view === "accueil"    && <Accueil entries={entries} cycles={cycles} settings={settings} onSaveSymptomes={handleAdd} onSaveSymptothermie={handleAdd} onSavePertes={handleAdd} />}
          {view === "cycle"      && <CycleActuel entries={entries} cycles={cycles} onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete} currentCycleNum={currentCycleNum} isMobile={isMobile} />}
          {view === "calendrier" && <Calendrier entries={entries} cycles={cycles} />}
          {view === "historique" && <Historique entries={entries} cycles={cycles} isMobile={isMobile} onDeleteCycle={handleDeleteCycle} />}
          {view === "analyse"    && <Analyse entries={entries} cycles={cycles} />}
          {view === "assistant"  && <Assistant entries={entries} cycles={cycles} currentCycleNum={currentCycleNum} />}
          {view === "params"     && <Parametres settings={settings} onUpdate={setSettings} onNewCycle={handleNewCycle} currentCycleNum={currentCycleNum} />}
        </main>
      </div>
      {isMobile && (
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
