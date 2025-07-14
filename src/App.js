import { useState } from "react";

const reports = [
  {
    title: "Context Leakage via Jailbreak Prompt",
    tactic: "Model Evasion",
    technique: "Prompt Injection",
    description:
      "An attacker tricked the LLM into leaking system prompt contents using a carefully crafted input.",
    model_type: "LLM (Chat-based)",
    attack_vector: "Prompt input",
    impact: "Confidential data leak",
    mitigations: [
      "Prompt filtering",
      "Memory segmentation",
      "Input sanitization"
    ],
    report_link: "https://example.com/redteam/context-leakage",
    status: "Simulated",
    tags: ["LLM", "Data Leakage", "Prompt Injection"]
  },
  {
    title: "Model Extraction via Query Replay",
    tactic: "Reconnaissance",
    technique: "Model Architecture Inference",
    description:
      "A black-box API was queried repeatedly with carefully chosen inputs to reconstruct the model behavior and extract training data characteristics.",
    model_type: "Proprietary Classifier",
    attack_vector: "External inference API",
    impact: "IP loss; reconstructed internal classifier",
    mitigations: [
      "Rate limiting",
      "Query pattern anomaly detection",
      "Output perturbation"
    ],
    report_link: "https://example.com/redteam/model-extraction",
    status: "Confirmed",
    tags: ["Model Extraction", "Recon", "API"]
  },
  {
    title: "Poisoned RAG Dataset Injection",
    tactic: "Poisoning",
    technique: "Training Data Poisoning",
    description:
      "An attacker added targeted false facts to a public wiki dataset used by the RAG pipeline. These poisoned facts were later cited verbatim in production responses.",
    model_type: "RAG (Retrieval Augmented Generation)",
    attack_vector: "Upstream data source",
    impact: "Misinformation surfaced to users; legal risk",
    mitigations: [
      "Trust filters on incoming data",
      "Hash/version tracking of training sets",
      "Feedback loop validation"
    ],
    report_link: "https://example.com/redteam/rag-poisoning",
    status: "Simulated",
    tags: ["RAG", "Poisoning", "Open Source"]
  }
];

const matrix = {
  "Model Evasion": ["Prompt Injection"],
  "Poisoning": ["Training Data Poisoning", "Feedback Loop Attack"],
  "Reconnaissance": ["Model Architecture Inference"]
};

export default function AIMitreMatrix() {
  const [selectedCell, setSelectedCell] = useState(null);

  const openReports = (tactic, technique) => {
    const matched = reports.filter(
      (r) => r.tactic === tactic && r.technique === technique
    );
    setSelectedCell({ tactic, technique, reports: matched });
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">AI MITRE Matrix (PoC)</h1>
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(matrix).map(([tactic, techniques]) => (
          <div key={tactic} className="border rounded-xl p-4 shadow">
            <h2 className="font-semibold text-lg mb-2">{tactic}</h2>
            {techniques.map((technique) => (
              <button
                key={technique}
                className="block w-full text-left text-blue-600 hover:underline mb-1"
                onClick={() => openReports(tactic, technique)}
              >
                {technique}
              </button>
            ))}
          </div>
        ))}
      </div>

      {selectedCell && (
        <div className="mt-6 p-4 border-t">
          <h3 className="text-xl font-semibold mb-2">
            Reports: {selectedCell.tactic} → {selectedCell.technique}
          </h3>
          {selectedCell.reports.length === 0 ? (
            <p>No reports yet for this combination.</p>
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
