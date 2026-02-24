export type Pet = {
  id: string;
  owner_id: string;
  name: string;
  species: "dog" | "cat" | "bird" | "rabbit" | "other";
  breed: string | null;
  age: number | null;
  weight_lbs: number | null;
  notes: string | null;
  photo_url: string | null;
  created_at: string;
};

export type AvailableDay = {
  id: string;
  date: string;
  max_capacity: number;
  slots_remaining: number;
};

export type Booking = {
  id: string;
  pet_id: string;
  owner_id: string;
  day_id: string;
  status: "confirmed" | "cancelled" | "completed";
  created_at: string;
  pet?: Pet;
  available_day?: AvailableDay;
};

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  emergency_contact: string | null;
  avatar_url: string | null;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      pets: {
        Row: Pet;
        Insert: Omit<Pet, "id" | "created_at">;
        Update: Partial<Omit<Pet, "id" | "owner_id" | "created_at">>;
      };
      available_days: {
        Row: AvailableDay;
        Insert: Omit<AvailableDay, "id">;
        Update: Partial<Omit<AvailableDay, "id">>;
      };
      bookings: {
        Row: Booking;
        Insert: Omit<Booking, "id" | "created_at">;
        Update: Partial<Omit<Booking, "id" | "owner_id" | "created_at">>;
      };
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at">;
        Update: Partial<Omit<Profile, "id" | "created_at">>;
      };
    };
  };
};
