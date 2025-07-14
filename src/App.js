import { useState, useEffect } from "react";

// Minimal demo fallback matrix if live fetch fails
const demoMatrix = [
  {
    tactic: "Model Evasion",
    techniques: [
      { name: "Prompt Injection" },
      { name: "Hallucinated Output" }
    ]
  },
  {
    tactic: "Poisoning",
    techniques: [
      { name: "Training Data Poisoning" }
    ]
  },
  {
    tactic: "Reconnaissance",
    techniques: [
      { name: "Model Extraction" }
    ]
  }
];

export default function AIMitreMatrix() {
  const [atlasMatrix, setAtlasMatrix] = useState(demoMatrix);    // start with demo data
  const [reports, setReports] = useState([]);
  const [pending, setPending] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);

  // Try live MITRE fetch, but fall back silently to demoMatrix
  useEffect(() => {
    fetch("https://atlas.mitre.org/api/matrix")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length) {
          setAtlasMatrix(data);
        }
      })
      .catch(() => {/* ignore – keep demoMatrix */});
  }, []);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        const list = Array.isArray(parsed) ? parsed : [parsed];
        setPending(list);
        alert(`${list.length} report(s) loaded. Click \"Map to MITRE AI\".`);
      } catch {
        alert("File is not valid JSON");
      }
    };
    reader.readAsText(file);
  };

  const mapPending = () => {
    if (!pending.length) return;

    const resolved = pending.map((rep) => {
      // If tactic & technique provided, accept as‑is
      if (rep.tactic && rep.technique) return rep;

      // Try id/name mapping
      for (const tac of atlasMatrix) {
        for (const tech of tac.techniques) {
          // By external ID
          if (rep.technique_id && tech.external_references?.some(r => r.external_id === rep.technique_id)) {
            return { ...rep, tactic: tac.tactic, technique: tech.name };
          }
          // By name (case‑insensitive)
          if (rep.technique && tech.name.toLowerCase() === rep.technique.toLowerCase()) {
            return { ...rep, tactic: tac.tactic, technique: tech.name };
          }
        }
      }
      // Fallback: dump into first tactic for demo purposes
      return { ...rep, tactic: atlasMatrix[0].tactic, technique: atlasMatrix[0].techniques[0].name };
    });

    setReports(r => [...r, ...resolved]);
    setPending([]);
  };

  const openReports = (tactic, tech) => {
    setSelectedCell({
      tactic,
      technique: tech,
      reports: reports.filter(r => r.tactic === tactic && r.technique === tech)
    });
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">AI MITRE Matrix (Demo)</h1>

      <div className="flex items-center space-x-4">
        <input type="file" accept="application/json" onChange={handleUpload} />
        <button
          disabled={!pending.length}
          onClick={mapPending}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >Map to MITRE AI</button>
        {pending.length > 0 && <span>{pending.length} pending</span>}
      </div>

      {/* Matrix */}
      <div className="grid grid-cols-4 gap-4">
        {atlasMatrix.map(tac => (
          <div key={tac.tactic} className="border rounded p-4">
            <h2 className="font-semibold mb-2">{tac.tactic}</h2>
            {tac.techniques.map(tech => (
              <button key={tech.name} className="block text-left text-blue-600 hover:underline" onClick={() => openReports(tac.tactic, tech.name)}>
                {tech.name}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Details */}
      {selectedCell && (
        <div className="border-t pt-4">
          <h3 className="text-xl font-semibold mb-2">{selectedCell.tactic} → {selectedCell.technique}</h3>
          {selectedCell.reports.length ? (
            <ul className="space-y-2">
              {selectedCell.reports.map((r,i)=>(
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
