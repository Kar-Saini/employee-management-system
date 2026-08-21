"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Clock,
  Mail,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format, parse } from "date-fns";
import { Prisma } from "@prisma/client";
import { getEmailHistory } from "@/app/action/getHistory";

type EmailHistoryItem = Prisma.PayslipLogGetPayload<{
  include: {
    employee: {
      select: {
        id: true;
        name: true;
        email: true;
        designation: true;
      };
    };
  };
}>;

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function HistoryPage() {
  const now = new Date();

  const [emails, setEmails] = useState<EmailHistoryItem[]>([]);

  // Default to current month/year
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());

  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

  /* ---------------------------------------------------------------------- */
  /* Load history                                                            */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    (async () => {
      const res = await getEmailHistory();

      if (typeof res === "string") return;

      setEmails(res);
    })();
  }, []);

  /* ---------------------------------------------------------------------- */
  /* Available years                                                         */
  /* ---------------------------------------------------------------------- */

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();

    const emailYears = emails.map((email) => email.year);

    return [...new Set([currentYear, ...emailYears])].sort((a, b) => b - a);
  }, [emails]);

  /* ---------------------------------------------------------------------- */
  /* Filter emails                                                           */
  /* ---------------------------------------------------------------------- */

  const filteredEmails = useMemo(() => {
    return emails.filter(
      (email) => email.year === year && email.month === month + 1,
    );
  }, [emails, month, year]);

  /* ---------------------------------------------------------------------- */
  /* Stats                                                                   */
  /* ---------------------------------------------------------------------- */

  const sentCount = filteredEmails.filter(
    (email) => email.status === "SENT",
  ).length;

  const failedCount = filteredEmails.filter(
    (email) => email.status === "FAILED",
  ).length;

  const pendingCount = filteredEmails.filter(
    (email) => email.status !== "SENT" && email.status !== "FAILED",
  ).length;

  /* ---------------------------------------------------------------------- */
  /* Expand selected month                                                   */
  /* ---------------------------------------------------------------------- */

  const selectedMonthLabel = `${MONTHS[month]} ${year}`;

  useEffect(() => {
    if (filteredEmails.length > 0) {
      setExpandedMonths(new Set([selectedMonthLabel]));
    } else {
      setExpandedMonths(new Set());
    }
  }, [month, year, filteredEmails.length, selectedMonthLabel]);

  const toggleMonth = (monthLabel: string) => {
    const expanded = new Set(expandedMonths);

    if (expanded.has(monthLabel)) {
      expanded.delete(monthLabel);
    } else {
      expanded.add(monthLabel);
    }

    setExpandedMonths(expanded);
  };

  /* ---------------------------------------------------------------------- */
  /* Month navigation                                                        */
  /* ---------------------------------------------------------------------- */

  const changeMonth = (direction: number) => {
    const next = new Date(year, month + direction, 1);

    setMonth(next.getMonth());
    setYear(next.getFullYear());
  };

  return (
    <div className="w-full space-y-8">
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                             */}
      {/* ------------------------------------------------------------------ */}

      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/25">
            Payslip
          </p>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">
            Email History
          </h1>

          <p className="mt-1.5 text-sm text-white/35">
            Track salary slip emails and delivery status
          </p>
        </div>

        {/* Month / Year filter */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 text-xs text-white/30">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>Showing</span>
          </div>

          {/* Month */}
          <div className="relative">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="h-9 appearance-none rounded-lg border border-white/[0.09] bg-white/[0.035] pl-3 pr-8 text-xs font-medium text-white outline-none transition hover:border-white/[0.16] focus:border-white/20"
            >
              {MONTHS.map((name, index) => (
                <option
                  key={name}
                  value={index}
                  className="bg-[#0a0a0a] text-white"
                >
                  {name}
                </option>
              ))}
            </select>

            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
          </div>

          {/* Year */}
          <div className="relative">
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="h-9 appearance-none rounded-lg border border-white/[0.09] bg-white/[0.035] pl-3 pr-8 text-xs font-medium text-white outline-none transition hover:border-white/[0.16] focus:border-white/20"
            >
              {years.map((value) => (
                <option
                  key={value}
                  value={value}
                  className="bg-[#0a0a0a] text-white"
                >
                  {value}
                </option>
              ))}
            </select>

            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Stats                                                               */}
      {/* ------------------------------------------------------------------ */}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Total */}
        <div className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06]">
            <Mail className="h-4 w-4 text-white/50" />
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wider text-white/25">
              Total emails
            </p>

            <p className="mt-0.5 text-sm font-medium text-white">
              {filteredEmails.length}
            </p>
          </div>
        </div>

        {/* Sent */}
        <div className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06]">
            <CheckCircle2 className="h-4 w-4 text-emerald-400/70" />
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wider text-white/25">
              Sent
            </p>

            <p className="mt-0.5 text-sm font-medium text-white">{sentCount}</p>
          </div>
        </div>

        {/* Failed */}
        <div className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06]">
            <AlertCircle className="h-4 w-4 text-red-400/70" />
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wider text-white/25">
              Failed
            </p>

            <p className="mt-0.5 text-sm font-medium text-white">
              {failedCount}
            </p>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* History                                                             */}
      {/* ------------------------------------------------------------------ */}

      <section className="w-full">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-sm font-medium text-white">
              {selectedMonthLabel}
            </h2>

            <p className="mt-0.5 text-xs text-white/30">
              Salary slip dispatch history
            </p>
          </div>

          <span className="text-xs text-white/25">
            {filteredEmails.length}{" "}
            {filteredEmails.length === 1 ? "email" : "emails"}
          </span>
        </div>

        {filteredEmails.length > 0 ? (
          <div className="w-full overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.02]">
            {/* Month header */}
            <button
              onClick={() => toggleMonth(selectedMonthLabel)}
              className="flex w-full items-center justify-between border-b border-white/[0.07] px-4 py-3.5 text-left transition hover:bg-white/[0.035]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06]">
                  <Mail className="h-4 w-4 text-white/50" />
                </div>

                <div>
                  <h3 className="text-xs font-medium text-white">
                    {selectedMonthLabel}
                  </h3>

                  <p className="mt-0.5 text-[10px] text-white/30">
                    {filteredEmails.length}{" "}
                    {filteredEmails.length === 1 ? "email" : "emails"}
                  </p>
                </div>
              </div>

              {expandedMonths.has(selectedMonthLabel) ? (
                <ChevronUp className="h-4 w-4 text-white/30" />
              ) : (
                <ChevronDown className="h-4 w-4 text-white/30" />
              )}
            </button>

            {/* Emails */}
            {expandedMonths.has(selectedMonthLabel) && (
              <div>
                {filteredEmails.map((message, index) => (
                  <div
                    key={message.id}
                    className={`px-4 py-4 transition hover:bg-white/[0.02] ${
                      index !== filteredEmails.length - 1
                        ? "border-b border-white/[0.06]"
                        : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 gap-3">
                        {/* Status icon */}
                        <div className="mt-0.5 shrink-0">
                          {message.status === "SENT" ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400/80" />
                          ) : message.status === "FAILED" ? (
                            <AlertCircle className="h-4 w-4 text-red-400/80" />
                          ) : (
                            <Clock className="h-4 w-4 text-amber-400/80" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <h4 className="text-sm font-medium text-white">
                              {message.employee.name}
                            </h4>

                            <span className="text-xs text-white/25">
                              {message.employee.designation}
                            </span>
                          </div>

                          <p className="mt-0.5 truncate text-xs text-white/35">
                            {message.employee.email}
                          </p>

                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-white/25">
                            <span>
                              {new Date(message.createdAt).toLocaleString()}
                            </span>

                            {message.messageId && (
                              <span className="font-mono">
                                ID: {message.messageId}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status */}
                      <span
                        className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-medium ${
                          message.status === "SENT"
                            ? "bg-emerald-400/10 text-emerald-400"
                            : message.status === "FAILED"
                              ? "bg-red-400/10 text-red-400"
                              : "bg-amber-400/10 text-amber-400"
                        }`}
                      >
                        {message.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex min-h-52 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.02]">
            <div className="text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04]">
                <Mail className="h-4 w-4 text-white/20" />
              </div>

              <p className="mt-3 text-sm text-white/35">No email history</p>

              <p className="mt-1 text-xs text-white/20">
                No salary slip emails were sent in {selectedMonthLabel}.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
