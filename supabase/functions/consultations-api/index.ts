import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ConsultationRow {
  id: string;
  user_id: string;
  lawyer_id: string | null;
  subject: string;
  question: string;
  answer: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  profile: { full_name: string | null; email: string } | null;
  lawyer: { specialization: string | null; profile: { full_name: string | null } | null } | null;
}

const VALID_STATUSES = ["pending", "answered", "closed"];

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function getAuthHeader(req: Request): string | null {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return authHeader;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[consultations-api] Missing Supabase environment variables");
    return jsonResponse({ error: "Server configuration error." }, 500);
  }

  // Require authentication — use the caller's JWT so RLS enforces ownership
  const authHeader = getAuthHeader(req);
  if (!authHeader) {
    return jsonResponse({ error: "Authentication required." }, 401);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  // Verify the session is valid
  const { data: sessionData, error: sessionError } = await supabase.auth.getUser();
  if (sessionError || !sessionData.user) {
    return jsonResponse({ error: "Invalid or expired session." }, 401);
  }

  const userId = sessionData.user.id;

  // --- GET: list the current user's consultations ---
  if (req.method === "GET") {
    try {
      const url = new URL(req.url);
      const params = url.searchParams;

      const rawPage = params.get("page");
      const rawLimit = params.get("limit");
      const status = params.get("status")?.trim() || "";

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

      if (status && !VALID_STATUSES.includes(status)) {
        return jsonResponse(
          { error: `Invalid status. Valid values: ${VALID_STATUSES.join(", ")}.` },
          400,
        );
      }

      const from = (page - 1) * limit;

      let query = supabase
        .from("consultations")
        .select(
          "id, user_id, lawyer_id, subject, question, answer, status, created_at, updated_at, profile:profiles!consultations_user_id_fkey(full_name, email), lawyer:lawyers(specialization, profile:profiles(full_name))",
          { count: "exact" },
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(from, from + limit - 1);

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error("[consultations-api] Database query error:", error.message);
        return jsonResponse({ error: "Failed to fetch consultations." }, 500);
      }

      const consultations = (data || []) as ConsultationRow[];
      const total = count ?? 0;
      const totalPages = Math.ceil(total / limit);

      return jsonResponse({
        data: consultations,
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
      console.error("[consultations-api] GET error:", err instanceof Error ? err.message : String(err));
      return jsonResponse({ error: "An unexpected error occurred." }, 500);
    }
  }

  // --- POST: create a new consultation ---
  if (req.method === "POST") {
    try {
      let body: unknown;
      try {
        body = await req.json();
      } catch {
        return jsonResponse({ error: "Invalid JSON body." }, 400);
      }

      const subject = (body as Record<string, unknown>)?.subject;
      const question = (body as Record<string, unknown>)?.question;
      const lawyerId = (body as Record<string, unknown>)?.lawyer_id;

      if (typeof subject !== "string" || subject.trim().length === 0) {
        return jsonResponse({ error: "Subject is required." }, 400);
      }

      if (typeof question !== "string" || question.trim().length === 0) {
        return jsonResponse({ error: "Question is required." }, 400);
      }

      if (subject.trim().length > 200) {
        return jsonResponse({ error: "Subject must be 200 characters or less." }, 400);
      }

      if (question.trim().length > 5000) {
        return jsonResponse({ error: "Question must be 5000 characters or less." }, 400);
      }

      const insertData: Record<string, unknown> = {
        user_id: userId,
        subject: subject.trim(),
        question: question.trim(),
        status: "pending",
      };

      if (typeof lawyerId === "string" && lawyerId.trim().length > 0) {
        insertData.lawyer_id = lawyerId.trim();
      }

      const { data, error } = await supabase
        .from("consultations")
        .insert(insertData)
        .select("id, user_id, lawyer_id, subject, question, answer, status, created_at, updated_at")
        .single();

      if (error) {
        console.error("[consultations-api] Insert error:", error.message);
        return jsonResponse({ error: "Failed to create consultation." }, 500);
      }

      return jsonResponse({ data }, 201);
    } catch (err) {
      console.error("[consultations-api] POST error:", err instanceof Error ? err.message : String(err));
      return jsonResponse({ error: "An unexpected error occurred." }, 500);
    }
  }

  return jsonResponse({ error: "Method not allowed." }, 405);
});
