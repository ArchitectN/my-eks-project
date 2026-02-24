import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus } from "lucide-react";
import { format } from "date-fns";

const STATUS_BADGE: Record<string, string> = {
  confirmed: "badge-green",
  cancelled: "badge-clay",
  completed: "badge-cream",
};

const SPECIES_EMOJI: Record<string, string> = {
  dog: "🐶", cat: "🐱", bird: "🐦", rabbit: "🐰", other: "🐾",
};

export default async function BookingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      *,
      pet:pets(name, species, breed),
      available_day:available_days(date, slots_remaining)
    `)
    .eq("owner_id", user!.id)
    .order("created_at", { ascending: false });

  const upcoming = bookings?.filter((b) => b.status === "confirmed") ?? [];
  const past = bookings?.filter((b) => b.status !== "confirmed") ?? [];

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Bookings</h1>
          <p className="text-sage-500 mt-1 font-body">All your daycare reservations</p>
        </div>
        <Link href="/bookings/new" className="btn-primary flex items-center gap-2">
          <Plus size={18} /> New Booking
        </Link>
      </div>

      {(!bookings || bookings.length === 0) && (
        <div className="card p-12 text-center border-dashed border-2 border-sage-200 bg-sage-50/50">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="section-title mb-2">No bookings yet</h3>
          <p className="text-sage-500 text-sm mb-6 font-body">
            Reserve a spot for your pet and we&apos;ll take care of the rest.
          </p>
          <Link href="/bookings/new" className="btn-primary">
            Make your first booking →
          </Link>
        </div>
      )}

      {upcoming.length > 0 && (
        <section>
          <h2 className="section-title mb-4">Upcoming</h2>
          <div className="space-y-3">
            {upcoming.map((b: any) => (
              <BookingRow key={b.id} booking={b} />
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 className="section-title mb-4 text-sage-500">Past Bookings</h2>
          <div className="space-y-3 opacity-70">
            {past.map((b: any) => (
              <BookingRow key={b.id} booking={b} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function BookingRow({ booking }: { booking: any }) {
  const emoji = SPECIES_EMOJI[booking.pet?.species] ?? "🐾";
  const dateStr = booking.available_day?.date
    ? format(new Date(booking.available_day.date + "T12:00:00"), "EEEE, MMMM d, yyyy")
    : "Date unknown";

  return (
    <div className="card p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-sage-50 flex items-center justify-center text-2xl shrink-0 border border-sage-100">
        {emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sage-900">{booking.pet?.name ?? "Unknown pet"}</p>
        <p className="text-sm text-sage-500 font-body">{dateStr}</p>
      </div>
      <span className={STATUS_BADGE[booking.status] ?? "badge"}>
        {booking.status}
      </span>
      <Link
        href={`/bookings/${booking.id}`}
        className="text-sage-400 hover:text-sage-700 transition-colors text-sm font-medium"
      >
        View →
      </Link>
    </div>
  );
}
