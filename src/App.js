import { useState, useEffect } from "react";

export default function AIMitreMatrix() {
  const [atlasMatrix, setAtlasMatrix] = useState([]);
  const [reports, setReports] = useState([]);            // mapped reports shown in UI
  const [pending, setPending] = useState([]);            // newly uploaded, not yet mapped
  const [selectedCell, setSelectedCell] = useState(null);

  // Fetch live MITRE ATLAS tactics/techniques once
  useEffect(() => {
    fetch("https://atlas.mitre.org/api/matrix")
      .then((r) => r.json())
      .then((data) => setAtlasMatrix(data));
  }, []);

  // 1) Upload JSON – keep it in pending until user clicks "Map to MITRE AI"
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        const newPending = Array.isArray(parsed) ? parsed : [parsed];
        setPending(newPending);
        alert(`Loaded ${newPending.length} report(s). Click \"Map to MITRE AI\" to add them to the matrix.`);
      } catch (err) {
        alert("Invalid JSON format – please upload a valid report file.");
      }
    };
    reader.readAsText(file);
  };

  // 2) Merge pending into reports using technique_id to resolve tactic/technique names
  const mapPending = () => {
    if (pending.length === 0) {
      alert("No uploaded reports to map.");
      return;
    }

    const resolved = pending.map((report) => {
      if (!report.technique_id) return null;

      for (const tactic of atlasMatrix) {
        const match = tactic.techniques.find((tech) => tech.id === report.technique_id);
        if (match) {
          return {
            ...report,
            tactic: tactic.tactic,
            technique: match.name
          };
        }
      }
      return null; // If not found, ignore
    }).filter(Boolean);

    if (resolved.length === 0) {
      alert("None of the uploaded reports matched known technique IDs.");
    } else {
      setReports((prev) => [...prev, ...resolved]);
    }
    setPending([]);
  };

  // 3) Open cell modal / panel
  const openReports = (tactic, technique) => {
    const matched = reports.filter(
      (r) => r.tactic === tactic && r.technique === technique
    );
    setSelectedCell({ tactic, technique, reports: matched });
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">AI MITRE Matrix (Live)</h1>

      {/* Upload + map controls */}
      <div className="flex items-center space-x-4">
        <div>
          <label className="block font-semibold mb-1">Upload Red Team Report (.json):</label>
          <input type="file" accept="application/json" onChange={handleUpload} />
        </div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 disabled:opacity-50"
          onClick={mapPending}
          disabled={pending.length === 0}
        >
          Map to MITRE&nbsp;AI
        </button>
        {pending.length > 0 && (
          <span className="text-sm text-gray-600">{pending.length} report(s) ready to map</span>
        )}
      </div>

      {/* Matrix grid */}
      <div className="grid grid-cols-4 gap-4">
        {atlasMatrix.map((tactic) => (
          <div key={tactic.tactic} className="border rounded-xl p-4 shadow">
            <h2 className="font-semibold text-lg mb-2">{tactic.tactic}</h2>
            {tactic.techniques.map((tech) => (
              <button
                key={tech.name}
                className="block w-full text-left text-blue-600 hover:underline mb-1"
                onClick={() => openReports(tactic.tactic, tech.name)}
              >
                {tech.name}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Report panel */}
      {selectedCell && (
        <div className="mt-6 p-4 border-t">
          <h3 className="text-xl font-semibold mb-2">
            Reports: {selectedCell.tactic} → {selectedCell.technique}
          </h3>
          {selectedCell.reports.length === 0 ? (
            <p>No mapped reports for this combination.</p>
          ) : (
            <ul className="space-y-2">
              {selectedCell.reports.map((r, idx) => (
                <li key={idx} className="border p-3 rounded-lg">
                  <p className="font-bold">{r.title}</p>
                  <p className="text-sm text-gray-600">{r.description}</p>
                  <p className="text-xs text-gray-500">Impact: {r.impact}</p>
                  <a
                    href={r.report_link}
                    className="text-blue-500 text-sm underline mt-1 inline-block"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Full Report
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
