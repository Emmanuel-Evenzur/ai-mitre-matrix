import { useState, useEffect } from "react";

/* ---------------- 1. DEMO MATRIX (static fallback) ---------------- */
const demoMatrix = [
  { tactic: "Reconnaissance",
    techniques: ["Search Open Technical Databases","Search Open AI Vulnerability Analysis","Search Victim-Owned Websites","Search Application Repositories","Active Scanning","Gather RAG-Indexed Targets"] },
  { tactic: "Resource Development",
    techniques: ["Acquire Public AI Artifacts","Obtain Capabilities","Develop Capabilities","Acquire Infrastructure","Publish Poisoned Datasets","Poison Training Data","Establish Accounts","Publish Poisoned Models","Publish Hallucinated Entities","LLM Prompt Crafting","Retrieval Content Crafting","Stage Capabilities"] },
  { tactic: "Initial Access",
    techniques: ["AI Supply Chain Compromise","Valid Accounts","Exploit Public-Facing Application","Phishing","Drive-by Compromise","AI Model Inference API Access"] },
  { tactic: "AI Model Access Execution",
    techniques: ["AI-Enabled Product or Service","Physical Environment Access","Full AI Model Access","User Execution"] },
  { tactic: "Persistence",
    techniques: ["Command and Scripting Interpreter","LLM Prompt Injection","LLM Plugin Compromise","Poison Training Data"] },
  { tactic: "Privilege Escalation",
    techniques: ["Manipulate AI Model","LLM Prompt Self-Replication"] },
  { tactic: "Defense Evasion",
    techniques: ["RAG Poisoning","LLM Plugin Compromise","LLM Jailbreak","Evade AI Model","LLM Prompt Obfuscation","False RAG Entry Injection","Impersonation","Masquerading"] },
  { tactic: "Credential Access", techniques: ["Unsecured Credentials"] },
  { tactic: "Discovery",
    techniques: ["Discover AI Model Ontology","Discover AI Model Family","Discover AI Artifacts","Discover LLM Hallucinations","Discover AI Model Outputs","Discover LLM System Information","Cloud Service Discovery"] },
  { tactic: "Collection",
    techniques: ["AI Artifact Collection","Data from Information Repositories","Data from Local System"] },
  { tactic: "AI Attack Staging",
    techniques: ["Create Proxy AI Model","Manipulate AI Model","Verify Attack","Craft Adversarial Data"] },
  { tactic: "Command and Control", techniques: ["Reverse Shell"] },
  { tactic: "Exfiltration",
    techniques: ["Exfiltration via AI Inference API","Exfiltration via Cyber Means","Extract LLM System Prompt","LLM Data Leakage","LLM Response Rendering"] },
  { tactic: "Impact",
    techniques: ["Evade AI Model","Denial of AI Service","Spamming AI System with Chaff Data","Erode AI Model Integrity","Cost Harvesting","External Harms","Erode Dataset Integrity"] }
];

