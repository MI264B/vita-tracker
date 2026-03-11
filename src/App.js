import React, { useState, useRef, useEffect } from "react";

// ── Google Fonts ──────────────────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap";
document.head.appendChild(fontLink);

// ── Constants ─────────────────────────────────────────────────────────────────

const GOALS = [
  { id:"gain",      label:"Gain Weight",  icon:"📈", color:"#f97316", grad:"linear-gradient(135deg,#f97316,#fb923c)" },
  { id:"lose",      label:"Lose Weight",  icon:"📉", color:"#06b6d4", grad:"linear-gradient(135deg,#06b6d4,#22d3ee)" },
  { id:"muscle",    label:"Build Muscle", icon:"💪", color:"#8b5cf6", grad:"linear-gradient(135deg,#8b5cf6,#a78bfa)" },
  { id:"maintain",  label:"Maintain",     icon:"⚖️", color:"#10b981", grad:"linear-gradient(135deg,#10b981,#34d399)" },
  { id:"endurance", label:"Endurance",    icon:"🏃", color:"#f43f5e", grad:"linear-gradient(135deg,#f43f5e,#fb7185)" },
];

const WORKOUTS = {
  gain:      [{ name:"Heavy Compound Lifts", hours:"1.0–1.5 hrs", days:"4× week", detail:"Squats, deadlifts, bench press, overhead press" },{ name:"Progressive Overload", hours:"45–60 min", days:"3–4× week", detail:"Increase weight 2–5% each week" },{ name:"Rest Days", hours:"—", days:"3× week", detail:"Light walks, stretching only" }],
  lose:      [{ name:"HIIT Cardio", hours:"20–30 min", days:"4× week", detail:"Sprint intervals, jump rope, cycling" },{ name:"Strength Training", hours:"45–60 min", days:"3× week", detail:"Preserve muscle while in deficit" },{ name:"Low-Intensity Cardio", hours:"30–45 min", days:"Daily", detail:"Walking, swimming, light cycling" }],
  muscle:    [{ name:"Hypertrophy Training", hours:"60–75 min", days:"5× week", detail:"8–12 rep ranges, isolation + compound" },{ name:"Mind-Muscle Focus", hours:"45–60 min", days:"4× week", detail:"Slow eccentrics, full range of motion" },{ name:"Active Recovery", hours:"20–30 min", days:"2× week", detail:"Foam rolling, yoga, mobility work" }],
  maintain:  [{ name:"Mixed Cardio", hours:"30–45 min", days:"3× week", detail:"Cycling, swimming, jogging" },{ name:"Full Body Strength", hours:"45–60 min", days:"3× week", detail:"Balanced compound movements" },{ name:"Flexibility & Stretch", hours:"15–20 min", days:"Daily", detail:"Morning stretching routine" }],
  endurance: [{ name:"Long Distance Run", hours:"60–120 min", days:"3× week", detail:"Zone 2 pace, build mileage 10%/week" },{ name:"Tempo Runs", hours:"30–45 min", days:"2× week", detail:"Lactate threshold training" },{ name:"Cross Training", hours:"45–60 min", days:"2× week", detail:"Cycling or swimming to avoid overuse" }],
};

const SLEEP_TIPS = {
  gain:      ["Sleep 8–9 hrs — growth hormone peaks during deep sleep","Avoid screens 1 hr before bed","Eat a light protein snack before sleep"],
  lose:      ["Sleep 7–8 hrs — poor sleep raises hunger hormones","Keep a consistent sleep schedule","Cool room (65–68°F) improves fat metabolism"],
  muscle:    ["Sleep 8–9 hrs — muscles repair during deep sleep","Short 20-min nap post-workout helps recovery","Magnesium supplement can improve sleep quality"],
  maintain:  ["Sleep 7–8 hrs consistently","Avoid caffeine after 2 PM","Morning sunlight helps regulate circadian rhythm"],
  endurance: ["Sleep 8–10 hrs during heavy training weeks","Elevate legs slightly for better recovery","Track HRV as a sleep quality marker"],
};

const ACTIVITY_MULTIPLIERS = [
  { label:"Sedentary (desk job)",          value:1.2   },
  { label:"Lightly active (1–3×/week)",    value:1.375 },
  { label:"Moderately active (3–5×/week)", value:1.55  },
  { label:"Very active (6–7×/week)",       value:1.725 },
  { label:"Athlete (2×/day)",              value:1.9   },
];

const TABS = [
  { id:"overview",  label:"Overview",  icon:"◈" },
  { id:"log",       label:"Log",       icon:"+" },
  { id:"workouts",  label:"Workouts",  icon:"⚡" },
  { id:"sleep",     label:"Sleep",     icon:"◐" },
  { id:"ai",        label:"AI Coach",  icon:"✦" },
  { id:"history",   label:"History",   icon:"≡" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const calcBMR  = (w,h,age,sex) => { if(!w||!h||!age)return null; return sex==="male"?88.36+13.4*w+4.8*h-5.7*age:447.6+9.2*w+3.1*h-4.3*age; };
const calcBMI  = (w,h) => (!w||!h?null:(w/((h/100)**2)).toFixed(1));
const bmiInfo  = b => { if(!b)return null; if(b<18.5)return{label:"Underweight",color:"#06b6d4"}; if(b<25)return{label:"Normal",color:"#10b981"}; if(b<30)return{label:"Overweight",color:"#f97316"}; return{label:"Obese",color:"#ef4444"}; };
const today    = () => new Date().toLocaleDateString("en-GB");
const nowTime  = () => new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
const uKey     = p => `ht_user_${p}`;
const kKey     = p => `ht_apikey_${p}`;
const loadUser = p => { try{return JSON.parse(localStorage.getItem(uKey(p)))||null;}catch{return null;} };
const saveUser = (p,d) => localStorage.setItem(uKey(p),JSON.stringify(d));
const loadKey  = p => localStorage.getItem(kKey(p))||"";
const saveKey  = (p,k) => localStorage.setItem(kKey(p),k);
const clearKey = p => localStorage.removeItem(kKey(p));

// ── Global CSS ────────────────────────────────────────────────────────────────

const globalCSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0a0b0f;
    --surface: #12141a;
    --surface2: #1a1d26;
    --border: rgba(255,255,255,0.07);
    --border2: rgba(255,255,255,0.12);
    --text: #e8e9f0;
    --text2: #6b7080;
    --text3: #9499a8;
    --font: 'DM Sans', sans-serif;
    --mono: 'Space Mono', monospace;
    --display: 'Syne', sans-serif;
  }
  body { background: var(--bg); color: var(--text); font-family: var(--font); }
  input, select, button, textarea { font-family: var(--font); }
  input[type=number]::-webkit-inner-spin-button { opacity: 0.4; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 99px; }

  .vt-input {
    width: 100%; background: var(--surface2); border: 1px solid var(--border);
    border-radius: 10px; padding: 0.75rem 1rem; color: var(--text);
    font-size: 0.9rem; outline: none; transition: border-color 0.2s;
  }
  .vt-input:focus { border-color: var(--accent, rgba(255,255,255,0.3)); }
  .vt-input::placeholder { color: var(--text2); }

  .vt-select {
    width: 100%; background: var(--surface2); border: 1px solid var(--border);
    border-radius: 10px; padding: 0.75rem 1rem; color: var(--text);
    font-size: 0.9rem; outline: none; cursor: pointer;
    appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236b7080' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 12px center;
  }

  @keyframes fadeUp {
    from { opacity:0; transform:translateY(12px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position:  200% 0; }
  }
  @keyframes pulse {
    0%,100% { opacity:0.5; transform:scale(0.85); }
    50%      { opacity:1;   transform:scale(1.15); }
  }
  @keyframes barGrow {
    from { width: 0 !important; }
  }
  .fade-up { animation: fadeUp 0.35s cubic-bezier(.16,1,.3,1) both; }
  .fade-up-2 { animation: fadeUp 0.35s 0.05s cubic-bezier(.16,1,.3,1) both; }
  .fade-up-3 { animation: fadeUp 0.35s 0.1s  cubic-bezier(.16,1,.3,1) both; }
  .fade-up-4 { animation: fadeUp 0.35s 0.15s cubic-bezier(.16,1,.3,1) both; }
  .bar-grow  { animation: barGrow 0.8s cubic-bezier(.16,1,.3,1) both; }

  .vt-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 1.4rem;
    margin-bottom: 0.75rem;
  }
  .vt-card-hover {
    transition: border-color 0.2s, transform 0.2s;
    cursor: pointer;
  }
  .vt-card-hover:hover {
    border-color: var(--border2);
    transform: translateY(-1px);
  }

  .chip {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 0.5rem 0.9rem; border-radius: 99px; font-size: 0.83rem;
    border: 1.5px solid; cursor: pointer; font-weight: 500;
    transition: all 0.18s;
  }
  .chip:hover { transform: translateY(-1px); }

  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 0.65rem 1rem; border-radius: 10px; cursor: pointer;
    font-size: 0.88rem; font-weight: 500; color: var(--text2);
    transition: all 0.18s; border: none; background: none; width: 100%;
    white-space: nowrap;
  }
  .nav-item:hover { color: var(--text); background: var(--surface2); }
  .nav-item.active { color: var(--text); background: var(--surface2); border-left: 2px solid var(--accent, #8b5cf6); padding-left: calc(1rem - 2px); }
  .nav-icon { font-size: 1rem; width: 22px; text-align: center; }

  .stat-ring {
    position: relative; display: flex; align-items: center;
    justify-content: center; flex-direction: column;
  }

  .pill-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 0.35rem 0.75rem; border-radius: 99px; font-size: 0.75rem;
    border: 1px solid var(--border); background: var(--surface2);
    color: var(--text3); cursor: pointer; transition: all 0.15s;
    white-space: nowrap;
  }
  .pill-btn:hover { color: var(--text); border-color: var(--border2); }

  .progress-track {
    height: 6px; border-radius: 99px;
    background: rgba(255,255,255,0.05);
    position: relative; overflow: hidden;
  }
  .progress-fill {
    position: absolute; left:0; top:0; bottom:0;
    border-radius: 99px;
    transition: width 0.8s cubic-bezier(.16,1,.3,1);
  }

  .food-result-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 0.7rem 0.9rem; border-radius: 10px;
    background: var(--surface2); border: 1px solid var(--border);
    margin-bottom: 0.4rem; transition: border-color 0.15s;
  }
  .food-result-row:hover { border-color: var(--border2); }

  .log-row {
    display: flex; align-items: center; gap: 8px;
    padding: 0.55rem 0; border-bottom: 1px solid var(--border);
    font-size: 0.83rem;
  }
  .log-row:last-child { border-bottom: none; }

  .badge {
    display: inline-block; padding: 0.2rem 0.55rem;
    border-radius: 99px; font-size: 0.72rem; font-weight: 600;
  }

  @media (max-width: 700px) {
    .sidebar { display: none !important; }
    .mobile-nav { display: flex !important; }
    .main-content { margin-left: 0 !important; }
  }
  @media (min-width: 701px) {
    .mobile-nav { display: none !important; }
  }
