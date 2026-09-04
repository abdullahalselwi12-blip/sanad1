import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const VALID_CATEGORIES = [
  "civil",
  "criminal",
  "commercial",
  "family",
  "administrative",
  "constitutional",
  "labor",
  "procedural",
];

interface LawRow {
  id: string;
  title: string;
  category: string;
  description: string | null;
  issue_date: string | null;
  effective_date: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
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

    // --- Parse and validate query parameters ---

    const rawPage = params.get("page");
    const rawLimit = params.get("limit");
    const search = params.get("search")?.trim() || "";
    const category = params.get("category")?.trim() || "";

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

    if (category && !VALID_CATEGORIES.includes(category)) {
      return jsonResponse(
        { error: `Invalid category. Valid values: ${VALID_CATEGORIES.join(", ")}.` },
        400,
      );
    }

    // --- Query the existing laws table (read-only, published only) ---

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("[laws-api] Missing Supabase environment variables");
      return jsonResponse({ error: "Server configuration error." }, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const from = (page - 1) * limit;

    let query = supabase
      .from("laws")
      .select("id, title, category, description, issue_date, effective_date, is_published, created_at, updated_at", { count: "exact" })
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .range(from, from + limit - 1);

    if (search) {
      const orFilter = `title.ilike.%${search}%,description.ilike.%${search}%`;
      query = query.or(orFilter);
    }

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("[laws-api] Database query error:", error.message);
      return jsonResponse({ error: "Failed to fetch laws." }, 500);
    }

    const laws = (data || []) as LawRow[];
    const total = count ?? 0;
    const totalPages = Math.ceil(total / limit);

    return jsonResponse({
      data: laws,
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
    console.error("[laws-api] Unexpected error:", err instanceof Error ? err.message : String(err));
    return jsonResponse({ error: "An unexpected error occurred." }, 500);
  }
});
