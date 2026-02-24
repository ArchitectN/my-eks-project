import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import CancelBookingButton from "@/components/ui/CancelBookingButton";

const SPECIES_EMOJI: Record<string, string> = {
  dog: "🐶", cat: "🐱", bird: "🐦", rabbit: "🐰", other: "🐾",
};

export default async function BookingDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: booking } = await supabase
    .from("bookings")
    .select("*, pet:pets(*), available_day:available_days(*)")
    .eq("id", params.id)
    .eq("owner_id", user!.id)
    .single();

  if (!booking) notFound();

  const pet = booking.pet as any;
  const day = booking.available_day as any;
  const dateStr = day?.date
    ? format(new Date(day.date + "T12:00:00"), "EEEE, MMMM d, yyyy")
    : "Date unknown";

  return (
    <div className="max-w-xl animate-fade-up">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/bookings" className="text-sage-400 hover:text-sage-700 text-sm">
          ← Bookings
        </Link>
      </div>

      <div className="card p-8 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-sage-50 flex items-center justify-center text-3xl border border-sage-100">
            {SPECIES_EMOJI[pet?.species] ?? "🐾"}
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-sage-900">{pet?.name}</h1>
            <p className="text-sage-500 capitalize font-body">{pet?.breed ?? pet?.species}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-sage-50 rounded-2xl p-4">
            <p className="text-xs text-sage-400 font-mono uppercase tracking-wider mb-1">Date</p>
            <p className="font-medium text-sage-800 text-sm">{dateStr}</p>
          </div>
          <div className="bg-sage-50 rounded-2xl p-4">
            <p className="text-xs text-sage-400 font-mono uppercase tracking-wider mb-1">Status</p>
            <p className="font-medium text-sage-800 text-sm capitalize">{booking.status}</p>
          </div>
          <div className="bg-sage-50 rounded-2xl p-4">
            <p className="text-xs text-sage-400 font-mono uppercase tracking-wider mb-1">Capacity</p>
            <p className="font-medium text-sage-800 text-sm">{day?.max_capacity} pets max</p>
          </div>
          <div className="bg-sage-50 rounded-2xl p-4">
            <p className="text-xs text-sage-400 font-mono uppercase tracking-wider mb-1">Booked on</p>
            <p className="font-medium text-sage-800 text-sm">
              {format(new Date(booking.created_at), "MMM d, yyyy")}
            </p>
          </div>
        </div>

        {pet?.notes && (
          <div>
            <p className="text-xs text-sage-400 font-mono uppercase tracking-wider mb-2">Caregiver Notes</p>
            <p className="text-sage-600 font-body text-sm bg-cream-100 rounded-2xl p-4">{pet.notes}</p>
          </div>
        )}

        {booking.status === "confirmed" && (
          <div className="pt-2 border-t border-sage-100 flex gap-3">
            <Link href={`/pets/${pet?.id}/edit`} className="btn-secondary flex-1 text-center">
              Edit pet details
            </Link>
            <CancelBookingButton bookingId={booking.id} dayId={day?.id} currentSlots={day?.slots_remaining} />
          </div>
        )}
      </div>
    </div>
  );
}
