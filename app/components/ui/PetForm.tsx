"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Pet } from "@/types";

const SPECIES = ["dog", "cat", "bird", "rabbit", "other"] as const;
const SPECIES_EMOJI: Record<string, string> = {
  dog: "🐶", cat: "🐱", bird: "🐦", rabbit: "🐰", other: "🐾",
};

export default function PetForm({ pet, userId }: { pet?: Pet; userId: string }) {
  const isEdit = !!pet;
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    name: pet?.name ?? "",
    species: pet?.species ?? "dog",
    breed: pet?.breed ?? "",
    age: pet?.age?.toString() ?? "",
    weight_lbs: pet?.weight_lbs?.toString() ?? "",
    notes: pet?.notes ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      name: form.name,
      species: form.species as Pet["species"],
      breed: form.breed || null,
      age: form.age ? parseInt(form.age) : null,
      weight_lbs: form.weight_lbs ? parseFloat(form.weight_lbs) : null,
      notes: form.notes || null,
    };

    let err;
    if (isEdit) {
      const res = await supabase.from("pets").update(payload).eq("id", pet.id);
      err = res.error;
    } else {
      const res = await supabase.from("pets").insert({ ...payload, owner_id: userId });
      err = res.error;
    }

    if (err) {
      setError(err.message);
    } else {
      router.push("/pets");
      router.refresh();
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!pet || !confirm(`Delete ${pet.name}? This will cancel all future bookings.`)) return;
    setDeleting(true);
    await supabase.from("pets").delete().eq("id", pet.id);
    router.push("/pets");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Species selector */}
      <div>
        <label className="label">Type of animal</label>
        <div className="flex gap-3 flex-wrap">
          {SPECIES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setForm((p) => ({ ...p, species: s }))}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-sm font-medium transition-all capitalize ${
                form.species === s
                  ? "bg-sage-600 text-white border-sage-600"
                  : "bg-white text-sage-600 border-sage-200 hover:border-sage-400"
              }`}
            >
              <span>{SPECIES_EMOJI[s]}</span> {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="col-span-2">
          <label className="label">Pet&apos;s name *</label>
          <input name="name" value={form.name} onChange={handleChange} className="input" placeholder="Buddy" required />
        </div>
        <div>
          <label className="label">Breed</label>
          <input name="breed" value={form.breed} onChange={handleChange} className="input" placeholder="Golden Retriever" />
        </div>
        <div>
          <label className="label">Age (years)</label>
          <input name="age" type="number" min="0" max="30" value={form.age} onChange={handleChange} className="input" placeholder="3" />
        </div>
        <div>
          <label className="label">Weight (lbs)</label>
          <input name="weight_lbs" type="number" min="0" step="0.1" value={form.weight_lbs} onChange={handleChange} className="input" placeholder="45" />
        </div>
        <div className="col-span-2">
          <label className="label">Notes for caregivers</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            className="input resize-none h-24"
            placeholder="Allergies, special needs, favourite toys..."
          />
        </div>
      </div>

      {error && (
        <div className="bg-clay-100 border border-clay-200 text-clay-500 px-4 py-3 rounded-2xl text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={() => router.back()} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? "Saving..." : isEdit ? "Save changes" : "Add pet →"}
        </button>
        {isEdit && (
          <button type="button" onClick={handleDelete} disabled={deleting} className="btn-danger">
            {deleting ? "Deleting..." : "Delete"}
          </button>
        )}
      </div>
    </form>
  );
}
