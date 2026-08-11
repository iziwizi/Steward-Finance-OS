import { formatNaira } from "@/lib/finance/allocation-engine";

export type DigestPayload = {
  period_start: string;
  period_end: string;
  total_income: number;
  total_expenses: number;
  net_cash_flow: number;
  buckets: { bucket: string; allocated: number; sent: number; pending: number; spent: number }[];
  tithe: { planned: number; sent: number; pending: number };
  pending_allocations: { bucket: string; planned_amount: number; income_source: string }[];
  goals: { name: string; target_amount: number; current_amount: number; status: string }[];
  upcoming_bills: { name: string; amount: number; next_due: string }[];
  upcoming_subscriptions: { service_name: string; cost: number; next_renewal_date: string }[];
};

export type DigestKind = "daily_brief" | "weekly_report" | "monthly_report";

const KIND_LABEL: Record<DigestKind, string> = {
  daily_brief: "Daily Brief",
  weekly_report: "Weekly Report",
  monthly_report: "Monthly Report",
};

export function renderDigestEmail(kind: DigestKind, d: DigestPayload): { subject: string; html: string; text: string } {
  const label = KIND_LABEL[kind];
  const subject = `StewardOS ${label} — ${formatNaira(d.net_cash_flow)} net (${d.period_start} to ${d.period_end})`;

  const bucketRows = d.buckets
    .map(
      (b) =>
        `<tr><td style="padding:4px 8px">${b.bucket}</td><td style="padding:4px 8px;text-align:right">${formatNaira(
          b.spent
        )} / ${formatNaira(b.allocated)}</td><td style="padding:4px 8px;text-align:right;color:${
          b.pending > 0 ? "#C9A227" : "#1F6F52"
        }">${b.pending > 0 ? formatNaira(b.pending) + " pending" : "sent"}</td></tr>`
    )
    .join("");

  const billLines = d.upcoming_bills
    .map((b) => `<li>${b.name} — ${formatNaira(b.amount)} due ${b.next_due}</li>`)
    .join("");
  const subLines = d.upcoming_subscriptions
    .map((s) => `<li>${s.service_name} — ${formatNaira(s.cost)} renews ${s.next_renewal_date}</li>`)
    .join("");
  const goalLines = d.goals
    .map(
      (g) =>
        `<li>${g.name}: ${formatNaira(g.current_amount)} / ${formatNaira(g.target_amount)}</li>`
    )
    .join("");

  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#0F1115;max-width:560px;margin:0 auto">
    <h2 style="color:#1F6F52">StewardOS ${label}</h2>
    <p style="color:#666;font-size:13px">${d.period_start} — ${d.period_end}</p>

    <table style="width:100%;margin:16px 0">
      <tr><td>Income</td><td style="text-align:right;font-weight:600">${formatNaira(d.total_income)}</td></tr>
      <tr><td>Expenses</td><td style="text-align:right;font-weight:600">${formatNaira(d.total_expenses)}</td></tr>
      <tr><td>Net Cash Flow</td><td style="text-align:right;font-weight:600">${formatNaira(d.net_cash_flow)}</td></tr>
    </table>

    <h3 style="margin-bottom:4px">Tithe</h3>
    <p style="margin-top:0">
      ${formatNaira(d.tithe.sent)} sent of ${formatNaira(d.tithe.planned)}
      ${d.tithe.pending > 0 ? `<strong style="color:#C9A227"> — ${formatNaira(d.tithe.pending)} still pending</strong>` : " — fully sent"}
    </p>

    <h3 style="margin-bottom:4px">Buckets — spent / allocated (pending shown separately)</h3>
    <table style="width:100%;font-size:13px;border-collapse:collapse">${bucketRows}</table>

    ${
      d.pending_allocations.length > 0
        ? `<h3 style="margin-bottom:4px;color:#C9A227">Pending allocations — not yet sent</h3>
           <ul>${d.pending_allocations
             .map((p) => `<li>${p.bucket}: ${formatNaira(p.planned_amount)} (from ${p.income_source})</li>`)
             .join("")}</ul>`
        : ""
    }

    ${billLines ? `<h3 style="margin-bottom:4px">Bills due soon</h3><ul>${billLines}</ul>` : ""}
    ${subLines ? `<h3 style="margin-bottom:4px">Subscriptions renewing soon</h3><ul>${subLines}</ul>` : ""}
    ${goalLines ? `<h3 style="margin-bottom:4px">Goal progress</h3><ul>${goalLines}</ul>` : ""}

    <p style="margin-top:24px;font-size:12px;color:#999">
      Sent automatically by your StewardOS Personal Finance app. Pending amounts are never counted as sent.
    </p>
  </div>`;

  const text = `StewardOS ${label} (${d.period_start} to ${d.period_end})
Income: ${formatNaira(d.total_income)}
Expenses: ${formatNaira(d.total_expenses)}
Net: ${formatNaira(d.net_cash_flow)}
Tithe: ${formatNaira(d.tithe.sent)} sent of ${formatNaira(d.tithe.planned)}${d.tithe.pending > 0 ? ` (${formatNaira(d.tithe.pending)} pending)` : ""}`;

  return { subject, html, text };
}

export function renderPushSummary(kind: DigestKind, d: DigestPayload) {
  const label = KIND_LABEL[kind];
  return {
    title: `StewardOS ${label}`,
    body: `Net ${formatNaira(d.net_cash_flow)} · ${
      d.pending_allocations.length > 0 ? `${d.pending_allocations.length} allocation(s) pending` : "All allocations sent"
    }`,
  };
}
