import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
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

const EXPORTABLE = ["income", "expenses", "allocations", "goals", "bills", "subscriptions", "assets"] as const;
type Exportable = (typeof EXPORTABLE)[number];

const TABLE_MAP: Record<Exportable, string> = {
  income: "income_transactions",
  expenses: "expense_transactions",
  allocations: "allocations",
  goals: "goals",
  bills: "bills",
  subscriptions: "subscriptions",
  assets: "assets",
};

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") === "json" ? "json" : "csv";
  const type = (searchParams.get("type") ?? "all") as Exportable | "all";

  const typesToExport: Exportable[] = type === "all" ? [...EXPORTABLE] : [type];
  if (type !== "all" && !EXPORTABLE.includes(type)) {
    return NextResponse.json({ error: `Unknown export type: ${type}` }, { status: 400 });
  }

  // RLS scopes every one of these queries to the authenticated user automatically.
  const results: Record<string, unknown[]> = {};
  for (const t of typesToExport) {
    const { data, error } = await supabase.from(TABLE_MAP[t]).select("*");
    if (error) {
      return NextResponse.json({ error: `Failed to export ${t}: ${error.message}` }, { status: 500 });
    }
    results[t] = data ?? [];
  }

  const today = new Date().toISOString().slice(0, 10);

  if (format === "json") {
    return new NextResponse(JSON.stringify(results, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="stewardos-export-${today}.json"`,
      },
    });
  }

  // CSV: single type -> one CSV file. "all" -> a plain-text file with one
  // CSV block per section (keeps this endpoint dependency-free — no zip lib).
  if (type !== "all") {
    return new NextResponse(toCsv(results[type] as Record<string, unknown>[]), {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="stewardos-${type}-${today}.csv"`,
      },
    });
  }

  const sections = typesToExport
    .map((t) => `# ${t}\n${toCsv(results[t] as Record<string, unknown>[]) || "(no records)"}`)
    .join("\n\n");
  return new NextResponse(sections, {
    headers: {
      "Content-Type": "text/plain",
      "Content-Disposition": `attachment; filename="stewardos-export-${today}.txt"`,
    },
  });
}
