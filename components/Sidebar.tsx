"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  Send,
  History,
  LogOut,
  Menu,
  X,
  Mail,
  Plane,
  ScrollText,
  ChevronDown,
  LayoutGrid,
} from "lucide-react";
import { useAuth } from "@/lib/authContext";
import { useState } from "react";

const SECTIONS = {
  payslip: {
    label: "Payslip",
    description: "Salary management",
    icon: Mail,
    items: [
      { href: "/dashboard/employees", label: "Employees", icon: Users },
      { href: "/dashboard/dispatch", label: "Dispatch", icon: Send },
      { href: "/dashboard/history", label: "History", icon: History },
    ],
  },
  visa: {
    label: "Visa",
    description: "Travel & compliance",
    icon: Plane,
    items: [
      { href: "/dashboard/visa", label: "Visas", icon: Plane },
      { href: "/dashboard/visa/logs", label: "Logs", icon: ScrollText },
    ],
  },
} as const;

export function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const section = pathname.startsWith("/dashboard/visa")
    ? SECTIONS.visa
    : SECTIONS.payslip;

  const SectionIcon = section.icon;

  const isActive = (href: string) => pathname === href;

  const NavContent = () => (
    <div className="relative flex h-full flex-col overflow-hidden border-r border-white/[0.08] bg-[#050505]">
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/[0.025] blur-3xl" />

      {/* Header */}
      <div className="relative border-b border-white/[0.08] px-4 py-4">
        <Link
          href="/"
          onClick={() => setIsOpen(false)}
          className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-white/[0.04]"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-lg shadow-black/20">
            <Mail className="h-4 w-4 text-black" />
          </div>

          <div className="min-w-0">
            <h1 className="text-sm font-semibold tracking-tight text-white">
              Dispatch
            </h1>
            <p className="mt-0.5 text-[10px] text-white/35">
              Management Portal
            </p>
          </div>
        </Link>
      </div>

      {/* Section */}
      <div className="relative px-3 pt-5">
        <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/25">
          Section
        </div>

        <Link
          href="/"
          onClick={() => setIsOpen(false)}
          className="group flex w-full items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 py-3 transition hover:border-white/[0.14] hover:bg-white/[0.055]"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.08]">
            <SectionIcon className="h-4 w-4 text-white/70" />
          </div>

          <div className="min-w-0 flex-1 text-left">
            <p className="text-xs font-medium text-white">{section.label}</p>
            <p className="mt-0.5 truncate text-[10px] text-white/30">
              {section.description}
            </p>
          </div>

          <ChevronDown className="h-3.5 w-3.5 text-white/25 transition group-hover:text-white/50" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="relative flex-1 px-3 py-6">
        <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/25">
          Navigation
        </div>

        <div className="space-y-1">
          {section.items.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);

            return (
              <Link
                key={href}
                href={href}
                onClick={() => setIsOpen(false)}
                className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 ${
                  active
                    ? "bg-white text-black shadow-lg shadow-black/20"
                    : "text-white/40 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    active
                      ? "text-black"
                      : "text-white/35 group-hover:text-white"
                  }`}
                />

                <span className="text-xs font-medium">{label}</span>

                {active && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-black/50" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom */}
      <div className="relative border-t border-white/[0.08] p-3">
        {/* User */}
        <div className="mb-2 flex items-center gap-3 rounded-xl bg-white/[0.035] px-3 py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-black">
            {user?.email?.charAt(0).toUpperCase() ?? "U"}
          </div>

          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-white/25">
              Signed in as
            </p>
            <p className="mt-0.5 truncate text-xs text-white/70">
              {user?.email ?? "User"}
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-white/35 transition hover:bg-red-500/[0.08] hover:text-white"
        >
          <LogOut className="h-4 w-4 transition group-hover:text-red-400" />
          <span className="text-xs font-medium">Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/80 text-white shadow-xl backdrop-blur-xl transition hover:bg-white/10 md:hidden"
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Desktop */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 md:flex">
        <NavContent />
      </aside>

      {/* Mobile */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-72 transition-transform duration-300 md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <NavContent />
      </aside>
    </>
  );
}
