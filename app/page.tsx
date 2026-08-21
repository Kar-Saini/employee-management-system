"use client";

import Link from "next/link";
import { ArrowRight, Mail, Plane, Receipt } from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";

const sections = [
  {
    href: "/dashboard/dispatch",
    icon: Receipt,
    title: "Payslips",
    description: "Generate and email monthly salary slips to employees.",
    links: "Employees · Dispatch · History",
  },
  {
    href: "/dashboard/visa",
    icon: Plane,
    title: "Visas",
    description: "Track entry and exit dates against the 180-day allowance.",
    links: "Visas · Logs",
  },
];

export default function Page() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#050505] text-white">
        {/* Header */}
        <header className="border-b border-white/[0.08] bg-black/70 backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white transition-transform group-hover:scale-105">
                <Mail className="h-4 w-4 text-black" />
              </div>

              <div>
                <div className="text-lg font-semibold tracking-tight">
                  Dispatch
                </div>
                <div className="text-[11px] text-white/40">
                  Management Portal
                </div>
              </div>
            </Link>
          </div>
        </header>

        {/* Main */}
        <main className="relative mx-auto w-full max-w-6xl px-6 py-16">
          {/* Background glow */}
          <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-white/[0.025] blur-3xl" />

          <div className="relative">
            {/* Page heading */}
            <div className="mb-10 max-w-xl">
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-white/35">
                Dashboard
              </p>

              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                What would you like
                <br />
                <span className="text-white/45">to manage?</span>
              </h1>

              <p className="mt-4 max-w-md text-sm leading-6 text-white/40">
                Manage employee payslips and visa records from one place.
              </p>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {sections.map(
                ({ href, icon: Icon, title, description, links }) => (
                  <Link
                    key={href}
                    href={href}
                    className="group relative overflow-hidden rounded-2xl border border-white/[0.09] bg-white/[0.035] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.18] hover:bg-white/[0.055] hover:shadow-2xl hover:shadow-black/40"
                  >
                    {/* Card glow */}
                    <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/[0.025] blur-3xl transition-all duration-500 group-hover:bg-white/[0.06]" />

                    <div className="relative">
                      {/* Icon + arrow */}
                      <div className="flex items-center justify-between">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-lg shadow-black/20">
                          <Icon className="h-5 w-5 text-black" />
                        </div>

                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.08] text-white/30 transition-all duration-300 group-hover:border-white/20 group-hover:bg-white group-hover:text-black">
                          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="mt-10">
                        <h2 className="text-xl font-semibold tracking-tight">
                          {title}
                        </h2>

                        <p className="mt-2 max-w-sm text-sm leading-6 text-white/40">
                          {description}
                        </p>
                      </div>

                      {/* Footer */}
                      <div className="mt-8 flex items-center border-t border-white/[0.08] pt-5">
                        <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/30">
                          {links}
                        </span>
                      </div>
                    </div>
                  </Link>
                ),
              )}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
