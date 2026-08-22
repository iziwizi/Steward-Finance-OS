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
  const subject = `StewardOS ${label} — ${formatNaira(d.net_cash_flow)} Net (${d.period_start} to ${d.period_end})`;

  const bucketRows = d.buckets
    .map(
      (b) =>
        `<tr><td style="padding:6px 8px;border-bottom:1px solid #eee">${b.bucket}</td><td style="padding:6px 8px;text-align:right;border-bottom:1px solid #eee">${formatNaira(
          b.spent
        )} / ${formatNaira(b.allocated)}</td><td style="padding:6px 8px;text-align:right;border-bottom:1px solid #eee;color:${
          b.pending > 0 ? "#C9A227" : "#1F6F52"
        };font-weight:600">${b.pending > 0 ? formatNaira(b.pending) + " pending" : "✓ Sent"}</td></tr>`
    )
    .join("");

  const billLines = d.upcoming_bills
    .map((b) => `<li style="margin-bottom:4px"><strong>${b.name}</strong> — ${formatNaira(b.amount)} due ${b.next_due}</li>`)
    .join("");
  const subLines = d.upcoming_subscriptions
    .map((s) => `<li style="margin-bottom:4px"><strong>${s.service_name}</strong> — ${formatNaira(s.cost)} renews ${s.next_renewal_date}</li>`)
    .join("");
  const goalLines = d.goals
    .map(
      (g) =>
        `<li style="margin-bottom:4px"><strong>${g.name}</strong>: ${formatNaira(g.current_amount)} / ${formatNaira(g.target_amount)}</li>`
    )
    .join("");

  const html = `
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0F1115;max-width:580px;margin:0 auto;padding:24px;border:1px solid #E4E4E7;border-radius:16px;background:#FFFFFF">
    <div style="border-bottom:2px solid #1F6F52;padding-bottom:12px;margin-bottom:20px">
      <h2 style="color:#1F6F52;margin:0 0 4px 0">StewardOS ${label}</h2>
      <p style="color:#71717A;font-size:12px;margin:0">Active Financial Cycle: ${d.period_start} — ${d.period_end}</p>
    </div>

    <table style="width:100%;margin:16px 0;background:#F4F4F5;border-radius:8px;padding:12px">
      <tr><td style="padding:6px">Total Inflows</td><td style="padding:6px;text-align:right;font-weight:bold;color:#1F6F52">+${formatNaira(d.total_income)}</td></tr>
      <tr><td style="padding:6px">Total Outflows</td><td style="padding:6px;text-align:right;font-weight:bold;color:#E11D48">-${formatNaira(d.total_expenses)}</td></tr>
      <tr style="border-top:1px solid #E4E4E7"><td style="padding:6px;font-weight:bold">Net Cash Margin</td><td style="padding:6px;text-align:right;font-weight:bold;color:${d.net_cash_flow >= 0 ? "#1F6F52" : "#E11D48"}">${d.net_cash_flow >= 0 ? "+" : ""}${formatNaira(d.net_cash_flow)}</td></tr>
    </table>

    <h3 style="margin:20px 0 8px 0;font-size:14px;color:#18181B">Tithe & Kingdom Giving</h3>
    <p style="margin:0 0 12px 0;font-size:13px">
      ${formatNaira(d.tithe.sent)} sent of ${formatNaira(d.tithe.planned)}
      ${d.tithe.pending > 0 ? `<strong style="color:#C9A227"> — ${formatNaira(d.tithe.pending)} pending transfer</strong>` : " — <span style=\"color:#1F6F52;font-weight:bold\">✓ Fully Settled</span>"}
    </p>

    <h3 style="margin:20px 0 8px 0;font-size:14px;color:#18181B">Envelopes & Budget Allocations</h3>
    <table style="width:100%;font-size:12px;border-collapse:collapse">${bucketRows}</table>

    ${
      d.pending_allocations.length > 0
        ? `<h3 style="margin:20px 0 8px 0;font-size:14px;color:#C9A227">Pending Transfer Obligations</h3>
           <ul style="font-size:13px;padding-left:20px">${d.pending_allocations
             .map((p) => `<li style="margin-bottom:4px">${p.bucket}: <strong>${formatNaira(p.planned_amount)}</strong> (from ${p.income_source})</li>`)
             .join("")}</ul>`
        : ""
    }

    ${billLines ? `<h3 style="margin:20px 0 8px 0;font-size:14px;color:#18181B">Upcoming Bills</h3><ul style="font-size:13px;padding-left:20px">${billLines}</ul>` : ""}
    ${subLines ? `<h3 style="margin:20px 0 8px 0;font-size:14px;color:#18181B">Upcoming Subscriptions</h3><ul style="font-size:13px;padding-left:20px">${subLines}</ul>` : ""}
    ${goalLines ? `<h3 style="margin:20px 0 8px 0;font-size:14px;color:#18181B">Goal Milestones</h3><ul style="font-size:13px;padding-left:20px">${goalLines}</ul>` : ""}

    <div style="margin-top:28px;padding-top:16px;border-top:1px solid #E4E4E7;font-size:11px;color:#A1A1AA;text-align:center">
      StewardOS Personal Finance Operating System · Faithful. Wise. Prosperous.
    </div>
  </div>`;

  const text = `StewardOS ${label} (${d.period_start} to ${d.period_end})
Total Inflows: ${formatNaira(d.total_income)}
Total Outflows: ${formatNaira(d.total_expenses)}
Net Cash Flow: ${formatNaira(d.net_cash_flow)}
Tithe: ${formatNaira(d.tithe.sent)} sent of ${formatNaira(d.tithe.planned)}${d.tithe.pending > 0 ? ` (${formatNaira(d.tithe.pending)} pending)` : ""}
Pending Allocations: ${d.pending_allocations.length} pending obligations`;

  return { subject, html, text };
}

export function renderPushSummary(kind: DigestKind, d: DigestPayload) {
  const label = KIND_LABEL[kind];
  
  let details = `Net cash flow: ${formatNaira(d.net_cash_flow)}.`;
  if (d.total_income > 0) {
    details += ` Income received: ${formatNaira(d.total_income)}.`;
  }
  if (d.total_expenses > 0) {
    details += ` Expenses recorded: ${formatNaira(d.total_expenses)}.`;
  }
  if (d.pending_allocations.length > 0) {
    const totalPendingAmt = d.pending_allocations.reduce((s, p) => s + Number(p.planned_amount), 0);
    details += ` ${formatNaira(totalPendingAmt)} remains in ${d.pending_allocations.length} pending envelope transfer(s).`;
  } else {
    details += ` All envelope allocations are fully dispatched.`;
  }

  if (d.goals.length > 0) {
    details += ` You have ${d.goals.length} active financial goal(s).`;
  }
  if (d.upcoming_bills.length > 0) {
    details += ` ${d.upcoming_bills.length} recurring bill(s) due soon.`;
  }

  return {
    title: `StewardOS ${label}`,
    body: details,
  };
}
