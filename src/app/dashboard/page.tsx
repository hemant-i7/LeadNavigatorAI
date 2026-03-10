"use client";
import { useEffect, useRef, useState } from "react";
import { LogEntry } from "@/types";

const ACCENT = "#f97316"; // orange

const SUGGESTIONS = [
  { label: "Desert Safari", msg: "Interested in desert safari for 4 people", vertical: "Tourism" },
  { label: "Visa Query", msg: "What are visa requirements for UAE visit?", vertical: "Tourism" },
  { label: "Group 12+", msg: "We are 15 people for corporate event - need package", vertical: "Tourism" },
  { label: "Car 3 days", msg: "SUV available for 3 days? What's the price?", vertical: "Car Rental" },
  { label: "Chauffeur", msg: "Luxury car with chauffeur for wedding", vertical: "Car Rental" },
  { label: "Rental 10 days", msg: "Need sedan for 10 days - airport pickup", vertical: "Car Rental" },
  { label: "Cancel Booking", msg: "I need to cancel my booking - wrong dates entered", vertical: "Car Rental" },
];

const VERTICAL_COLOR: Record<string, string> = {
  Tourism: "#f97316",
  "Car Rental": "#3b82f6",
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

const isFromWhatsApp = (phone: string) => !/^test-/.test(phone);

const WhatsAppIcon = ({ size = 16 }: { size?: number }) => (
  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: size, height: size, padding: "0 4px", borderRadius: 4, background: "#25D366", color: "white", fontSize: 10, fontWeight: 600, flexShrink: 0 }} title="From WhatsApp">WA</span>
);

type ChatMsg = { role: "user" | "assistant"; text: string; meta?: { vertical: string; category: string; escalate: boolean } };

