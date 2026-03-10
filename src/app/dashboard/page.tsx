"use client";
import { useEffect, useState } from "react";
import { LogEntry } from "@/types";

const VERTICAL_COLOR: Record<string, string> = {
  Tourism: "#d4a853",
  "Car Rental": "#5b9bd5",
  Unknown: "#888",
};

const MOOD_EMOJI: Record<string, string> = {
  Excited: "🤩",
  Urgent: "🚨",
  Confused: "🤔",
  Neutral: "😐",
};

const VALUE_DOT: Record<string, string> = {
  High: "#4ade80",
  Medium: "#facc15",
  Low: "#f87171",
};

export default function Dashboard() {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [selected, setSelected] = useState<LogEntry | null>(null);
  const [filter, setFilter] = useState<"All" | "Tourism" | "Car Rental" | "Escalated">("All");
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    const res = await fetch("/api/logs");
    const data = await res.json();
    setEntries(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, []);

  const filtered = entries.filter((e) => {
    if (filter === "All") return true;
    if (filter === "Escalated") return e.escalate;
    return e.vertical === filter;
  });

  const stats = {
    total: entries.length,
    tourism: entries.filter((e) => e.vertical === "Tourism").length,
    carRental: entries.filter((e) => e.vertical === "Car Rental").length,
    escalated: entries.filter((e) => e.escalate).length,
  };

  return (
    <div style={{ fontFamily: "'DM Mono', monospace", background: "#0d0d0d", minHeight: "100vh", color: "#e8e0d0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Cormorant+Garamond:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #1a1a1a; }
        ::-webkit-scrollbar-thumb { background: #d4a853; border-radius: 2px; }
        .entry-row { transition: background 0.15s; cursor: pointer; }
        .entry-row:hover { background: #1c1c1c !important; }
        .pill { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 500; }
        .filter-btn { background: none; border: 1px solid #2a2a2a; color: #888; padding: 6px 14px; border-radius: 4px; font-family: inherit; font-size: 12px; cursor: pointer; transition: all 0.15s; }
        .filter-btn.active { border-color: #d4a853; color: #d4a853; }
        .filter-btn:hover { border-color: #555; color: #ccc; }
        .close-btn { background: none; border: 1px solid #333; color: #888; padding: 4px 12px; border-radius: 4px; font-family: inherit; font-size: 12px; cursor: pointer; }
        .close-btn:hover { border-color: #d4a853; color: #d4a853; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.3s ease; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .pulse { animation: pulse 2s infinite; }
      `}</style>

      <div style={{ borderBottom: "1px solid #1e1e1e", padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 700, color: "#d4a853", letterSpacing: 1 }}>
            CONCIERGE CONSOLE
          </div>
          <div style={{ fontSize: 11, color: "#555", marginTop: 2, letterSpacing: 2 }}>
            DUBAI TOURISM & CAR RENTAL — WHATSAPP AGENT
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80" }} />
          <span style={{ fontSize: 11, color: "#555", letterSpacing: 1 }}>LIVE</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, borderBottom: "1px solid #1e1e1e" }}>
        {[
          { label: "TOTAL ENQUIRIES", value: stats.total, color: "#e8e0d0" },
          { label: "TOURISM", value: stats.tourism, color: "#d4a853" },
          { label: "CAR RENTAL", value: stats.carRental, color: "#5b9bd5" },
          { label: "ESCALATED", value: stats.escalated, color: "#f87171" },
        ].map((s) => (
          <div key={s.label} style={{ padding: "20px 32px", borderRight: "1px solid #1e1e1e" }}>
            <div style={{ fontSize: 10, color: "#555", letterSpacing: 2, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 32, fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", height: "calc(100vh - 160px)" }}>
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "14px 32px", borderBottom: "1px solid #1a1a1a", display: "flex", gap: 8 }}>
            {(["All", "Tourism", "Car Rental", "Escalated"] as const).map((f) => (
              <button key={f} className={`filter-btn ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
                {f}
              </button>
            ))}
            <span style={{ marginLeft: "auto", fontSize: 11, color: "#444", alignSelf: "center" }}>
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div style={{ overflow: "auto", flex: 1 }}>
            {loading ? (
              <div style={{ padding: 48, textAlign: "center", color: "#444", fontSize: 13 }}>Loading enquiries...</div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: 48, textAlign: "center", color: "#333", fontSize: 13 }}>
                No enquiries yet. Messages will appear here in real-time.
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #1a1a1a" }}>
                    {["TIME", "CUSTOMER", "VERTICAL", "CATEGORY", "MOOD", "VALUE", "ESC"].map((h) => (
                      <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, color: "#444", letterSpacing: 2, fontWeight: 500 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((e) => (
                    <tr
                      key={e.id}
                      className="entry-row fade-in"
                      onClick={() => setSelected(e)}
                      style={{ borderBottom: "1px solid #111", background: selected?.id === e.id ? "#161616" : "transparent" }}
                    >
                      <td style={{ padding: "12px 16px", fontSize: 11, color: "#555" }}>
                        {new Date(e.loggedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 12 }}>
                        <div style={{ color: "#c8bfa8" }}>{e.customerName || "Unknown"}</div>
                        <div style={{ fontSize: 10, color: "#444", marginTop: 2 }}>{e.phone}</div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span className="pill" style={{ background: (VERTICAL_COLOR[e.vertical] || "#888") + "22", color: VERTICAL_COLOR[e.vertical] || "#888", border: `1px solid ${(VERTICAL_COLOR[e.vertical] || "#888")}44` }}>
                          {e.vertical}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 11, color: "#888" }}>{e.category}</td>
                      <td style={{ padding: "12px 16px", fontSize: 16 }}>{MOOD_EMOJI[e.customerMood] || "😐"}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#666" }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: VALUE_DOT[e.estimatedValue] || "#888", display: "inline-block" }} />
                          {e.estimatedValue}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {e.escalate && <span style={{ fontSize: 10, color: "#f87171", letterSpacing: 1 }}>▲ ESC</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {selected && (
          <div className="fade-in" style={{ width: 360, borderLeft: "1px solid #1e1e1e", overflow: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: "#d4a853" }}>
                  {selected.customerName || "Unknown Customer"}
                </div>
                <div style={{ fontSize: 11, color: "#444", marginTop: 2 }}>{selected.phone}</div>
              </div>
              <button className="close-btn" onClick={() => setSelected(null)}>✕</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                ["Vertical", selected.vertical],
                ["Category", selected.category],
                ["Language", selected.language],
                ["Confidence", `${selected.confidence}%`],
                ["Value", selected.estimatedValue],
                ["Mood", selected.customerMood],
              ].map(([k, v]) => (
                <div key={k} style={{ background: "#141414", padding: "10px 12px", borderRadius: 4, border: "1px solid #1e1e1e" }}>
                  <div style={{ fontSize: 10, color: "#444", marginBottom: 4, letterSpacing: 1 }}>{k}</div>
                  <div style={{ fontSize: 12, color: "#c8bfa8" }}>{String(v)}</div>
                </div>
              ))}
            </div>

            <div>
              <div style={{ fontSize: 10, color: "#444", letterSpacing: 1, marginBottom: 8 }}>CUSTOMER MESSAGE</div>
              <div style={{ background: "#141414", border: "1px solid #1e1e1e", borderRadius: 4, padding: 12, fontSize: 12, color: "#999", lineHeight: 1.6 }}>
                {selected.messageText}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 10, color: "#444", letterSpacing: 1, marginBottom: 8 }}>AI RESPONSE SENT</div>
              <div style={{ background: "#141414", border: "1px solid #1e1e1e", borderLeft: "3px solid #d4a853", borderRadius: 4, padding: 12, fontSize: 12, color: "#c8bfa8", lineHeight: 1.7 }}>
                {selected.response}
              </div>
            </div>

            {selected.escalate && selected.staffBrief && (
              <div>
                <div style={{ fontSize: 10, color: "#f87171", letterSpacing: 1, marginBottom: 8 }}>▲ STAFF BRIEF (ESCALATED)</div>
                <div style={{ background: "#1a0f0f", border: "1px solid #3a1a1a", borderRadius: 4, padding: 12, fontSize: 12, color: "#f8a0a0", lineHeight: 1.6 }}>
                  {selected.staffBrief}
                </div>
              </div>
            )}

            <div style={{ fontSize: 10, color: "#333", borderTop: "1px solid #1a1a1a", paddingTop: 12 }}>
              Logged: {new Date(selected.loggedAt).toLocaleString("en-GB")}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
