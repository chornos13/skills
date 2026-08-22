// POC report + replay server — throwaway. Not production code.
// Reads poc.jsonl (one recorded exchange per line), serves a report at /,
// and re-runs any recorded request server-side at POST /replay/:i (no CORS).
// Binds 127.0.0.1 only — the records and replays carry live tokens.
import { createServer } from "node:http";
import { readFileSync } from "node:fs";

// Usage: node serve.mjs [records.jsonl] [port]   — fixed tool, never regenerated per run.
const FILE = process.argv[2] || "poc.jsonl";
const PORT = Number(process.argv[3]) || 8732;
const records = readFileSync(FILE, "utf8")
  .split("\n").filter(Boolean).map((l) => JSON.parse(l));

// ---- aggregates for the DevTools-style summary header (computed at render) ----
const bytesOf = (s) => (s ? Buffer.byteLength(s, "utf8") : 0);
const fmtSize = (n) => (n < 1024 ? n + " B" : (n / 1024).toFixed(1) + " KB");
const statusClass = (s) => (s >= 100 && s < 200 ? "s1" : s >= 200 && s < 300 ? "s2" : s >= 300 && s < 400 ? "s3" : s >= 400 && s < 500 ? "s4" : s ? "s5" : "s0");

let totalBytes = 0, okCount = 0, redirCount = 0, failCount = 0;
const hosts = new Set(), methods = new Set();
for (const r of records) {
  totalBytes += bytesOf(r.body) + bytesOf(r.response.body);
  const s = r.response.status;
  if (s >= 200 && s < 300) okCount++;
  else if (s >= 300 && s < 400) redirCount++;
  else if (s >= 400) failCount++;
  hosts.add(new URL(r.url).host);
  methods.add(r.method);
}
const hostLabel = hosts.size === 1 ? [...hosts][0] : hosts.size + " hosts";

// segmented status distribution bar (one cell per request, colored by class)
const distCells = records
  .map((r) => `<i class="seg ${statusClass(r.response.status)}" title="${r.response.status} ${r.response.statusText}"></i>`)
  .join("");