export default function Dashboard() {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [selected, setSelected] = useState<LogEntry | null>(null);
  const [filter, setFilter] = useState<"All" | "Tourism" | "Car Rental" | "Escalated">("All");
  const [loading, setLoading] = useState(true);
  const [testInput, setTestInput] = useState("");
  const [testPhone, setTestPhone] = useState("");
  const [testName, setTestName] = useState("Test User");
  const [testSending, setTestSending] = useState(false);
  const [testChatHistory, setTestChatHistory] = useState<ChatMsg[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [knowledgeModalOpen, setKnowledgeModalOpen] = useState(false);
  const [knowledgeContent, setKnowledgeContent] = useState("");
  const [knowledgeSaving, setKnowledgeSaving] = useState(false);

  const sendTestMessage = async (msg: string) => {
    if (!msg.trim() || testSending) return;
    setTestSending(true);
    setTestChatHistory((h) => [...h, { role: "user", text: msg.trim() }]);
    setTestInput("");
    const phone = testPhone.trim() || "test-dashboard-" + Date.now();
    try {
      const res = await fetch("/api/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageText: msg.trim(),
          customerPhone: phone,
          customerName: testName.trim() || "Test User",
        }),
      });
      const data = await res.json();
      setTestChatHistory((h) => [
        ...h,
        {
          role: "assistant",
          text: data.response || data.reply || "No response",
          meta: { vertical: data.vertical, category: data.category, escalate: data.escalate },
        },
      ]);
      fetchLogs();
    } catch (e) {
      setTestChatHistory((h) => [
        ...h,
        { role: "assistant", text: "Request failed.", meta: { vertical: "Error", category: "Error", escalate: true } },
      ]);
    } finally {
      setTestSending(false);
    }
  };

  const fetchLogs = async () => {
    const res = await fetch("/api/logs");
    const data = await res.json();
    setEntries(data);
    setLoading(false);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [testChatHistory]);

  const loadKnowledge = async () => {
    const res = await fetch("/api/knowledge");
    const data = await res.json();
    setKnowledgeContent(data.content || "");
  };

  const saveKnowledge = async () => {
    setKnowledgeSaving(true);
    try {
      await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: knowledgeContent }),
      });
      setKnowledgeModalOpen(false);
    } finally {
      setKnowledgeSaving(false);
    }
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

  const selectedHistory = selected
    ? entries.filter((e) => e.phone === selected.phone).sort((a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime())
    : [];

  return (
    <div style={{ fontFamily: "'DM Mono', monospace", background: "#0d0d0d", minHeight: "100vh", color: "#e8e0d0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Cormorant+Garamond:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #1a1a1a; }
        ::-webkit-scrollbar-thumb { background: #f97316; border-radius: 2px; }
        .entry-row { transition: background 0.15s; cursor: pointer; }
        .entry-row:hover { background: #1c1c1c !important; }
        .pill { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 500; }
        .filter-btn { background: none; border: 1px solid #2a2a2a; color: #888; padding: 6px 14px; border-radius: 4px; font-family: inherit; font-size: 12px; cursor: pointer; transition: all 0.15s; }
        .filter-btn.active { border-color: #f97316; color: #f97316; }
        .filter-btn:hover { border-color: #555; color: #ccc; }
        .close-btn { background: none; border: 1px solid #333; color: #888; padding: 4px 12px; border-radius: 4px; font-family: inherit; font-size: 12px; cursor: pointer; }
        .close-btn:hover { border-color: #f97316; color: #f97316; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.3s ease; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .pulse { animation: pulse 2s infinite; }
      `}</style>

      <div style={{ borderBottom: "1px solid #1e1e1e", padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 700, color: ACCENT, letterSpacing: 1 }}>
            CONCIERGE CONSOLE
          </div>
          <div style={{ fontSize: 11, color: "#555", marginTop: 2, letterSpacing: 2 }}>
            DUBAI TOURISM & CAR RENTAL — WHATSAPP AGENT
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => { setKnowledgeModalOpen(true); loadKnowledge(); }}
            style={{ background: "#1a1a1a", border: "1px solid #333", color: "#888", padding: "6px 12px", fontSize: 11, borderRadius: 4, cursor: "pointer", fontFamily: "inherit" }}
          >
            + Knowledge Base
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div className="pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: ACCENT }} />
            <span style={{ fontSize: 11, color: ACCENT, letterSpacing: 1 }}>LIVE</span>
          </div>
        </div>
      </div>

      {knowledgeModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setKnowledgeModalOpen(false)}>
          <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 8, width: "90%", maxWidth: 560, maxHeight: "80vh", display: "flex", flexDirection: "column" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: 20, borderBottom: "1px solid #1a1a1a" }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: ACCENT, marginBottom: 4 }}>Knowledge Base</div>
              <div style={{ fontSize: 12, color: "#666" }}>You can train the assistant using your own company knowledge.</div>
            </div>
            <textarea
              value={knowledgeContent}
              onChange={(e) => setKnowledgeContent(e.target.value)}
              placeholder="Paste FAQs, policies, pricing, package details, contact info... The chatbot will use this context when answering customers."
              style={{ flex: 1, minHeight: 200, maxHeight: 400, padding: 16, background: "#141414", border: "none", color: "#e8e0d0", fontSize: 13, fontFamily: "inherit", resize: "vertical", overflow: "auto" }}
            />
            <div style={{ padding: 16, borderTop: "1px solid #1a1a1a", display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button onClick={() => setKnowledgeModalOpen(false)} className="close-btn">Cancel</button>
              <button onClick={saveKnowledge} disabled={knowledgeSaving} style={{ background: ACCENT, color: "#000", border: "none", padding: "8px 20px", borderRadius: 4, fontSize: 12, fontWeight: 600, cursor: knowledgeSaving ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                {knowledgeSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, borderBottom: "1px solid #1e1e1e" }}>
        {[
          { label: "TOTAL ENQUIRIES", value: stats.total, color: "#e8e0d0" },
          { label: "TOURISM", value: stats.tourism, color: ACCENT },
          { label: "CAR RENTAL", value: stats.carRental, color: "#3b82f6" },
          { label: "ESCALATED", value: stats.escalated, color: "#f87171" },
        ].map((s) => (
          <div key={s.label} style={{ padding: "20px 32px", borderRight: "1px solid #1e1e1e" }}>
            <div style={{ fontSize: 10, color: "#555", letterSpacing: 2, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 32, fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", height: "calc(100vh - 160px)" }}>
        {/* Left: Test Chat */}
        <div style={{ width: 320, borderRight: "1px solid #1e1e1e", display: "flex", flexDirection: "column", background: "#0a0a0a", minHeight: 0 }}>
          <div style={{ padding: 12, borderBottom: "1px solid #1a1a1a", flexShrink: 0 }}>
            <div style={{ fontSize: 10, color: "#555", letterSpacing: 2, marginBottom: 8 }}>TEST CHAT</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 9, color: "#444", marginBottom: 4 }}>Phone</div>
                <div style={{ display: "flex", gap: 4 }}>
                  <input
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    placeholder="+971501234567"
                    style={{ flex: 1, background: "#141414", border: "1px solid #1e1e1e", borderRadius: 4, padding: "6px 10px", fontSize: 11, color: "#e8e0d0", fontFamily: "inherit" }}
                  />
                  <button
                    onClick={() => testPhone.trim() && navigator.clipboard.writeText(testPhone.trim())}
                    disabled={!testPhone.trim()}
                    style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 4, padding: "6px 10px", fontSize: 10, color: "#888", cursor: testPhone.trim() ? "pointer" : "not-allowed", fontFamily: "inherit" }}
                    title="Copy number"
                  >
                    Copy
                  </button>
                  <button
                    onClick={() => navigator.clipboard.readText().then((t) => setTestPhone((p) => t || p))}
                    style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 4, padding: "6px 10px", fontSize: 10, color: "#888", cursor: "pointer", fontFamily: "inherit" }}
                    title="Paste number"
                  >
                    Paste
                  </button>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 9, color: "#444", marginBottom: 4 }}>Name</div>
                <input
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  placeholder="Name"
                  style={{ width: "100%", background: "#141414", border: "1px solid #1e1e1e", borderRadius: 4, padding: "6px 10px", fontSize: 11, color: "#e8e0d0", fontFamily: "inherit" }}
                />
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.label}
                  onClick={() => { setTestInput(s.msg); sendTestMessage(s.msg); }}
                  disabled={testSending}
                  style={{
                    background: (VERTICAL_COLOR[s.vertical] || "#888") + "22",
                    color: VERTICAL_COLOR[s.vertical] || "#888",
                    border: `1px solid ${(VERTICAL_COLOR[s.vertical] || "#888")}44`,
                    padding: "5px 8px",
                    borderRadius: 6,
                    fontSize: 10,
                    cursor: testSending ? "not-allowed" : "pointer",
                    fontFamily: "inherit",
                    opacity: testSending ? 0.6 : 1,
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, overflow: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 10, minHeight: 0 }}>
            {testChatHistory.length === 0 ? (
              <div style={{ color: "#444", fontSize: 11, textAlign: "center", padding: 24 }}>
                Send a message or click a suggestion to start
              </div>
            ) : (
              <>
              {testChatHistory.map((m, i) => (
                <div
                  key={i}
                  className="fade-in"
                  style={{
                    alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                    maxWidth: "90%",
                  }}
                >
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                      background: m.role === "user" ? "#25D366" : "#141414",
                      color: m.role === "user" ? "#000" : "#c8bfa8",
                      fontSize: 12,
                      lineHeight: 1.5,
                      border: m.role === "user" ? "none" : "1px solid #1e1e1e",
                    }}
                  >
                    {m.text}
                  </div>
                  {m.meta && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6, marginLeft: m.role === "user" ? 0 : 4 }}>
                      <span className="pill" style={{ background: (VERTICAL_COLOR[m.meta.vertical] || "#888") + "22", color: VERTICAL_COLOR[m.meta.vertical] || "#888", border: `1px solid ${(VERTICAL_COLOR[m.meta.vertical] || "#888")}44`, fontSize: 9 }}>
                        {m.meta.vertical}
                      </span>
                      <span className="pill" style={{ background: "#1e1e1e", color: "#888", fontSize: 9 }}>{m.meta.category}</span>
                      {m.meta.escalate && <span className="pill" style={{ background: "#f8717122", color: "#f87171", border: "1px solid #f8717144", fontSize: 9 }}>Escalated</span>}
                    </div>
                  )}
                </div>
              ))}
              <div ref={chatEndRef} />
              </>
            )}
          </div>
          <div style={{ padding: "12px 12px 20px", borderTop: "1px solid #1a1a1a", flexShrink: 0, background: "#0a0a0a" }}>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendTestMessage(testInput)}
                placeholder="Type message..."
                disabled={testSending}
                style={{
                  flex: 1,
                  background: "#141414",
                  border: "1px solid #1e1e1e",
                  borderRadius: 20,
                  padding: "10px 14px",
                  fontSize: 12,
                  color: "#e8e0d0",
                  fontFamily: "inherit",
                }}
              />
              <button
                onClick={() => sendTestMessage(testInput)}
                disabled={testSending || !testInput.trim()}
                style={{
                  background: ACCENT,
                  color: "#000",
                  border: "none",
                  borderRadius: 50,
                  padding: "10px 16px",
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: testSending || !testInput.trim() ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  opacity: testSending || !testInput.trim() ? 0.6 : 1,
                }}
              >
                {testSending ? "..." : "Send"}
              </button>
            </div>
          </div>
        </div>

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
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          {isFromWhatsApp(e.phone) && <WhatsAppIcon size={16} />}
                          <div>
                            <div style={{ color: "#c8bfa8" }}>{e.customerName || "Unknown"}</div>
                            <div style={{ fontSize: 10, color: "#444", marginTop: 2 }}>{e.phone}</div>
                          </div>
                        </div>
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
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {isFromWhatsApp(selected.phone) && <WhatsAppIcon size={20} />}
                  <div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: ACCENT }}>
                      {selected.customerName || "Unknown Customer"}
                    </div>
                    <div style={{ fontSize: 11, color: "#444", marginTop: 2 }}>{selected.phone}</div>
                    {isFromWhatsApp(selected.phone) && <div style={{ fontSize: 10, color: "#25D366", marginTop: 2 }}>via WhatsApp</div>}
                  </div>
                </div>
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
                <div key={k} style={{ background: "#141414", padding: "10px 12px", borderRadius: 6, border: "1px solid #1e1e1e", borderLeft: k === "Vertical" ? `3px solid ${VERTICAL_COLOR[String(v)] || "#888"}` : undefined }}>
                  <div style={{ fontSize: 10, color: "#444", marginBottom: 4, letterSpacing: 1 }}>{k}</div>
                  <div style={{ fontSize: 12, color: "#c8bfa8", fontWeight: k === "Vertical" ? 600 : 400 }}>{String(v)}</div>
                </div>
              ))}
            </div>

            <div>
              <div style={{ fontSize: 10, color: "#444", letterSpacing: 1, marginBottom: 10 }}>CHAT HISTORY ({selectedHistory.length} exchange{selectedHistory.length !== 1 ? "s" : ""})</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16, maxHeight: 320, overflow: "auto", paddingRight: 4 }}>
                {selectedHistory.map((e) => (
                  <div key={e.id} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ alignSelf: "flex-end", maxWidth: "85%" }}>
                      <div style={{ padding: "10px 14px", borderRadius: "18px 18px 4px 18px", background: "#25D366", color: "#000", fontSize: 12, lineHeight: 1.5 }}>
                        {e.messageText}
                      </div>
                      <div style={{ fontSize: 9, color: "#444", marginTop: 4, textAlign: "right" }}>{new Date(e.loggedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</div>
                    </div>
                    <div style={{ alignSelf: "flex-start", maxWidth: "85%" }}>
                      <div style={{ padding: "10px 14px", borderRadius: "18px 18px 18px 4px", background: "#141414", border: "1px solid #1e1e1e", borderLeft: "3px solid #f97316", fontSize: 12, color: "#c8bfa8", lineHeight: 1.5 }}>
                        {e.response}
                      </div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                        <span className="pill" style={{ background: (VERTICAL_COLOR[e.vertical] || "#888") + "22", color: VERTICAL_COLOR[e.vertical] || "#888", border: `1px solid ${(VERTICAL_COLOR[e.vertical] || "#888")}44`, fontSize: 9 }}>{e.vertical}</span>
                        <span className="pill" style={{ background: "#1e1e1e", color: "#888", fontSize: 9 }}>{e.category}</span>
                        {e.escalate && <span className="pill" style={{ background: "#f8717122", color: "#f87171", fontSize: 9 }}>Esc</span>}
                      </div>
                      <div style={{ fontSize: 9, color: "#444", marginTop: 4 }}>{new Date(e.loggedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selected.escalate && (
              <>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 10, color: "#f87171", letterSpacing: 1, marginBottom: 8 }}>ESCALATION FLOW</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 11 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ background: "#1a1a1a", padding: "4px 8px", borderRadius: 4, color: "#888" }}>1</span>
                      <span style={{ color: "#999" }}>Customer message received</span>
                    </div>
                    <div style={{ borderLeft: "2px solid #2a2a2a", marginLeft: 14, height: 8 }} />
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ background: "#1a1a1a", padding: "4px 8px", borderRadius: 4, color: "#888" }}>2</span>
                      <span style={{ color: "#999" }}>AI detected escalation trigger (group 10+, rental 7+ days, cancellation, VIP tone, or low confidence)</span>
                    </div>
                    <div style={{ borderLeft: "2px solid #2a2a2a", marginLeft: 14, height: 8 }} />
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ background: "#f8717122", padding: "4px 8px", borderRadius: 4, color: "#f87171" }}>3</span>
                      <span style={{ color: "#f8a0a0" }}>Staff brief generated → Human takes over</span>
                    </div>
                  </div>
                </div>
                {selected.staffBrief && (
                  <div>
                    <div style={{ fontSize: 10, color: "#f87171", letterSpacing: 1, marginBottom: 8 }}>▲ STAFF BRIEF</div>
                    <div style={{ background: "#1a0f0f", border: "1px solid #3a1a1a", borderRadius: 4, padding: 12, fontSize: 12, color: "#f8a0a0", lineHeight: 1.6 }}>
                      {selected.staffBrief}
                    </div>
                  </div>
                )}
              </>
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
