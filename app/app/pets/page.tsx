import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus } from "lucide-react";
import PetCard from "@/components/ui/PetCard";

export default async function PetsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: pets } = await supabase.from("pets").select("*").eq("owner_id", user!.id).order("created_at", { ascending: false });

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">My Pets</h1>
          <p className="text-sage-500 mt-1 font-body">Manage your registered companions</p>
        </div>
        <Link href="/pets/new" className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Pet
        </Link>
      </div>

      {pets && pets.length > 0 ? (
        <div className="grid grid-cols-2 gap-5">
          {pets.map((pet) => (
            <PetCard key={pet.id} pet={pet} />
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center border-dashed border-2 border-sage-200 bg-sage-50/50">
          <div className="text-6xl mb-4">🐾</div>
          <h3 className="section-title mb-2">No pets yet</h3>
          <p className="text-sage-500 text-sm mb-6 font-body">
            Add your first companion to start booking daycare days.
          </p>
          <Link href="/pets/new" className="btn-primary">
            Add your first pet →
          </Link>
        </div>
      )}
    </div>
  );
}
