# Vercel + Supabase Minimal Starter (Leads Form)

這是一個可直接用來**接案交付**的最小專案：
- 前端：Next.js（Vercel）
- 後端：API Route（/api/submit）
- 資料庫：Supabase（Postgres）

## 功能
- 表單收集（client_name, phone, email, area_ping, category, source, notes）
- 呼叫 API Route 寫入 Supabase
- 成功/失敗提示
- 可切換「純前端直連 Supabase（RLS 限制 Insert）」模式

---

## 一步步部署

### 1) 建立 Supabase 專案與資料表
- 建立專案 → 進入 SQL Editor，貼上 `schema.sql` 完整執行。
- 到 Project Settings → API 複製：
  - `Project URL` → `SUPABASE_URL`
  - `anon public` → `SUPABASE_ANON_KEY`
  - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

### 2) 匯入到 Vercel
- 將此專案推到 GitHub。
- 在 Vercel 連結此 GitHub repo → Import。
- 在 Vercel 專案 Settings → Environment Variables 新增：
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Deploy 後，打開專案網址即可使用。

### 3) 本機開發（可選）
```bash
npm i
cp .env.example .env.local  # 填入你的 Supabase 變數
npm run dev
```

---

## 兩種寫入模式

1) **API Route（預設）**：
   - 前端呼叫 `/api/submit`，伺服器端用 `SERVICE_ROLE_KEY` 寫入（不受 RLS 限制）。
   - 好處：機密邏輯不外洩、可加入驗證/防濫用。

2) **前端直連（選配）**：
   - `pages/index.tsx` 內有備用程式，使用 `ANON_KEY` 直插 `leads`。
   - 需在 `schema.sql` 中啟用 RLS 並保留 `INSERT` policy（已包含）。

---

## 注意
- 請務必把環境變數僅設定在 Vercel，不要提交到 Git。
- 若要新增欄位：修改 `schema.sql` 與頁面表單/後端欄位對應即可。
