"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function CancelBookingButton({
  bookingId,
  dayId,
  currentSlots,
}: {
  bookingId: string;
  dayId: string;
  currentSlots: number;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleCancel = async () => {
    if (!confirm("Cancel this booking?")) return;
    setLoading(true);

    await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingId);

    // Return the slot
    await supabase
      .from("available_days")
      .update({ slots_remaining: currentSlots + 1 })
      .eq("id", dayId);

    router.push("/bookings");
    router.refresh();
  };

  return (
    <button onClick={handleCancel} disabled={loading} className="btn-danger flex-1">
      {loading ? "Cancelling..." : "Cancel booking"}
    </button>
  );
}
