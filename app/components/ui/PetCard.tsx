import Link from "next/link";
import { Pet } from "@/types";
import { Edit2, CalendarDays } from "lucide-react";

const SPECIES_EMOJI: Record<string, string> = {
  dog: "🐶",
  cat: "🐱",
  bird: "🐦",
  rabbit: "🐰",
  other: "🐾",
};

export default function PetCard({ pet }: { pet: Pet }) {
  return (
    <div className="card p-6 flex flex-col gap-4">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-2xl bg-sage-50 flex items-center justify-center text-3xl shrink-0 border border-sage-100">
          {SPECIES_EMOJI[pet.species] ?? "🐾"}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-xl font-bold text-sage-900">{pet.name}</h3>
          <p className="text-sage-500 text-sm font-body capitalize">
            {pet.species}{pet.breed ? ` · ${pet.breed}` : ""}
          </p>
          <div className="flex gap-2 mt-2 flex-wrap">
            {pet.age && <span className="badge-cream">{pet.age} yr{pet.age !== 1 ? "s" : ""}</span>}
            {pet.weight_lbs && <span className="badge-green">{pet.weight_lbs} lbs</span>}
          </div>
        </div>
      </div>

      {pet.notes && (
        <p className="text-sm text-sage-500 font-body bg-sage-50 rounded-2xl px-4 py-3 line-clamp-2">
          {pet.notes}
        </p>
      )}

      <div className="flex gap-2 mt-auto pt-2 border-t border-sage-100">
        <Link
          href={`/pets/${pet.id}/edit`}
          className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm py-2"
        >
          <Edit2 size={14} /> Edit
        </Link>
        <Link
          href={`/bookings/new?pet=${pet.id}`}
          className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm py-2"
        >
          <CalendarDays size={14} /> Book a day
        </Link>
      </div>
    </div>
  );
}
