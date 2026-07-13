import { useState, useEffect, useRef } from "react";
import mammoth from "mammoth";
import {
  LayoutDashboard, MessageSquare, Workflow, FileText,
  Play, Pause, Bot, Sparkles, Scale, Send, Check, Loader2,
  ChevronRight, ChevronLeft, ChevronUp, ChevronDown, Zap, X, Plus,
  Trash2, Download, Upload, Mail, Wand2, BadgeCheck, AlertTriangle,
  CircleDot, Activity, Bell, Eye, ArrowRight, Clock, Newspaper, Calendar, Pin,
  Settings, Copy, ExternalLink, RefreshCw
} from "lucide-react";

/* ============ tokens ============ */
const T = {
  ink: "#26221B", ink2: "rgba(38,34,27,.72)",
  gold: "#C9A84C", goldDark: "#6B5620",
  wine: "#9C3A32", green: "#5C8A5C", blue: "#5B7BA6",
};

const appStorage = {
  async get(k) { const v = localStorage.getItem(k); return v == null ? null : { value: v }; },
  async set(k, v) { localStorage.setItem(k, v); return {}; },
};
const CFG_KEY = "gab-cfg-v1";
const CFG_DEFAULT = { provider: "gemini", geminiKey: "", claudeKey: "", repoUrl: "", geminiModel: "gemini-2.5-flash", ghToken: "", sheetCsvUrl: "" };
function loadCfg() {
  try { return { ...CFG_DEFAULT, ...(JSON.parse(localStorage.getItem(CFG_KEY) || "{}")) }; }
  catch (e) { return { ...CFG_DEFAULT }; }
}
function saveCfgLS(c) { localStorage.setItem(CFG_KEY, JSON.stringify(c)); }

const CSS = `

/* utilities de layout (no artefato vinham do ambiente; aqui precisam existir) */
.flex{display:flex}.grid{display:grid}.flex-col{flex-direction:column}.flex-wrap{flex-wrap:wrap}
.items-center{align-items:center}.items-start{align-items:flex-start}.items-end{align-items:flex-end}
.items-baseline{align-items:baseline}.items-stretch{align-items:stretch}
.justify-between{justify-content:space-between}.justify-center{justify-content:center}.justify-end{justify-content:flex-end}
.gap-1{gap:4px}.gap-1\\.5{gap:6px}.gap-2{gap:8px}.gap-3{gap:12px}.gap-4{gap:16px}
.mb-1{margin-bottom:4px}.mb-2{margin-bottom:8px}.mb-3{margin-bottom:12px}.mb-4{margin-bottom:16px}.mb-5{margin-bottom:20px}.mb-6{margin-bottom:24px}
.mt-2{margin-top:8px}.mt-3{margin-top:12px}.mt-4{margin-top:16px}.mt-8{margin-top:32px}
.text-left{text-align:left}
@keyframes spin{to{transform:rotate(360deg)}}
.animate-spin{animation:spin 1s linear infinite}
button{font-family:inherit}
a{color:inherit}
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
* { box-sizing: border-box; }
.appfont { font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', Inter, 'Segoe UI', sans-serif; }
.mono { font-family: 'SF Mono', ui-monospace, 'Menlo', monospace; }

.bg { position: fixed; inset: 0; z-index: 0;
  background:
    radial-gradient(1100px 760px at 14% 8%, #D2C9B6 0%, rgba(210,201,182,0) 62%),
    radial-gradient(900px 640px at 86% 92%, #71685A 0%, rgba(113,104,90,0) 58%),
    radial-gradient(680px 480px at 82% 12%, rgba(124,140,104,.55) 0%, rgba(124,140,104,0) 62%),
    radial-gradient(760px 560px at 16% 88%, rgba(163,110,63,.4) 0%, rgba(163,110,63,0) 58%),
    linear-gradient(158deg, #B5AB99 0%, #968C7A 46%, #6E665A 100%);
}

.glass { background: rgba(248,246,241,.6); backdrop-filter: blur(32px) saturate(1.6); -webkit-backdrop-filter: blur(32px) saturate(1.6);
  border: 1px solid rgba(255,255,255,.55); box-shadow: 0 26px 64px rgba(35,30,22,.28), inset 0 1px 0 rgba(255,255,255,.6); }
.glass-d { background: rgba(33,31,27,.66); backdrop-filter: blur(26px) saturate(1.4); -webkit-backdrop-filter: blur(26px) saturate(1.4);
  border: 1px solid rgba(255,255,255,.14); box-shadow: 0 18px 44px rgba(18,15,11,.45), inset 0 1px 0 rgba(255,255,255,.08); color: #F3F1EB; }
.card { background: rgba(255,255,255,.58); border: 1px solid rgba(255,255,255,.68); border-radius: 24px;
  box-shadow: 0 10px 26px rgba(35,30,22,.10), inset 0 1px 0 rgba(255,255,255,.7); }

.cbtn { width: 54px; height: 54px; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,.4); border: 1px solid rgba(255,255,255,.55); box-shadow: 0 5px 16px rgba(35,30,22,.14);
  cursor: pointer; color: #3A362E; transition: transform .12s ease, background .15s ease; position: relative; }
.cbtn:hover { background: rgba(255,255,255,.68); transform: translateY(-1px); }
.cbtn.on { background: #C9A84C; color: #241F12; }
.cbtn:disabled { opacity: .5; cursor: default; transform: none; }

.pill { display: inline-flex; align-items: center; gap: 8px; border-radius: 999px; padding: 9px 16px;
  background: rgba(255,255,255,.5); border: 1px solid rgba(255,255,255,.6); font-size: 14px; color: #2E2A22; cursor: pointer; box-shadow: 0 4px 12px rgba(35,30,22,.08); }
.pill:hover { background: rgba(255,255,255,.66); }
.pill.act { background: #26221B; color: #F4F1EA; border-color: rgba(255,255,255,.2); }
.pill:disabled { opacity: .5; cursor: default; }
.btnp { display: inline-flex; align-items: center; gap: 8px; border-radius: 999px; padding: 11px 19px;
  background: rgba(30,28,24,.86); color: #F5F3ED; border: 1px solid rgba(255,255,255,.18); font-weight: 600; font-size: 14.5px;
  cursor: pointer; box-shadow: 0 10px 24px rgba(20,17,12,.32); }
.btnp:hover { background: rgba(42,39,33,.9); }
.btng { display: inline-flex; align-items: center; gap: 8px; border-radius: 999px; padding: 11px 19px;
  background: linear-gradient(180deg, #DABE6E 0%, #C2A044 100%); color: #241F12; border: 1px solid rgba(255,255,255,.5);
  font-weight: 700; font-size: 14.5px; cursor: pointer; box-shadow: 0 10px 24px rgba(120,94,36,.35); }
.btnp:disabled, .btng:disabled { opacity: .5; cursor: default; }

.in { width: 100%; font-size: 15.5px; padding: 13px 18px; border-radius: 999px; border: 1px solid rgba(255,255,255,.6);
  background: rgba(255,255,255,.52); color: #2B2720; outline: none; box-shadow: inset 0 1px 2px rgba(35,30,22,.07); }
.in:focus { border-color: rgba(201,168,76,.9); box-shadow: 0 0 0 3px rgba(201,168,76,.24); }
.ta { border-radius: 20px; resize: vertical; line-height: 1.55; }
.lbl { font-size: 13px; color: rgba(38,34,27,.72); margin-bottom: 5px; display: block; padding-left: 6px; }

.h1 { font-size: 38px; font-weight: 800; letter-spacing: -0.02em; color: #26221B; margin: 0; }
.sub { font-size: 15px; color: rgba(38,34,27,.72); margin-top: 5px; max-width: 660px; line-height: 1.5; }
.num { font-weight: 800; letter-spacing: -0.03em; }

.stamp { display: inline-flex; align-items: center; border-radius: 10px; padding: 4px 11px; white-space: nowrap;
  border: 1px solid rgba(201,168,76,.8); background: rgba(201,168,76,.16); color: #5E4B18; font-size: 12px; letter-spacing: .08em; font-weight: 600; cursor: inherit; }
.tagp { font-size: 11.5px; letter-spacing: .1em; border-radius: 999px; padding: 3px 9px; white-space: nowrap; font-weight: 600; }

.tl-dot { width: 30px; height: 30px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }

/* ticker */
.ticker { overflow: hidden; position: relative; -webkit-mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent); mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent); }
.ticker-track { display: inline-flex; gap: 30px; white-space: nowrap; animation: ticker 34s linear infinite; will-change: transform; }
.ticker:hover .ticker-track { animation-play-state: paused; }
@keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@media (prefers-reduced-motion: reduce) { .ticker-track { animation: none; } }

/* word modal */
.modal-bg { position: fixed; inset: 0; z-index: 80; background: rgba(20,17,12,.5); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; padding: 20px; }
.word { width: 100%; max-width: 720px; max-height: 88vh; border-radius: 14px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 40px 90px rgba(0,0,0,.5); background: #fff; }
.word-bar { display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: linear-gradient(180deg,#2B579A,#1F4482); color: #fff; }
.word-tool { display: flex; gap: 6px; padding: 6px 14px; background: #F3F2F1; border-bottom: 1px solid #E1DFDD; }
.word-page { flex: 1; overflow-y: auto; background: #EAE9E8; padding: 24px; }
.word-sheet { background: #fff; max-width: 560px; margin: 0 auto; padding: 48px 54px; box-shadow: 0 2px 10px rgba(0,0,0,.15); min-height: 400px; font-family: Garamond, 'Times New Roman', serif; color: #1C2433; font-size: 15px; line-height: 1.6; }

.scroll-thin::-webkit-scrollbar { width: 6px; height: 6px; }
.scroll-thin::-webkit-scrollbar-thumb { background: rgba(38,34,27,.22); border-radius: 3px; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(7px); } to { opacity: 1; transform: none; } }
.fade-up { animation: fadeUp .3s ease both; }
@keyframes pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: .35; transform: scale(.7); } }
.pulse { animation: pulse 1.7s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .fade-up { animation: none; } .cbtn:hover { transform: none; } .pulse { animation: none; } }

.dock { position: fixed; left: 18px; top: 50%; transform: translateY(-50%); z-index: 30;
  display: flex; flex-direction: column; gap: 12px; padding: 14px 12px; border-radius: 999px; }
.panel-wrap { position: relative; z-index: 10; min-height: 100vh; display: flex; justify-content: center; align-items: stretch; padding: 24px 24px 24px 104px; }
.panel { width: 100%; max-width: 1060px; border-radius: 30px; display: flex; flex-direction: column; overflow: hidden; }
.panel-head { display: flex; align-items: center; gap: 10px; padding: 15px 22px; border-bottom: 1px solid rgba(255,255,255,.4); }
.panel-body { flex: 1; overflow-y: auto; padding: 24px 26px 30px; display: flex; flex-direction: column; }
.panel-foot { display: flex; flex-wrap: wrap; gap: 5px 16px; align-items: center; padding: 10px 22px; border-top: 1px solid rgba(255,255,255,.4); font-size: 11px; color: rgba(38,34,27,.6); }

.toast { position: fixed; left: 50%; transform: translateX(-50%); bottom: 26px; z-index: 90;
  border-radius: 999px; padding: 12px 18px; display: flex; gap: 10px; align-items: center; }

@media (max-width: 760px) {
  .panel-wrap { padding: 12px 10px 96px; }
  .panel { border-radius: 26px; }
  .panel-body { padding: 18px 16px 24px; }
  .dock { left: 50%; right: auto; top: auto; bottom: 12px; transform: translateX(-50%); flex-direction: row; padding: 10px 14px; }
  .h1 { font-size: 27px; }
  .toast { bottom: 86px; }
  .hide-m { display: none !important; }
}
`;