`;

function GlobalStyles() {
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = globalCSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);
  return null;
}

// ── API Key Panel ─────────────────────────────────────────────────────────────

function ApiKeyPanel({ phone, onSave, accentColor }) {
  const [key, setKey] = useState("");
  const [err, setErr] = useState("");

  function save() {
    const k = key.trim();
    if (!k.startsWith("AI")) { setErr("Gemini keys start with 'AI…' — double-check yours"); return; }
    saveKey(phone, k); onSave(k);
  }

  return (
    <div className="vt-card fade-up" style={{ maxWidth: 520, margin: "0 auto", borderColor: `${accentColor}30` }}>
      <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:"1.4rem" }}>
        <div style={{ width:44, height:44, borderRadius:12, background:`${accentColor}15`, border:`1px solid ${accentColor}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.4rem" }}>✦</div>
        <div>
          <div style={{ fontFamily:"var(--display)", fontSize:"1.1rem", fontWeight:800, color:"var(--text)", letterSpacing:"-0.02em" }}>Connect AI Coach</div>
          <div style={{ fontSize:"0.78rem", color:"#10b981", marginTop:2 }}>Google Gemini · Free tier · 1,500 msgs/day</div>
        </div>
      </div>

      <div style={{ background:"var(--surface2)", borderRadius:12, padding:"1rem 1.1rem", marginBottom:"1.2rem" }}>
        {[
          ["01","Go to","aistudio.google.com/apikey","https://aistudio.google.com/apikey"],
          ["02","Sign in with Google → click","Create API Key",null],
          ["03","Copy and paste the key below","",null],
        ].map(([n,pre,link,href])=>(
          <div key={n} style={{ display:"flex", gap:12, marginBottom:"0.65rem", alignItems:"flex-start" }}>
            <span style={{ fontFamily:"var(--mono)", fontSize:"0.7rem", color:`${accentColor}99`, paddingTop:2, flexShrink:0 }}>{n}</span>
            <span style={{ fontSize:"0.85rem", color:"var(--text3)", lineHeight:1.5 }}>
              {pre} {href
                ? <a href={href} target="_blank" rel="noreferrer" style={{ color:accentColor, textDecoration:"none", fontWeight:600 }}>{link}</a>
                : <span style={{ color:"var(--text)", fontWeight:600 }}>{link}</span>}
            </span>
          </div>
        ))}
      </div>

      <label style={{ fontSize:"0.72rem", textTransform:"uppercase", letterSpacing:"0.1em", color:"var(--text2)", display:"block", marginBottom:6 }}>API Key</label>
      <input className="vt-input" style={{ fontFamily:"var(--mono)", fontSize:"0.82rem", marginBottom:"0.6rem", "--accent":accentColor }} placeholder="AIzaSy…"
        value={key} onChange={e=>{setKey(e.target.value);setErr("");}} onKeyDown={e=>e.key==="Enter"&&save()} />
      {err && <p style={{ color:"#f43f5e", fontSize:"0.78rem", marginBottom:"0.6rem" }}>{err}</p>}
      <button onClick={save} style={{ width:"100%", background:`linear-gradient(135deg,${accentColor},${accentColor}cc)`, color:"#fff", border:"none", borderRadius:10, padding:"0.8rem", fontSize:"0.92rem", fontWeight:700, cursor:"pointer", letterSpacing:"0.01em" }}>
        Connect & Start Chatting →
      </button>
      <p style={{ fontSize:"0.7rem", color:"var(--text2)", textAlign:"center", marginTop:"0.8rem" }}>Saved to your account on this device only.</p>
    </div>
  );
}

// ── AI Chat ───────────────────────────────────────────────────────────────────

