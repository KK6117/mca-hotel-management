import { createClient } from "@supabase/supabase-js";

export const supabaseUrl = "https://cmuzkjfgtjcgyupffnwp.supabase.co";
const supabaseKey =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtdXpramZndGpjZ3l1cGZmbndwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTE4NTMwNTcsImV4cCI6MjAyNzQyOTA1N30.E632Dv7pDf5ejZS9V-StpBNVagrJheAca4NRsyzN7xM";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
