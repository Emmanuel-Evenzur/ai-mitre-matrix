import { useState, useEffect } from "react";

/* ---------- DEMO MATRIX (always renders) ---------- */
const demoMatrix = [
  {
    tactic: "Reconnaissance",
    techniques: [
      { name: "Search Open Technical Databases" },
      { name: "Search Open AI Vulnerability Analysis" },
      { name: "Search Victim-Owned Websites" },
      { name: "Search Application Repositories" },
      { name: "Active Scanning" },
      { name: "Gather RAG-Indexed Targets" }
    ]
  },
  {
    tactic: "Resource Development",
    techniques: [
      { name: "Acquire Public AI Artifacts" },
      { name: "Obtain Capabilities" },
      { name: "Develop Capabilities" },
      { name: "Acquire Infrastructure" },
      { name: "Publish Poisoned Datasets" },
      { name: "Poison Training Data" },
      { name: "Establish Accounts" },
      { name: "Publish Poisoned Models" },
      { name: "Publish Hallucinated Entities" },
      { name: "LLM Prompt Crafting" },
      { name: "Retrieval Content Crafting" },
      { name: "Stage Capabilities" }
    ]
  },
  {
    tactic: "Initial Access",
    techniques: [
      { name: "AI Supply Chain Compromise" },
      { name: "Valid Accounts" },
      { name: "Exploit Public-Facing Application" },
      { name: "Phishing" },
      { name: "Drive-by Compromise" },
      { name: "AI Model Inference API Access" }
    ]
  },
  {
    tactic: "AI Model Access Execution",
    techniques: [
      { name: "AI-Enabled Product or Service" },
      { name: "Physical Environment Access" },
      { name: "Full AI Model Access" },
      { name: "User Execution" }
    ]
  },
  {
    tactic: "Persistence",
    techniques: [
      { name: "Command and Scripting Interpreter" },
      { name: "LLM Prompt Injection" },
      { name: "LLM Plugin Compromise" },
      { name: "Poison Training Data" }
    ]
  },
  {
    tactic: "Privilege Escalation",
    techniques: [
      { name: "Manipulate AI Model" },
      { name: "LLM Prompt Self-Replication" }
    ]
  },
  {
    tactic: "Defense Evasion",
    techniques: [
      { name: "RAG Poisoning" },
      { name: "LLM Plugin Compromise" },
      { name: "LLM Jailbreak" },
      { name: "Evade AI Model" },
      { name: "LLM Prompt Obfuscation" },
      { name: "False RAG Entry Injection" },
      { name: "Impersonation" },
      { name: "Masquerading" }
    ]
  },
  {
    tactic: "Credential Access",
    techniques: [{ name: "Unsecured Credentials" }]
  },
  {
    tactic: "Discovery",
    techniques: [
      { name: "Discover AI Model Ontology" },
      { name: "Discover AI Model Family" },
      { name: "Discover AI Artifacts" },
      { name: "Discover LLM Hallucinations" },
      { name: "Discover AI Model Outputs" },
      { name: "Discover LLM System Information" },
      { name: "Cloud Service Discovery" }
    ]
  },
  {
    tactic: "Collection",
    techniques: [
      { name: "AI Artifact Collection" },
      { name: "Data from Information Repositories" },
      { name: "Data from Local System" }
    ]
  },
  {
    tactic: "AI Attack Staging",
    techniques: [
      { name: "Create Proxy AI Model" },
      { name: "Manipulate AI Model" },
      { name: "Verify Attack" },
      { name: "Craft Adversarial Data" }
    ]
  },
  {
    tactic: "Command and Control",
    techniques: [{ name: "Reverse Shell" }]
  },
  {
    tactic: "Exfiltration",
    techniques: [
      { name: "Exfiltration via AI Inference API" },
      { name: "Exfiltration via Cyber Means" },
      { name: "Extract LLM System Prompt" },
      { name: "LLM Data Leakage" },
      { name: "LLM Response Rendering" }
    ]
  },
  {
    tactic: "Impact",
    techniques: [
      { name: "Evade AI Model" },
      { name: "Denial of AI Service" },
      { name: "Spamming AI System with Chaff Data" },
      { name: "Erode AI Model Integrity" },
      { name: "Cost Harvesting" },
      { name: "External Harms" },
      { name: "Erode Dataset Integrity" }
    ]
  }
];

