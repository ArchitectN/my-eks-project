"use client";

import { useState } from "react";
import { DayPicker } from "react-day-picker";
import { format, parseISO } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Pet, AvailableDay } from "@/types";
import "react-day-picker/dist/style.css";

const SPECIES_EMOJI: Record<string, string> = {
  dog: "🐶", cat: "🐱", bird: "🐦", rabbit: "🐰", other: "🐾",
};

export default function BookingForm({
  pets,
  availableDays,
  userId,
  defaultPetId,
}: {
  pets: Pet[];
  availableDays: AvailableDay[];
  userId: string;
  defaultPetId?: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [selectedPetId, setSelectedPetId] = useState(defaultPetId ?? pets[0]?.id ?? "");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Build a Set of available date strings for fast lookup
  const availableDateStrings = new Set(availableDays.map((d) => d.date));

  const selectedDay = availableDays.find(
    (d) => selectedDate && d.date === format(selectedDate, "yyyy-MM-dd")
  );

  const isDayDisabled = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return !availableDateStrings.has(dateStr);
  };

  const handleBook = async () => {
    if (!selectedDate || !selectedDay || !selectedPetId) return;
    setLoading(true);
    setError("");

    // Check for duplicate booking
    const { data: existing } = await supabase
      .from("bookings")
      .select("id")
      .eq("pet_id", selectedPetId)
      .eq("day_id", selectedDay.id)
      .eq("status", "confirmed")
      .single();

    if (existing) {
      setError("This pet is already booked for that day.");
      setLoading(false);
      return;
    }

    const { error: bookErr } = await supabase.from("bookings").insert({
      pet_id: selectedPetId,
      owner_id: userId,
      day_id: selectedDay.id,
      status: "confirmed",
    });

    if (bookErr) {
      setError(bookErr.message);
    } else {
      // Decrement slot
      await supabase
        .from("available_days")
        .update({ slots_remaining: selectedDay.slots_remaining - 1 })
        .eq("id", selectedDay.id);
      setSuccess(true);
      setTimeout(() => {
        router.push("/bookings");
        router.refresh();
      }, 1500);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="card p-12 text-center animate-scale-in">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="font-display text-2xl font-bold text-sage-900 mb-2">Booking confirmed!</h2>
        <p className="text-sage-500 font-body">
          {pets.find((p) => p.id === selectedPetId)?.name} is booked for{" "}
          {selectedDate && format(selectedDate, "MMMM d, yyyy")}. Redirecting...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pet selector */}
      <div className="card p-6">
        <h2 className="section-title mb-4">1. Choose your pet</h2>
        <div className="flex gap-3 flex-wrap">
          {pets.map((pet) => (
            <button
              key={pet.id}
              type="button"
              onClick={() => setSelectedPetId(pet.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${
                selectedPetId === pet.id
                  ? "bg-sage-600 text-white border-sage-600 shadow-sm"
                  : "bg-white text-sage-700 border-sage-200 hover:border-sage-400"
              }`}
            >
              <span className="text-xl">{SPECIES_EMOJI[pet.species]}</span>
              <div className="text-left">
                <p className="font-medium text-sm">{pet.name}</p>
                <p className={`text-xs capitalize ${selectedPetId === pet.id ? "text-sage-200" : "text-sage-400"}`}>
                  {pet.breed ?? pet.species}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Calendar */}
      <div className="card p-6">
        <h2 className="section-title mb-1">2. Pick a date</h2>
        <p className="text-sm text-sage-500 mb-4 font-body">Green-highlighted dates are available</p>
        <div className="flex items-start gap-8">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={isDayDisabled}
            fromDate={new Date()}
            modifiers={{
              available: availableDays.map((d) => parseISO(d.date)),
            }}
            modifiersStyles={{
              available: {
                backgroundColor: "#e6ede6",
                borderRadius: "12px",
                color: "#2c432c",
                fontWeight: "600",
              },
            }}
          />
          {selectedDay && selectedDate && (
            <div className="flex-1 bg-sage-50 rounded-3xl p-6 border border-sage-100 animate-scale-in">
              <p className="font-display text-lg font-bold text-sage-900">
                {format(selectedDate, "EEEE")}
              </p>
              <p className="text-sage-600 font-body text-sm mb-4">
                {format(selectedDate, "MMMM d, yyyy")}
              </p>
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="h-2 rounded-full bg-sage-400 transition-all"
                  style={{
                    width: `${(selectedDay.slots_remaining / selectedDay.max_capacity) * 100}%`,
                  }}
                />
              </div>
              <p className="text-xs text-sage-500 font-body">
                {selectedDay.slots_remaining} of {selectedDay.max_capacity} spots remaining
              </p>
              <div className="mt-4 pt-4 border-t border-sage-200">
                <span className="badge-green">✓ Available</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-clay-100 border border-clay-200 text-clay-500 px-4 py-3 rounded-2xl text-sm">
          {error}
        </div>
      )}

      {/* Confirm */}
      <div className="flex gap-3">
        <button type="button" onClick={() => router.back()} className="btn-secondary">
          Cancel
        </button>
        <button
          type="button"
          onClick={handleBook}
          disabled={!selectedDate || !selectedPetId || loading}
          className="btn-primary flex-1"
        >
          {loading
            ? "Booking..."
            : selectedDate
            ? `Confirm booking for ${format(selectedDate, "MMM d")} →`
            : "Select a date to continue"}
        </button>
      </div>
    </div>
  );
}
