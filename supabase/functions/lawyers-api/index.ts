import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface LawyerRow {
  id: string;
  profile_id: string;
  license_number: string | null;
  specialization: string | null;
  bio: string | null;
  experience_years: number | null;
  office_address: string | null;
  is_verified: boolean;
  rating: number | null;
  created_at: string;
  updated_at: string;
  profile: {
    full_name: string | null;
    email: string;
    phone: string | null;
    avatar_url: string | null;
  } | null;
}

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
    const url = new URL(req.url);
    const params = url.searchParams;

    const rawPage = params.get("page");
    const rawLimit = params.get("limit");
    const search = params.get("search")?.trim() || "";
    const specialization = params.get("specialization")?.trim() || "";
    const verifiedOnly = params.get("verified") === "true";

    let page = 1;
    let limit = 20;

    if (rawPage !== null) {
      page = parseInt(rawPage, 10);
      if (isNaN(page) || page < 1) {
        return jsonResponse({ error: "Parameter 'page' must be a positive integer." }, 400);
      }
    }

    if (rawLimit !== null) {
      limit = parseInt(rawLimit, 10);
      if (isNaN(limit) || limit < 1 || limit > 100) {
        return jsonResponse({ error: "Parameter 'limit' must be an integer between 1 and 100." }, 400);
      }
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("[lawyers-api] Missing Supabase environment variables");
      return jsonResponse({ error: "Server configuration error." }, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const from = (page - 1) * limit;

    let query = supabase
      .from("lawyers")
      .select(
        "id, profile_id, license_number, specialization, bio, experience_years, office_address, is_verified, rating, created_at, updated_at, profile:profiles(full_name, email, phone, avatar_url)",
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(from, from + limit - 1);

    if (verifiedOnly) {
      query = query.eq("is_verified", true);
    }

    if (specialization) {
      query = query.ilike("specialization", `%${specialization}%`);
    }

    if (search) {
      const orFilter = `specialization.ilike.%${search}%,bio.ilike.%${search}%`;
      query = query.or(orFilter);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("[lawyers-api] Database query error:", error.message);
      return jsonResponse({ error: "Failed to fetch lawyers." }, 500);
    }

    const lawyers = (data || []) as LawyerRow[];
    const total = count ?? 0;
    const totalPages = Math.ceil(total / limit);

    return jsonResponse({
      data: lawyers,
      pagination: {
        page,
        limit,
        total,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
    });
  } catch (err) {
    console.error("[lawyers-api] Unexpected error:", err instanceof Error ? err.message : String(err));
    return jsonResponse({ error: "An unexpected error occurred." }, 500);
  }
});
