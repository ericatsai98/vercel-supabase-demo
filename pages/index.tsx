import React, { useEffect, useMemo, useState } from "react";



type Lead = {
  client_name: string;
  phone?: string;
  email?: string;
  area_ping?: number | string | undefined;
  category?: string;
  source?: string;
  notes?: string;
  budget_range?: string;
  add_carpentry?: boolean;
  add_system_furniture?: boolean;
  add_electrical?: boolean;
  add_painting?: boolean;
  add_flooring?: boolean;
};

// ✅ 統一的初始值
const INITIAL_FORM: Lead = {
  client_name: "",
  phone: "",
  email: "",
  area_ping: "",
  category: "",
  source: "官網",
  notes: "",
  budget_range: "",
  add_carpentry: false,
  add_system_furniture: false,
  add_electrical: false,
  add_painting: false,
  add_flooring: false,
};

// 用它初始化
const [form, setForm] = useState<Lead>(INITIAL_FORM);


const P = {
  BASE: Number(process.env.NEXT_PUBLIC_QUOTE_BASE_PRICE) || 80000,
  PER_PING: Number(process.env.NEXT_PUBLIC_QUOTE_PRICE_PER_PING) || 20000,
  CARPENTRY: Number(process.env.NEXT_PUBLIC_QUOTE_CARPENTRY_PER_PING) || 6000,
  SYSTEM: Number(process.env.NEXT_PUBLIC_QUOTE_SYSTEM_PER_PING) || 8000,
  ELECTRICAL: Number(process.env.NEXT_PUBLIC_QUOTE_ELECTRICAL_PER_PING) || 3000,
  PAINTING: Number(process.env.NEXT_PUBLIC_QUOTE_PAINTING_PER_PING) || 1500,
  FLOORING: Number(process.env.NEXT_PUBLIC_QUOTE_FLOORING_PER_PING) || 3500,
};

function calcEstimate(area: any, f: Lead) {
  const a = Math.max(0, Number(area) || 0);
  let t = P.BASE + a * P.PER_PING;
  if (f.add_carpentry)        t += a * P.CARPENTRY;
  if (f.add_system_furniture) t += a * P.SYSTEM;
  if (f.add_electrical)       t += a * P.ELECTRICAL;
  if (f.add_painting)         t += a * P.PAINTING;
  if (f.add_flooring)         t += a * P.FLOORING;
  return Math.round(t);
}