/* ---------- MAIN COMPONENT ---------- */
export default function AIMitreMatrix() {
  const [atlasMatrix, setAtlasMatrix] = useState(demoMatrix); // fallback
  const [reports, setReports]     = useState([]);
  const [pending, setPending]     = useState([]);
  const [selected, setSelected]   = useState(null);

  /* Try live MITRE ATLAS fetch */
  useEffect(() => {
    fetch("https://atlas.mitre.org/api/matrix")
      .then(r => r.json())
      .then(d => Array.isArray(d) && d.length && setAtlasMatrix(d))
      .catch(() => {}); // silent fail, keep demo
  }, []);

  /* -------- Upload ---------- */
  const handleUpload = e => {
    const f = e.target.files[0];
    if (!f) return;
    const rdr = new FileReader();
    rdr.onload = e2 => {
      try {
        const json = JSON.parse(e2.target.result);
        setPending(Array.isArray(json) ? json : [json]);
        alert("Reports loaded – click “Map to MITRE AI”.");
      } catch { alert("Invalid JSON"); }
    };
    rdr.readAsText(f);
  };

  /* -------- Map ---------- */
  const mapPending = () => {
    if (!pending.length) return;
    const mapped = pending.map(rep => {
      if (rep.tactic && rep.technique) return rep; // already mapped

      for (const tac of atlasMatrix) {
        for (const tech of tac.techniques) {
          const nm   = tech.name.toLowerCase();
          const blob = `${rep.title||""} ${rep.description||""}`.toLowerCase();

          if (rep.technique_id &&
              tech.external_references?.some(r=>r.external_id===rep.technique_id))
            return { ...rep, tactic: tac.tactic, technique: tech.name };

          if (rep.technique && rep.technique.toLowerCase() === nm)
            return { ...rep, tactic: tac.tactic, technique: tech.name };

          if (blob.includes(nm))
            return { ...rep, tactic: tac.tactic, technique: tech.name };
        }
      }
      // fallback -> first cell
      return { ...rep,
        tactic: atlasMatrix[0].tactic,
        technique: atlasMatrix[0].techniques[0].name
      };
    });
    setReports(r => [...r, ...mapped]);
    setPending([]);
  };

  /* -------- UI helpers ---------- */
  const openCell = (tac, tech) =>
    setSelected({ tactic: tac, technique: tech,
      reports: reports.filter(r=>r.tactic===tac && r.technique===tech) });

  /* -------- Render ---------- */
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">AI MITRE Matrix (Demo)</h1>

      <div className="flex items-center space-x-4">
        <input type="file" accept="application/json" onChange={handleUpload}/>
        <button
          disabled={!pending.length}
          onClick={mapPending}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50">
          Map to MITRE AI
        </button>
        {!!pending.length && <span>{pending.length} pending</span>}
      </div>

      {/* Matrix grid */}
      <div className="grid grid-cols-4 gap-4">
        {atlasMatrix.map(tac=>(
          <div key={tac.tactic} className="border rounded p-4">
            <h2 className="font-semibold mb-2">{tac.tactic}</h2>
            {tac.techniques.map(tech=>(
              <button key={tech.name}
                className="block text-left text-blue-600 hover:underline"
                onClick={()=>openCell(tac.tactic, tech.name)}>
                {tech.name}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Details panel */}
      {selected && (
        <div className="border-t pt-4">
          <h3 className="text-xl font-semibold mb-2">
            {selected.tactic} → {selected.technique}
          </h3>
          {selected.reports.length ? (
            <ul className="space-y-2">
              {selected.reports.map((r,i)=>(
                <li key={i} className="border p-3 rounded">
                  <p className="font-bold">{r.title}</p>
                  <p className="text-sm text-gray-600">{r.description}</p>
                  <p className="text-xs text-gray-500">Impact: {r.impact}</p>
                </li>
              ))}
            </ul>
          ) : <p>No reports mapped.</p>}
        </div>
      )}
    </div>
  );
}