/* ---------------- 2. MAIN COMPONENT ---------------- */
export default function AIMitreMatrix() {
  const [matrix,  setMatrix]  = useState(demoMatrix); // will try live fetch
  const [pending, setPending] = useState([]);
  const [reports, setReports] = useState([]);         // mapped
  const [focus,   setFocus]   = useState(null);       // {tactic,tech, reports}

  /* Attempt live MITRE fetch (silent failure retains demo) */
  useEffect(()=> {
    fetch("https://atlas.mitre.org/api/matrix")
      .then(r=>r.json())
      .then(d => Array.isArray(d)&&d.length && setMatrix(
        d.map(t => ({ tactic: t.tactic, techniques: t.techniques.map(tc=>tc.name) }))
      ))
      .catch(()=>{});
  },[]);

  /* --------- Upload JSON --------- */
  const handleUpload = e=>{
    const f=e.target.files[0];
    if(!f) return;
    const rdr=new FileReader();
    rdr.onload=ev=>{
      try{
        const j=JSON.parse(ev.target.result);
        setPending(Array.isArray(j)?j:[j]);
        alert("Loaded reports – click Map to MITRE AI.");
      }catch{alert("Invalid JSON");}
    };
    rdr.readAsText(f);
  };

  /* --------- Map pending --------- */
  const mapPending = ()=>{
    if(!pending.length) return;
    const mapped = pending.map(rep=>{
      // simple phrase match across matrix technique names
      const blob=`${rep.title||""} ${rep.description||""}`.toLowerCase();
      for(const t of matrix){
        for(const tech of t.techniques){
          if(blob.includes(tech.toLowerCase())){
            return {...rep,tactic:t.tactic,technique:tech};
          }
        }
      }
      // fallback into first cell
      return {...rep,tactic:matrix[0].tactic,technique:matrix[0].techniques[0]};
    });
    setReports(r=>[...r, ...mapped]);
    setPending([]);
  };

  /* --------- Inline styles --------- */
  const cellStyle = (tac,tech)=>({
    cursor:"pointer",
    padding:"4px 6px",
    margin:"2px 0",
    border:"1px solid #ccc",
    borderRadius:3,
    background: reports.some(r=>r.tactic===tac&&r.technique===tech)? "#c6f6d5":"#eff6ff", // green if mapped
    color:"#1a202c",
    fontSize:13,
    textAlign:"left"
  });

  const columnStyle = {
    minWidth:230,
    maxHeight:320,
    overflowY:"auto",
    border:"1px solid #cbd5e0",
    borderRadius:4,
    padding:4,
    background:"#ffffff"
  };

  /* --------- Render --------- */
  return (
    <div style={{fontFamily:"Arial,Helvetica",padding:20}}>
      <h1 style={{fontSize:32,marginBottom:4}}>AI MITRE Matrix (Demo)</h1>

      {/* upload + map */}
      <div style={{margin:"12px 0"}}>
        <input type="file" accept="application/json" onChange={handleUpload}/>
        <button disabled={!pending.length}
          onClick={mapPending}
          style={{marginLeft:8,padding:"6px 12px",background:"#2563eb",color:"#fff",
                  border:"none",borderRadius:4,opacity:pending.length?1:.5}}>
          Map to MITRE AI
        </button>
        {pending.length>0 && <span style={{marginLeft:8,fontSize:13}}>{pending.length} pending</span>}
      </div>

      {/* grid */}
      <div style={{display:"flex",gap:12,overflowX:"auto"}}>
        {matrix.map(col=>(
          <div key={col.tactic} style={columnStyle}>
            <div style={{fontWeight:"bold",marginBottom:4}}>{col.tactic}</div>
            {col.techniques.map(tech=>(
              <div key={tech}
                   style={cellStyle(col.tactic,tech)}
                   onClick={()=>setFocus({
                     tactic:col.tactic,
                     technique:tech,
                     reports:reports.filter(r=>r.tactic===col.tactic && r.technique===tech)
                   })}>
                {tech}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* details panel */}
      {focus && (
        <div style={{marginTop:24,borderTop:"1px solid #cbd5e0",paddingTop:12}}>
          <h3 style={{fontSize:20,fontWeight:"bold"}}>
            {focus.tactic} ➜ {focus.technique}
          </h3>
          {focus.reports.length?
            <ul>
              {focus.reports.map((r,i)=>(
                <li key={i} style={{margin:"8px 0",padding:8,border:"1px solid #e2e8f0",borderRadius:4}}>
                  <strong>{r.title}</strong><br/>
                  <span style={{fontSize:13}}>{r.description}</span><br/>
                  <em style={{fontSize:12,color:"#4a5568"}}>Impact: {r.impact}</em>
                </li>
              ))}
            </ul>
          : <p style={{fontStyle:"italic"}}>No mapped reports.</p>}
        </div>
      )}
    </div>
  );
}
