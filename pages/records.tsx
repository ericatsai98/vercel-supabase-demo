import React, { useMemo, useState } from "react";
import type { GetServerSideProps } from "next";
import { getAdminClient } from "../lib/supabaseAdmin";

type Lead = {
  id: string;
  created_at: string;
  client_name: string | null;
  phone: string | null;
  email: string | null;
  area_ping: number | null;
  category: string | null;
  source: string | null;
  notes: string | null;
  budget_range?: string | null;
  add_carpentry?: boolean | null;
  add_system_furniture?: boolean | null;
  add_electrical?: boolean | null;
  add_painting?: boolean | null;
  add_flooring?: boolean | null;
  quote_estimate?: number | null;
};

type Props = {
  rows: Lead[];
  total: number;
  page: number;
  pageSize: number;
};

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  // ✅ 簡單密碼保護（看 cookie）
  const cookiePwd = ctx.req.cookies?.admin_pwd;
  if (cookiePwd !== process.env.RECORDS_ADMIN_PWD) {
    return { redirect: { destination: "/?need_admin=1", permanent: false } };
  }

  const supabase = getAdminClient();

  const pageSize = 20;
  const page = Number(ctx.query.page || 1);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // 先查總數
  const { count } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true });

  // 再拉分頁資料（新→舊）
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error(error);
    return { props: { rows: [], total: 0, page: 1, pageSize } };
  }

  return {
    props: {
      rows: (data || []) as Lead[],
      total: count || 0,
      page,
      pageSize,
    },
  };
};

export default function Records({ rows, total, page, pageSize }: Props) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return rows;
    return rows.filter(
      (r) =>
        r.client_name?.toLowerCase().includes(k) ||
        r.phone?.toLowerCase().includes(k) ||
        r.email?.toLowerCase().includes(k) ||
        r.category?.toLowerCase().includes(k) ||
        r.source?.toLowerCase().includes(k)
    );
  }, [q, rows]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

// ✅ 匯出 CSV（含 BOM、電話防科學記號、中文標題）
const toCSV = () => {
  // 1) 標題用「字串」，或由物件陣列取 title
  const headerTitles = [
    "建立日期",
    "客戶名稱",
    "電話",
    "信箱",
    "坪數",
    "案件類別",
    "來源",
    "預算區間",
    "木作",
    "系統櫃",
    "水電",
    "油漆",
    "地板",
    "估算報價",
    "備註",
  ];

  // 2) 每列資料 → 轉成字串陣列
  const rowsForCsv = filtered.map((r) => {
    // 防 Excel 把電話變 1.23E+08：前面加 \t
    const safePhone = r.phone ? `\t${r.phone}` : "";

    const cols = [
      r.created_at,
      r.client_name ?? "",
      safePhone,
      r.email ?? "",
      r.area_ping ?? "",
      r.category ?? "",
      r.source ?? "",
      r.budget_range ?? "",
      r.add_carpentry ? "1" : "",
      r.add_system_furniture ? "1" : "",
      r.add_electrical ? "1" : "",
      r.add_painting ? "1" : "",
      r.add_flooring ? "1" : "",
      r.quote_estimate ?? "",
      // 備註：換行與逗號做安全處理
      (r.notes ?? "").replace(/\n/g, " ").replace(/,/g, "，"),
    ];

    // CSV 安全轉義：每格外層加雙引號，內部雙引號變兩個
    return cols.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(",");
  });

  // 3) 組成 CSV 內容
  const content = [headerTitles.join(","), ...rowsForCsv].join("\n");

  // 4) 加上 UTF-8 BOM，避免 Excel 中文顯示異常
  const withBOM = "\uFEFF" + content;

  // 5) 下載
  const blob = new Blob([withBOM], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `leads_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};


  return (
    <div style={styles.wrap}>
      <div style={styles.head}>
        <h1 style={{ margin: 0 }}>Leads 後台列表</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            placeholder="搜尋姓名/電話/Email/類別/來源"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={styles.search as any}
          />
          <button onClick={toCSV}>匯出 CSV</button>
        </div>
      </div>

      <div style={{ fontSize: 14, opacity: 0.7, marginBottom: 8 }}>
        共 {total} 筆，顯示第 {page} / {totalPages} 頁（每頁 {pageSize} 筆）
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={styles.table as any}>
          <thead>
            <tr>
              <th>時間</th>
              <th>姓名</th>
              <th>電話</th>
              <th>Email</th>
              <th>坪數</th>
              <th>類別</th>
              <th>來源</th>
              <th>預算</th>
              <th>加選</th>
              <th>估價</th>
              <th>備註</th>
            </tr>
          </thead>
<tbody>
  {filtered.map((r) => {
    return (
      <tr key={r.id}>
        <td>{new Date(r.created_at).toLocaleString()}</td>
        <td>{r.client_name}</td>
        <td>{r.phone}</td>
        <td>{r.email}</td>
        <td>{r.area_ping ?? ""}</td>
        <td>{r.category ?? ""}</td>
        <td>{r.source ?? ""}</td>
        <td>{r.budget_range ?? ""}</td>
        <td style={{ whiteSpace: "nowrap" }}>
          {[
            r.add_carpentry && "木作",
            r.add_system_furniture && "系統櫃",
            r.add_electrical && "水電",
            r.add_painting && "油漆",
            r.add_flooring && "地坪",
          ]
            .filter(Boolean)
            .join("、")}
        </td>
        <td>{r.quote_estimate?.toLocaleString?.() ?? ""}</td>
        <td
          style={{
            maxWidth: 360,
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            overflow: "hidden",
          }}
        >
          {r.notes}
        </td>
      </tr>
    );
  })}

  {filtered.length === 0 && (
    <tr>
      <td colSpan={11} style={{ textAlign: "center", padding: 20, opacity: 0.7 }}>
        沒有資料
      </td>
    </tr>
  )}
</tbody>

        </table>
      </div>

      <div style={styles.pager}>
        <a href={`/records?page=${Math.max(1, page - 1)}`} aria-disabled={page <= 1}>
          ← 上一頁
        </a>
        <a href={`/records?page=${Math.min(totalPages, page + 1)}`} aria-disabled={page >= totalPages}>
          下一頁 →
        </a>
      </div>

      <style jsx global>{`
        :root { color-scheme: light dark; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border-bottom: 1px solid rgba(140,140,140,.2); padding: 8px 10px; text-align: left; }
        th { font-weight: 700; }
        button { padding: 8px 12px; border-radius: 10px; border: 1px solid rgba(140,140,140,.4); cursor: pointer; background: transparent; }
        input { padding: 8px 10px; border-radius: 10px; border: 1px solid rgba(140,140,140,.4); }
        a[aria-disabled="true"] { pointer-events: none; opacity: .5; }
      `}</style>
    </div>
  );
}

const styles = {
  wrap: { maxWidth: 1100, margin: "32px auto", padding: "0 16px" },
  head: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  search: { minWidth: 260 },
  table: {},
  pager: { display: "flex", gap: 16, justifyContent: "center", marginTop: 16 },
} as const;
