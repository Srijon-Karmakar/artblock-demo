const readEnv = (key: "VITE_SUPABASE_URL" | "VITE_SUPABASE_ANON_KEY") => {
  const value = import.meta.env[key];
  return typeof value === "string" && value.trim().length > 0 ? value : null;
};

export const env = {
  supabaseUrl: readEnv("VITE_SUPABASE_URL"),
  supabaseAnonKey: readEnv("VITE_SUPABASE_ANON_KEY")
};

export const isSupabaseConfigured =
  env.supabaseUrl !== null && env.supabaseAnonKey !== null;
