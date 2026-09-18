import { createClient } from "npm:@supabase/supabase-js@2";
import {
  corsHeaders,
  formatResponse,
  errorResponse,
} from "../_shared/xml.ts";

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

  // Supabase returns related profiles as arrays
  profile: {
    full_name: string | null;
    email: string;
  }[] | null;

  lawyer: {
    specialization: string | null;
    profile: {
      full_name: string | null;
    }[] | null;
  }[] | null;
}

const VALID_STATUSES = ["pending", "answered", "closed"];

function getAuthHeader(req: Request): string | null {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader;
}

Deno.serve(async (req: Request) => {
  // CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  // Environment variables
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      "[consultations-api] Missing Supabase environment variables",
    );

    return errorResponse("Server configuration error.", 500);
  }

  // Require authentication
  const authHeader = getAuthHeader(req);

  if (!authHeader) {
    return errorResponse("Authentication required.", 401);
  }

  // Supabase client using caller JWT
  const supabase = createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    },
  );

  // Verify session
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getUser();

  if (sessionError || !sessionData.user) {
    return errorResponse(
      "Invalid or expired session.",
      401,
    );
  }

  const userId = sessionData.user.id;

  // =========================================================
  // GET - List current user's consultations
  // =========================================================

  if (req.method === "GET") {
    try {
      const url = new URL(req.url);
      const params = url.searchParams;

      const rawPage = params.get("page");
      const rawLimit = params.get("limit");
      const status = params.get("status")?.trim() || "";

      let page = 1;
      let limit = 20;

      // Validate page
      if (rawPage !== null) {
        page = parseInt(rawPage, 10);

        if (isNaN(page) || page < 1) {
          return errorResponse(
            "Parameter 'page' must be a positive integer.",
            400,
          );
        }
      }

      // Validate limit
      if (rawLimit !== null) {
        limit = parseInt(rawLimit, 10);

        if (isNaN(limit) || limit < 1 || limit > 100) {
          return errorResponse(
            "Parameter 'limit' must be an integer between 1 and 100.",
            400,
          );
        }
      }

      // Validate status
      if (status && !VALID_STATUSES.includes(status)) {
        return errorResponse(
          `Invalid status. Valid values: ${VALID_STATUSES.join(", ")}.`,
          400,
        );
      }

      const from = (page - 1) * limit;

      let query = supabase
        .from("consultations")
        .select(
          `
          id,
          user_id,
          lawyer_id,
          subject,
          question,
          answer,
          status,
          created_at,
          updated_at,
          profile:profiles!consultations_user_id_fkey(
            full_name,
            email
          ),
          lawyer:lawyers(
            specialization,
            profile:profiles(
              full_name
            )
          )
          `,
          {
            count: "exact",
          },
        )
        .eq("user_id", userId)
        .order("created_at", {
          ascending: false,
        })
        .range(
          from,
          from + limit - 1,
        );

      if (status) {
        query = query.eq("status", status);
      }

      const {
        data,
        error,
        count,
      } = await query;

      if (error) {
        console.error(
          "[consultations-api] Database query error:",
          error.message,
        );

        return errorResponse(
          "Failed to fetch consultations.",
          500,
        );
      }

      const consultations =
        (data || []) as ConsultationRow[];

      const total = count ?? 0;

      const totalPages = Math.ceil(
        total / limit,
      );

      return formatResponse(
        req,
        "consultations",
        {
          data: consultations,

          pagination: {
            page,
            limit,
            total,
            total_pages: totalPages,
            has_next: page < totalPages,
            has_prev: page > 1,
          },
        },
      );
    } catch (err) {
      console.error(
        "[consultations-api] GET error:",
        err instanceof Error
          ? err.message
          : String(err),
      );

      return errorResponse(
        "An unexpected error occurred.",
        500,
      );
    }
  }

  // =========================================================
  // POST - Create a new consultation
  // =========================================================

  if (req.method === "POST") {
    try {
      let body: unknown;

      try {
        body = await req.json();
      } catch {
        return errorResponse(
          "Invalid JSON body.",
          400,
        );
      }

      const bodyObject =
        body as Record<string, unknown>;

      const subject = bodyObject?.subject;
      const question = bodyObject?.question;
      const lawyerId = bodyObject?.lawyer_id;

      // Validate subject
      if (
        typeof subject !== "string" ||
        subject.trim().length === 0
      ) {
        return errorResponse(
          "Subject is required.",
          400,
        );
      }

      // Validate question
      if (
        typeof question !== "string" ||
        question.trim().length === 0
      ) {
        return errorResponse(
          "Question is required.",
          400,
        );
      }

      // Validate subject length
      if (subject.trim().length > 200) {
        return errorResponse(
          "Subject must be 200 characters or less.",
          400,
        );
      }

      // Validate question length
      if (question.trim().length > 5000) {
        return errorResponse(
          "Question must be 5000 characters or less.",
          400,
        );
      }

      // Prepare insert data
      const insertData: Record<string, unknown> = {
        user_id: userId,
        subject: subject.trim(),
        question: question.trim(),
        status: "pending",
      };

      // Optional lawyer
      if (
        typeof lawyerId === "string" &&
        lawyerId.trim().length > 0
      ) {
        insertData.lawyer_id =
          lawyerId.trim();
      }

      // Insert consultation
      const {
        data,
        error,
      } = await supabase
        .from("consultations")
        .insert(insertData)
        .select(
          `
          id,
          user_id,
          lawyer_id,
          subject,
          question,
          answer,
          status,
          created_at,
          updated_at
          `,
        )
        .single();

      if (error) {
        console.error(
          "[consultations-api] Insert error:",
          error.message,
        );

        return errorResponse(
          "Failed to create consultation.",
          500,
        );
      }

      // JSON by default, XML when requested
      return formatResponse(
        req,
        "consultation",
        {
          data,
        },
        201,
      );
    } catch (err) {
      console.error(
        "[consultations-api] POST error:",
        err instanceof Error
          ? err.message
          : String(err),
      );

      return errorResponse(
        "An unexpected error occurred.",
        500,
      );
    }
  }

  // =========================================================
  // Unsupported method
  // =========================================================

  return errorResponse(
    "Method not allowed.",
    405,
  );
});