/* ============ integrações reais ============ */
function parseRepo(cfg) {
  const m = (cfg.repoUrl || "").match(/github\.com\/([^\/\s]+)\/([^\/\s]+)/);
  return m ? { owner: m[1], repo: m[2].replace(/\.git$/, "") } : null;
}
function ghHeaders(cfg) {
  const h = { Accept: "application/vnd.github+json" };
  if (cfg.ghToken) h.Authorization = "Bearer " + cfg.ghToken;
  return h;
}
async function listarArquivosRobos(cfg) {
  const r = parseRepo(cfg);
  if (!r) throw new Error("Configure o repositório dos robôs em Ajustes.");
  const res = await fetch(`https://api.github.com/repos/${r.owner}/${r.repo}/contents/data`, { headers: ghHeaders(cfg) });
  if (res.status === 404) throw new Error("Pasta data ainda não existe no repositório (rode o robô uma vez).");
  if (res.status === 403) throw new Error("GitHub limitou as consultas agora. Tente de novo em alguns minutos ou cole um token em Ajustes.");
  if (!res.ok) throw new Error("GitHub respondeu " + res.status);
  const lista = await res.json();
  return (Array.isArray(lista) ? lista : []).filter((f) => f.name.endsWith(".json")).sort((a, b) => (a.name < b.name ? 1 : -1));
}
async function dispararRobo(cfg, inputs) {
  const r = parseRepo(cfg);
  if (!r) return { ok: false, msg: "Configure o repositório dos robôs em Ajustes." };
  if (!cfg.ghToken) return { ok: false, msg: "Para disparar daqui, cole o token do GitHub em Ajustes (1 minuto para criar)." };
  const res = await fetch(`https://api.github.com/repos/${r.owner}/${r.repo}/actions/workflows/robos.yml/dispatches`, {
    method: "POST", headers: { ...ghHeaders(cfg), "Content-Type": "application/json" },
    body: JSON.stringify({ ref: "main", inputs }),
  });
  if (res.status === 204) return { ok: true, msg: "Robô disparado. O resultado chega na sincronização em 2 a 4 minutos." };
  if (res.status === 401 || res.status === 403) return { ok: false, msg: "O token não tem permissão de Actions neste repositório. Refaça o token (Actions: leitura e escrita)." };
  if (res.status === 404) return { ok: false, msg: "Não achei o workflow robos.yml no repositório. Confira se a pasta .github subiu." };
  return { ok: false, msg: "GitHub respondeu " + res.status + " ao disparar." };
}
function montarPromptClaude(titulo, dados) {
  return `Você é o assistente do escritório Adriana Matos Advocacia (TCE/MA). Tarefa: ${titulo}.\nUse SOMENTE os dados abaixo, não invente fatos, números de processo nem datas; onde faltar, escreva [PREENCHER]. Documentos formais em Garamond 12. Nunca use travessões.\n\n=== DADOS EXTRAÍDOS PELO ROBÔ/SISTEMA ===\n${dados}`;
}
async function abrirNoClaude(titulo, dados, toast) {
  const texto = montarPromptClaude(titulo, dados);
  try { await navigator.clipboard.writeText(texto); } catch (e) {}
  window.open("https://claude.ai/new?q=" + encodeURIComponent(texto.slice(0, 6000)), "_blank");
  if (toast) toast("Prompt copiado e Claude aberto. Se o campo vier vazio, é só colar.");
}
function parseCsvPrazos(txt) {
  const linhas = txt.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const sep = (linhas[0] || "").includes(";") ? ";" : ",";
  const rows = [];
  for (const l of linhas) {
    const c = l.split(sep).map((x) => x.replace(/^"|"$/g, "").trim());
    const dias = parseInt(c[2], 10);
    if (!c[0] || isNaN(dias)) continue;
    rows.push({ title: c[0], who: c[1] || "", days: dias });
  }
  return rows;
}

/* ============ IA ============ */
const OFFICE_CTX = `Contexto: escritório Adriana Matos Advocacia (São Luís, MA), atuação perante o TCE/MA para cerca de 35 clientes municipais (prefeituras, câmaras municipais e ex-gestores). Equipe: Dra. Adriana Santos Matos, Dra. Bruna Raquel Silva Machado e o estagiário Carlos. Rotinas: monitoramento diário do Diário Oficial do TCE/MA, informativos timbrados por município, relatórios de acompanhamento processual, petições (prescrição intercorrente, prorrogação de prazo, sustentação oral) e preparação de pautas do Pleno. Documentos formais em Garamond 12. Nunca use travessões em nenhum texto.`;

async function askClaude(messages, system) {
  const cfg = loadCfg();
  if (cfg.provider === "claude" && cfg.claudeKey) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": cfg.claudeKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1200, system, messages }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message || "erro da API Claude");
    return (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
  }
  if (cfg.geminiKey) {
    const contents = messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/" + (cfg.geminiModel || "gemini-2.5-flash") + ":generateContent?key=" + cfg.geminiKey,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ system_instruction: { parts: [{ text: system || "" }] }, contents }) }
    );
    const data = await res.json();
    if (data.error) {
      const e = new Error(data.error.message || "erro da API Gemini");
      if (data.error.code === 429) e.friendly = "A IA gratuita atingiu o limite por minuto. Espere um pouco e tente de novo.";
      throw e;
    }
    const parts = (((data.candidates || [])[0] || {}).content || {}).parts || [];
    const txt = parts.map((pt) => pt.text || "").join("\n").trim();
    if (!txt) { const e = new Error("resposta vazia do Gemini"); e.friendly = "A IA não devolveu texto. Tente de novo."; throw e; }
    return txt;
  }
  const e = new Error("SEM_CHAVE");
  e.friendly = "Configure uma chave de IA em Ajustes: a do Gemini é gratuita (aistudio.google.com).";
  throw e;
}

function parseJson(text) {
  const clean = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = Math.min(...["{", "["].map((c) => { const i = clean.indexOf(c); return i === -1 ? Infinity : i; }));
  if (start === Infinity) throw new Error("sem JSON na resposta");
  return JSON.parse(clean.slice(start));
}

