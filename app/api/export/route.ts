import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "No records found\n";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(","));
  }
  return lines.join("\n");
}

function toExcelXml(rows: Record<string, unknown>[], title = "StewardOS Export"): string {
  if (rows.length === 0) {
    return `<?xml version="1.0"?>
    <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
      <Worksheet ss:Name="Transactions"><Table><Row><Cell><Data ss:Type="String">No records found</Data></Cell></Row></Table></Worksheet>
    </Workbook>`;
  }

  const headers = Object.keys(rows[0]);
  const headerXml = headers
    .map((h) => `<Cell ss:StyleID="Header"><Data ss:Type="String">${h}</Data></Cell>`)
    .join("");

  const rowsXml = rows
    .map((r) => {
      const cells = headers
        .map((h) => {
          const val = r[h] === null || r[h] === undefined ? "" : String(r[h]);
          const num = Number(val);
          if (!isNaN(num) && val.trim() !== "" && !h.toLowerCase().includes("date") && !h.toLowerCase().includes("id")) {
            return `<Cell><Data ss:Type="Number">${num}</Data></Cell>`;
          }
          return `<Cell><Data ss:Type="String">${val.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</Data></Cell>`;
        })
        .join("");
      return `<Row>${cells}</Row>`;
    })
    .join("");

  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Header">
   <Font ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#1D6458" ss:Pattern="Solid"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="${title}">
  <Table>
   <Row>${headerXml}</Row>
   ${rowsXml}
  </Table>
 </Worksheet>
</Workbook>`;
}

function toPdfHtml(rows: Record<string, unknown>[], title = "StewardOS Financial Ledger"): string {
  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
  const rowsHtml = rows
    .map(
      (r) =>
        `<tr>${headers
          .map(
            (h) =>
              `<td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-size: 12px;">${r[h] ?? ""}</td>`
          )
          .join("")}</tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; padding: 32px; color: #18181b; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1D6458; padding-bottom: 16px; margin-bottom: 24px; }
    .title { font-size: 20px; font-weight: bold; color: #1D6458; }
    .subtitle { font-size: 11px; color: #71717a; }
    table { width: 100%; border-collapse: collapse; text-align: left; }
    th { background: #f4f4f5; padding: 8px 12px; font-size: 11px; text-transform: uppercase; color: #71717a; border-bottom: 1px solid #d4d4d8; }
    .footer { margin-top: 32px; font-size: 10px; color: #a1a1aa; text-align: center; }
  </style>
</head>
<body onload="window.print()">
  <div class="header">
    <div>
      <div class="title">StewardOS · ${title}</div>
      <div class="subtitle">Generated on ${new Date().toLocaleDateString("en-US", { dateStyle: "full" })}</div>
    </div>
    <div style="font-weight: 800; color: #1D6458;">FAITHFUL. WISE. PROSPEROUS.</div>
  </div>
  <table>
    <thead>
      <tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>
  <div class="footer">StewardOS Personal Finance Operating System · A product of MUJTEKNIFY</div>
</body>
</html>`;
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "csv"; // 'csv' | 'xlsx' | 'excel' | 'pdf'
  const tab = searchParams.get("tab") || "all";
  const category = searchParams.get("category");
  const accountId = searchParams.get("account");
  const status = searchParams.get("status");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const q = searchParams.get("q");

  // Fetch Income
  let incomeQuery = supabase
    .from("income_transactions")
    .select("txn_date, source, amount, description, accounts(name)")
    .eq("user_id", user.id)
    .order("txn_date", { ascending: false });

  if (from) incomeQuery = incomeQuery.gte("txn_date", from);
  if (to) incomeQuery = incomeQuery.lte("txn_date", to);
  if (accountId) incomeQuery = incomeQuery.eq("account_id", accountId);

  // Fetch Expenses
  let expenseQuery = supabase
    .from("expense_transactions")
    .select("txn_date, vendor, reason, amount, description, receipt_status, budget_buckets(name)")
    .eq("user_id", user.id)
    .order("txn_date", { ascending: false });

  if (from) expenseQuery = expenseQuery.gte("txn_date", from);
  if (to) expenseQuery = expenseQuery.lte("txn_date", to);
  if (category) expenseQuery = expenseQuery.eq("bucket_id", category);

  const [{ data: incomeData }, { data: expenseData }] = await Promise.all([
    tab !== "expenses" ? incomeQuery : Promise.resolve({ data: [] }),
    tab !== "income" ? expenseQuery : Promise.resolve({ data: [] }),
  ]);

  const rows: Record<string, unknown>[] = [];

  (incomeData ?? []).forEach((i: any) => {
    const desc = i.description || i.source || "Income Deposit";
    if (q && !desc.toLowerCase().includes(q.toLowerCase())) return;
    if (status && status !== "all" && status !== "cleared") return;

    rows.push({
      Date: i.txn_date,
      Type: "Income",
      Description: desc,
      Category: "Income",
      Account: i.accounts?.name || "Main Account",
      Status: "Cleared",
      Amount: Number(i.amount),
    });
  });

  (expenseData ?? []).forEach((e: any) => {
    const desc = e.description || e.vendor || e.reason || "Expense Outflow";
    const st = e.receipt_status === "verified" ? "Cleared" : "Pending";
    if (q && !desc.toLowerCase().includes(q.toLowerCase())) return;
    if (status && status !== "all" && status.toLowerCase() !== st.toLowerCase()) return;

    rows.push({
      Date: e.txn_date,
      Type: "Expense",
      Description: desc,
      Category: e.budget_buckets?.name || "General",
      Account: "Pocket Wallet",
      Status: st,
      Amount: -Number(e.amount),
    });
  });

  rows.sort((a, b) => new Date(b.Date as string).getTime() - new Date(a.Date as string).getTime());

  const today = new Date().toISOString().slice(0, 10);
  const filename = `stewardos-transactions-${today}`;

  if (format === "pdf") {
    return new Response(toPdfHtml(rows, `Transactions Ledger`), {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="${filename}.html"`,
      },
    });
  }

  if (format === "xlsx" || format === "excel") {
    return new Response(toExcelXml(rows, `Transactions`), {
      headers: {
        "Content-Type": "application/vnd.ms-excel; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}.xls"`,
      },
    });
  }

  return new Response(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}.csv"`,
    },
  });
}
