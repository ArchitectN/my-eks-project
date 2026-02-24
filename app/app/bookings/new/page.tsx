import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BookingForm from "@/components/ui/BookingForm";

export default async function NewBookingPage({
  searchParams,
}: {
  searchParams: { pet?: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: pets }, { data: availableDays }] = await Promise.all([
    supabase.from("pets").select("*").eq("owner_id", user!.id),
    supabase
      .from("available_days")
      .select("*")
      .gt("slots_remaining", 0)
      .gte("date", new Date().toISOString().split("T")[0])
      .order("date", { ascending: true })
      .limit(90),
  ]);

  if (!pets || pets.length === 0) {
    redirect("/pets/new");
  }

  return (
    <div className="max-w-2xl animate-fade-up">
      <div className="mb-8">
        <h1 className="page-title">Book a day</h1>
        <p className="text-sage-500 mt-1 font-body">Pick your pet and choose an available date</p>
      </div>
      <BookingForm
        pets={pets}
        availableDays={availableDays ?? []}
        userId={user!.id}
        defaultPetId={searchParams.pet}
      />
    </div>
  );
}
