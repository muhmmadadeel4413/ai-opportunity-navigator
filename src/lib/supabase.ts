import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://bficpbbezccjpdifzxek.supabase.co";
const SUPABASE_ANON_KEY =
  "sb_publishable_e4t0914t7-zaWIVOv2oYKw_FtWRIRn6";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
