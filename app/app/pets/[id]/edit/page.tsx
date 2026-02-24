import { createClient } from "@/lib/supabase/server";
import PetForm from "@/components/ui/PetForm";
import { notFound } from "next/navigation";

export default async function EditPetPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: pet } = await supabase
    .from("pets")
    .select("*")
    .eq("id", params.id)
    .eq("owner_id", user!.id)
    .single();

  if (!pet) notFound();

  return (
    <div className="max-w-xl animate-fade-up">
      <div className="mb-8">
        <h1 className="page-title">Edit {pet.name}</h1>
        <p className="text-sage-500 mt-1 font-body">Update your pet&apos;s information</p>
      </div>
      <div className="card p-8">
        <PetForm pet={pet} userId={user!.id} />
      </div>
    </div>
  );
}