function downloadDoc(filename, bodyHtml) {
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><style>
@page{size:A4;margin:2.5cm 2cm;} body{font-family:Garamond,serif;font-size:12pt;color:#1C2433;line-height:1.5;}
h1{font-size:15pt;color:#1B2A4A;} h2{font-size:13pt;color:#1B2A4A;}
.hdr{border-bottom:3pt solid #C9A84C;padding-bottom:8pt;margin-bottom:16pt;} .hn{font-size:14pt;color:#1B2A4A;font-weight:bold;letter-spacing:2pt;} .hs{font-size:9pt;color:#6B7280;}
table{border-collapse:collapse;width:100%;} td,th{border:0.5pt solid #C9A84C;padding:5pt;font-size:11pt;text-align:left;}
.ftr{margin-top:24pt;border-top:1pt solid #C9A84C;padding-top:6pt;font-size:9pt;color:#6B7280;text-align:center;}</style></head><body>
<div class="hdr"><div class="hn">ADRIANA MATOS ADVOCACIA</div><div class="hs">Barros, Fernandes &amp; Borgneth &middot; OAB/MA 18.101 &middot; S&atilde;o Lu&iacute;s, MA</div></div>
${bodyHtml}<div class="ftr">Minuta gerada pelo sistema do escrit&oacute;rio. Sujeita &agrave; revis&atilde;o das advogadas antes de qualquer uso externo.</div></body></html>`;
  const blob = new Blob(["\ufeff", html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename.endsWith(".doc") ? filename : filename + ".doc";
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

function downloadCsv(filename, rows) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

async function writeDocument(template, caseData, titleHint) {
  const base = template.base ? `\n\nEstrutura de referência extraída do modelo original (siga o formato):\n${template.base.slice(0, 8000)}` : "";
  const out = await askClaude(
    [{ role: "user", content: `Redija o conteúdo de um documento do escritório usando o modelo ${template.id} (${template.name}; ${template.spec}; uso: ${template.uses}).${base}\n\nDados do caso, colados por quem opera o sistema:\n${caseData.slice(0, 8000)}\n\nRegras: escreva SOMENTE o corpo do documento em HTML simples (h1, h2, p, table quando fizer sentido). Não invente timbrado, cabeçalho de escritório nem rodapé: o sistema aplica isso. Não invente fatos, números de processo nem datas que não estejam nos dados. Onde faltar informação, escreva [PREENCHER]. Sem markdown, sem comentários.${titleHint ? ` Título do documento: ${titleHint}.` : ""}` }],
    OFFICE_CTX
  );
  return out.replace(/```html/gi, "").replace(/```/g, "").trim();
}

/* ============ dados iniciais ============ */
const FLOW_SCHEMA = `Schema de fluxo (JSON): { "id": string, "name": string, "desc": string, "active": boolean, "steps": [ { "type": "gatilho"|"robo"|"ia"|"regra"|"doc"|"envio", "title": string, "desc": string opcional, "cond": string opcional } ] }. Todo fluxo que gera documento deve terminar passando pela fila de revisão antes de qualquer envio.`;

const DEFAULT_FLOWS = [
  { id: "doe14", name: "Diário Oficial · 14h", desc: "Lê a edição do dia, classifica o que cita a carteira e gera os informativos.", active: true, steps: [
    { type: "gatilho", title: "Nova edição do DOE/TCE-MA", desc: "Verificação automática em dia útil, antes das 14h." },
    { type: "robo", title: "Baixar a edição e extrair as publicações", desc: "Módulo robô local (fase 1)." },
    { type: "ia", title: "Classificar as publicações", desc: "Cita cliente da carteira? É multa, edital, pauta ou decisão? Há prazo?" },
    { type: "regra", title: "Condição de urgência", cond: "Se houver multa aplicada e o recurso já tiver sido negado: registrar o prazo, marcar como URGENTE e avisar a Dra. Adriana no mesmo minuto." },
    { type: "doc", title: "Gerar informativo · TIMB-01", desc: "A IA escreve o conteúdo. O sistema aplica o modelo pelo identificador." },
    { type: "envio", title: "Fila de revisão + e-mail de repasse", desc: "Nada sai do escritório sem aprovação." },
  ]},
  { id: "spe", name: "Relatório de processos · SPE", desc: "Pesquisa por gestor e município, confere processo a processo e monta o relatório.", active: true, steps: [
    { type: "gatilho", title: "Pedido em Acompanhamentos", desc: "Nome do gestor + município jurisdicionado." },
    { type: "robo", title: "Pesquisar no Consulta SPE e conferir um a um", desc: "O filtro do SPE erra. O robô abre cada processo e confirma interessado e período. Fase 1." },
    { type: "robo", title: "Baixar andamentos e peças", desc: "Fase 1." },
    { type: "regra", title: "Condição de escopo", cond: "Considerar apenas processos do gestor no período informado. Nome parecido de outro interessado: descartar e registrar no log." },
    { type: "ia", title: "Redigir o relatório", desc: "Análise por processo, no padrão do escritório." },
    { type: "doc", title: "Gerar documento · REL-02", desc: "Relatório de Acompanhamento Processual." },
    { type: "envio", title: "Fila de revisão", desc: "Aguarda aprovação antes de ir ao cliente." },
  ]},
  { id: "pauta", name: "Informativo de pauta · Pleno", desc: "A pauta do Pleno sai NO Diário (qui/sex, às vezes qua); a sessão é na quarta seguinte. O robô lê a pauta e prepara o material por item.", active: true, steps: [
    { type: "gatilho", title: "Pauta publicada no Diário", desc: "Normalmente quinta ou sexta (às vezes quarta); sessão do Pleno na quarta seguinte." },
    { type: "robo", title: "Cruzar itens com a carteira", desc: "35 clientes verificados por regra. Fase 1." },
    { type: "regra", title: "Condição de preparo", cond: "Se houver item de cliente na pauta: preparar o material do processo e perguntar às advogadas se haverá sustentação oral." },
    { type: "doc", title: "Gerar informativo · TIMB-01", desc: "Um por município citado, com a data da sessão em destaque." },
    { type: "envio", title: "Fila de revisão", desc: "Com alerta de data da sessão." },
  ]},
];

const DEFAULT_TEMPLATES = [
  { id: "TIMB-01", name: "Informativo timbrado", spec: "Página única · fundo timbrado ouro e azul · um município por documento", uses: "Editais, decisões e pautas", base: "" },
  { id: "REL-02", name: "Relatório de acompanhamento", spec: "Multipágina · tabela de fases por processo · exercícios por gestor", uses: "Prestações de contas", base: "" },
  { id: "PET-03", name: "Petição padrão", spec: "Garamond 12 · endereçamento e espaçamento no padrão de referência do escritório", uses: "Prescrição intercorrente, prorrogações", base: "" },
  { id: "OFI-04", name: "E-mail de protocolo", spec: "Texto padrão SEPRO · anexos nomeados por processo", uses: "Protocolos e comunicações", base: "" },
];

const DEFAULT_CATEGORIES = [
  { id: "gov", name: "Prestação de Contas Anual de Governo", params: "Interessado: Prefeito · Natureza: PCG · Exercício corrente", period: "Semanal", model: "REL-02" },
  { id: "gest", name: "Prestação de Contas Anual de Gestores", params: "Interessado: Ordenador de despesa · Natureza: PCA · Exercício corrente", period: "Semanal", model: "REL-02" },
];

const PERIODS = ["Diária", "Semanal", "Quinzenal", "Mensal"];

const STEP_META = {
  gatilho: { label: "GATILHO", icon: Zap, tone: "#26221B" },
  robo: { label: "ROBÔ", icon: Bot, tone: "#5B7BA6" },
  ia: { label: "IA", icon: Sparkles, tone: "#C9A84C" },
  regra: { label: "REGRA", icon: Scale, tone: "#7A6E58" },
  doc: { label: "DOCUMENTO", icon: FileText, tone: "#5C8A5C" },
  envio: { label: "ENVIO", icon: Send, tone: "#8B857A" },
};
const STEP_ORDER = ["gatilho", "robo", "ia", "regra", "doc", "envio"];
const TAG_TONES = { MULTA: "#9C3A32", EDITAL: "#8A6D1F", PAUTA: "#3D4F73", DECISAO: "#3F6B3F", "DECISÃO": "#3F6B3F", OUTRO: "#6B665C" };
const FEED_ICON = { prazo: Clock, despacho: Activity, pauta: Calendar, doc: FileText, doe: Newspaper, info: Bell };
const KIND_TAG = {
  prazo: { label: "PRAZO", color: "#9C3A32" },
  despacho: { label: "MOVIMENTAÇÃO", color: "#4A6FA5" },
  pauta: { label: "PAUTA", color: "#3D4F73" },
  doc: { label: "DOCUMENTO", color: "#4F7A4F" },
  doe: { label: "DIÁRIO", color: "#8A6D1F" },
  info: { label: "SISTEMA", color: "#6B665C" },
};
const DEFAULT_FEED = [];

/* ============ átomos ============ */
function Title({ children, sub }) {
  return <div className="mb-5"><h2 className="h1">{children}</h2>{sub && <p className="sub">{sub}</p>}</div>;
}
function Spin() { return <Loader2 size={15} className="animate-spin" />; }

function WordModal({ doc, onClose }) {
  if (!doc) return null;
  const temBase = !!doc.html;
  return (
    <div className="modal-bg fade-up" onClick={onClose}>
      <div className="word" onClick={(e) => e.stopPropagation()} style={{ background: "transparent", boxShadow: "none" }}>
        <div className="glass" style={{ borderRadius: 20, overflow: "hidden", display: "flex", flexDirection: "column", maxHeight: "88vh" }}>
          <div className="flex items-center gap-2" style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,.45)" }}>
            <Eye size={16} style={{ color: T.goldDark }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: T.ink, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{doc.name || doc.id} · prévia de leitura</span>
            <button onClick={onClose} className="cbtn" style={{ width: 32, height: 32 }}><X size={15} /></button>
          </div>
          <div className="word-page scroll-thin" style={{ background: "rgba(234,233,232,.6)" }}>
            {temBase ? (
              <div className="word-sheet" dangerouslySetInnerHTML={{ __html: doc.html }} />
            ) : (
              <div className="word-sheet">
                <h1 style={{ fontSize: "17pt" }}>{doc.name}</h1>
                <p><b>{doc.spec || ""}</b></p>
                {doc.uses && <p>Uso: {doc.uses}</p>}
                <p style={{ color: "#9C3A32" }}>Este modelo ainda não tem estrutura real extraída. Envie o .docx original do escritório no botão Extrair modelo e a prévia passa a mostrar o documento de verdade.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ Hoje ============ */
function NewsBand({ feed, setFeed }) {
  const items = feed.length ? feed : [{ id: 0, kind: "info", text: "Sem novidades ainda. Conforme o escritório usar o sistema, tudo aparece aqui.", ago: "" }];
  const hero = items[0];
  const Hks = FEED_ICON[hero.kind] || Bell;
  const rest = items.slice(1);
  const cards = [...rest.filter((x) => x.pinned), ...rest.filter((x) => !x.pinned)].slice(0, 6);
  const marquee = items.length > 1 ? [...items, ...items] : [];
  const togglePin = (id) => { if (setFeed) setFeed(feed.map((f) => (f.id === id ? { ...f, pinned: !f.pinned } : f))); };

  return (
    <div style={{ marginBottom: 20 }}>
      {/* faixa de destaque */}
      <div className="glass-d" style={{ borderRadius: 18, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, marginBottom: cards.length ? 12 : 0 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(201,168,76,.2)", color: T.goldDark, border: "1px solid rgba(201,168,76,.6)", borderRadius: 999, padding: "6px 12px", fontSize: 12, fontWeight: 700, letterSpacing: ".05em", flexShrink: 0 }}>
          <span className="pulse" style={{ width: 7, height: 7, borderRadius: 999, background: "#C9A84C" }} /> NOVIDADES
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 17.5, fontWeight: 600, color: "#F8F5EE", lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{hero.text}</div>
          <div style={{ fontSize: 12.5, color: "rgba(248,245,238,.55)", marginTop: 2 }}>última atualização · {hero.ago || "agora"}</div>
        </div>
        <Hks size={22} style={{ color: T.gold, flexShrink: 0 }} />
      </div>

      {/* caixas de novidade */}
      {cards.length > 0 && (
        <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(215px, 1fr))" }}>
          {cards.map((c) => {
            const tag = KIND_TAG[c.kind] || KIND_TAG.info;
            return (
              <div key={c.id} className="card" style={{ padding: "11px 13px", borderColor: c.pinned ? "rgba(201,168,76,.85)" : undefined, boxShadow: c.pinned ? "inset 0 0 0 1px rgba(201,168,76,.45)" : undefined }}>
                <div className="flex items-center gap-2 mb-2">
                  <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".05em", color: tag.color, background: `${tag.color}16`, border: `1px solid ${tag.color}4D`, borderRadius: 999, padding: "3px 11px", whiteSpace: "nowrap" }}>{tag.label}</span>
                  <button onClick={() => togglePin(c.id)} title={c.pinned ? "desafixar" : "fixar"} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", padding: 2, lineHeight: 0 }}>
                    <Pin size={15} style={{ color: c.pinned ? T.gold : "rgba(38,34,27,.28)", fill: c.pinned ? T.gold : "none" }} />
                  </button>
                </div>
                <div style={{ fontSize: 14, fontWeight: 500, color: T.ink, lineHeight: 1.4 }}>{c.text}</div>
                <div style={{ fontSize: 12, color: T.ink2, marginTop: 8 }}>{c.pinned ? "fixada por você" : (c.ago || "agora")}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* strip embaixo */}
      {marquee.length > 0 && (
        <div className="glass-d ticker" style={{ borderRadius: 999, padding: "8px 6px", marginTop: 12 }}>
          <div className="ticker-track" style={{ animationDuration: "40s" }}>
            {marquee.map((it, i) => {
              const I = FEED_ICON[it.kind] || Bell;
              return (
                <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13, color: "rgba(239,235,226,.8)", paddingLeft: 8 }}>
                  <I size={12} style={{ color: "rgba(201,168,76,.85)", flexShrink: 0 }} /> {it.text}
                  <span style={{ opacity: .3, marginLeft: 7 }}>•</span>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function HomeView({ deadlines, setDeadlines, monitors, categories, feed, setFeed, addFeed, go, toast, syncNow, syncing, quick, cfg }) {
  const SHEETS = ["Prazos 2026", "Prazos TCE-MA", "Cível e Trabalhista"];
  const [adding, setAdding] = useState(false);
  const [plan, setPlan] = useState(false);
  const [impText, setImpText] = useState("");
  const [sheet, setSheet] = useState(SHEETS[0]);
  const [nt, setNt] = useState(""); const [nw, setNw] = useState(""); const [nd, setNd] = useState("");

  const addDeadline = (t, w, d) => {
    const days = parseInt(d, 10);
    if (!t || isNaN(days)) return;
    setDeadlines([...deadlines, { id: Date.now() + Math.random(), title: t, who: w || "", days, sheet }].sort((a, b) => a.days - b.days));
    setNt(""); setNw(""); setNd(""); setAdding(false);
    addFeed("prazo", `Novo prazo em ${sheet}: ${t}${w ? " · " + w : ""} (${days}d)`);
    toast(`Prazo criado e enviado para a aba ${sheet}`);
  };

  const doImport = () => {
    const lines = impText.split("\n").map((l) => l.trim()).filter(Boolean);
    let n = 0;
    const rows = lines.map((l) => {
      const parts = l.split(/[;,\t]/).map((p) => p.trim());
      const days = parseInt(parts[2], 10);
      if (!parts[0] || isNaN(days)) return null;
      n++;
      return { id: Date.now() + Math.random(), title: parts[0], who: parts[1] || "", days, sheet };
    }).filter(Boolean);
    if (rows.length) setDeadlines([...deadlines, ...rows].sort((a, b) => a.days - b.days));
    setImpText(""); setPlan(false);
    addFeed("prazo", `${n} prazos importados da aba ${sheet}`);
    toast(n ? `${n} prazos importados` : "Nada reconhecido. Use: título; responsável; dias");
  };

  const alimentar = () => {
    downloadCsv(`prazos-${sheet.replace(/\s+/g, "-").toLowerCase()}.csv`, [["Prazo", "Responsável", "Dias restantes"], ...deadlines.map((d) => [d.title, d.who, d.days])]);
    setPlan(false);
    addFeed("info", `Planilha alimentada: ${deadlines.length} prazos enviados para a aba ${sheet}`);
    toast(`Enviado para a aba ${sheet}`);
  };

  const catName = (id) => (categories.find((c) => c.id === id) || {}).name || "";

  return (
    <div className="fade-up">
      <div className="flex items-end justify-between flex-wrap gap-3 mb-5">
        <div>
          <h2 className="h1">Hoje</h2>
          <p className="sub">Domingo, 12 de julho de 2026 · o painel do escritório</p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <button onClick={() => syncNow(false)} className="pill appfont" style={{ fontSize: 13.5 }} title="Buscar agora os resultados dos robôs no GitHub"><RefreshCw size={15} className={syncing ? "animate-spin" : ""} /> {syncing ? "Sincronizando..." : "Sincronizar robôs"}</button>
          <button onClick={() => go("chat")} className="btng appfont" style={{ fontSize: 15, padding: "12px 20px" }}><MessageSquare size={17} /> Assistente <ArrowRight size={15} /></button>
        </div>
      </div>

      <NewsBand feed={feed} setFeed={setFeed} />

      <div className="grid gap-3 mb-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(215px, 1fr))" }}>
        {[
          { id: "spe", t: "Relatório de processos", d: "SPE · por gestor e município", I: Activity },
          { id: "doe14", t: "Ler o Diário agora", d: "Fora do horário das 14h", I: Newspaper },
          { id: "pauta", t: "Pauta de sessão", d: "Sai no Diário qui/sex", I: Calendar },
        ].map((a) => (
          <button key={a.id} onClick={() => quick(a.id)} className="card text-left appfont" style={{ padding: "14px 16px", cursor: "pointer" }}>
            <div className="flex items-center gap-3">
              <span style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(201,168,76,.16)", border: "1px solid rgba(201,168,76,.45)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: T.goldDark, flexShrink: 0 }}><a.I size={19} /></span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: T.ink }}>{a.t}</span>
                <span style={{ display: "block", fontSize: 12.5, color: T.ink2 }}>{a.d}</span>
              </span>
              <ChevronRight size={16} style={{ color: T.gold }} />
            </div>
          </button>
        ))}
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(330px, 1fr))", alignItems: "start", marginTop: 4 }}>

        <div className="card" style={{ padding: 18 }}>
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 16, fontWeight: 700, color: T.ink }}><Clock size={16} style={{ color: T.gold }} /> Prazos</span>
            <div className="flex gap-2">
              <button className={"pill" + (plan ? " act" : "")} style={{ fontSize: 13 }} onClick={() => { setPlan(!plan); setAdding(false); }}><FileText size={13} /> Planilha</button>
              <button className={"pill" + (adding ? " act" : "")} style={{ fontSize: 13 }} onClick={() => { setAdding(!adding); setPlan(false); }}><Plus size={13} /> Novo</button>
            </div>
          </div>

          {plan && (
            <div className="fade-up" style={{ background: "rgba(201,168,76,.08)", border: "1px solid rgba(201,168,76,.5)", borderRadius: 14, padding: 14, marginBottom: 14 }}>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span style={{ fontSize: 13.5, fontWeight: 600, color: T.ink }}>Planilha da Dra. Bruna</span>
                <select value={sheet} onChange={(e) => setSheet(e.target.value)} className="pill appfont" style={{ fontSize: 12.5, padding: "4px 10px", appearance: "auto", marginLeft: "auto" }}>
                  {SHEETS.map((s) => <option key={s} value={s}>Aba: {s}</option>)}
                </select>
              </div>
              <label className="lbl" style={{ paddingLeft: 0 }}>Importar da aba {sheet} · uma linha por prazo (título; responsável; dias)</label>
              <textarea value={impText} onChange={(e) => setImpText(e.target.value)} rows={3} className="in ta appfont scroll-thin" placeholder={"Recolhimento Edital 007/2026; Barreirinhas; 4\nPetição prescrição; Montes Altos; 12"} />
              <div className="flex justify-between items-center mt-2 flex-wrap gap-2">
                <button className="btng appfont" style={{ fontSize: 13.5 }} onClick={doImport} disabled={!impText.trim()}><Upload size={13} /> Importar</button>
                <button className="pill appfont" style={{ fontSize: 13 }} onClick={alimentar} disabled={!deadlines.length}><ArrowRight size={13} /> Alimentar aba com {deadlines.length} prazos</button>
              </div>
            </div>
          )}

          {adding && (
            <div className="fade-up" style={{ background: "rgba(201,168,76,.08)", border: "1px solid rgba(201,168,76,.5)", borderRadius: 14, padding: 14, marginBottom: 14 }}>
              <label className="lbl" style={{ paddingLeft: 0 }}>O que vence</label>
              <input className="in appfont" style={{ marginBottom: 8 }} value={nt} onChange={(e) => setNt(e.target.value)} placeholder="Ex.: recolhimento Edital 007/2026" />
              <div className="flex gap-2 flex-wrap">
                <div style={{ flex: 2, minWidth: 150 }}><label className="lbl" style={{ paddingLeft: 0 }}>Responsável</label><input className="in appfont" value={nw} onChange={(e) => setNw(e.target.value)} placeholder="Barreirinhas" /></div>
                <div style={{ width: 76 }}><label className="lbl" style={{ paddingLeft: 0 }}>Dias</label><input className="in appfont" value={nd} onChange={(e) => setNd(e.target.value)} placeholder="10" inputMode="numeric" /></div>
              </div>
              <div className="flex items-end gap-2 mt-2 flex-wrap">
                <div style={{ flex: 1, minWidth: 140 }}><label className="lbl" style={{ paddingLeft: 0 }}>Aba</label><select className="in appfont" value={sheet} onChange={(e) => setSheet(e.target.value)}>{SHEETS.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
                <button className="btng appfont" onClick={() => addDeadline(nt, nw, nd)}><Check size={14} /> Salvar</button>
              </div>
            </div>
          )}

          {deadlines.length === 0 && !adding && !plan ? (
            <p style={{ fontSize: 14, color: T.ink2, margin: 0 }}>Nenhum prazo ainda. Importe da planilha da Dra. Bruna em Planilha, ou crie um em Novo. Tudo que você criar aqui alimenta a aba escolhida.</p>
          ) : (
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(138px, 1fr))" }}>
              {deadlines.map((d) => (
                <div key={d.id} className="fade-up" style={{ position: "relative", background: "rgba(255,255,255,.45)", border: `1px solid ${d.days <= 5 ? "rgba(156,58,50,.5)" : "rgba(255,255,255,.6)"}`, borderRadius: 14, padding: 14 }}>
                  <button onClick={() => setDeadlines(deadlines.filter((x) => x.id !== d.id))} style={{ position: "absolute", top: 10, right: 10, background: "none", border: "none", cursor: "pointer" }}><Trash2 size={12} style={{ color: "rgba(38,34,27,.3)" }} /></button>
                  <div className="flex items-baseline gap-1.5">
                    <span className="num" style={{ fontSize: 46, lineHeight: 1, color: d.days <= 5 ? T.wine : T.ink }}>{d.days}</span>
                    <span style={{ fontSize: 12.5, color: T.ink2 }}>dias</span>
                    {d.days <= 5 && <AlertTriangle size={13} style={{ color: T.wine }} />}
                  </div>
                  <p style={{ fontSize: 14, color: T.ink, fontWeight: 600, margin: "6px 0 0", lineHeight: 1.3 }}>{d.title}</p>
                  {d.who && <p style={{ fontSize: 12.5, color: T.ink2, margin: "2px 0 0" }}>{d.who}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card" style={{ padding: 18 }}>
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 16, fontWeight: 700, color: T.ink }}><Activity size={16} style={{ color: T.gold }} /> Acompanhamento</span>
            <button className="pill" style={{ fontSize: 13 }} onClick={() => go("acomp")}>Abrir <ChevronRight size={13} /></button>
          </div>
          {monitors.length === 0 ? (
            <p style={{ fontSize: 14, color: T.ink2, margin: 0 }}>Nenhum processo em acompanhamento. Em Acompanhamentos, escolha uma categoria e adicione um gestor para o robô vigiar. As prévias do que ele achar aparecem aqui.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {monitors.map((m) => {
                const last = (m.findings || [])[0];
                return (
                  <button key={m.id} onClick={() => go("acomp")} className="text-left appfont fade-up" style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,.6)", background: "rgba(255,255,255,.42)", cursor: "pointer", width: "100%" }}>
                    <span style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(91,123,166,.16)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: T.blue, flexShrink: 0 }}><Activity size={16} /></span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "block", fontSize: 14.5, fontWeight: 600, color: T.ink }}>{m.subject}</span>
                      <span style={{ display: "block", fontSize: 12.5, color: T.ink2 }}>{catName(m.categoryId)}</span>
                      {last ? <span style={{ display: "block", fontSize: 13, color: T.ink, marginTop: 4, lineHeight: 1.4 }}>{last.text}</span> : <span className="mono" style={{ display: "block", fontSize: 11.5, color: T.ink2, marginTop: 4 }}>aguardando robô · fase 1</span>}
                    </span>
                    <ChevronRight size={15} style={{ color: T.ink2, flexShrink: 0, marginTop: 2 }} />
                  </button>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

/* ============ Assistente ============ */
function ChatView() {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);
  useEffect(() => { endRef.current && endRef.current.scrollIntoView({ behavior: "smooth" }); }, [msgs, busy]);

  const send = async (text) => {
    const content = (text || input).trim();
    if (!content || busy) return;
    const next = [...msgs, { role: "user", content }];
    setMsgs(next); setInput(""); setBusy(true);
    try {
      const out = await askClaude(next.map((m) => ({ role: m.role, content: m.content })), `Você é o assistente interno do sistema do escritório. ${OFFICE_CTX} Responda em português do Brasil, direto e conciso. Minutas são rascunhos e exigem revisão das advogadas.`);
      setMsgs((m) => [...m, { role: "assistant", content: out || "Não consegui responder agora. Tente de novo." }]);
    } catch (e) { setMsgs((m) => [...m, { role: "assistant", content: (e && e.friendly) || "Falha de conexão com a IA. Verifique a internet e tente novamente." }]); }
    setBusy(false);
  };

  const chips = ["O que fazer quando sai multa com recurso já negado no TCE/MA?", "Minute um pedido de prorrogação de prazo de 15 dias", "Explique o rito da prestação de contas anual no TCE/MA"];

  return (
    <div className="fade-up flex flex-col" style={{ flex: 1, minHeight: 0 }}>
      <Title sub="Chat real, com o contexto do escritório embutido. GPT e Gemini entram como auditoria cruzada na fase 2.">Assistente</Title>
      <div className="scroll-thin" style={{ flex: 1, overflowY: "auto", minHeight: 240, paddingRight: 4 }}>
        {msgs.length === 0 && (
          <div className="flex flex-col items-start gap-2 justify-center" style={{ height: "100%" }}>
            <p style={{ fontSize: 20, fontWeight: 700, color: T.ink, margin: "0 0 4px" }}>Em que posso ajudar?</p>
            {chips.map((c) => <button key={c} onClick={() => send(c)} className="pill appfont text-left" style={{ fontSize: 13.5 }}>{c}</button>)}
          </div>
        )}
        <div className="flex flex-col gap-3">
          {msgs.map((m, i) => (
            <div key={i} className={"fade-up " + (m.role === "user" ? "glass-d" : "card")} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "85%", borderRadius: 22, padding: "11px 16px" }}>
              <div style={{ whiteSpace: "pre-wrap", fontSize: 14.5, lineHeight: 1.6 }}>{m.content}</div>
            </div>
          ))}
          {busy && <div className="flex items-center gap-2" style={{ fontSize: 13.5, color: T.ink2 }}><Loader2 size={14} className="animate-spin" style={{ color: T.gold }} /> escrevendo...</div>}
          <div ref={endRef} />
        </div>
      </div>
      <div className="flex gap-2 mt-4 items-center">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Escreva aqui..." className="in appfont" style={{ flex: 1 }} />
        <button className="cbtn" onClick={() => send()} disabled={busy} style={{ background: "rgba(30,28,24,.86)", color: "#F5EFE0", borderColor: "rgba(255,255,255,.2)" }}><Send size={17} /></button>
      </div>
    </div>
  );
}

/* ============ Fluxos ============ */
function NodeCard({ step, onCond, controls }) {
  const M = STEP_META[step.type] || STEP_META.robo;
  return (
    <div className="card" style={{ padding: "14px 16px", flex: 1 }}>
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <span className="tl-dot" style={{ width: 28, height: 28, borderRadius: 9, background: `${M.tone}1C`, color: M.tone }}><M.icon size={15} /></span>
        <span className="mono" style={{ fontSize: 11, letterSpacing: ".12em", color: M.tone, fontWeight: 600 }}>{M.label}</span>
        {controls}
      </div>
      <p style={{ fontSize: 15.5, fontWeight: 600, color: T.ink, margin: 0 }}>{step.title}</p>
      {step.desc && <p style={{ fontSize: 13.5, color: T.ink2, margin: "3px 0 0", lineHeight: 1.5 }}>{step.desc}</p>}
      {step.cond !== undefined && (
        <textarea value={step.cond} onChange={(e) => onCond(e.target.value)} rows={3} className="in ta appfont scroll-thin" style={{ marginTop: 10, fontSize: 13.5, borderColor: "rgba(201,168,76,.65)", background: "rgba(255,255,255,.6)" }} />
      )}
    </div>
  );
}

function RunPanel({ flowId, cfg, toast, addFeed }) {
  const [cat, setCat] = useState("Prestação de Contas Anual de Gestores");
  const [gestor, setGestor] = useState("");
  const [muni, setMuni] = useState("");
  const [filtros, setFiltros] = useState("");
  const [pedidoLivre, setPedidoLivre] = useState("");
  const [busy, setBusy] = useState(false);
  const spe = flowId === "spe";
  const robo = spe ? "spe" : flowId === "pauta" ? "pauta" : "diario";

  const executar = async () => {
    if (spe && !gestor.trim()) { toast("Diga o nome do gestor. Sem chute."); return; }
    setBusy(true);
    const pedido = spe
      ? `gestor: ${gestor.trim()}; municipio: ${muni.trim()}; categoria: ${cat}; filtros: ${filtros.trim()}`
      : pedidoLivre.trim();
    const r = await dispararRobo(cfg, { robo, pedido, alvo_pedido: spe ? "spe" : "diario" });
    setBusy(false);
    toast(r.msg);
    if (r.ok) addFeed("info", `Robô ${robo} disparado${spe ? ` para ${gestor.trim()}` : ""}. Sincronize em alguns minutos.`);
  };

  return (
    <div className="card mb-5" style={{ padding: 16, borderColor: "rgba(92,138,92,.55)" }}>
      <div className="flex items-center gap-2 mb-2"><Play size={15} style={{ color: T.green }} /><span style={{ fontSize: 14, fontWeight: 700, color: T.ink }}>Executar este fluxo agora</span></div>
      {spe ? (
        <>
          <div className="flex gap-3 flex-wrap">
            <div style={{ minWidth: 230, flex: 1 }}>
              <label className="lbl">Tipo de acompanhamento</label>
              <select className="in appfont" value={cat} onChange={(e) => setCat(e.target.value)}>
                <option>Prestação de Contas Anual de Gestores</option>
                <option>Prestação de Contas Anual de Governo</option>
                <option>Outro (descreva nos filtros)</option>
              </select>
            </div>
            <div style={{ minWidth: 180, flex: 1 }}><label className="lbl">Gestor / interessado</label><input className="in appfont" value={gestor} onChange={(e) => setGestor(e.target.value)} placeholder="Nome exato" /></div>
          </div>
          <div className="flex gap-3 flex-wrap mt-2">
            <div style={{ minWidth: 180, flex: 1 }}><label className="lbl">Município jurisdicionado</label><input className="in appfont" value={muni} onChange={(e) => setMuni(e.target.value)} placeholder="Ex.: Primeira Cruz" /></div>
            <div style={{ minWidth: 180, flex: 1 }}><label className="lbl">Filtros (opcional)</label><input className="in appfont" value={filtros} onChange={(e) => setFiltros(e.target.value)} placeholder="administração direta" /></div>
          </div>
        </>
      ) : (
        <div><label className="lbl">Pedido extra para esta rodada (opcional)</label><input className="in appfont" value={pedidoLivre} onChange={(e) => setPedidoLivre(e.target.value)} placeholder='Ex.: "procurar também o gestor Fulano de Tal"' /></div>
      )}
      <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
        <span style={{ fontSize: 12, color: T.ink2 }}>{cfg.ghToken ? "O robô roda na nuvem e o resultado entra sozinho na sincronização." : "Falta o token do GitHub em Ajustes para disparar daqui (1 min para criar)."}</span>
        <button className="btng appfont" onClick={executar} disabled={busy}>{busy ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} />} Executar robô</button>
      </div>
    </div>
  );
}

function FlowsView({ flows, setFlows, toast, forcedOpen, clearForced, cfg, addFeed }) {
  const [openId, setOpenId] = useState(null);
  const [nl, setNl] = useState("");
  const [busy, setBusy] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newDesc, setNewDesc] = useState("");
  const [manual, setManual] = useState(false);
  const open = flows.find((f) => f.id === openId);

  useEffect(() => { if (forcedOpen) { setOpenId(forcedOpen); clearForced(); } }, [forcedOpen]);

  const validFlow = (f) => f && typeof f.name === "string" && Array.isArray(f.steps) && f.steps.every((s) => STEP_META[s.type] && typeof s.title === "string");
  const setSteps = (fid, steps) => setFlows(flows.map((f) => (f.id === fid ? { ...f, steps } : f)));

  const applyNl = async () => {
    if (!nl.trim() || busy || !open) return;
    setBusy(true);
    try {
      const out = await askClaude([{ role: "user", content: `${FLOW_SCHEMA}\n\nFluxo atual:\n${JSON.stringify(open)}\n\nInstrução: "${nl.trim()}"\n\nAplique ao fluxo. Responda SOMENTE com o JSON completo do fluxo atualizado, mesmo id. Sem markdown.` }], OFFICE_CTX);
      const nf = parseJson(out); nf.id = open.id;
      if (!validFlow(nf)) throw new Error("inválido");
      setFlows(flows.map((f) => (f.id === open.id ? nf : f)));
      setNl(""); toast("Fluxo atualizado pela sua instrução");
    } catch (e) { toast((e && e.friendly) || "Não entendi. Reformule."); }
    setBusy(false);
  };

  const createFlow = async () => {
    if (!newDesc.trim() || busy) return;
    setBusy(true);
    try {
      const out = await askClaude([{ role: "user", content: `${FLOW_SCHEMA}\n\nCrie um fluxo a partir de: "${newDesc.trim()}". Máx 7 passos. Responda SOMENTE com o JSON, active true. Sem markdown.` }], OFFICE_CTX);
      const nf = parseJson(out);
      if (!validFlow(nf)) throw new Error("inválido");
      nf.id = "fx" + Date.now();
      setFlows([...flows, nf]); setNewDesc(""); setCreating(false); setOpenId(nf.id);
      toast("Fluxo criado");
    } catch (e) { toast((e && e.friendly) || "Não consegui montar. Descreva de outro jeito."); }
    setBusy(false);
  };

  const editCond = (idx, val) => setSteps(open.id, open.steps.map((s, i) => (i === idx ? { ...s, cond: val } : s)));
  const move = (idx, dir) => { const s = [...open.steps]; const j = idx + dir; if (j < 0 || j >= s.length) return; [s[idx], s[j]] = [s[j], s[idx]]; setSteps(open.id, s); };
  const del = (idx) => setSteps(open.id, open.steps.filter((_, i) => i !== idx));
  const changeType = (idx, type) => setSteps(open.id, open.steps.map((s, i) => (i === idx ? { ...s, type, cond: type === "regra" ? (s.cond || "Descreva a condição.") : undefined } : s)));
  const addNode = (at) => { const s = [...open.steps]; s.splice(at, 0, { type: "ia", title: "Nova etapa", desc: "Clique para editar tipo e texto." }); setSteps(open.id, s); };
  const editTitle = (idx, val) => setSteps(open.id, open.steps.map((s, i) => (i === idx ? { ...s, title: val } : s)));
  const toggle = (id) => setFlows(flows.map((f) => (f.id === id ? { ...f, active: !f.active } : f)));

  if (open) {
    return (
      <div className="fade-up">
        <button onClick={() => { setOpenId(null); setNl(""); setManual(false); }} className="pill appfont mb-3" style={{ fontSize: 13.5 }}><ChevronLeft size={14} /> Todos os fluxos</button>
        <div className="flex items-start justify-between flex-wrap gap-3">
          <Title sub={open.desc}>{open.name}</Title>
          <div className="flex gap-2 items-center flex-wrap">
            <button className={"pill appfont" + (manual ? " act" : "")} onClick={() => setManual(!manual)}>{manual ? <Check size={13} /> : <Wand2 size={13} />} Editar à mão</button>
            <button className="pill appfont" onClick={() => toggle(open.id)}>{open.active ? <Pause size={13} /> : <Play size={13} />} {open.active ? "Pausar" : "Ativar"}</button>
            <button className="pill appfont" onClick={() => { setFlows(flows.filter((f) => f.id !== open.id)); setOpenId(null); toast("Fluxo removido"); }}><Trash2 size={13} /> Remover</button>
          </div>
        </div>


        {["spe", "doe14", "pauta"].includes(open.id) && (
          <RunPanel flowId={open.id} cfg={cfg} toast={toast} addFeed={addFeed} />
        )}
        <div className="card mb-5" style={{ padding: 16, borderColor: "rgba(201,168,76,.7)" }}>
          <div className="flex items-center gap-2 mb-2"><Wand2 size={15} style={{ color: T.gold }} /><span style={{ fontSize: 14, fontWeight: 700, color: T.ink }}>Mudar o fluxo escrevendo</span></div>
          <div className="flex gap-2 flex-wrap items-center">
            <input value={nl} onChange={(e) => setNl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && applyNl()} className="in appfont" style={{ flex: 1, minWidth: 220 }} placeholder='Ex.: "tira a etapa de e-mail" ou "depois de classificar, se for edital de débito, gerar um informativo por município"' />
            <button className="cbtn" onClick={applyNl} disabled={busy || !nl.trim()} style={{ background: "linear-gradient(180deg,#DABE6E,#C2A044)", color: "#241F12" }}>{busy ? <Spin /> : <Wand2 size={17} />}</button>
          </div>
          <p style={{ fontSize: 12.5, color: T.ink2, margin: "8px 0 0" }}>{manual ? "Modo à mão ligado: use os controles em cada nó para reordenar, trocar o tipo, editar ou remover, e o + para inserir." : "A IA lê a instrução e o desenho abaixo muda na hora. Ou ligue “Editar à mão” para mexer nó a nó."}</p>
        </div>

        <div>
          {manual && (
            <div className="flex justify-center mb-2"><button className="pill appfont" style={{ fontSize: 13 }} onClick={() => addNode(0)}><Plus size={13} /> inserir no topo</button></div>
          )}
          {open.steps.map((s, i) => (
            <div key={i} className="fade-up">
              <div className="flex items-stretch gap-3">
                {manual && (
                  <div className="flex flex-col items-center justify-center gap-1" style={{ flexShrink: 0 }}>
                    <button className="cbtn" style={{ width: 30, height: 30 }} onClick={() => move(i, -1)} disabled={i === 0}><ChevronUp size={14} /></button>
                    <button className="cbtn" style={{ width: 30, height: 30 }} onClick={() => move(i, 1)} disabled={i === open.steps.length - 1}><ChevronDown size={14} /></button>
                  </div>
                )}
                <NodeCard step={s} onCond={(v) => editCond(i, v)} controls={manual ? (
                  <span className="flex items-center gap-1" style={{ marginLeft: "auto" }}>
                    <select value={s.type} onChange={(e) => changeType(i, e.target.value)} className="mono" style={{ fontSize: 11, padding: "3px 6px", borderRadius: 7, border: "1px solid rgba(38,34,27,.2)", background: "rgba(255,255,255,.7)", color: T.ink }}>
                      {STEP_ORDER.map((t) => <option key={t} value={t}>{STEP_META[t].label}</option>)}
                    </select>
                    <button onClick={() => del(i)} style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}><Trash2 size={13} style={{ color: T.wine }} /></button>
                  </span>
                ) : (s.type === "robo" ? <span style={{ fontSize: 11.5, color: T.ink2, marginLeft: "auto" }}>módulo robô · fase 1</span> : s.type === "regra" ? <span style={{ fontSize: 11.5, color: T.goldDark, marginLeft: "auto" }}>condição editável</span> : null)} />
              </div>
              {manual && (
                <div style={{ paddingLeft: manual ? 42 : 0 }}>
                  <input value={s.title} onChange={(e) => editTitle(i, e.target.value)} className="in appfont" style={{ margin: "6px 0", fontSize: 13.5, padding: "7px 12px" }} placeholder="Título da etapa" />
                </div>
              )}
              {/* conector */}
              <div className="flex justify-center" style={{ padding: manual ? "2px 0" : "6px 0" }}>
                {i < open.steps.length - 1 ? (
                  <svg width="30" height={manual ? 26 : 30} viewBox="0 0 30 30"><path d="M15 2 L15 22" stroke={T.gold} strokeWidth="2" /><path d="M10 20 L15 27 L20 20" stroke={T.gold} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                ) : manual ? (
                  <button className="pill appfont" style={{ fontSize: 13 }} onClick={() => addNode(open.steps.length)}><Plus size={13} /> inserir no fim</button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="fade-up">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <Title sub="Cada fluxo é uma cadeia de etapas ligadas. Mude escrevendo o que quer, ou entre e edite os nós à mão.">Fluxos</Title>
        <button className="btng appfont" onClick={() => setCreating(!creating)}><Plus size={14} /> Novo fluxo</button>
      </div>
      {creating && (
        <div className="fade-up card mb-4" style={{ padding: 16, borderColor: "rgba(201,168,76,.7)" }}>
          <label className="lbl">Descreva o fluxo em português. A IA monta a estrutura, depois você refina à mão.</label>
          <div className="flex gap-2 flex-wrap items-center">
            <input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} onKeyDown={(e) => e.key === "Enter" && createFlow()} className="in appfont" style={{ flex: 1, minWidth: 220 }} placeholder='Ex.: "toda sexta, listar processos com prazo na semana seguinte e mandar resumo por e-mail para as doutoras"' />
            <button className="cbtn" onClick={createFlow} disabled={busy || !newDesc.trim()} style={{ background: "linear-gradient(180deg,#DABE6E,#C2A044)", color: "#241F12" }}>{busy ? <Spin /> : <Sparkles size={17} />}</button>
          </div>
        </div>
      )}
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
        {flows.map((f) => (
          <button key={f.id} onClick={() => setOpenId(f.id)} className="card text-left appfont" style={{ padding: 18, cursor: "pointer" }}>
            <div className="flex items-center gap-2 mb-2">
              <span style={{ width: 8, height: 8, borderRadius: 999, background: f.active ? T.green : "rgba(38,34,27,.25)" }} />
              <span style={{ fontSize: 12, color: f.active ? T.green : T.ink2, fontWeight: 600 }}>{f.active ? "Ativo" : "Pausado"}</span>
              <span className="mono" style={{ fontSize: 11.5, color: T.ink2, marginLeft: "auto" }}>{f.steps.length} etapas</span>
            </div>
            <p style={{ fontSize: 20, color: T.ink, fontWeight: 700, margin: 0, letterSpacing: "-0.01em" }}>{f.name}</p>
            <p style={{ fontSize: 13.5, color: T.ink2, margin: "4px 0 0", lineHeight: 1.5 }}>{f.desc}</p>
            <div className="flex items-center gap-1.5 mt-3">
              {f.steps.map((s, i) => { const M = STEP_META[s.type] || STEP_META.robo; return <M.icon key={i} size={13} style={{ color: M.tone }} />; })}
              <ChevronRight size={15} style={{ color: T.gold, marginLeft: "auto" }} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ============ Acompanhamentos ============ */
function AcompView({ categories, setCategories, monitors, setMonitors, templates, pushDoc, addFeed, toast }) {
  const [tab, setTab] = useState(categories[0] ? categories[0].id : null);
  const [newCat, setNewCat] = useState(false);
  const [cn, setCn] = useState(""); const [cp, setCp] = useState(""); const [cper, setCper] = useState("Semanal"); const [cmodel, setCmodel] = useState("REL-02");
  const [addMon, setAddMon] = useState(false);
  const [mg, setMg] = useState(""); const [mm, setMm] = useState("");
  const [reportFor, setReportFor] = useState(null);
  const [reportData, setReportData] = useState("");
  const [busy, setBusy] = useState(false);

  const cat = categories.find((c) => c.id === tab);
  const catMonitors = monitors.filter((m) => m.categoryId === tab);

  const createCat = () => {
    if (!cn.trim()) return;
    const id = "cat" + Date.now();
    setCategories([...categories, { id, name: cn.trim(), params: cp.trim(), period: cper, model: cmodel }]);
    setCn(""); setCp(""); setNewCat(false); setTab(id);
    addFeed("info", `Nova categoria de acompanhamento: ${cn.trim()} (${cper})`);
    toast("Categoria criada");
  };

  const createMon = () => {
    if (!mg.trim() || !cat) return;
    const id = "mon" + Date.now();
    setMonitors([...monitors, { id, categoryId: cat.id, subject: mg.trim(), muni: mm.trim(), findings: [] }]);
    setMg(""); setMm(""); setAddMon(false);
    addFeed("despacho", `Robô agora vigia ${mg.trim()} em ${cat.name}`);
    toast("Acompanhamento criado. O robô passa a vigiar (fase 1).");
  };

  const addFinding = (mon) => {
    const txt = prompt("Registrar andamento observado para " + mon.subject + ":");
    if (!txt) return;
    setMonitors(monitors.map((m) => (m.id === mon.id ? { ...m, findings: [{ ts: Date.now(), text: txt, tone: T.blue }, ...(m.findings || [])] } : m)));
    addFeed("despacho", `${mon.subject}: ${txt}`);
    toast("Andamento registrado e enviado às novidades");
  };

  const genReport = async (mon) => {
    if (!reportData.trim() || busy) return;
    setBusy(true);
    try {
      const tpl = templates.find((t) => t.id === (cat.model || "REL-02")) || templates[0];
      const html = await writeDocument(tpl, `Gestor: ${mon.subject}\nJurisdicionado: ${mon.muni}\nCategoria: ${cat.name}\n\nAndamentos e dados copiados do Consulta SPE:\n${reportData}`, `Relatório · ${mon.subject}`);
      pushDoc({ tpl: tpl.id, name: `Relatório de acompanhamento · ${mon.subject}`, who: mon.muni, html });
      setReportData(""); setReportFor(null);
      addFeed("doc", `Relatório ${tpl.id} gerado para ${mon.subject}`);
      toast(`${tpl.id} enviado à fila de revisão`);
    } catch (e) { toast((e && e.friendly) || "Falha ao redigir. Tente de novo."); }
    setBusy(false);
  };

  return (
    <div className="fade-up">
      <Title sub="Cada aba é um tipo de acompanhamento. Você define os parâmetros e a periodicidade; o robô vigia (fase 1) e joga os achados no sistema.">Acompanhamentos</Title>

      {/* abas de categoria */}
      <div className="flex items-center gap-2 flex-wrap mb-5">
        {categories.map((c) => (
          <button key={c.id} onClick={() => setTab(c.id)} className={"pill appfont" + (tab === c.id ? " act" : "")}>{c.name}</button>
        ))}
        <button className="pill appfont" onClick={() => setNewCat(!newCat)} style={{ borderStyle: "dashed" }}><Plus size={13} /> Nova categoria</button>
      </div>

      {newCat && (
        <div className="fade-up card mb-5" style={{ padding: 18, borderColor: "rgba(201,168,76,.7)" }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: T.ink, margin: "0 0 12px" }}>Nova categoria de acompanhamento</p>
          <label className="lbl">Nome da categoria</label>
          <input className="in appfont mb-3" value={cn} onChange={(e) => setCn(e.target.value)} placeholder="Ex.: Prestação de Contas Anual de Gestores" />
          <label className="lbl">Parâmetros de busca (o que o robô usa no SPE)</label>
          <textarea className="in ta appfont mb-3 scroll-thin" rows={2} value={cp} onChange={(e) => setCp(e.target.value)} placeholder="Ex.: Interessado: Ordenador · Natureza: PCA · Exercício: 2024" />
          <div className="flex gap-3 flex-wrap items-end">
            <div style={{ minWidth: 160 }}><label className="lbl">Periodicidade</label>
              <select className="in appfont" value={cper} onChange={(e) => setCper(e.target.value)}>{PERIODS.map((p) => <option key={p}>{p}</option>)}</select>
            </div>
            <div style={{ minWidth: 200 }}><label className="lbl">Modelo de relatório</label>
              <select className="in appfont" value={cmodel} onChange={(e) => setCmodel(e.target.value)}>{templates.map((t) => <option key={t.id} value={t.id}>{t.id} · {t.name}</option>)}</select>
            </div>
            <button className="btng appfont" onClick={createCat} disabled={!cn.trim()}><Check size={14} /> Criar categoria</button>
          </div>
        </div>
      )}

      {cat && (
        <>
          <div className="card mb-5" style={{ padding: "14px 18px", display: "flex", gap: 18, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13.5, color: T.ink2 }}><Clock size={14} style={{ color: T.gold }} /> {cat.period}</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13.5, color: T.ink2 }}><FileText size={14} style={{ color: T.green }} /> Relatório {cat.model}</span>
            {cat.params && <span style={{ fontSize: 13, color: T.ink2, flex: 1, minWidth: 200 }}>{cat.params}</span>}
            <button className="pill appfont" style={{ fontSize: 13 }} onClick={() => { setCategories(categories.filter((c) => c.id !== cat.id)); setMonitors(monitors.filter((m) => m.categoryId !== cat.id)); setTab(categories[0] && categories[0].id !== cat.id ? categories[0].id : (categories[1] || {}).id || null); toast("Categoria removida"); }}><Trash2 size={12} /> Remover categoria</button>
          </div>

          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <span style={{ fontSize: 14, fontWeight: 700, color: T.ink }}>Processos vigiados nesta categoria</span>
            <button className="pill appfont" onClick={() => setAddMon(!addMon)}><Plus size={14} /> Novo acompanhamento</button>
          </div>

          {addMon && (
            <div className="fade-up card mb-4 flex flex-wrap gap-3 items-end" style={{ padding: 16, borderColor: "rgba(201,168,76,.7)" }}>
              <div style={{ flex: 2, minWidth: 180 }}><label className="lbl">Nome do gestor / interessado</label><input className="in appfont" value={mg} onChange={(e) => setMg(e.target.value)} placeholder="Ex.: Márcio Araújo Silva" /></div>
              <div style={{ flex: 2, minWidth: 180 }}><label className="lbl">Município jurisdicionado</label><input className="in appfont" value={mm} onChange={(e) => setMm(e.target.value)} placeholder="Ex.: Primeira Cruz" /></div>
              <button className="btng appfont" onClick={createMon} disabled={!mg.trim()}><Check size={14} /> Vigiar</button>
            </div>
          )}

          {catMonitors.length === 0 && !addMon && (
            <div className="card" style={{ padding: 18, borderStyle: "dashed" }}><p style={{ fontSize: 14.5, color: T.ink2, margin: 0 }}>Nenhum processo vigiado aqui ainda. Adicione um gestor e o robô passa a checar conforme a periodicidade ({cat.period.toLowerCase()}). Os achados aparecem em Hoje.</p></div>
          )}

          <div className="flex flex-col gap-3">
            {catMonitors.map((m) => (
              <div key={m.id} className="card fade-up" style={{ padding: 16 }}>
                <div className="flex items-center gap-3 flex-wrap">
                  <span style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(91,123,166,.16)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: T.blue, flexShrink: 0 }}><Activity size={19} /></span>
                  <span style={{ flex: 1, minWidth: 140 }}>
                    <span style={{ display: "block", fontSize: 16, fontWeight: 700, color: T.ink }}>{m.subject}</span>
                    <span style={{ display: "block", fontSize: 13, color: T.ink2 }}>{m.muni}</span>
                  </span>
                  <button className="pill appfont" style={{ fontSize: 13 }} onClick={() => addFinding(m)}><Plus size={12} /> Registrar andamento</button>
                  <button className="pill appfont" style={{ fontSize: 13 }} onClick={() => { setReportFor(reportFor === m.id ? null : m.id); setReportData(""); }}><FileText size={12} /> Gerar relatório</button>
                  <button onClick={() => { setMonitors(monitors.filter((x) => x.id !== m.id)); toast("Acompanhamento removido"); }} style={{ background: "none", border: "none", cursor: "pointer" }}><Trash2 size={13} style={{ color: "rgba(38,34,27,.3)" }} /></button>
                </div>

                {(m.findings || []).length > 0 && (
                  <div style={{ marginTop: 12, borderTop: "1px solid rgba(38,34,27,.1)", paddingTop: 10 }}>
                    {m.findings.map((f, i) => (
                      <div key={i} className="flex items-start gap-2" style={{ marginBottom: 6 }}>
                        <CircleDot size={11} style={{ color: f.tone || T.blue, marginTop: 3, flexShrink: 0 }} />
                        <span style={{ fontSize: 13.5, color: T.ink }}>{f.text}</span>
                      </div>
                    ))}
                  </div>
                )}
                {(m.findings || []).length === 0 && <p className="mono" style={{ fontSize: 12, color: T.ink2, margin: "10px 0 0" }}>aguardando primeira verificação do robô · fase 1</p>}

                {reportFor === m.id && (
                  <div className="fade-up" style={{ marginTop: 12, borderTop: "1px solid rgba(201,168,76,.5)", paddingTop: 12 }}>
                    <label className="lbl">Cole os andamentos/peças do SPE deste processo. A IA redige no modelo {cat.model}.</label>
                    <textarea className="in ta appfont scroll-thin" rows={5} value={reportData} onChange={(e) => setReportData(e.target.value)} placeholder="Cole aqui o que copiou do Consulta SPE. Na fase 1 o robô cola isto sozinho." />
                    <div className="flex justify-end mt-2"><button className="btng appfont" onClick={() => genReport(m)} disabled={busy || !reportData.trim()}>{busy ? <Spin /> : <Sparkles size={14} />} Redigir {cat.model}</button></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ============ Documentos ============ */
function DocsView({ docs, setDocs, templates, setTemplates, openWord, toast }) {
  const [selTpl, setSelTpl] = useState(templates[0] ? templates[0].id : "TIMB-01");
  const [title, setTitle] = useState("");
  const [caseData, setCaseData] = useState("");
  const [busy, setBusy] = useState(false);
  const [mailBusy, setMailBusy] = useState(null);
  const [extractBusy, setExtractBusy] = useState(false);
  const fileRef = useRef(null);

  const createDoc = async () => {
    if (!caseData.trim() || busy) return;
    setBusy(true);
    try {
      const tpl = templates.find((t) => t.id === selTpl) || templates[0];
      const html = await writeDocument(tpl, caseData, title);
      setDocs([{ id: Date.now(), tpl: tpl.id, name: title || tpl.name, who: "", html, ok: false }, ...docs]);
      setTitle(""); setCaseData(""); toast(`${tpl.id} redigido e enviado à fila`);
    } catch (e) { toast((e && e.friendly) || "Falha ao redigir. Tente de novo."); }
    setBusy(false);
  };

  const approve = (id) => { setDocs(docs.map((d) => (d.id === id ? { ...d, ok: true } : d))); toast("Aprovado. Agora dá para baixar e enviar."); };

  const mail = async (d) => {
    setMailBusy(d.id);
    try {
      const out = await askClaude([{ role: "user", content: `Escreva um e-mail curto de encaminhamento do documento "${d.name}" (modelo ${d.tpl})${d.who ? `, referente a ${d.who}` : ""}, no padrão do escritório. Responda SOMENTE com JSON: {"assunto": string, "corpo": string}. Sem markdown.` }], OFFICE_CTX);
      const m = parseJson(out);
      window.location.href = `mailto:?subject=${encodeURIComponent(m.assunto || d.name)}&body=${encodeURIComponent((m.corpo || "").slice(0, 1800))}`;
    } catch (e) { toast((e && e.friendly) || "Falha ao preparar o e-mail."); }
    setMailBusy(null);
  };

  const extract = async (file) => {
    if (!file) return;
    setExtractBusy(true);
    try {
      const buf = await file.arrayBuffer();
      const { value: rawHtml } = await mammoth.convertToHtml({ arrayBuffer: buf });
      const out = await askClaude([{ role: "user", content: `Documento enviado para virar modelo reutilizável. Conteúdo (HTML):\n${rawHtml.slice(0, 9000)}\n\nResponda SOMENTE com JSON: {"name": nome curto, "spec": especificação em uma linha, "uses": para que serve, "base": esqueleto em HTML simples com campos variáveis como {{CAMPO}}}. Sem markdown.` }], OFFICE_CTX);
      const t = parseJson(out);
      const num = String(templates.length + 1).padStart(2, "0");
      setTemplates([...templates, { id: `MOD-${num}`, name: t.name || file.name, spec: t.spec || "", uses: t.uses || "", base: t.base || rawHtml.slice(0, 8000) }]);
      toast(`Modelo MOD-${num} extraído de ${file.name}`);
    } catch (e) { toast((e && e.friendly) || "Não consegui extrair. Envie um .docx."); }
    setExtractBusy(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="fade-up">
      <Title sub="A IA escreve o conteúdo. O sistema aplica o modelo pelo identificador e gera o arquivo. Tudo passa pela fila de revisão.">Documentos</Title>

      <div className="card mb-6" style={{ padding: 18, borderColor: "rgba(201,168,76,.7)" }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: T.ink, margin: "0 0 12px" }}>Redigir documento</p>
        <div className="flex gap-3 flex-wrap">
          <div style={{ minWidth: 210 }}><label className="lbl">Modelo</label>
            <select value={selTpl} onChange={(e) => setSelTpl(e.target.value)} className="in appfont">{templates.map((t) => <option key={t.id} value={t.id}>{t.id} · {t.name}</option>)}</select>
          </div>
          <div style={{ flex: 1, minWidth: 220 }}><label className="lbl">Título / assunto</label>
            <input className="in appfont" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Informativo · Edital 007/2026 · Barreirinhas" />
          </div>
        </div>
        <label className="lbl" style={{ marginTop: 14 }}>Dados do caso (cole publicações, andamentos, o que a IA deve usar)</label>
        <textarea value={caseData} onChange={(e) => setCaseData(e.target.value)} rows={5} className="in ta appfont scroll-thin" placeholder="Sem dados, sem documento. A IA não inventa fatos: onde faltar, ela escreve [PREENCHER]." />
        <div className="flex justify-end mt-3"><button className="btng appfont" onClick={createDoc} disabled={busy || !caseData.trim()}>{busy ? <Spin /> : <Sparkles size={14} />} Redigir e enviar à fila</button></div>
      </div>

      <p style={{ fontSize: 14, fontWeight: 700, color: T.ink, margin: "0 0 10px" }}>Fila de revisão</p>
      {docs.length === 0 && (
        <div className="card" style={{ padding: 18, borderStyle: "dashed" }}><p style={{ fontSize: 14.5, color: T.ink2, margin: 0 }}>Nada aguardando revisão. Redija acima ou gere um relatório em Acompanhamentos.</p></div>
      )}
      <div className="flex flex-col gap-2">
        {docs.map((d) => (
          <div key={d.id} className="card fade-up flex items-center gap-3 flex-wrap" style={{ padding: "12px 14px" }}>
            <span className="stamp mono">{d.tpl}</span>
            <span style={{ minWidth: 150, flex: 1 }}>
              <span style={{ fontSize: 14.5, fontWeight: 600, color: T.ink, display: "block" }}>{d.name}</span>
              {d.who && <span style={{ fontSize: 12.5, color: T.ink2, display: "block" }}>{d.who}</span>}
            </span>
            <button className="pill appfont" style={{ padding: "6px 12px", fontSize: 13 }} onClick={() => openWord(d)}><Eye size={13} /> Ler</button>
            {d.ok ? (
              <>
                <span className="flex items-center gap-1" style={{ fontSize: 13, color: T.green, fontWeight: 600 }}><BadgeCheck size={14} /> Aprovado</span>
                <button className="pill appfont" style={{ padding: "6px 12px", fontSize: 13 }} onClick={() => downloadDoc((d.name || "documento").replace(/[^\wÀ-ú\- ]/g, "").slice(0, 60) || "documento", d.html)}><Download size={13} /> Baixar .doc</button>
                <button className="pill appfont" style={{ padding: "6px 12px", fontSize: 13 }} onClick={() => mail(d)} disabled={mailBusy === d.id}>{mailBusy === d.id ? <Loader2 size={13} className="animate-spin" /> : <Mail size={13} />} E-mail</button>
                <button className="pill appfont" style={{ padding: "6px 12px", fontSize: 13 }} onClick={() => abrirNoClaude("refinar o documento " + d.name + " (modelo " + d.tpl + ")", (d.html || "").replace(/<[^>]+>/g, " ").slice(0, 9000), toast)}><ExternalLink size={13} /> Refinar no Claude</button>
              </>
            ) : (
              <button className="btng appfont" style={{ padding: "8px 14px", fontSize: 13.5 }} onClick={() => approve(d.id)}><Check size={13} /> Aprovar</button>
            )}
            <button onClick={() => setDocs(docs.filter((x) => x.id !== d.id))} style={{ background: "none", border: "none", cursor: "pointer" }}><Trash2 size={13} style={{ color: "rgba(38,34,27,.3)" }} /></button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-8 mb-3 flex-wrap gap-2">
        <p style={{ fontSize: 14, fontWeight: 700, color: T.ink, margin: 0 }}>Biblioteca de modelos · clique para pré-visualizar</p>
        <div>
          <input ref={fileRef} type="file" accept=".docx" style={{ display: "none" }} onChange={(e) => extract(e.target.files && e.target.files[0])} />
          <button className="pill appfont" onClick={() => fileRef.current && fileRef.current.click()} disabled={extractBusy}>{extractBusy ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />} Extrair modelo de um .docx</button>
        </div>
      </div>
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))" }}>
        {templates.map((t) => (
          <button key={t.id} onClick={() => openWord({ id: t.id, name: t.name, spec: t.spec, uses: t.uses, html: t.base ? t.base : "" })} className="card text-left appfont" style={{ padding: 16, cursor: "pointer" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="stamp mono">{t.id}</span>
              {t.base ? <span className="mono" style={{ fontSize: 10.5, color: T.green, fontWeight: 600 }}>ESTRUTURA EXTRAÍDA</span> : <Eye size={14} style={{ color: T.ink2 }} />}
            </div>
            <p style={{ fontSize: 17.5, color: T.ink, fontWeight: 700, margin: 0, letterSpacing: "-0.01em" }}>{t.name}</p>
            <p style={{ fontSize: 13, color: T.ink2, margin: "4px 0 0", lineHeight: 1.5 }}>{t.spec}</p>
            {t.uses && <p style={{ fontSize: 12.5, color: T.ink, margin: "8px 0 0" }}>Uso: {t.uses}</p>}
          </button>
        ))}
      </div>
      <p style={{ fontSize: 13, color: T.ink2, marginTop: 12 }}>Clique num modelo para abrir a prévia em janela estilo Word. Envie um .docx para o extrator ler a estrutura e criar um modelo fiel.</p>
    </div>
  );
}

/* ============ Robôs (pedidos adaptativos) ============ */
function downloadText(nome, texto, tipo) {
  const blob = new Blob(["\ufeff", texto], { type: tipo || "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = nome;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

function RobosView({ cfg, toast }) {
  const [alvo, setAlvo] = useState("diario");
  const [texto, setTexto] = useState("");
  const [gestor, setGestor] = useState("");
  const [muni, setMuni] = useState("");
  const [filtros, setFiltros] = useState("");
  const [lista, setLista] = useState(() => { try { return JSON.parse(localStorage.getItem("gab-pedidos-v1") || "[]"); } catch (e) { return []; } });

  const salvarLista = (l) => { setLista(l); localStorage.setItem("gab-pedidos-v1", JSON.stringify(l)); };

  const pedidoObj = () => ({
    id: "p" + Date.now(),
    alvo,
    texto: texto.trim(),
    params: {
      gestor: gestor.trim(), municipio: muni.trim(),
      filtros: filtros.split(",").map((f) => f.trim()).filter(Boolean),
      termos_extras: [],
    },
    status: "pendente",
  });

  const criar = () => {
    if (!texto.trim() && !gestor.trim()) { toast("Escreva o pedido ou pelo menos o gestor."); return; }
    const novo = pedidoObj();
    salvarLista([novo, ...lista].slice(0, 30));
    toast("Pedido criado. Agora leve ao robô (copiar ou baixar).");
  };

  const jsonFila = JSON.stringify({ pedidos: lista.filter((x) => x.status === "pendente") }, null, 2);
  const copiar = async () => {
    try { await navigator.clipboard.writeText(jsonFila); toast("Fila copiada. Cole em config/pedidos.json no GitHub."); }
    catch (e) { toast("Não consegui copiar. Use o botão Baixar."); }
  };

  const repo = (cfg.repoUrl || "").replace(/\/$/, "");

  return (
    <div className="fade-up">
      <Title sub="Peça fora da rotina em português. Pedido ambíguo não vira chute: o robô devolve uma pergunta. As respostas entram sozinhas pela sincronização.">Robôs</Title>

      {(() => { let spe = null; try { spe = JSON.parse(localStorage.getItem("gab-spe-last") || "null"); } catch (e) {}
        return spe ? (
          <div className="card mb-5" style={{ padding: 16 }}>
            <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
              <span style={{ fontSize: 15, fontWeight: 700, color: T.ink }}>Última resposta do SPE · {spe.interessado || "consulta"}</span>
              <button className="pill appfont" style={{ fontSize: 13 }} onClick={() => abrirNoClaude("montar o Relatório de Acompanhamento Processual (REL-02) do gestor " + (spe.interessado || ""), JSON.stringify(spe).slice(0, 9000), toast)}><ExternalLink size={14} /> Montar relatório no Claude</button>
            </div>
            {spe.status === "duvida" ? (
              <p style={{ fontSize: 14, color: T.wine, margin: 0 }}>O robô perguntou: {spe.pergunta}</p>
            ) : (
              <p style={{ fontSize: 14, color: T.ink2, margin: 0 }}>{(spe.linhas_brutas || []).length} linhas extraídas{spe.filtros_aplicados && spe.filtros_aplicados.length ? " · filtros: " + spe.filtros_aplicados.join(", ") : ""}. Gerado em {spe.gerado_em ? new Date(spe.gerado_em).toLocaleString("pt-BR") : ""}.</p>
            )}
          </div>
        ) : null; })()}

      <div className="card mb-5" style={{ padding: 18, borderColor: "rgba(201,168,76,.7)" }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: T.ink, margin: "0 0 12px" }}>Novo pedido ao robô</p>
        <div className="flex gap-3 flex-wrap">
          <div style={{ minWidth: 170 }}>
            <label className="lbl">Robô alvo</label>
            <select className="in appfont" value={alvo} onChange={(e) => setAlvo(e.target.value)}>
              <option value="diario">Diário Oficial</option>
              <option value="spe">SPE · processos</option>
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 240 }}>
            <label className="lbl">Pedido em português</label>
            <input className="in appfont" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder='Ex.: "todos os processos de prestação de contas do gestor tal, só administração direta"' />
          </div>
        </div>
        <div className="flex gap-3 flex-wrap" style={{ marginTop: 12 }}>
          <div style={{ flex: 1, minWidth: 180 }}><label className="lbl">Gestor / interessado</label><input className="in appfont" value={gestor} onChange={(e) => setGestor(e.target.value)} placeholder="Nome exato" /></div>
          <div style={{ flex: 1, minWidth: 180 }}><label className="lbl">Município</label><input className="in appfont" value={muni} onChange={(e) => setMuni(e.target.value)} placeholder="Jurisdicionado" /></div>
          <div style={{ flex: 1, minWidth: 180 }}><label className="lbl">Filtros (vírgula)</label><input className="in appfont" value={filtros} onChange={(e) => setFiltros(e.target.value)} placeholder="administração direta" /></div>
        </div>
        <div className="flex justify-end mt-3"><button className="btng appfont" onClick={criar}><Plus size={15} /> Criar pedido</button></div>
      </div>

      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <p style={{ fontSize: 14, fontWeight: 700, color: T.ink, margin: 0 }}>Fila de pedidos ({lista.filter((x) => x.status === "pendente").length} pendentes)</p>
        <div className="flex gap-2 flex-wrap">
          <button className="pill appfont" onClick={copiar} disabled={!lista.length}><Copy size={14} /> Copiar fila</button>
          <button className="pill appfont" onClick={() => downloadText("pedidos.json", jsonFila)} disabled={!lista.length}><Download size={14} /> Baixar pedidos.json</button>
          {repo && <a className="pill appfont" style={{ textDecoration: "none" }} href={repo + "/edit/main/config/pedidos.json"} target="_blank" rel="noreferrer"><ExternalLink size={14} /> Colar no GitHub</a>}
          {repo && <a className="pill appfont" style={{ textDecoration: "none" }} href={repo + "/actions"} target="_blank" rel="noreferrer"><Play size={14} /> Rodar robôs</a>}
        </div>
      </div>

      {!repo && <p style={{ fontSize: 12.5, color: T.ink2, margin: "0 0 10px" }}>Dica: cole o endereço do repositório em Ajustes e os botões de atalho para o GitHub aparecem aqui.</p>}

      {lista.length === 0 ? (
        <div className="card" style={{ padding: 18, borderStyle: "dashed" }}><p style={{ fontSize: 14, color: T.ink2, margin: 0 }}>Nenhum pedido ainda. Crie acima; o robô executa na próxima rodada (ou na hora, pelo Run workflow).</p></div>
      ) : (
        <div className="flex flex-col gap-2">
          {lista.map((pd) => (
            <div key={pd.id} className="card flex items-center gap-3 flex-wrap" style={{ padding: "12px 14px" }}>
              <span className="stamp mono">{pd.alvo === "spe" ? "SPE" : "DIÁRIO"}</span>
              <span style={{ flex: 1, minWidth: 160 }}>
                <span style={{ display: "block", fontSize: 14, fontWeight: 600, color: T.ink }}>{pd.texto || pd.params.gestor}</span>
                <span style={{ display: "block", fontSize: 12, color: T.ink2 }}>{[pd.params.gestor, pd.params.municipio, (pd.params.filtros || []).join(" · ")].filter(Boolean).join(" · ")}</span>
              </span>
              <button className="pill appfont" style={{ fontSize: 12.5, padding: "6px 12px" }} onClick={() => salvarLista(lista.map((x) => x.id === pd.id ? { ...x, status: x.status === "pendente" ? "respondido" : "pendente" } : x))}>
                {pd.status === "pendente" ? "Marcar respondido" : "Reabrir"}
              </button>
              <span style={{ fontSize: 12, fontWeight: 600, color: pd.status === "pendente" ? T.goldDark : T.green }}>{pd.status}</span>
              <button onClick={() => salvarLista(lista.filter((x) => x.id !== pd.id))} style={{ background: "none", border: "none", cursor: "pointer" }}><Trash2 size={14} style={{ color: "rgba(38,34,27,.3)" }} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============ Ajustes ============ */
function CfgView({ cfg, setCfg, toast }) {
  const [f, setF] = useState(cfg);
  const salvar = () => { saveCfgLS(f); setCfg(f); toast("Ajustes salvos neste aparelho."); };
  return (
    <div className="fade-up">
      <Title sub="Chaves e endereços ficam guardados só neste aparelho (navegador). Nada vai para servidores nossos.">Ajustes</Title>
      <div className="card" style={{ padding: 18, maxWidth: 680 }}>
        <label className="lbl">Motor de IA</label>
        <select className="in appfont" value={f.provider} onChange={(e) => setF({ ...f, provider: e.target.value })}>
          <option value="gemini">Gemini (chave gratuita · aistudio.google.com)</option>
          <option value="claude">Claude (chave de API paga por uso)</option>
        </select>
        <label className="lbl" style={{ marginTop: 14 }}>Chave do Gemini</label>
        <input type="password" className="in appfont" value={f.geminiKey} onChange={(e) => setF({ ...f, geminiKey: e.target.value })} placeholder="AIza..." />
        <label className="lbl" style={{ marginTop: 14 }}>Modelo Gemini</label>
        <input className="in appfont" value={f.geminiModel} onChange={(e) => setF({ ...f, geminiModel: e.target.value })} placeholder="gemini-2.5-flash" />
        <label className="lbl" style={{ marginTop: 14 }}>Chave do Claude (opcional)</label>
        <input type="password" className="in appfont" value={f.claudeKey} onChange={(e) => setF({ ...f, claudeKey: e.target.value })} placeholder="sk-ant-..." />
        <label className="lbl" style={{ marginTop: 14 }}>Repositório dos robôs no GitHub</label>
        <input className="in appfont" value={f.repoUrl} onChange={(e) => setF({ ...f, repoUrl: e.target.value })} placeholder="https://github.com/usuario/gabinete-robos" />
        <label className="lbl" style={{ marginTop: 14 }}>Token do GitHub (para disparar robôs daqui)</label>
        <input type="password" className="in appfont" value={f.ghToken} onChange={(e) => setF({ ...f, ghToken: e.target.value })} placeholder="github_pat_..." />
        <p style={{ fontSize: 13, color: T.ink2, margin: "6px 0 0" }}>Como criar em 1 minuto: GitHub, Settings, Developer settings, Fine-grained tokens, Generate. Repositório: só o gabinete-robos. Permissões: Actions (leitura e escrita) e Contents (leitura). Cole aqui.</p>
        <label className="lbl" style={{ marginTop: 14 }}>Planilha de prazos da Dra. Bruna (CSV publicado)</label>
        <input className="in appfont" value={f.sheetCsvUrl} onChange={(e) => setF({ ...f, sheetCsvUrl: e.target.value })} placeholder="https://docs.google.com/spreadsheets/d/e/....../pub?output=csv" />
        <p style={{ fontSize: 13, color: T.ink2, margin: "6px 0 0" }}>Na planilha: Arquivo, Compartilhar, Publicar na web, escolher a aba, CSV, copiar o link. O app passa a ler os prazos sozinho (colunas: título; responsável; dias).</p>
        <div className="flex justify-end mt-4"><button className="btng appfont" onClick={salvar}><Check size={15} /> Salvar</button></div>
      </div>
      <p style={{ fontSize: 13, color: T.ink2, marginTop: 14, maxWidth: 680, lineHeight: 1.55 }}>
        Aviso importante: no nível gratuito do Gemini, o Google pode usar o conteúdo enviado para treinar modelos. Serve bem para Diário, pautas e rascunhos gerais (informação pública). Para peças sigilosas e defesas, use a chave do Claude ou trabalhe dentro do Claude.
      </p>
    </div>
  );
}

/* ============ app ============ */
export default function Sistema() {
  const [view, setView] = useState("home");
  const [flows, setFlows] = useState(DEFAULT_FLOWS);
  const [docs, setDocs] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [pubs, setPubs] = useState([]);
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [monitors, setMonitors] = useState([]);
  const [feed, setFeed] = useState(DEFAULT_FEED);
  const [wordDoc, setWordDoc] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [cfg, setCfg] = useState(loadCfg());
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(() => { try { return JSON.parse(localStorage.getItem("gab-sync-meta") || "null"); } catch (e) { return null; } });
  const [flowOpen, setFlowOpen] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const L = async (k, s) => { try { const r = await appStorage.get(k); if (r && r.value) s(JSON.parse(r.value)); } catch (e) {} };
      await L("gab-flows-v4", setFlows); await L("gab-docs-v4", setDocs); await L("gab-deadlines-v4", setDeadlines);
      await L("gab-pubs-v4", setPubs); await L("gab-templates-v4", setTemplates); await L("gab-cats-v4", setCategories);
      await L("gab-monitors-v4", setMonitors); await L("gab-feed-v6", setFeed);
      setLoaded(true);
    })();
  }, []);
  const P = (k, v) => { if (loaded) { (async () => { try { await appStorage.set(k, JSON.stringify(v)); } catch (e) {} })(); } };
  useEffect(() => P("gab-flows-v4", flows), [flows, loaded]);
  useEffect(() => P("gab-docs-v4", docs), [docs, loaded]);
  useEffect(() => P("gab-deadlines-v4", deadlines), [deadlines, loaded]);
  useEffect(() => P("gab-pubs-v4", pubs), [pubs, loaded]);
  useEffect(() => P("gab-templates-v4", templates), [templates, loaded]);
  useEffect(() => P("gab-cats-v4", categories), [categories, loaded]);
  useEffect(() => P("gab-monitors-v4", monitors), [monitors, loaded]);
  useEffect(() => P("gab-feed-v6", feed), [feed, loaded]);

  const toast = (m) => { setToastMsg(m); setTimeout(() => setToastMsg(null), 2800); };
  const syncNow = async (silent) => {
    if (syncing) return;
    if (!parseRepo(cfg)) { if (!silent) toast("Configure o repositório dos robôs em Ajustes."); return; }
    setSyncing(true);
    try {
      const feitos = new Set(JSON.parse(localStorage.getItem("gab-sync-files") || "[]"));
      const arquivos = (await listarArquivosRobos(cfg)).slice(0, 8);
      let novos = 0, prazosNovos = 0;
      const feedItems = []; const dl = [...deadlines];
      for (const f of arquivos) {
        if (feitos.has(f.name)) continue;
        const r = await fetch(f.download_url);
        if (!r.ok) continue;
        const d = await r.json();
        if (d.robo === "spe") {
          localStorage.setItem("gab-spe-last", JSON.stringify(d));
          feedItems.push({ id: Date.now() + Math.random(), kind: "despacho", text: d.status === "duvida" ? `Robô SPE perguntou: ${d.pergunta}` : `SPE: ${d.linhas_brutas ? d.linhas_brutas.length : 0} linhas para ${d.interessado || "consulta"}`, ago: "robô", pinned: false });
          novos++;
        } else {
          for (const pb of (d.publicacoes || []).slice(0, 10)) {
            const tag = ((pb.tags && pb.tags[0]) || "OUTRO").toUpperCase();
            const kind = tag.includes("MULTA") || pb.urgente ? "prazo" : tag.includes("PAUTA") ? "pauta" : "doe";
            feedItems.push({ id: Date.now() + Math.random(), kind, text: `${pb.municipio}: ${(pb.resumo_ia || pb.trecho || "").slice(0, 120)}`, ago: `Diário ${d.edicao || ""}`, pinned: false });
            if (pb.urgente && pb.prazo_dias && !dl.some((x) => x.title === (pb.trecho || "").slice(0, 70))) {
              dl.push({ id: Date.now() + Math.random(), title: (pb.trecho || "Prazo do Diário").slice(0, 70), who: pb.municipio || "", days: parseInt(pb.prazo_dias, 10) || 15 });
              prazosNovos++;
            }
            novos++;
          }
          for (const rp of (d.respostas_pedidos || [])) {
            feedItems.push({ id: Date.now() + Math.random(), kind: "info", text: rp.status === "duvida" ? `Robô perguntou: ${rp.pergunta}` : `Pedido ${rp.id}: ${(rp.achados || []).length} achados`, ago: "robô", pinned: false });
          }
        }
        feitos.add(f.name);
      }
      if (feedItems.length) setFeed((fd) => [...feedItems, ...fd].slice(0, 60));
      if (prazosNovos) setDeadlines(dl.sort((a, b) => a.days - b.days));
      localStorage.setItem("gab-sync-files", JSON.stringify([...feitos].slice(-200)));
      const meta = { quando: Date.now() };
      localStorage.setItem("gab-sync-meta", JSON.stringify(meta));
      setLastSync(meta);
      if (!silent) toast(novos ? `${novos} novidades dos robôs${prazosNovos ? `, ${prazosNovos} prazos` : ""}` : "Nada novo dos robôs por enquanto.");
    } catch (e) {
      if (!silent) toast(e.message || "Falha ao sincronizar com o GitHub.");
    }
    setSyncing(false);
  };

  const lerPlanilha = async (silent) => {
    if (!cfg.sheetCsvUrl) return;
    try {
      const r = await fetch(cfg.sheetCsvUrl);
      if (!r.ok) throw new Error("planilha respondeu " + r.status);
      const rows = parseCsvPrazos(await r.text());
      if (!rows.length) { if (!silent) toast("Li a planilha, mas não reconheci linhas (título; responsável; dias)."); return; }
      setDeadlines((atual) => {
        const chaves = new Set(atual.map((d) => d.title + "|" + d.who));
        const novos = rows.filter((x) => !chaves.has(x.title + "|" + x.who)).map((x) => ({ id: Date.now() + Math.random(), ...x }));
        if (novos.length && !silent) toast(`${novos.length} prazos vindos da planilha da Dra. Bruna`);
        return [...atual, ...novos].sort((a, b) => a.days - b.days);
      });
    } catch (e) { if (!silent) toast("Não consegui ler a planilha publicada. Confira o endereço em Ajustes."); }
  };

  useEffect(() => {
    const meta = lastSync && lastSync.quando ? Date.now() - lastSync.quando : Infinity;
    if (parseRepo(cfg) && meta > 10 * 60 * 1000) syncNow(true);
    lerPlanilha(true);
  }, [cfg.repoUrl, cfg.sheetCsvUrl]);

  const quick = (id) => { setFlowOpen(id === "spe" ? "spe" : id); setView("flows"); };

  const pushDoc = (d) => setDocs((p) => [{ id: Date.now(), ok: false, ...d }, ...p]);
  const addFeed = (kind, text) => setFeed((f) => [{ id: Date.now() + Math.random(), kind, text }, ...f].slice(0, 40));

  const NAV = [
    { k: "home", l: "Hoje", I: LayoutDashboard },
    { k: "chat", l: "Assistente", I: MessageSquare },
    { k: "flows", l: "Fluxos", I: Workflow },
    { k: "acomp", l: "Acompanhamentos", I: Activity },
    { k: "robos", l: "Robôs", I: Bot },
    { k: "docs", l: "Documentos", I: FileText },
  ];
  const pending = docs.filter((d) => !d.ok).length;

  return (
    <div className="appfont" style={{ minHeight: "100vh", color: T.ink }}>
      <style>{CSS}</style>
      <div className="bg" />

      <nav className="dock glass-d">
        {NAV.map((n) => (
          <button key={n.k} title={n.l} onClick={() => setView(n.k)} className={"cbtn" + (view === n.k ? " on" : "")} style={view === n.k ? {} : { background: "rgba(255,255,255,.1)", borderColor: "rgba(255,255,255,.16)", color: "#E9E5DC" }}>
            <n.I size={23} />
            {n.k === "docs" && pending > 0 && (
              <span className="mono" style={{ position: "absolute", top: -3, right: -3, minWidth: 18, height: 18, borderRadius: 999, background: "#C9A84C", color: "#241F12", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px", border: "1.5px solid rgba(255,255,255,.7)" }}>{pending}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="panel-wrap">
        <div className="panel glass">
          <div className="panel-head">
            <span className="glass-d" style={{ borderRadius: 999, padding: "6px 14px", fontSize: 13.5, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 8 }}>
              Gabinete <span className="mono" style={{ fontSize: 10.5, opacity: .55 }}>nome provisório · v0.9</span>
            </span>
            <span style={{ fontSize: 13, color: T.ink2 }}>Adriana Matos Advocacia</span>
            <button onClick={() => setView("cfg")} title="Ajustes" className="cbtn" style={{ width: 38, height: 38, marginLeft: "auto" }}><Settings size={17} /></button>
            <span className="hide-m" style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
              {["Dra. Adriana", "Dra. Bruna", "Carlos"].map((u, i) => (
                <span key={u} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, color: i === 2 ? T.ink : T.ink2 }}><CircleDot size={9} style={{ color: i === 2 ? T.green : "rgba(38,34,27,.3)" }} /> {u}</span>
              ))}
            </span>
          </div>

          <div className="panel-body scroll-thin">
            {view === "home" && <HomeView deadlines={deadlines} setDeadlines={setDeadlines} monitors={monitors} categories={categories} feed={feed} setFeed={setFeed} addFeed={addFeed} go={setView} toast={toast} syncNow={syncNow} syncing={syncing} quick={quick} cfg={cfg} />}
            {view === "chat" && <ChatView />}
            {view === "flows" && <FlowsView flows={flows} setFlows={setFlows} toast={toast} forcedOpen={flowOpen} clearForced={() => setFlowOpen(null)} cfg={cfg} addFeed={addFeed} />}
            {view === "acomp" && <AcompView categories={categories} setCategories={setCategories} monitors={monitors} setMonitors={setMonitors} templates={templates} pushDoc={pushDoc} addFeed={addFeed} toast={toast} />}
            {view === "docs" && <DocsView docs={docs} setDocs={setDocs} templates={templates} setTemplates={setTemplates} openWord={setWordDoc} toast={toast} />}
            {view === "robos" && <RobosView cfg={cfg} toast={toast} />}
            {view === "cfg" && <CfgView cfg={cfg} setCfg={setCfg} toast={toast} />}
          </div>

          <div className="panel-foot">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><CircleDot size={8} style={{ color: (cfg.geminiKey || cfg.claudeKey) ? T.green : T.gold }} /> {(cfg.claudeKey && cfg.provider === "claude") ? "IA: Claude" : cfg.geminiKey ? "IA: Gemini (nível gratuito)" : "IA: configurar em Ajustes"}</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><CircleDot size={8} style={{ color: parseRepo(cfg) ? T.green : "rgba(38,34,27,.3)" }} /> {parseRepo(cfg) ? (lastSync ? "Robôs: sincronizado " + new Date(lastSync.quando).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "Robôs: conectado") : "Robôs: configurar em Ajustes"}</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><CircleDot size={8} style={{ color: "rgba(38,34,27,.3)" }} /> Astrea · fase 2</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><CircleDot size={8} style={{ color: T.gold }} /> Planilha via importar/exportar</span>
          </div>
        </div>
      </div>

      <WordModal doc={wordDoc} onClose={() => setWordDoc(null)} />

      {toastMsg && (
        <div className="toast glass-d fade-up">
          <BadgeCheck size={15} style={{ color: T.gold }} />
          <span style={{ fontSize: 14 }}>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, marginLeft: 4 }}><X size={13} style={{ color: "rgba(255,255,255,.55)" }} /></button>
        </div>
      )}
    </div>
  );
}
