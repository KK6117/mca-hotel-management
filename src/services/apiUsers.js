import supabase from "../services/supabase";

export async function getGuests() {
	const { data, error } = await supabase.from("guests").select("*");

	if (error) throw new Error(error.message);

	return data;
}
