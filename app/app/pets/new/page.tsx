import { createClient } from "@/lib/supabase/server";
import PetForm from "@/components/ui/PetForm";

export default async function NewPetPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="max-w-xl animate-fade-up">
      <div className="mb-8">
        <h1 className="page-title">Add a pet</h1>
        <p className="text-sage-500 mt-1 font-body">Tell us about your companion</p>
      </div>
      <div className="card p-8">
        <PetForm userId={user!.id} />
      </div>
    </div>
  );
}
