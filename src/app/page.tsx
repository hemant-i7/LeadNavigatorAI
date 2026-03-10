import Link from "next/link";

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0d0d0d", color: "#e8e0d0", fontFamily: "sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: 32, marginBottom: 16, color: "#d4a853" }}>WhatsApp Concierge Agent</h1>
        <p style={{ color: "#888", marginBottom: 24 }}>Dubai Tourism & Car Rental</p>
        <Link href="/dashboard" style={{ padding: "12px 24px", background: "#d4a853", color: "#0d0d0d", borderRadius: 6, textDecoration: "none", fontWeight: 600 }}>
          Open Dashboard
        </Link>
      </div>
    </main>
  );
}
