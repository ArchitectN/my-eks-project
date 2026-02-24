"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LayoutDashboard, PawPrint, CalendarDays, LogOut, User } from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/pets", icon: PawPrint, label: "My Pets" },
  { href: "/bookings", icon: CalendarDays, label: "Bookings" },
];

export default function Sidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 flex flex-col border-r border-sage-100 bg-white">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-sage-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-sage-600 rounded-xl flex items-center justify-center text-white">
            🐾
          </div>
          <span className="font-display text-lg font-bold text-sage-900">PawDays</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-sage-600 text-white shadow-sm"
                  : "text-sage-600 hover:bg-sage-50 hover:text-sage-800"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-sage-100 space-y-1">
        <Link
          href="/profile"
          className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm text-sage-600 hover:bg-sage-50 transition-colors"
        >
          <User size={18} />
          <span className="truncate">{userEmail}</span>
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm text-clay-500 hover:bg-clay-100 transition-colors"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
