import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return jsonResponse({ error: "Method not allowed. Use GET." }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("[auth-api] Missing Supabase environment variables");
      return jsonResponse({ error: "Server configuration error." }, 500);
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return jsonResponse({ error: "Authentication required." }, 401);
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: sessionData, error: sessionError } = await supabase.auth.getUser();

    if (sessionError || !sessionData.user) {
      return jsonResponse({ error: "Invalid or expired session." }, 401);
    }

    const authUser = sessionData.user;

    // Fetch the profile from the existing profiles table
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, full_name, phone, avatar_url, role, is_active, created_at, updated_at")
      .eq("id", authUser.id)
      .maybeSingle();

    if (profileError) {
      console.error("[auth-api] Profile fetch error:", profileError.message);
      return jsonResponse({ error: "Failed to fetch user profile." }, 500);
    }

    if (!profile) {
      return jsonResponse({ error: "Profile not found." }, 404);
    }

    return jsonResponse({
      user: profile,
      session: {
        access_token: authUser.id,
        expires_at: null,
      },
    });
  } catch (err) {
    console.error("[auth-api] Unexpected error:", err instanceof Error ? err.message : String(err));
    return jsonResponse({ error: "An unexpected error occurred." }, 500);
  }
});