function AIChat({ user, phone, goalObj, apiKey, onChangeKey, chatMessages, setChatMessages }) {
  const profile = user.profile;
  const bmr     = calcBMR(Number(profile.weight),Number(profile.height),Number(profile.age),profile.sex);
  const tdee    = bmr ? Math.round(bmr * profile.activity) : null;
  const bmi     = calcBMI(Number(profile.weight),Number(profile.height));

  const todayE    = user.history.filter(e=>e.date===today());
  const totalCals = todayE.reduce((s,e)=>s+(e.calories||0),0);
  const totalProt = todayE.reduce((s,e)=>s+(e.protein||0),0);
  const totalWat  = todayE.reduce((s,e)=>s+(e.water||0),0);
  const totalSlp  = todayE.reduce((s,e)=>s+(e.sleep||0),0);

  const recentHistory = Object.entries(
    [...user.history].reverse().reduce((acc,e)=>{
      if(!acc[e.date]) acc[e.date]={cals:0,protein:0,sleep:0};
      acc[e.date].cals+=e.calories||0; acc[e.date].protein+=e.protein||0; acc[e.date].sleep+=e.sleep||0;
      return acc;
    },{})
  ).slice(0,5);

  const systemInstruction = `You are Vita, a warm personal health coach inside VitaTrack. Give personalized, concise, actionable advice.
USER: ${user.name} | Goal: ${goalObj.label} | ${profile.weight}kg ${profile.height}cm ${profile.age}yo ${profile.sex}
BMR: ${bmr?Math.round(bmr):"?"} | TDEE: ${tdee||"?"} | BMI: ${bmi||"?"}
TODAY: ${totalCals}kcal ${totalProt}g protein ${totalWat} cups water ${totalSlp}h sleep (${todayE.length} entries)
LAST 5 DAYS: ${recentHistory.map(([d,v])=>`${d}:${v.cals}cal/${v.protein}g`).join(", ")||"none"}
Respond in 2-4 short paragraphs. Be specific with their numbers. Be encouraging but honest. Plain text, no markdown headers.`;

  const greeting = [{ role:"model", parts:[{ text:`Hi ${user.name}! ✦ I'm Vita, your personal health coach. I can see your stats and today's progress. Ask me anything — meals, workouts, sleep, or how you're tracking toward your ${goalObj.label} goal!` }] }];
  const messages    = chatMessages ?? greeting;
  const setMessages = setChatMessages;

  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const bottomRef = useRef(null);
  const scroll = () => setTimeout(()=>bottomRef.current?.scrollIntoView({behavior:"smooth"}),50);

  async function send(overrideText) {
    const text = (typeof overrideText==="string" ? overrideText : input).trim();
    if (!text || loading) return;
    setInput(""); setError("");
    const userMsg = { role:"user", parts:[{text}] };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs); setLoading(true); scroll();
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        { method:"POST", headers:{"Content-Type":"application/json"},
          body:JSON.stringify({ system_instruction:{parts:[{text:systemInstruction}]}, contents:newMsgs, generationConfig:{maxOutputTokens:2048,temperature:0.7} }) }
      );
      const data = await res.json();
      if (data.error) { setError(data.error.message||"API error — check your key."); setMessages(prev=>prev.slice(0,-1)); }
      else { const reply=data.candidates?.[0]?.content?.parts?.[0]?.text||"No response."; setMessages(prev=>[...prev,{role:"model",parts:[{text:reply}]}]); }
    } catch { setError("Network error — check your connection."); setMessages(prev=>prev.slice(0,-1)); }
    setLoading(false); scroll();
  }

  const quickPrompts = ["What should I eat today?","Am I on track?","Workout for today","Improve my sleep","High-protein meals","Adjust my calories?"];
  const c = goalObj.color;

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"calc(100vh - 130px)", minHeight:480 }}>
      {/* Header bar */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0.9rem 1.2rem", background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"14px 14px 0 0", marginBottom:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:10, background:`${c}20`, border:`1px solid ${c}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1rem", color:c }}>✦</div>
          <div>
            <div style={{ fontWeight:700, fontSize:"0.9rem", color:"var(--text)" }}>Vita — AI Coach</div>
            <div style={{ fontSize:"0.68rem", color:"#10b981" }}>● Gemini 2.5 Flash · Free</div>
          </div>
        </div>
        <button className="pill-btn" onClick={onChangeKey}>Change Key</button>
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:"auto", background:"var(--surface)", borderLeft:"1px solid var(--border)", borderRight:"1px solid var(--border)", padding:"1rem 1.1rem", display:"flex", flexDirection:"column", gap:"0.75rem" }}>
        {messages.map((m,i)=>{
          const isUser = m.role==="user";
          return (
            <div key={i} style={{ display:"flex", justifyContent:isUser?"flex-end":"flex-start", gap:8, alignItems:"flex-start" }}>
              {!isUser && <div style={{ width:26, height:26, borderRadius:8, background:`${c}15`, border:`1px solid ${c}35`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.75rem", color:c, flexShrink:0, marginTop:2 }}>✦</div>}
              <div style={{ maxWidth:"78%", padding:"0.7rem 1rem", borderRadius:isUser?"14px 14px 4px 14px":"14px 14px 14px 4px", background:isUser?`${c}18`:"var(--surface2)", border:`1px solid ${isUser?c+"30":"var(--border)"}`, fontSize:"0.87rem", lineHeight:1.7, color:"var(--text)", whiteSpace:"pre-wrap" }}>
                {m.parts?.[0]?.text}
              </div>
            </div>
          );
        })}
        {loading && (
          <div style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
            <div style={{ width:26, height:26, borderRadius:8, background:`${c}15`, border:`1px solid ${c}35`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.75rem", color:c, flexShrink:0 }}>✦</div>
            <div style={{ padding:"0.75rem 1rem", borderRadius:"14px 14px 14px 4px", background:"var(--surface2)", border:"1px solid var(--border)", display:"flex", gap:5, alignItems:"center" }}>
              {[0,1,2].map(n=><span key={n} style={{ width:6,height:6,borderRadius:"50%",background:c,display:"inline-block",animation:`pulse 1.1s ${n*0.18}s ease-in-out infinite` }}/>)}
            </div>
          </div>
        )}
        {error && <div style={{ background:"rgba(244,63,94,0.08)", border:"1px solid rgba(244,63,94,0.25)", borderRadius:10, padding:"0.65rem 1rem", fontSize:"0.82rem", color:"#f43f5e" }}>⚠ {error}</div>}
        <div ref={bottomRef}/>
      </div>

      {/* Quick prompts */}
      <div style={{ padding:"0.5rem 0.9rem", display:"flex", gap:5, flexWrap:"wrap", background:"var(--surface)", borderLeft:"1px solid var(--border)", borderRight:"1px solid var(--border)", borderTop:"1px solid var(--border)" }}>
        {quickPrompts.map((q,i)=><button key={i} className="pill-btn" onClick={()=>send(q)}>{q}</button>)}
      </div>

      {/* Input */}
      <div style={{ display:"flex", gap:8, padding:"0.75rem", background:"var(--surface)", border:"1px solid var(--border)", borderTop:"none", borderRadius:"0 0 14px 14px" }}>
        <input className="vt-input" style={{ "--accent":c, flex:1, margin:0 }} placeholder="Ask Vita anything…" value={input}
          onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} />
        <button onClick={()=>send()} disabled={loading} style={{ background:c, border:"none", borderRadius:10, width:44, height:44, flexShrink:0, cursor:"pointer", fontSize:"1.1rem", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", opacity:loading?0.5:1, transition:"opacity 0.2s" }}>↑</button>
      </div>
    </div>
  );
}

// ── Login ─────────────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }) {
  const [phone,setPhone]=useState(""); const [name,setName]=useState("");
  const [err,setErr]=useState(""); const [mode,setMode]=useState("login");

  function handle() {
    const p=phone.trim().replace(/\s/g,"");
    if(!/^\+?\d{7,15}$/.test(p)){setErr("Enter a valid mobile number");return;}
    const existing=loadUser(p);
    if(mode==="login"){ if(!existing){setErr("No account found — register first");return;} onLogin(p,existing); }
    else { if(!name.trim()){setErr("Enter your name");return;} const f={name:name.trim(),phone:p,profile:null,history:[]}; saveUser(p,f); onLogin(p,f); }
  }

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center", padding:"1.5rem", position:"relative", overflow:"hidden" }}>
      {/* Ambient blobs */}
      <div style={{ position:"absolute", top:"-20%", right:"-10%", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(139,92,246,0.06) 0%,transparent 70%)", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", bottom:"-15%", left:"-10%", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(16,185,129,0.05) 0%,transparent 70%)", pointerEvents:"none" }}/>

      <div className="fade-up" style={{ width:"100%", maxWidth:420 }}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:"2.5rem" }}>
          <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:56, height:56, borderRadius:16, background:"linear-gradient(135deg,#8b5cf6,#06b6d4)", marginBottom:"1rem", fontSize:"1.6rem" }}>✦</div>
          <h1 style={{ fontFamily:"var(--display)", fontSize:"2.2rem", fontWeight:800, color:"var(--text)", letterSpacing:"-0.04em", lineHeight:1 }}>VitaTrack</h1>
          <p style={{ color:"var(--text2)", fontSize:"0.88rem", marginTop:"0.4rem" }}>Your personal health companion</p>
        </div>

        {/* Card */}
        <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:20, padding:"1.8rem" }}>
          {/* Mode toggle */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4, background:"var(--surface2)", borderRadius:10, padding:4, marginBottom:"1.4rem" }}>
            {["login","register"].map(m=>(
              <button key={m} onClick={()=>{setMode(m);setErr("");}} style={{ padding:"0.6rem", borderRadius:8, border:"none", background:mode===m?"var(--bg)":"transparent", color:mode===m?"var(--text)":"var(--text2)", fontWeight:600, fontSize:"0.88rem", cursor:"pointer", transition:"all 0.18s", boxShadow:mode===m?"0 1px 4px rgba(0,0,0,0.3)":"none" }}>
                {m==="login"?"Sign In":"Register"}
              </button>
            ))}
          </div>

          {mode==="register" && (
            <div style={{ marginBottom:"0.9rem" }}>
              <label style={{ fontSize:"0.72rem", textTransform:"uppercase", letterSpacing:"0.1em", color:"var(--text2)", display:"block", marginBottom:6 }}>Full Name</label>
              <input className="vt-input" placeholder="Your name" value={name} onChange={e=>setName(e.target.value)}/>
            </div>
          )}
          <div style={{ marginBottom:"0.9rem" }}>
            <label style={{ fontSize:"0.72rem", textTransform:"uppercase", letterSpacing:"0.1em", color:"var(--text2)", display:"block", marginBottom:6 }}>Mobile Number</label>
            <input className="vt-input" placeholder="+91 98765 43210" value={phone} onChange={e=>{setPhone(e.target.value);setErr("");}} onKeyDown={e=>e.key==="Enter"&&handle()}/>
          </div>

          {err && <div style={{ background:"rgba(244,63,94,0.08)", border:"1px solid rgba(244,63,94,0.2)", borderRadius:8, padding:"0.6rem 0.9rem", fontSize:"0.82rem", color:"#f43f5e", marginBottom:"0.8rem" }}>{err}</div>}

          <button onClick={handle} style={{ width:"100%", background:"linear-gradient(135deg,#8b5cf6,#06b6d4)", border:"none", borderRadius:10, padding:"0.85rem", fontSize:"0.95rem", fontWeight:700, color:"#fff", cursor:"pointer", letterSpacing:"0.01em" }}>
            {mode==="login" ? "Sign In →" : "Create Account →"}
          </button>
          <p style={{ fontSize:"0.75rem", color:"var(--text2)", textAlign:"center", marginTop:"1rem" }}>Stored locally by mobile number</p>
        </div>
      </div>
    </div>
  );
}