export default function Home() {
  const [pwd, setPwd] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [form, setForm] = useState<Lead>({
  client_name: "",        // ✅補上必填欄位
  phone: "",
  email: "",
  area_ping: "",
  category: "",
  source: "官網",
  notes: "",
  budget_range: "",

  add_carpentry: false,
  add_system_furniture: false,
  add_electrical: false,
  add_painting: false,
  add_flooring: false,
});


  const UNLOCK_PWD = process.env.NEXT_PUBLIC_DEMO_PWD || "demo123";
  const est = useMemo(() => calcEstimate(form.area_ping, form), [form]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, type } = e.target;
    const value = (type === "checkbox")
      ? (e.target as HTMLInputElement).checked
      : (type === "number" ? (e.target as HTMLInputElement).value : e.target.value);
    setForm(f => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true); setMsg(null);

   const payload: Lead = {
  ...form,
  area_ping: form.area_ping ? Number(form.area_ping) : undefined, // ✅ 改這行
};


    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const out = await res.json();
      if (out?.ok) {
        setMsg(`已送出！預估金額：${(out.estimate || est).toLocaleString()} 元`);
        setForm(INITIAL_FORM); // ✅ 不會少欄位

      } else {
        throw new Error(out?.error || "提交失敗");
      }
    } catch (err: any) {
      setMsg("發生錯誤：" + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.card as any}>
        <h1>室內裝修試算報價單（Vercel + Supabase）</h1>
        <p style={{opacity:.8}}>此頁會即時計算金額，送出後由伺服器再次計算並寫入 Supabase。</p>

        {!unlocked && (
          <div style={{ marginBottom: 12 }}>
            <label>存取密碼</label>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <input type="password" value={pwd} onChange={(e)=>setPwd(e.target.value)} placeholder="輸入密碼後可使用" />
              <button onClick={()=> setUnlocked(pwd === UNLOCK_PWD)}>解鎖</button>
            </div>
            <div style={{fontSize: 12, opacity: .7}}>（示範用前端密碼，正式請用登入/權限）</div>
          </div>
        )}

        {unlocked && (
          <form onSubmit={onSubmit} style={{marginTop: 12}}>
            <div style={styles.row as any}>
              <div>
                <label>客戶姓名</label>
                <input name="client_name" value={form.client_name || ""} onChange={onChange} required />
              </div>
              <div>
                <label>電話</label>
                <input name="phone" value={form.phone || ""} onChange={onChange} />
              </div>
            </div>

            <div style={styles.row as any}>
              <div>
                <label>Email</label>
                <input type="email" name="email" value={form.email || ""} onChange={onChange} />
              </div>
              <div>
                <label>坪數</label>
                <input type="number" step="0.1" name="area_ping" value={form.area_ping as any || ""} onChange={onChange} />
              </div>
            </div>

            <div style={styles.row as any}>
              <div>
                <label>類別</label>
                <select name="category" value={form.category || ""} onChange={onChange}>
                  <option value="">未指定</option>
                  <option>全室翻新</option>
                  <option>局部裝修</option>
                  <option>系統櫃</option>
                  <option>木作</option>
                  <option>水電</option>
                </select>
              </div>
              <div>
                <label>來源</label>
                <select name="source" value={form.source || "官網"} onChange={onChange}>
                  <option>官網</option><option>FB</option><option>IG</option><option>LINE</option><option>其他</option>
                </select>
              </div>
            </div>

            <div className="addons" style={{marginTop:6}}>
              <label>加選項目（每坪附加單價）</label>
              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginTop:6}}>
                <label><input type="checkbox" name="add_carpentry" checked={!!form.add_carpentry} onChange={onChange}/> 木作（{P.CARPENTRY}/坪）</label>
                <label><input type="checkbox" name="add_system_furniture" checked={!!form.add_system_furniture} onChange={onChange}/> 系統櫃（{P.SYSTEM}/坪）</label>
                <label><input type="checkbox" name="add_electrical" checked={!!form.add_electrical} onChange={onChange}/> 水電（{P.ELECTRICAL}/坪）</label>
                <label><input type="checkbox" name="add_painting" checked={!!form.add_painting} onChange={onChange}/> 油漆（{P.PAINTING}/坪）</label>
                <label><input type="checkbox" name="add_flooring" checked={!!form.add_flooring} onChange={onChange}/> 地坪（{P.FLOORING}/坪）</label>
              </div>
            </div>

            <div style={styles.row as any}>
              <div>
                <label>預算區間</label>
                <select name="budget_range" value={form.budget_range || ""} onChange={onChange}>
                  <option value="">未提供</option>
                  <option>50–80 萬</option>
                  <option>80–120 萬</option>
                  <option>120–200 萬</option>
                  <option>200 萬以上</option>
                </select>
              </div>
              <div>
                <label>即時試算金額</label>
                <div style={{padding:"10px 12px", border:"1px solid rgba(140,140,140,.4)", borderRadius:10}}>
                  {isFinite(est) ? `${est.toLocaleString()} 元` : "請輸入坪數"}
                </div>
              </div>
            </div>

            <label>需求描述</label>
            <textarea name="notes" rows={5} value={form.notes || ""} onChange={onChange} placeholder="請簡述需求與預算"></textarea>

            <button type="submit" disabled={loading} style={{marginTop: 12}}>
              {loading ? "送出中..." : "送出"}
            </button>

            {msg && <div style={{marginTop: 10, padding: 10, borderRadius: 8, background: 'rgba(0,0,0,.05)'}}>{msg}</div>}
          </form>
        )}
      </div>
      <style jsx global>{`
        :root { color-scheme: light dark; }
        body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Noto Sans, Arial, "Microsoft JhengHei", sans-serif; }
        input, select, textarea { width: 100%; padding: 10px; border-radius: 10px; border: 1px solid rgba(140,140,140,.4); }
        button { padding: 10px 16px; border-radius: 10px; border: none; cursor: pointer; }
        label { display:block; margin-top: 12px; font-weight: 600; }
      `}</style>
    </div>
  );
}

const styles = {
  wrap: { maxWidth: 760, margin: "40px auto", padding: "0 16px", lineHeight: 1.6 },
  card: { border: "1px solid rgba(140,140,140,.3)", borderRadius: 14, padding: 20, boxShadow: "0 4px 14px rgba(0,0,0,.06)" },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
} as const;

export async function getServerSideProps() {
  return { props: {} };
}
