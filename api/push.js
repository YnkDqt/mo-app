import webpush from "web-push";
import { Redis } from "@upstash/redis";

// Stockage des abonnements : Upstash Redis (Vercel Marketplace). Repli mémoire en local uniquement.
const URL_ = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const mem = new Map();
const store = URL_ && TOKEN
  ? (() => {
      const r = new Redis({ url: URL_, token: TOKEN });
      return {
        set: (k, v) => r.hset("mo:subs", { [k]: JSON.stringify(v) }),
        del: (k) => r.hdel("mo:subs", k),
        all: async () => Object.values((await r.hgetall("mo:subs")) || {}).map(v => (typeof v === "string" ? JSON.parse(v) : v)),
      };
    })()
  : {
      set: async (k, v) => { mem.set(k, v); },
      del: async (k) => { mem.delete(k); },
      all: async () => [...mem.values()],
    };

let ready = false;
function setup() {
  if (ready) return;
  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY } = process.env;
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) throw new Error("Clés VAPID manquantes");
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || "https://mo-app-gold.vercel.app", VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  ready = true;
}

const PAYLOAD = JSON.stringify({
  title: "Rappel du soir",
  body: "Il est l'heure de compléter ta journée",
  url: "/",
});

// Heure et date à Paris
function parisNow() {
  const d = new Date();
  const hour = parseInt(new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", hour: "2-digit", hour12: false }).format(d), 10) % 24;
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris" }).format(d);
  return { hour, date };
}

export default async function handler(req, res) {
  try {
    const body = req.method === "POST" ? (typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {}) : {};
    const action = req.query?.action || body.action;

    if (action === "key") {
      if (!process.env.VAPID_PUBLIC_KEY) return res.status(500).json({ error: "Clés VAPID manquantes" });
      return res.status(200).json({ key: process.env.VAPID_PUBLIC_KEY });
    }

    if (action === "subscribe") {
      const { subscription, hour } = body;
      if (!subscription?.endpoint) return res.status(400).json({ error: "Abonnement invalide" });
      const h = Math.min(23, Math.max(0, parseInt(hour, 10) || 20));
      await store.set(subscription.endpoint, { sub: subscription, hour: h, last: null });
      return res.status(200).json({ ok: true, hour: h });
    }

    if (action === "unsubscribe") {
      if (!body.endpoint) return res.status(400).json({ error: "Endpoint manquant" });
      await store.del(body.endpoint);
      return res.status(200).json({ ok: true });
    }

    if (action === "test") {
      setup();
      if (!body.subscription?.endpoint) return res.status(400).json({ error: "Abonnement invalide" });
      await webpush.sendNotification(body.subscription, PAYLOAD);
      return res.status(200).json({ ok: true });
    }

    if (action === "send") {
      const secret = process.env.CRON_SECRET;
      const given = (req.headers.authorization || "").replace(/^Bearer\s+/i, "") || req.query?.secret;
      if (!secret || given !== secret) return res.status(401).json({ error: "Non autorisé" });
      setup();
      const { hour, date } = parisNow();
      const stamp = `${date}T${hour}`;
      const results = [];
      for (const rec of await store.all()) {
        if (rec.hour !== hour || rec.last === stamp) continue;
        try {
          await webpush.sendNotification(rec.sub, PAYLOAD);
          await store.set(rec.sub.endpoint, { ...rec, last: stamp });
          results.push({ ok: true });
        } catch (e) {
          if (e.statusCode === 404 || e.statusCode === 410) await store.del(rec.sub.endpoint);
          results.push({ ok: false, status: e.statusCode || 0 });
        }
      }
      return res.status(200).json({ hour, date, sent: results.filter(r => r.ok).length, results });
    }

    return res.status(400).json({ error: "Action inconnue" });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Erreur serveur" });
  }
}
