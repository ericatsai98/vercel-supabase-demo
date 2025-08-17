import { useState } from "react";

export default function AdminLogin() {
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    const res = await fetch("/api/set-admin-cookie", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pwd }),
    });
    if (res.ok) {
      location.href = "/records"; // 登入成功就跳後台
    } else {
      const out = await res.json().catch(() => ({}));
      setErr(out?.error || "密碼錯誤");
    }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 360, margin: "80px auto", padding: 16 }}>
      <h1>後台登入</h1>
      <form onSubmit={handleLogin}>
        <input
          type="password"
          placeholder="輸入後台密碼"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          style={{ width: "100%", padding: 10, borderRadius: 8, margin: "8px 0" }}
        />
        <button disabled={loading} style={{ padding: 10, borderRadius: 8 }}>
          {loading ? "登入中..." : "登入"}
        </button>
      </form>
      {err && <div style={{ color: "tomato", marginTop: 8 }}>{err}</div>}
    </div>
  );
}
