"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "Is StewardOS free to use?",
    answer:
      "Yes. StewardOS is 100% free for individual personal finance management. There are no subscription fees, paywalls, or hidden locked tiers for personal stewardship.",
  },
  {
    question: "How is my financial data protected and secured?",
    answer:
      "StewardOS is engineered on Supabase with strict PostgreSQL Row-Level Security (RLS). Every single query and transaction is cryptographically isolated to your authenticated account. No one else — not even database admins — can access your ledgers without explicit permissions.",
  },
  {
    question: "Can I install StewardOS on my phone as a native app?",
    answer:
      "Yes! StewardOS is a full Progressive Web App (PWA). You can tap 'Add to Home Screen' in Safari on iOS or Chrome on Android for an instant, full-screen native mobile application experience.",
  },
  {
    question: "How does the percentage-based envelope allocation engine work?",
    answer:
      "You define your stewardship allocation percentages once (e.g. 10% Tithe & Kingdom Giving, 50% Living Expenses, 15% Future Investments, 10% Freedom Fund). Whenever income is recorded, StewardOS instantly calculates the precise split with integer kobo accuracy and creates your planned disbursement envelopes.",
  },
  {
    question: "Can I export my financial data for accounting or tax purposes?",
    answer:
      "Yes. You have complete ownership of your data. You can export your full transaction ledgers and reports to CSV, formatted Excel (.xlsx), or print-ready PDF summaries anytime with a single click.",
  },
];

export function LandingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First item open by default

  const toggle = (idx: number) => {
    setOpenIndex((curr) => (curr === idx ? null : idx));
  };

  return (
    <div className="space-y-3.5">
      {FAQS.map((faq, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={faq.question}
            className={`rounded-2xl border transition-all ${
              isOpen
                ? "border-brand-300 bg-white shadow-sm ring-1 ring-brand-100"
                : "border-zinc-200/80 bg-white hover:border-zinc-300 shadow-xs"
            }`}
          >
            <button
              type="button"
              onClick={() => toggle(idx)}
              aria-expanded={isOpen}
              aria-controls={`faq-answer-${idx}`}
              className="flex w-full items-center justify-between p-5 text-left transition-colors"
            >
              <span className="text-sm font-bold text-zinc-900 pr-4">{faq.question}</span>
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-transform duration-200 ${
                  isOpen ? "rotate-180 bg-brand-50 text-brand-700" : "bg-zinc-100 text-zinc-500"
                }`}
              >
                <ChevronDown className="h-4 w-4" />
              </div>
            </button>

            {isOpen && (
              <div
                id={`faq-answer-${idx}`}
                className="px-5 pb-5 pt-0 text-xs text-zinc-600 leading-relaxed border-t border-zinc-100 pt-3 animate-in fade-in duration-fast"
              >
                {faq.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
