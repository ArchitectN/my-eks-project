import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { PawPrint, CalendarDays, Clock, ChevronRight } from "lucide-react";
import { format } from "date-fns";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: pets }, { data: upcomingBookings }, { data: profile }] = await Promise.all([
    supabase.from("pets").select("*").eq("owner_id", user!.id),
    supabase
      .from("bookings")
      .select("*, pet:pets(name, species), available_day:available_days(date)")
      .eq("owner_id", user!.id)
      .eq("status", "confirmed")
      .gte("available_days.date", new Date().toISOString().split("T")[0])
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("profiles").select("*").eq("id", user!.id).single(),
  ]);

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="font-display text-4xl font-bold text-sage-900">
          {greeting}, {displayName} 👋
        </h1>
        <p className="text-sage-500 mt-1 font-body">Here&apos;s what&apos;s happening with your pets today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-5">
        {[
          { label: "Registered Pets", value: pets?.length ?? 0, icon: PawPrint, color: "bg-sage-600", href: "/pets" },
          { label: "Upcoming Bookings", value: upcomingBookings?.length ?? 0, icon: CalendarDays, color: "bg-cream-400", href: "/bookings" },
          { label: "Days Visited", value: "—", icon: Clock, color: "bg-clay-300", href: "/bookings" },
        ].map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} href={href} className="card p-6 flex items-start justify-between group cursor-pointer">
            <div>
              <p className="text-sage-500 text-sm font-body mb-1">{label}</p>
              <p className="font-display text-3xl font-bold text-sage-900">{value}</p>
            </div>
            <div className={`${color} w-10 h-10 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
              <Icon size={20} />
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-5">
        <div className="card p-6">
          <h2 className="section-title mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Link href="/pets/new" className="flex items-center justify-between p-3 rounded-2xl hover:bg-sage-50 transition-colors group">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🐶</span>
                <div>
                  <p className="text-sm font-medium text-sage-800">Add a new pet</p>
                  <p className="text-xs text-sage-400">Register your companion</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-sage-300 group-hover:text-sage-600 transition-colors" />
            </Link>
            <Link href="/bookings/new" className="flex items-center justify-between p-3 rounded-2xl hover:bg-sage-50 transition-colors group">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📅</span>
                <div>
                  <p className="text-sm font-medium text-sage-800">Book a day</p>
                  <p className="text-xs text-sage-400">Reserve a spot for your pet</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-sage-300 group-hover:text-sage-600 transition-colors" />
            </Link>
          </div>
        </div>

        {/* Upcoming bookings */}
        <div className="card p-6">
          <h2 className="section-title mb-4">Upcoming Visits</h2>
          {upcomingBookings && upcomingBookings.length > 0 ? (
            <div className="space-y-2">
              {upcomingBookings.slice(0, 3).map((booking: any) => (
                <div key={booking.id} className="flex items-center gap-3 p-3 rounded-2xl bg-sage-50">
                  <span className="text-xl">{booking.pet?.species === "dog" ? "🐶" : booking.pet?.species === "cat" ? "🐱" : "🐾"}</span>
                  <div>
                    <p className="text-sm font-medium text-sage-800">{booking.pet?.name}</p>
                    <p className="text-xs text-sage-400">
                      {booking.available_day?.date
                        ? format(new Date(booking.available_day.date), "MMM d, yyyy")
                        : "Date TBD"}
                    </p>
                  </div>
                  <span className="ml-auto badge-green">Confirmed</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sage-400 text-sm">No upcoming visits</p>
              <Link href="/bookings/new" className="text-sage-600 text-sm font-medium hover:underline mt-1 inline-block">
                Book one now →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Empty state if no pets */}
      {(!pets || pets.length === 0) && (
        <div className="card p-10 text-center border-dashed border-2 border-sage-200 bg-sage-50/50">
          <div className="text-5xl mb-4">🐾</div>
          <h3 className="section-title mb-2">Add your first pet</h3>
          <p className="text-sage-500 text-sm mb-6">Register your companion to start booking daycare days.</p>
          <Link href="/pets/new" className="btn-primary">
            Add a pet →
          </Link>
        </div>
      )}
    </div>
  );
}