const page = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>POC Report · ${hostLabel}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root {
    color-scheme: dark;
    --bg:#0b0b0e; --surface:#131318; --surface-2:#1a1a21; --surface-3:#20202a; --line:#26262f;
    --text:#eaeaee; --text-2:#a0a0ac; --text-3:#6a6a77;
    --accent:#7c88ff; --accent-ink:#0b0b0e;
    /* method + status hues follow hoppscotch/DevTools semantics — color is reserved for meaning */
    --get:#3fb950; --post:#d29922; --put:#58a6ff; --patch:#bc8cff; --delete:#f85149; --head:#39c5cf; --options:#db6dc0; --def:#8a8a96;
    /* status: 1xx info · 2xx success · 3xx redirect · 4xx client-error · 5xx server-error */
    --s1:#58a6ff; --s2:#3fb950; --s3:#d29922; --s4:#f85149; --s5:#ff7b72;
    /* JSON tokens — distinct hue per type (Tokyo-Night lineage; strings green, numbers orange, keys cyan) */
    --j-key:#7dcfff; --j-str:#9ece6a; --j-num:#ff9e64; --j-bool:#bb9af7; --j-punc:#565f7a;
    --mono:"JetBrains Mono",ui-monospace,"SF Mono",Menlo,monospace;
    --sans:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  }
  * { box-sizing:border-box; }
  html { scroll-behavior:smooth; }
  body { margin:0; background:var(--bg); color:var(--text); font-family:var(--sans);
         font-size:14px; line-height:1.5; -webkit-font-smoothing:antialiased; text-rendering:optimizeLegibility; }

  /* ---------- DevTools-style summary header (translucent, floats over content) ---------- */
  .top { position:sticky; top:0; z-index:10;
         background:rgba(11,11,14,.7); backdrop-filter:blur(24px) saturate(180%); -webkit-backdrop-filter:blur(24px) saturate(180%); }
  .top::after { content:""; position:absolute; left:0; right:0; bottom:-18px; height:18px; pointer-events:none;
                background:linear-gradient(rgba(11,11,14,.55), rgba(11,11,14,0)); }
  .top__inner { max-width:960px; margin:0 auto; padding:16px 24px 14px; }
  .top__row { display:flex; align-items:center; gap:16px; }
  .top__id { display:flex; align-items:center; gap:11px; min-width:0; }
  .dot { flex:none; width:9px; height:9px; border-radius:50%; background:var(--accent); box-shadow:0 0 12px var(--accent); }
  .top__title { font-size:16px; font-weight:640; letter-spacing:-.02em; line-height:1.1; }
  .top__sub { font-family:var(--mono); font-size:11.5px; color:var(--text-3); letter-spacing:.01em; margin-top:1px; }
  .top__spacer { flex:1; }

  /* aggregate stat tiles — the critical at-a-glance metrics DevTools surfaces */
  .stats { display:flex; align-items:stretch; gap:8px; }
  .stat-tile { display:flex; flex-direction:column; gap:2px; padding:6px 12px; border-radius:9px;
               background:var(--surface); border:1px solid var(--line); min-width:64px; }
  .stat-tile .num { font-family:var(--mono); font-size:15px; font-weight:600; line-height:1.1; letter-spacing:-.01em; }
  .stat-tile .lab { font-size:10px; font-weight:600; letter-spacing:.5px; text-transform:uppercase; color:var(--text-3); }
  .num.ok{color:var(--s2);} .num.bad{color:var(--s5);}

  /* segmented status-distribution bar */
  .dist { display:flex; align-items:center; gap:10px; margin-top:12px; }
  .dist__bar { display:flex; gap:2px; flex:1; height:6px; }
  .dist .seg { flex:1; border-radius:2px; background:var(--sc); min-width:6px; }
  .seg.s1{--sc:var(--s1);} .seg.s2{--sc:var(--s2);} .seg.s3{--sc:var(--s3);} .seg.s4{--sc:var(--s4);} .seg.s5{--sc:var(--s5);} .seg.s0{--sc:var(--text-3);}
  .dist__legend { display:flex; gap:14px; font-family:var(--mono); font-size:11px; color:var(--text-2); white-space:nowrap; }
  .dist__legend b { font-weight:600; }
  .dist__legend .k { display:inline-block; width:7px; height:7px; border-radius:50%; margin-right:5px; vertical-align:middle; }

  .btn { font:inherit; font-weight:600; font-size:13px; border:0; border-radius:9px; padding:8px 14px;
         cursor:pointer; transition:transform .1s ease-out, filter .15s ease, border-color .15s ease, color .15s ease; }
  .btn:active { transform:scale(.97); }
  .btn--primary { color:var(--accent-ink); background:var(--accent);
                  box-shadow:0 1px 0 rgba(255,255,255,.18) inset, 0 8px 22px -10px var(--accent); }
  .btn--primary:hover { filter:brightness(1.08); }
  .btn--primary:disabled { opacity:.5; transform:none; cursor:default; box-shadow:none; }
  .btn--ghost { color:var(--text-2); background:var(--surface); border:1px solid var(--line); }
  .btn--ghost:hover { color:var(--text); border-color:#3a3a46; }
  .btn--sm { padding:4px 10px; font-size:12px; border-radius:7px; }

  /* ---------- request cards ---------- */
  .wrap { max-width:960px; margin:0 auto; padding:24px; display:flex; flex-direction:column; gap:16px; }
  .card { background:var(--surface); border:1px solid var(--line); border-radius:14px; overflow:hidden;
          box-shadow:0 1px 0 rgba(255,255,255,.02), 0 18px 40px -22px rgba(0,0,0,.8); }

  /* the DevTools "row": index · method · name · type · size · status */
  .row { display:flex; align-items:center; gap:13px; padding:14px 16px; }
  .row .idx { flex:none; font-family:var(--mono); font-size:11px; font-weight:600; color:var(--text-3);
              width:20px; text-align:right; }
  .method { flex:none; font-family:var(--mono); font-size:11px; font-weight:600; letter-spacing:.5px;
            padding:4px 8px; border-radius:6px; color:var(--def);
            background:color-mix(in srgb, var(--def) 15%, transparent);
            border:1px solid color-mix(in srgb, var(--def) 32%, transparent); }
  .m-GET{--def:var(--get);} .m-POST{--def:var(--post);} .m-PUT{--def:var(--put);}
  .m-PATCH{--def:var(--patch);} .m-DELETE{--def:var(--delete);} .m-HEAD{--def:var(--head);} .m-OPTIONS{--def:var(--options);}
  .names { min-width:0; flex:1; display:flex; flex-direction:column; gap:2px; }
  .names .lbl { font-weight:600; color:var(--text); letter-spacing:-.005em; line-height:1.3;
                white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .names .url { color:var(--text-3); font-family:var(--mono); font-size:11.5px;
                white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .meta { flex:none; display:flex; align-items:center; gap:9px; }
  .chip { font-family:var(--mono); font-size:11px; color:var(--text-2); padding:3px 8px; border-radius:6px;
          background:var(--surface-2); border:1px solid var(--line); white-space:nowrap; }
  .chip.dimc { color:var(--text-3); }
  .status { font-family:var(--mono); font-size:12px; font-weight:600; padding:4px 11px; border-radius:20px;
            color:var(--sc); background:color-mix(in srgb, var(--sc) 14%, transparent);
            border:1px solid color-mix(in srgb, var(--sc) 34%, transparent); white-space:nowrap; }
  .s1{--sc:var(--s1);} .s2{--sc:var(--s2);} .s3{--sc:var(--s3);} .s4{--sc:var(--s4);} .s5{--sc:var(--s5);} .s0{--sc:var(--text-3);}

  /* response meta strip — muted labels, status-colored value (hoppscotch ResponseMeta pattern) */
  .rmeta { display:flex; align-items:center; gap:14px; flex-wrap:wrap; font-family:var(--mono); font-size:12px;
           padding:9px 12px; border:1px solid var(--line); border-radius:9px; background:var(--surface-2); }
  .rmeta .m { display:inline-flex; align-items:baseline; gap:6px; }
  .rmeta .k { font-size:10px; font-weight:600; letter-spacing:.5px; text-transform:uppercase; color:var(--text-3); }
  .rmeta .v { color:var(--text-2); }
  .rmeta .v.code { color:var(--sc); font-weight:600; }
  .rstack { display:flex; flex-direction:column; gap:10px; }

  .body { padding:0 16px 16px; display:flex; flex-direction:column; gap:13px; }
  .divide { height:1px; background:var(--line); margin:1px 0 2px; opacity:.7; }
  .slabel { font-size:11px; font-weight:600; letter-spacing:.6px; text-transform:uppercase; color:var(--text-3);
            margin-bottom:7px; display:flex; align-items:center; gap:8px; }
  .slabel .cnt { font-family:var(--mono); letter-spacing:0; text-transform:none; color:var(--text-3); font-weight:500; }

  /* headers table — the #1 DevTools capability the old report lacked */
  .headers { display:grid; grid-template-columns:minmax(120px,auto) 1fr; gap:1px; background:var(--line);
             border:1px solid var(--line); border-radius:9px; overflow:hidden; font-family:var(--mono); font-size:12px; }
  .headers dt { background:var(--surface-2); color:var(--text-2); padding:6px 11px; margin:0; font-weight:500;
                overflow:hidden; text-overflow:ellipsis; }
  .headers dd { background:var(--surface); color:var(--text); padding:6px 11px; margin:0; word-break:break-all; }
  .headers .grp { grid-column:1/-1; background:var(--surface-3); color:var(--text-3); padding:5px 11px;
                  font-size:10px; font-weight:600; letter-spacing:.5px; text-transform:uppercase; }

  .viewer { border:1px solid var(--line); border-radius:9px; overflow:hidden; background:var(--surface-2); }
  .tabs { display:flex; align-items:center; gap:2px; padding:6px 6px 0; }
  .tab { font:inherit; font-size:12px; color:var(--text-3); background:transparent; border:0;
         padding:5px 11px; border-radius:7px 7px 0 0; cursor:pointer; transition:color .15s ease, background .2s ease; }
  .tab:hover { color:var(--text-2); }
  .tab:active { transform:scale(.96); }
  .tab.active { color:var(--text); background:var(--surface); }
  .tabs .size { margin-left:auto; padding-right:6px; font-family:var(--mono); font-size:11px; color:var(--text-3); }
  .vbody { margin:0; padding:12px 14px; background:var(--surface); font-family:var(--mono);
           font-size:12.5px; line-height:1.6; white-space:pre-wrap; word-break:break-word;
           max-height:340px; overflow:auto; }
  .j-key{color:var(--j-key);} .j-str{color:var(--j-str);} .j-num{color:var(--j-num);}
  .j-bool{color:var(--j-bool);} .j-punc{color:var(--j-punc);} .dim{color:var(--text-3);}

  details.fold { border:1px solid var(--line); border-radius:9px; background:var(--surface-2); }
  details.fold > summary { cursor:pointer; list-style:none; user-select:none; padding:9px 12px;
                          font-family:var(--mono); font-size:12px; color:var(--text-2);
                          display:flex; align-items:center; gap:8px; }
  details.fold > summary::-webkit-details-marker { display:none; }
  details.fold > summary .caret { color:var(--accent); transition:transform .15s; }
  details.fold[open] > summary .caret { transform:rotate(90deg); }
  details.fold > summary .spacer { margin-left:auto; }
  details.fold .fwrap { padding:0 12px 12px; }
  details.fold pre.curl { margin:0; padding:12px 14px; background:var(--bg); border:1px solid var(--line);
                     border-radius:7px; font-family:var(--mono); font-size:12.5px; line-height:1.6;
                     white-space:pre-wrap; word-break:break-all; color:#e6c98a; }

  .actions { display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
  .stat-line { font-family:var(--mono); font-size:12px; display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
  .ok-t{color:var(--s2);} .bad-t{color:var(--s5);}

  .cols { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  /* materialize on reveal — blur + scale + opacity together, not a flat fade */
  .cols.reveal { opacity:0; transform:scale(.985); filter:blur(4px); }
  .cols.reveal.in { opacity:1; transform:none; filter:blur(0);
    transition:opacity .3s ease, transform .34s cubic-bezier(.2,.7,.2,1), filter .3s ease; }

  @media (max-width:680px){
    .stats{display:none;}
    .cols{grid-template-columns:1fr;}
    .row{flex-wrap:wrap;}
    .names{order:3; flex-basis:100%;}
    .meta{margin-left:auto;}
  }
  @media (prefers-reduced-motion: reduce){
    html{scroll-behavior:auto;}
    * { transition-duration:.01ms !important; }
    .cols.reveal, .cols.reveal.in { filter:none; transform:none; }
    .btn:active, .tab:active { transform:none; }
  }
  @media (prefers-reduced-transparency: reduce){
    .top { background:var(--bg); backdrop-filter:none; -webkit-backdrop-filter:none; border-bottom:1px solid var(--line); }
    .top::after { display:none; }
  }
  @media (prefers-contrast: more){
    :root { --line:#4a4a56; --text-2:#c9c9d2; --text-3:#9a9aa6; }
    .method, .status, .chip { border-width:1.5px; }
  }
</style></head><body>
<header class="top"><div class="top__inner">
  <div class="top__row">
    <div class="top__id"><span class="dot"></span>
      <div><div class="top__title">POC Report</div>
        <div class="top__sub">${hostLabel} · ${[...methods].join(" ")}</div></div>
    </div>
    <div class="top__spacer"></div>
    <div class="stats">
      <div class="stat-tile"><span class="num">${records.length}</span><span class="lab">Requests</span></div>
      <div class="stat-tile"><span class="num ok">${okCount}</span><span class="lab">2xx</span></div>
      <div class="stat-tile"><span class="num bad">${failCount}</span><span class="lab">4xx/5xx</span></div>
      <div class="stat-tile"><span class="num">${fmtSize(totalBytes)}</span><span class="lab">Payload</span></div>
    </div>
    <button class="btn btn--ghost" id="replayAll">Replay all</button>
  </div>
  <div class="dist">
    <div class="dist__bar">${distCells}</div>
    <div class="dist__legend">
      <span><i class="k" style="background:var(--s2)"></i><b id="lg-ok">${okCount}</b> ok</span>
      <span><i class="k" style="background:var(--s5)"></i><b id="lg-bad">${failCount}</b> failed</span>
      <span id="lg-replay" class="dim">0 / ${records.length} replayed</span>
    </div>
  </div>
</div></header>

<main class="wrap" id="app"></main>
<script>
const records = ${JSON.stringify(records)};
const esc = (s) => String(s ?? "").replace(/[&<>]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const pretty = (s) => { if (!s) return ""; try { return JSON.stringify(JSON.parse(s), null, 2); } catch { return s; } };
const bytes = (s) => (s ? new TextEncoder().encode(s).length : 0);
const fmtSize = (n) => (n < 1024 ? n + " B" : (n / 1024).toFixed(1) + " KB");
const ctype = (h) => { for (const k in (h||{})) if (k.toLowerCase() === "content-type") return String(h[k]).split(";")[0]; return ""; };
const shortType = (ct) => (ct||"").replace("application/","").replace("text/","") || "—";
const statusCls = (s) => (s>=100&&s<200?"s1":s>=200&&s<300?"s2":s>=300&&s<400?"s3":s>=400&&s<500?"s4":s?"s5":"s0");

function hljson(raw) {
  return esc(raw).replace(
    /("(?:\\\\.|[^"\\\\])*"(\\s*:)?)|\\b(true|false|null)\\b|(-?\\d+(?:\\.\\d+)?(?:[eE][+-]?\\d+)?)/g,
    (m, str, colon, kw, num) => {
      if (str) return '<span class="' + (colon ? 'j-key' : 'j-str') + '">' + m + '</span>';
      if (kw)  return '<span class="j-bool">' + m + '</span>';
      if (num) return '<span class="j-num">' + m + '</span>';
      return m;
    }
  ).replace(/([{}\\[\\],])/g, '<span class="j-punc">$1</span>');
}
function curl(r) {
  let p = ["curl -i -X " + r.method + " '" + r.url + "'"];
  for (const [k, v] of Object.entries(r.headers || {})) p.push("-H '" + k + ": " + v + "'");
  if (r.body) p.push("--data '" + r.body + "'");
  return p.join(" \\\\\\n  ");
}
function respHeaders(obj, live) {
  const keys = Object.keys(obj || {});
  const rows = keys.map((k) => '<dt>' + esc(k) + '</dt><dd>' + esc(obj[k]) + '</dd>').join("")
    || '<dd class="dim" style="grid-column:1/-1">' + (live ? '(none captured)' : '(only content-type was recorded)') + '</dd>';
  return '<details class="fold" style="margin-top:10px"><summary><span class="caret">▸</span>Response headers' +
    '<span class="spacer cnt">' + keys.length + '</span></summary>' +
    '<div class="fwrap"><dl class="headers">' + rows + '</dl></div></details>';
}
function headersTable(reqH, resH, status, statusText) {
  const rows = (obj) => Object.entries(obj || {})
    .map(([k, v]) => '<dt>' + esc(k) + '</dt><dd>' + esc(v) + '</dd>').join("") || '<dd class="dim" style="grid-column:1/-1">(none)</dd>';
  return '<dl class="headers">' +
    '<div class="grp">Request headers</div>' + rows(reqH) +
    '<div class="grp">Response · ' + status + ' ' + esc(statusText) + '</div>' + rows(resH) + '</dl>';
}

const V = {}; let vid = 0;
function viewer(body, ct) {
  const id = "v" + (vid++);
  const raw = esc(body || "");
  const pj = body ? hljson(pretty(body)) : "";
  V[id] = { raw: raw || '<span class="dim">(empty)</span>', pretty: pj || '<span class="dim">(empty)</span>' };
  const sz = fmtSize(bytes(body));
  return '<div class="viewer" data-vid="' + id + '">' +
           '<div class="tabs" role="tablist" aria-label="body format">' +
             '<button class="tab active" role="tab" aria-selected="true" data-view="pretty">Pretty</button>' +
             '<button class="tab" role="tab" aria-selected="false" data-view="raw">Raw</button>' +
             '<span class="size">' + (ct ? esc(ct) + ' · ' : '') + sz + '</span></div>' +
           '<pre class="vbody" role="tabpanel">' + V[id].pretty + '</pre></div>';
}
// response meta strip — muted label + status-colored value (hoppscotch ResponseMeta.vue pattern)
function metaStrip(status, statusText, cls, type, size, ms) {
  const cell = (k, v, extra) => '<span class="m"><span class="k">' + k + '</span> <span class="v' + (extra || "") + '">' + v + '</span></span>';
  return '<div class="rmeta ' + cls + '">' +
    cell("Status", status + (statusText ? " " + esc(statusText) : ""), " code") +
    (type ? cell("Type", esc(type)) : "") +
    cell("Size", fmtSize(size)) +
    (ms != null ? cell("Time", ms + " ms") : "") +
  '</div>';
}

const app = document.getElementById("app");
records.forEach((r, i) => {
  const s = r.response.status, cls = statusCls(s);
  const reqCt = ctype(r.headers), resCt = ctype(r.response.headers);
  const size = bytes(r.body) + bytes(r.response.body);
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML =
    '<div class="row">' +
      '<span class="idx">' + (i + 1) + '</span>' +
      '<span class="method m-' + r.method + '">' + r.method + '</span>' +
      '<div class="names"><span class="lbl">' + esc(r.label) + '</span>' +
        '<span class="url">' + esc(r.url) + '</span></div>' +
      '<div class="meta">' +
        '<span class="chip dimc">' + esc(shortType(resCt)) + '</span>' +
        '<span class="chip">' + fmtSize(size) + '</span>' +
        '<span class="status ' + cls + '">' + s + ' ' + esc(r.response.statusText) + '</span>' +
      '</div>' +
    '</div>' +
    '<div class="body">' +
      '<div class="divide"></div>' +
      '<details class="fold"><summary><span class="caret">▸</span>Headers' +
        '<span class="spacer"></span></summary>' +
        '<div class="fwrap">' + headersTable(r.headers, r.response.headers, s, r.response.statusText) + '</div></details>' +
      (r.body ? '<div><div class="slabel">Request body</div>' + viewer(r.body, reqCt) + '</div>' : '') +
      '<details class="fold"><summary><span class="caret">▸</span>curl' +
        '<button class="btn btn--ghost btn--sm spacer" data-copy="' + i + '">copy</button></summary>' +
        '<div class="fwrap"><pre class="curl">' + esc(curl(r)) + '</pre></div></details>' +
      '<div class="actions"><button class="btn btn--primary" data-replay="' + i + '">▶ Replay live</button>' +
        '<span class="stat-line" id="stat' + i + '"></span></div>' +
      '<div><div class="slabel">Recorded response</div><div class="rstack">' +
        metaStrip(s, r.response.statusText, cls, resCt, bytes(r.response.body), null) +
        viewer(r.response.body, resCt) + '</div></div>' +
      '<div id="out' + i + '"></div>' +
    '</div>';
  app.appendChild(card);
});

let replayed = new Set();
function markReplayed(i) {
  replayed.add(i);
  document.getElementById("lg-replay").textContent = replayed.size + " / " + records.length + " replayed";
  document.getElementById("lg-replay").classList.toggle("dim", replayed.size === 0);
}

async function replay(i, btn) {
  btn.disabled = true; const label = btn.textContent; btn.textContent = "replaying…";
  const res = await fetch("/replay/" + i, { method: "POST" }).then((x) => x.json()).catch(() => ({ status: 0, statusText: "fetch failed", body: "", ms: 0 }));
  const rec = records[i].response;
  const sameStatus = res.status === rec.status, sameBody = (res.body || "") === (rec.body || "");
  const dSize = bytes(res.body) - bytes(rec.body);
  document.getElementById("stat" + i).innerHTML =
    (sameStatus ? '<span class="ok-t">● status matches</span>'
                : '<span class="bad-t">● status ' + rec.status + '→' + res.status + '</span>') +
    '<span class="dim">·</span>' +
    (sameBody ? '<span class="ok-t">body matches</span>' : '<span class="bad-t">body differs (' + (dSize >= 0 ? '+' : '') + fmtSize(Math.abs(dSize)).replace('B','B').replace('KB','KB') + ')</span>') +
    '<span class="dim">·</span><span class="dim">' + (res.ms || 0) + ' ms</span>';
  const out = document.getElementById("out" + i);
  const resCt = ctype(records[i].response.headers);
  out.innerHTML =
    '<div class="divide"></div>' +
    '<div class="slabel">Recorded vs replayed <span class="cnt">(live re-fire, ' + (res.ms || 0) + ' ms)</span></div>' +
    '<div class="cols reveal">' +
      '<div><div class="slabel">Recorded</div><div class="rstack">' +
        metaStrip(rec.status, rec.statusText, statusCls(rec.status), resCt, bytes(rec.body), null) +
        viewer(rec.body, resCt) + respHeaders(records[i].response.headers, false) + '</div></div>' +
      '<div><div class="slabel">Replayed now</div><div class="rstack">' +
        metaStrip(res.status, res.statusText, statusCls(res.status), ctype(res.headers), bytes(res.body), res.ms || 0) +
        viewer(res.body, ctype(res.headers)) + respHeaders(res.headers, true) + '</div></div>' +
    '</div>';
  requestAnimationFrame(() => out.querySelector(".cols").classList.add("in"));
  markReplayed(i);
  btn.disabled = false; btn.textContent = label;
}

app.addEventListener("click", async (e) => {
  const tab = e.target.closest(".tab");
  if (tab) {
    const v = tab.closest(".viewer");
    v.querySelectorAll(".tab").forEach((t) => { const on = t === tab; t.classList.toggle("active", on); t.setAttribute("aria-selected", String(on)); });
    v.querySelector(".vbody").innerHTML = V[v.dataset.vid][tab.dataset.view];
    return;
  }
  const copy = e.target.getAttribute("data-copy");
  if (copy !== null) {
    e.preventDefault();
    await navigator.clipboard.writeText(curl(records[copy]).replace(/\\\\\\n  /g, " "));
    e.target.textContent = "copied ✓"; setTimeout(() => (e.target.textContent = "copy"), 1200);
    return;
  }
  const i = e.target.getAttribute("data-replay");
  if (i !== null) return replay(Number(i), e.target);
});

document.getElementById("replayAll").addEventListener("click", async (e) => {
  const btn = e.currentTarget; btn.disabled = true; const label = btn.textContent; btn.textContent = "replaying…";
  const buttons = [...document.querySelectorAll("[data-replay]")];
  for (const b of buttons) { await replay(Number(b.getAttribute("data-replay")), b); }
  btn.disabled = false; btn.textContent = label;
});
</script></body></html>`;

createServer(async (req, res) => {
  if (req.url === "/") {
    res.writeHead(200, { "content-type": "text/html" });
    return res.end(page);
  }
  const m = req.url.match(/^\/replay\/(\d+)$/);
  if (m && req.method === "POST") {
    const r = records[Number(m[1])];
    const t0 = performance.now();
    try {
      const resp = await fetch(r.url, { method: r.method, headers: r.headers, body: r.body ?? undefined });
      const body = await resp.text();
      const ms = Math.round(performance.now() - t0);
      const headers = Object.fromEntries(resp.headers);
      res.writeHead(200, { "content-type": "application/json" });
      return res.end(JSON.stringify({ status: resp.status, statusText: resp.statusText, headers, body, ms }));
    } catch (err) {
      const ms = Math.round(performance.now() - t0);
      res.writeHead(200, { "content-type": "application/json" });
      return res.end(JSON.stringify({ status: 0, statusText: "fetch failed", body: String(err), ms }));
    }
  }
  res.writeHead(404); res.end("not found");
}).listen(PORT, "127.0.0.1", () => {
  console.log(`POC report → http://127.0.0.1:${PORT}/  (${records.length} requests, Ctrl-C to stop)`);
});