// ── Profile Setup ─────────────────────────────────────────────────────────────

function ProfileSetup({ user, onSave }) {
  const [goal,setGoal]=useState("gain");
  const [form,setForm]=useState({weight:"",height:"",age:"",sex:"male",activity:1.375});
  const goalObj = GOALS.find(g=>g.id===goal);

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center", padding:"1.5rem", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:"10%", right:"5%", width:350, height:350, borderRadius:"50%", background:`radial-gradient(circle,${goalObj.color}08 0%,transparent 70%)`, pointerEvents:"none", transition:"background 0.4s" }}/>

      <div className="fade-up" style={{ width:"100%", maxWidth:520 }}>
        <div style={{ marginBottom:"1.8rem" }}>
          <div style={{ fontFamily:"var(--display)", fontSize:"1.7rem", fontWeight:800, color:"var(--text)", letterSpacing:"-0.03em" }}>Hey, {user.name} 👋</div>
          <div style={{ color:"var(--text2)", marginTop:"0.3rem", fontSize:"0.9rem" }}>Let's personalise VitaTrack for you</div>
        </div>

        <div className="vt-card">
          {/* Goal selector */}
          <div style={{ marginBottom:"1.4rem" }}>
            <label style={{ fontSize:"0.72rem", textTransform:"uppercase", letterSpacing:"0.1em", color:"var(--text2)", display:"block", marginBottom:10 }}>Your Primary Goal</label>
            <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
              {GOALS.map(g=>(
                <button key={g.id} className="chip" onClick={()=>setGoal(g.id)}
                  style={{ borderColor:goal===g.id?g.color:"var(--border)", color:goal===g.id?g.color:"var(--text2)", background:goal===g.id?`${g.color}12`:"transparent" }}>
                  {g.icon} {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stats grid */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.85rem", marginBottom:"0.85rem" }}>
            {[["weight","Weight","kg","70"],["height","Height","cm","175"],["age","Age","yrs","25"]].map(([k,lbl,unit,ph])=>(
              <div key={k}>
                <label style={{ fontSize:"0.72rem", textTransform:"uppercase", letterSpacing:"0.1em", color:"var(--text2)", display:"block", marginBottom:6 }}>{lbl} <span style={{ color:"var(--text2)", fontSize:"0.68rem" }}>({unit})</span></label>
                <input className="vt-input" type="number" placeholder={ph} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} style={{ "--accent":goalObj.color }}/>
              </div>
            ))}
            <div>
              <label style={{ fontSize:"0.72rem", textTransform:"uppercase", letterSpacing:"0.1em", color:"var(--text2)", display:"block", marginBottom:6 }}>Sex</label>
              <select className="vt-select" value={form.sex} onChange={e=>setForm(f=>({...f,sex:e.target.value}))}>
                <option value="male">Male</option><option value="female">Female</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom:"1.2rem" }}>
            <label style={{ fontSize:"0.72rem", textTransform:"uppercase", letterSpacing:"0.1em", color:"var(--text2)", display:"block", marginBottom:6 }}>Activity Level</label>
            <select className="vt-select" value={form.activity} onChange={e=>setForm(f=>({...f,activity:Number(e.target.value)}))}>
              {ACTIVITY_MULTIPLIERS.map(a=><option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
          </div>

          <button onClick={()=>{if(!form.weight||!form.height||!form.age)return;onSave({goal,...form});}}
            style={{ width:"100%", background:goalObj.grad, border:"none", borderRadius:10, padding:"0.85rem", fontSize:"0.95rem", fontWeight:700, color:"#fff", cursor:"pointer" }}>
            Start Tracking →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Progress Ring SVG ─────────────────────────────────────────────────────────

function Ring({ pct, color, size=80, stroke=6 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" style={{ transition:"stroke-dasharray 0.8s cubic-bezier(.16,1,.3,1)" }}/>
    </svg>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

function Dashboard({ user, phone, onLogout, onUpdateUser }) {
  const profile  = user.profile;
  const goalObj  = GOALS.find(g=>g.id===profile.goal);
  const workouts = WORKOUTS[profile.goal];
  const sleepTips= SLEEP_TIPS[profile.goal];
  const c        = goalObj.color;

  const [apiKey, setApiKey]         = useState(()=>loadKey(phone));
  const [tab, setTab]               = useState("overview");
  const [chatMessages, setChatMessages] = useState(null);
  const [logInput, setLogInput]     = useState({calories:"",protein:"",water:"",sleep:"",note:""});
  const [foodQuery, setFoodQuery]   = useState("");
  const [foodResults, setFoodResults] = useState([]);
  const [foodLoading, setFoodLoading] = useState(false);
  const [foodError, setFoodError]   = useState("");
  const [selectedFoods, setSelectedFoods] = useState([]);

  const bmr  = calcBMR(Number(profile.weight),Number(profile.height),Number(profile.age),profile.sex);
  const tdee = bmr ? Math.round(bmr*profile.activity) : null;
  const bmi  = calcBMI(Number(profile.weight),Number(profile.height));
  const bi   = bmiInfo(Number(bmi));
  const targetCals    = tdee ? ({gain:tdee+500,lose:tdee-400,muscle:tdee+300,endurance:tdee+200}[profile.goal]||tdee) : null;
  const targetProtein = Math.round(Number(profile.weight)*1.6);

  const todayEntries = user.history.filter(e=>e.date===today());
  const totalCals  = todayEntries.reduce((s,e)=>s+(e.calories||0),0);
  const totalProt  = todayEntries.reduce((s,e)=>s+(e.protein||0),0);
  const totalWater = todayEntries.reduce((s,e)=>s+(e.water||0),0);
  const totalSleep = todayEntries.reduce((s,e)=>s+(e.sleep||0),0);

  const grouped = {};
  [...user.history].reverse().forEach(e=>{if(!grouped[e.date])grouped[e.date]=[];grouped[e.date].push(e);});
  const pct = (v,m) => m ? Math.min(100,Math.round(v/m*100)) : 0;

  function addEntry() {
    if(!logInput.calories&&!logInput.protein&&!logInput.water&&!logInput.sleep) return;
    const entry={id:Date.now(),date:today(),time:nowTime(),calories:Number(logInput.calories)||0,protein:Number(logInput.protein)||0,water:Number(logInput.water)||0,sleep:Number(logInput.sleep)||0,note:logInput.note||"Entry"};
    const updated={...user,history:[...user.history,entry]};
    saveUser(phone,updated); onUpdateUser(updated);
    setLogInput({calories:"",protein:"",water:"",sleep:"",note:""});
    setSelectedFoods([]);
  }

  async function searchFood() {
    const q=foodQuery.trim(); if(!q)return;
    setFoodLoading(true); setFoodError(""); setFoodResults([]);
    try {
      const res=await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=6&fields=product_name,nutriments,serving_size,brands`);
      const data=await res.json();
      const items=(data.products||[]).filter(p=>p.product_name&&p.nutriments?.["energy-kcal_100g"]).slice(0,6).map(p=>({
        name:p.product_name, brand:p.brands||"", serving:p.serving_size||"100g",
        cal100:Math.round(p.nutriments["energy-kcal_100g"]||0),
        prot100:Math.round((p.nutriments["proteins_100g"]||0)*10)/10,
        carb100:Math.round((p.nutriments["carbohydrates_100g"]||0)*10)/10,
        fat100:Math.round((p.nutriments["fat_100g"]||0)*10)/10, grams:100,
      }));
      if(items.length===0) setFoodError("No results — try a different name.");
      else setFoodResults(items);
    } catch { setFoodError("Could not reach food database."); }
    setFoodLoading(false);
  }

  function addFoodToLog(food) {
    const ratio=food.grams/100;
    const cals=Math.round(food.cal100*ratio), prot=Math.round(food.prot100*ratio*10)/10;
    setSelectedFoods(prev=>[...prev,{...food,cals,prot}]);
    setLogInput(l=>({...l, calories:String((Number(l.calories)||0)+cals), protein:String(Math.round(((Number(l.protein)||0)+prot)*10)/10), note:l.note?l.note+", "+food.name:food.name }));
    setFoodResults([]); setFoodQuery("");
  }

  function removeFoodFromLog(idx) {
    const food=selectedFoods[idx];
    setSelectedFoods(prev=>prev.filter((_,i)=>i!==idx));
    setLogInput(l=>({...l, calories:String(Math.max(0,(Number(l.calories)||0)-food.cals)), protein:String(Math.max(0,Math.round(((Number(l.protein)||0)-food.prot)*10)/10)) }));
  }

  function updateGrams(idx,grams) {
    const g=Number(grams)||0, food=selectedFoods[idx];
    const oldCals=food.cals, oldProt=food.prot;
    const newCals=Math.round(food.cal100*g/100), newProt=Math.round(food.prot100*g/100*10)/10;
    setSelectedFoods(prev=>prev.map((f,i)=>i===idx?{...f,grams:g,cals:newCals,prot:newProt}:f));
    setLogInput(l=>({...l, calories:String(Math.max(0,(Number(l.calories)||0)-oldCals+newCals)), protein:String(Math.max(0,Math.round(((Number(l.protein)||0)-oldProt+newProt)*10)/10)) }));
  }

  function handleSaveKey(k){ saveKey(phone,k); setApiKey(k); }
  function handleChangeKey(){ clearKey(phone); setApiKey(""); }

  const progressItems = [
    { label:"Calories", val:totalCals, max:targetCals||2000, unit:"kcal", color:c },
    { label:"Protein",  val:totalProt, max:targetProtein,    unit:"g",    color:"#8b5cf6" },
    { label:"Water",    val:totalWater,max:8,                unit:"cups", color:"#06b6d4" },
    { label:"Sleep",    val:totalSleep,max:9,                unit:"hrs",  color:"#f59e0b" },
  ];

  // Apply accent CSS var
  useEffect(()=>{
    document.documentElement.style.setProperty("--accent", c);
  },[c]);

  const LBL = { fontSize:"0.7rem", textTransform:"uppercase", letterSpacing:"0.1em", color:"var(--text2)", display:"block", marginBottom:6 };

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"var(--bg)" }}>

      {/* ── Sidebar (desktop) ── */}
      <aside className="sidebar" style={{ width:220, flexShrink:0, background:"var(--surface)", borderRight:"1px solid var(--border)", display:"flex", flexDirection:"column", position:"fixed", top:0, left:0, bottom:0, zIndex:10 }}>
        {/* Brand */}
        <div style={{ padding:"1.4rem 1.2rem 1rem", borderBottom:"1px solid var(--border)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:9 }}>
            <div style={{ width:34, height:34, borderRadius:10, background:goalObj.grad, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1rem", color:"#fff", flexShrink:0 }}>✦</div>
            <div>
              <div style={{ fontFamily:"var(--display)", fontWeight:800, fontSize:"1rem", letterSpacing:"-0.03em", color:"var(--text)" }}>VitaTrack</div>
              <div style={{ fontSize:"0.68rem", color:c, fontWeight:600 }}>{goalObj.icon} {goalObj.label}</div>
            </div>
          </div>
        </div>

        {/* User */}
        <div style={{ padding:"0.8rem 1.2rem", borderBottom:"1px solid var(--border)" }}>
          <div style={{ fontSize:"0.88rem", fontWeight:600, color:"var(--text)" }}>{user.name}</div>
          <div style={{ fontSize:"0.72rem", color:"var(--text2)", marginTop:2 }}>{phone}</div>
        </div>

        {/* Nav */}
        <nav style={{ padding:"0.6rem 0.7rem", flex:1 }}>
          {TABS.map(t=>(
            <button key={t.id} className={`nav-item ${tab===t.id?"active":""}`} onClick={()=>setTab(t.id)}
              style={{ "--accent":c }}>
              <span className="nav-icon">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>

        {/* Stats mini */}
        <div style={{ padding:"0.8rem 1.1rem", borderTop:"1px solid var(--border)" }}>
          <div style={{ fontSize:"0.68rem", textTransform:"uppercase", letterSpacing:"0.1em", color:"var(--text2)", marginBottom:8 }}>Today</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4, marginBottom:"0.8rem" }}>
            {[{v:totalCals,u:"cal",col:c},{v:totalProt,u:"g prot",col:"#8b5cf6"},{v:totalWater,u:"cups",col:"#06b6d4"},{v:totalSleep,u:"h sleep",col:"#f59e0b"}].map((s,i)=>(
              <div key={i} style={{ background:"var(--surface2)", borderRadius:8, padding:"0.4rem 0.55rem" }}>
                <div style={{ fontFamily:"var(--mono)", fontSize:"0.82rem", fontWeight:700, color:s.col }}>{s.v}</div>
                <div style={{ fontSize:"0.62rem", color:"var(--text2)" }}>{s.u}</div>
              </div>
            ))}
          </div>
          <button onClick={onLogout} style={{ width:"100%", background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:8, padding:"0.55rem", fontSize:"0.78rem", color:"var(--text2)", cursor:"pointer", transition:"all 0.15s" }}
            onMouseEnter={e=>e.target.style.color="var(--text)"} onMouseLeave={e=>e.target.style.color="var(--text2)"}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="main-content" style={{ flex:1, marginLeft:220, minHeight:"100vh", overflowY:"auto" }}>
        <div style={{ maxWidth:780, margin:"0 auto", padding:"1.8rem 1.5rem" }}>

          {/* ── OVERVIEW ── */}
          {tab==="overview" && (
            <div>
              <div className="fade-up" style={{ marginBottom:"1.4rem" }}>
                <h2 style={{ fontFamily:"var(--display)", fontSize:"1.5rem", fontWeight:800, color:"var(--text)", letterSpacing:"-0.03em" }}>Good {new Date().getHours()<12?"morning":new Date().getHours()<17?"afternoon":"evening"}, {user.name.split(" ")[0]}</h2>
                <p style={{ color:"var(--text2)", fontSize:"0.88rem", marginTop:4 }}>{today()} · {goalObj.icon} {goalObj.label}</p>
              </div>

              {/* Metric cards */}
              <div className="fade-up-2" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"0.75rem", marginBottom:"0.75rem" }}>
                {[
                  { label:"Target Calories", val:targetCals||"—", unit:"kcal/day", color:c },
                  { label:"BMI", val:bmi||"—", unit:bi?.label||"", color:bi?.color||"#7a7080" },
                  { label:"TDEE", val:tdee||"—", unit:"maintenance", color:"#06b6d4" },
                ].map((m,i)=>(
                  <div key={i} className="vt-card" style={{ textAlign:"center", padding:"1.2rem" }}>
                    <div style={{ fontFamily:"var(--mono)", fontSize:"1.6rem", fontWeight:700, color:m.color, lineHeight:1, letterSpacing:"-0.02em" }}>{m.val}</div>
                    <div style={{ fontSize:"0.68rem", color:"var(--text2)", marginTop:5, textTransform:"uppercase", letterSpacing:"0.08em" }}>{m.label}</div>
                    {m.unit && <div style={{ fontSize:"0.7rem", color:m.color, marginTop:2, opacity:0.8 }}>{m.unit}</div>}
                  </div>
                ))}
              </div>

              {/* Progress rings + bars */}
              <div className="vt-card fade-up-3">
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.2rem" }}>
                  <span style={{ fontWeight:700, fontSize:"0.95rem", color:"var(--text)" }}>Today's Progress</span>
                  <span style={{ fontFamily:"var(--mono)", fontSize:"0.75rem", color:"var(--text2)" }}>{today()}</span>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1rem", marginBottom:"1.2rem" }}>
                  {progressItems.map(item=>(
                    <div key={item.label} style={{ textAlign:"center" }}>
                      <div style={{ position:"relative", display:"inline-flex", alignItems:"center", justifyContent:"center" }}>
                        <Ring pct={pct(item.val,item.max)} color={item.color} size={72} stroke={5}/>
                        <div style={{ position:"absolute", textAlign:"center" }}>
                          <div style={{ fontFamily:"var(--mono)", fontSize:"0.78rem", fontWeight:700, color:item.color, lineHeight:1 }}>{pct(item.val,item.max)}%</div>
                        </div>
                      </div>
                      <div style={{ fontSize:"0.7rem", color:"var(--text2)", marginTop:5 }}>{item.label}</div>
                      <div style={{ fontFamily:"var(--mono)", fontSize:"0.7rem", color:item.color, marginTop:1 }}>{item.val}<span style={{ color:"var(--text2)", fontSize:"0.65rem" }}>/{item.max}</span></div>
                    </div>
                  ))}
                </div>
                {/* Bar breakdown */}
                {progressItems.map(item=>(
                  <div key={item.label} style={{ marginBottom:"0.7rem" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:"0.78rem", marginBottom:4 }}>
                      <span style={{ color:"var(--text3)" }}>{item.label}</span>
                      <span style={{ color:item.color, fontFamily:"var(--mono)" }}>{item.val} / {item.max} {item.unit}</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill bar-grow" style={{ width:`${pct(item.val,item.max)}%`, background:`linear-gradient(90deg,${item.color}66,${item.color})` }}/>
                    </div>
                  </div>
                ))}
              </div>

              {/* AI nudge */}
              <div className="vt-card vt-card-hover fade-up-4" onClick={()=>setTab("ai")} style={{ borderColor:`${c}25`, background:`${c}08`, padding:"1rem 1.2rem" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:36, height:36, borderRadius:10, background:`${c}15`, border:`1px solid ${c}30`, display:"flex", alignItems:"center", justifyContent:"center", color:c, fontSize:"1rem" }}>✦</div>
                    <div>
                      <div style={{ fontWeight:700, color:c, fontSize:"0.88rem" }}>Chat with Vita — AI Coach</div>
                      <div style={{ color:"var(--text2)", fontSize:"0.78rem", marginTop:1 }}>{apiKey?"Ready · Knows your stats today →":"Connect Gemini free API →"}</div>
                    </div>
                  </div>
                  <span style={{ color:c, fontSize:"1.2rem" }}>→</span>
                </div>
              </div>

              {/* Recent entries */}
              {todayEntries.length > 0 && (
                <div className="vt-card fade-up-4">
                  <div style={{ fontSize:"0.72rem", textTransform:"uppercase", letterSpacing:"0.1em", color:"var(--text2)", marginBottom:"0.9rem" }}>Today's Entries</div>
                  {todayEntries.map(e=>(
                    <div key={e.id} className="log-row">
                      <span style={{ fontFamily:"var(--mono)", fontSize:"0.72rem", color:"var(--text2)", minWidth:40 }}>{e.time}</span>
                      <span style={{ flex:1, color:"var(--text3)", fontSize:"0.84rem" }}>{e.note}</span>
                      {e.calories>0 && <span className="badge" style={{ background:`${c}15`, color:c }}>{e.calories} kcal</span>}
                      {e.protein>0  && <span className="badge" style={{ background:"rgba(139,92,246,0.12)", color:"#8b5cf6" }}>{e.protein}g</span>}
                      {e.sleep>0    && <span className="badge" style={{ background:"rgba(245,158,11,0.12)", color:"#f59e0b" }}>{e.sleep}h 😴</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── LOG ── */}
          {tab==="log" && (
            <div className="fade-up">
              <div style={{ marginBottom:"1.2rem" }}>
                <h2 style={{ fontFamily:"var(--display)", fontSize:"1.4rem", fontWeight:800, color:"var(--text)", letterSpacing:"-0.03em" }}>Log Entry</h2>
                <p style={{ color:"var(--text2)", fontSize:"0.85rem", marginTop:3 }}>Search food or enter values manually</p>
              </div>

              {/* Food search */}
              <div className="vt-card">
                <label style={LBL}>🔍 Search Food</label>
                <div style={{ display:"flex", gap:8, marginBottom:"0.8rem" }}>
                  <input className="vt-input" style={{ "--accent":c, flex:1 }} placeholder="banana, chicken breast, oats…"
                    value={foodQuery} onChange={e=>setFoodQuery(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();searchFood();}}}/>
                  <button onClick={searchFood} disabled={foodLoading}
                    style={{ background:c, border:"none", borderRadius:10, padding:"0 1.1rem", color:"#fff", fontWeight:700, cursor:"pointer", flexShrink:0, opacity:foodLoading?0.6:1, fontSize:"0.88rem" }}>
                    {foodLoading ? "…" : "Search"}
                  </button>
                </div>

                {foodError && <p style={{ color:"#f43f5e", fontSize:"0.8rem", marginBottom:"0.6rem" }}>{foodError}</p>}

                {foodResults.length > 0 && (
                  <div style={{ marginBottom:"0.6rem" }}>
                    {foodResults.map((f,i)=>(
                      <div key={i} className="food-result-row">
                        <div style={{ flex:1, minWidth:0, marginRight:10 }}>
                          <div style={{ fontSize:"0.87rem", fontWeight:600, color:"var(--text)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{f.name}</div>
                          <div style={{ fontSize:"0.72rem", color:"var(--text2)", marginTop:1 }}>
                            {f.brand||"Generic"} · per 100g:&nbsp;
                            <span style={{ color:c }}>{f.cal100} kcal</span> ·&nbsp;
                            <span style={{ color:"#8b5cf6" }}>{f.prot100}g prot</span> ·&nbsp;
                            <span style={{ color:"var(--text3)" }}>{f.carb100}g carb</span>
                          </div>
                        </div>
                        <button onClick={()=>addFoodToLog(f)}
                          style={{ background:`${c}15`, border:`1px solid ${c}30`, borderRadius:8, padding:"0.35rem 0.75rem", color:c, fontSize:"0.78rem", fontWeight:700, cursor:"pointer" }}>
                          + Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {selectedFoods.length > 0 && (
                  <>
                    <label style={{ ...LBL, marginTop:"0.3rem" }}>Added Foods</label>
                    {selectedFoods.map((f,i)=>(
                      <div key={i} style={{ display:"flex", alignItems:"center", gap:8, background:"var(--surface2)", borderRadius:10, padding:"0.55rem 0.8rem", marginBottom:5, border:"1px solid var(--border)" }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:"0.84rem", color:"var(--text)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{f.name}</div>
                          <div style={{ fontSize:"0.74rem", marginTop:1 }}>
                            <span style={{ color:c }}>{f.cals} kcal</span>
                            <span style={{ color:"var(--text2)", margin:"0 4px" }}>·</span>
                            <span style={{ color:"#8b5cf6" }}>{f.prot}g protein</span>
                          </div>
                        </div>
                        <input type="number" value={f.grams} min="1" max="2000"
                          className="vt-input" style={{ width:60, padding:"0.3rem 0.5rem", textAlign:"center", fontFamily:"var(--mono)", fontSize:"0.8rem" }}
                          onChange={e=>updateGrams(i,e.target.value)}/>
                        <span style={{ fontSize:"0.72rem", color:"var(--text2)", flexShrink:0 }}>g</span>
                        <button onClick={()=>removeFoodFromLog(i)}
                          style={{ background:"rgba(244,63,94,0.1)", border:"1px solid rgba(244,63,94,0.2)", borderRadius:7, color:"#f43f5e", cursor:"pointer", padding:"0.25rem 0.5rem", fontSize:"0.8rem" }}>✕</button>
                      </div>
                    ))}
                  </>
                )}
              </div>

              {/* Manual entry */}
              <div className="vt-card">
                <label style={LBL}>Entry Details</label>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.85rem" }}>
                  {[
                    ["calories","Calories (kcal)",c],
                    ["protein","Protein (g)","#8b5cf6"],
                    ["water","Water (cups)","#06b6d4"],
                    ["sleep","Sleep (hrs)","#f59e0b"],
                  ].map(([k,lbl,col])=>(
                    <div key={k}>
                      <label style={{ ...LBL, color:col }}>{lbl}</label>
                      <input className="vt-input" type="number" style={{ "--accent":col, color:logInput[k]?col:"var(--text)" }}
                        placeholder="0" value={logInput[k]} onChange={e=>setLogInput(l=>({...l,[k]:e.target.value}))}/>
                    </div>
                  ))}
                  <div style={{ gridColumn:"span 2" }}>
                    <label style={LBL}>Note / Meal</label>
                    <input className="vt-input" style={{ "--accent":c }} placeholder="Breakfast, snack, workout…"
                      value={logInput.note} onChange={e=>setLogInput(l=>({...l,note:e.target.value}))}/>
                  </div>
                </div>
                <button onClick={addEntry} style={{ width:"100%", background:goalObj.grad, border:"none", borderRadius:10, padding:"0.8rem", fontSize:"0.92rem", fontWeight:700, color:"#fff", cursor:"pointer", marginTop:"1.1rem" }}>
                  + Log Entry
                </button>
              </div>

              {todayEntries.length > 0 && (
                <div className="vt-card">
                  <label style={LBL}>Today's Log</label>
                  {todayEntries.map(e=>(
                    <div key={e.id} className="log-row">
                      <span style={{ fontFamily:"var(--mono)", fontSize:"0.72rem", color:"var(--text2)", minWidth:42 }}>{e.time}</span>
                      <span style={{ flex:1, color:"var(--text3)" }}>{e.note}</span>
                      {e.calories>0 && <span className="badge" style={{ background:`${c}15`, color:c }}>{e.calories}</span>}
                      {e.protein>0  && <span className="badge" style={{ background:"rgba(139,92,246,0.12)", color:"#8b5cf6" }}>{e.protein}g</span>}
                      {e.sleep>0    && <span className="badge" style={{ background:"rgba(245,158,11,0.12)", color:"#f59e0b" }}>{e.sleep}h</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── WORKOUTS ── */}
          {tab==="workouts" && (
            <div className="fade-up">
              <div style={{ marginBottom:"1.2rem" }}>
                <h2 style={{ fontFamily:"var(--display)", fontSize:"1.4rem", fontWeight:800, color:"var(--text)", letterSpacing:"-0.03em" }}>Workouts</h2>
                <p style={{ color:"var(--text2)", fontSize:"0.85rem", marginTop:3 }}>Recommended for {goalObj.label}</p>
              </div>
              {workouts.map((w,i)=>(
                <div key={i} className="vt-card" style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                      <div style={{ width:8, height:8, borderRadius:"50%", background:c, flexShrink:0 }}/>
                      <div style={{ fontWeight:700, fontSize:"0.95rem", color:"var(--text)" }}>{w.name}</div>
                    </div>
                    <div style={{ fontSize:"0.83rem", color:"var(--text2)", paddingLeft:16 }}>{w.detail}</div>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ fontFamily:"var(--mono)", color:c, fontWeight:700, fontSize:"0.85rem" }}>{w.hours}</div>
                    <div style={{ fontSize:"0.72rem", color:"var(--text2)", marginTop:2 }}>{w.days}</div>
                  </div>
                </div>
              ))}
              <div className="vt-card vt-card-hover" onClick={()=>setTab("ai")} style={{ borderColor:`${c}25`, background:`${c}08` }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ color:c, fontSize:"1.1rem" }}>✦</span>
                  <div>
                    <div style={{ fontWeight:700, color:c, fontSize:"0.88rem" }}>Want a custom plan?</div>
                    <div style={{ color:"var(--text2)", fontSize:"0.78rem" }}>Ask Vita — she knows your body stats →</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── SLEEP ── */}
          {tab==="sleep" && (
            <div className="fade-up">
              <div style={{ marginBottom:"1.2rem" }}>
                <h2 style={{ fontFamily:"var(--display)", fontSize:"1.4rem", fontWeight:800, color:"var(--text)", letterSpacing:"-0.03em" }}>Sleep</h2>
                <p style={{ color:"var(--text2)", fontSize:"0.85rem", marginTop:3 }}>Track and optimise your recovery</p>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"0.75rem", marginBottom:"0.75rem" }}>
                {[
                  { label:"Tonight", val:totalSleep||"—", unit:"hrs", color:"#f59e0b" },
                  { label:"Target", val:profile.goal==="endurance"?"8–10":["muscle","gain"].includes(profile.goal)?"8–9":"7–8", unit:"hrs", color:"#8b5cf6" },
                  { label:"Status", val:totalSleep>=7?"✓":totalSleep>0?"⚠":"—", unit:totalSleep>=7?"Good":totalSleep>0?"Low":"No data", color:totalSleep>=7?"#10b981":totalSleep>0?"#f97316":"var(--text2)" },
                ].map((s,i)=>(
                  <div key={i} className="vt-card" style={{ textAlign:"center", padding:"1.1rem" }}>
                    <div style={{ fontFamily:"var(--mono)", fontSize:"1.5rem", fontWeight:700, color:s.color, lineHeight:1 }}>{s.val}</div>
                    <div style={{ fontSize:"0.68rem", color:"var(--text2)", marginTop:5, textTransform:"uppercase", letterSpacing:"0.08em" }}>{s.label}</div>
                    <div style={{ fontSize:"0.7rem", color:s.color, marginTop:2, opacity:0.8 }}>{s.unit}</div>
                  </div>
                ))}
              </div>

              <div className="vt-card" style={{ marginBottom:"0.75rem" }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:"0.8rem", marginBottom:6 }}>
                  <span style={{ color:"var(--text2)" }}>Tonight's sleep</span>
                  <span style={{ fontFamily:"var(--mono)", color:"#f59e0b" }}>{totalSleep} / 9 hrs</span>
                </div>
                <div className="progress-track" style={{ height:8 }}>
                  <div className="progress-fill bar-grow" style={{ width:`${pct(totalSleep,9)}%`, background:"linear-gradient(90deg,#f59e0b66,#f59e0b)" }}/>
                </div>
              </div>

              <div className="vt-card" style={{ marginBottom:"0.75rem" }}>
                <label style={LBL}>💤 Sleep Tips for {goalObj.label}</label>
                {sleepTips.map((t,i)=>(
                  <div key={i} style={{ display:"flex", gap:10, padding:"0.5rem 0", borderBottom:i<sleepTips.length-1?"1px solid var(--border)":"none" }}>
                    <div style={{ width:6, height:6, borderRadius:"50%", background:"#f59e0b", flexShrink:0, marginTop:7 }}/>
                    <span style={{ fontSize:"0.87rem", color:"var(--text3)", lineHeight:1.6 }}>{t}</span>
                  </div>
                ))}
              </div>

              <div className="vt-card">
                <label style={LBL}>Sleep History</label>
                {Object.entries(grouped).slice(0,7).map(([date,entries])=>{
                  const s=entries.reduce((a,e)=>a+(e.sleep||0),0);
                  return s>0?(
                    <div key={date} className="log-row">
                      <span style={{ fontFamily:"var(--mono)", fontSize:"0.75rem", color:"var(--text2)" }}>{date}</span>
                      <span style={{ flex:1, paddingLeft:8 }}>
                        <div className="progress-track" style={{ width:100, display:"inline-block" }}>
                          <div className="progress-fill" style={{ width:`${pct(s,9)}%`, background:"#f59e0b" }}/>
                        </div>
                      </span>
                      <span style={{ fontFamily:"var(--mono)", color:"#f59e0b", fontSize:"0.82rem", fontWeight:700 }}>{s}h</span>
                      <span className="badge" style={{ background:s>=7?"rgba(16,185,129,0.12)":"rgba(249,115,22,0.12)", color:s>=7?"#10b981":"#f97316" }}>{s>=7?"Good":"Low"}</span>
                    </div>
                  ):null;
                })}
                {Object.keys(grouped).length===0&&<p style={{ color:"var(--text2)", fontSize:"0.85rem" }}>No sleep data yet.</p>}
              </div>
            </div>
          )}

          {/* ── AI COACH ── */}
          {tab==="ai" && (
            <div className="fade-up">
              <div style={{ marginBottom:"1.2rem" }}>
                <h2 style={{ fontFamily:"var(--display)", fontSize:"1.4rem", fontWeight:800, color:"var(--text)", letterSpacing:"-0.03em" }}>AI Coach</h2>
                <p style={{ color:"var(--text2)", fontSize:"0.85rem", marginTop:3 }}>Powered by Gemini · personalised to your stats</p>
              </div>
              {!apiKey
                ? <ApiKeyPanel phone={phone} onSave={handleSaveKey} accentColor={c}/>
                : <AIChat user={user} phone={phone} goalObj={goalObj} apiKey={apiKey} onChangeKey={handleChangeKey} chatMessages={chatMessages} setChatMessages={setChatMessages}/>
              }
            </div>
          )}

          {/* ── HISTORY ── */}
          {tab==="history" && (
            <div className="fade-up">
              <div style={{ marginBottom:"1.2rem" }}>
                <h2 style={{ fontFamily:"var(--display)", fontSize:"1.4rem", fontWeight:800, color:"var(--text)", letterSpacing:"-0.03em" }}>History</h2>
                <p style={{ color:"var(--text2)", fontSize:"0.85rem", marginTop:3 }}>{user.name} · {Object.keys(grouped).length} days logged</p>
              </div>
              {Object.keys(grouped).length===0 && <div className="vt-card" style={{ textAlign:"center", padding:"2.5rem", color:"var(--text2)" }}>No history yet — start logging!</div>}
              {Object.entries(grouped).map(([date,entries])=>{
                const dc=entries.reduce((s,e)=>s+(e.calories||0),0),dp=entries.reduce((s,e)=>s+(e.protein||0),0),dw=entries.reduce((s,e)=>s+(e.water||0),0),ds=entries.reduce((s,e)=>s+(e.sleep||0),0);
                return (
                  <div key={date} className="vt-card">
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.8rem" }}>
                      <span style={{ fontFamily:"var(--mono)", fontWeight:700, color:"var(--text)", fontSize:"0.88rem" }}>{date}</span>
                      <span style={{ fontSize:"0.72rem", color:"var(--text2)" }}>{entries.length} entries</span>
                    </div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:"0.8rem" }}>
                      {dc>0 && <span className="badge" style={{ background:`${c}15`, color:c }}>{dc} kcal</span>}
                      {dp>0 && <span className="badge" style={{ background:"rgba(139,92,246,0.12)", color:"#8b5cf6" }}>{dp}g prot</span>}
                      {dw>0 && <span className="badge" style={{ background:"rgba(6,182,212,0.12)", color:"#06b6d4" }}>{dw} cups</span>}
                      {ds>0 && <span className="badge" style={{ background:"rgba(245,158,11,0.12)", color:"#f59e0b" }}>{ds}h sleep</span>}
                    </div>
                    {entries.map(e=>(
                      <div key={e.id} className="log-row">
                        <span style={{ fontFamily:"var(--mono)", fontSize:"0.7rem", color:"var(--text2)", minWidth:38 }}>{e.time}</span>
                        <span style={{ flex:1, color:"var(--text3)", fontSize:"0.82rem" }}>{e.note}</span>
                        {e.calories>0 && <span className="badge" style={{ background:`${c}12`, color:c, fontSize:"0.68rem" }}>{e.calories}</span>}
                        {e.sleep>0    && <span className="badge" style={{ background:"rgba(245,158,11,0.1)", color:"#f59e0b", fontSize:"0.68rem" }}>{e.sleep}h</span>}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* ── Mobile bottom nav ── */}
      <nav className="mobile-nav" style={{ position:"fixed", bottom:0, left:0, right:0, background:"var(--surface)", borderTop:"1px solid var(--border)", display:"none", justifyContent:"space-around", padding:"0.5rem 0.25rem", zIndex:20, paddingBottom:"env(safe-area-inset-bottom, 0.5rem)" }}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3, background:"none", border:"none", cursor:"pointer", padding:"0.3rem 0.5rem", borderRadius:8, flex:1 }}>
            <span style={{ fontSize:"1.1rem", color:tab===t.id?c:"var(--text2)" }}>{t.icon}</span>
            <span style={{ fontSize:"0.6rem", color:tab===t.id?c:"var(--text2)", fontWeight:tab===t.id?700:400 }}>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [phone,setPhone]=useState(null);
  const [userData,setUserData]=useState(null);
  function handleLogin(p,d){setPhone(p);setUserData(d);}
  function handleLogout(){setPhone(null);setUserData(null);}
  function handleProfileSave(p){const u={...userData,profile:p};saveUser(phone,u);setUserData(u);}
  function handleUpdateUser(u){setUserData(u);}
  return (
    <>
      <GlobalStyles/>
      {!phone||!userData   ? <LoginScreen onLogin={handleLogin}/>             :
       !userData.profile   ? <ProfileSetup user={userData} onSave={handleProfileSave}/> :
       <Dashboard user={userData} phone={phone} onLogout={handleLogout} onUpdateUser={handleUpdateUser}/>}
    </>
  );
}