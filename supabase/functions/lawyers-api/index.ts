import { createClient } from "npm:@supabase/supabase-js@2";
import {
  corsHeaders,
  formatResponse,
  errorResponse,
} from "../_shared/xml.ts";

/* =========================================================
   TYPES
   ========================================================= */

interface ProfileRow {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  avatar_url: string | null;
}

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
}

interface LawyerResponse {
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

/* =========================================================
   API
   ========================================================= */

Deno.serve(async (req: Request) => {
  /* =======================================================
     CORS
     ======================================================= */

  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  /* =======================================================
     ONLY GET
     ======================================================= */

  if (req.method !== "GET") {
    return errorResponse(
      "Method not allowed. Use GET.",
      405,
    );
  }

  try {
    /* =====================================================
       URL PARAMETERS
       ===================================================== */

    const url = new URL(req.url);
    const params = url.searchParams;

    const rawPage = params.get("page");
    const rawLimit = params.get("limit");

    const search =
      params.get("search")?.trim() || "";

    const specialization =
      params.get("specialization")?.trim() || "";

    const verifiedOnly =
      params.get("verified") === "true";

    /* =====================================================
       PAGINATION
       ===================================================== */

    let page = 1;
    let limit = 20;

    if (rawPage !== null) {
      page = parseInt(rawPage, 10);

      if (Number.isNaN(page) || page < 1) {
        return errorResponse(
          "Parameter 'page' must be a positive integer.",
          400,
        );
      }
    }

    if (rawLimit !== null) {
      limit = parseInt(rawLimit, 10);

      if (
        Number.isNaN(limit) ||
        limit < 1 ||
        limit > 100
      ) {
        return errorResponse(
          "Parameter 'limit' must be an integer between 1 and 100.",
          400,
        );
      }
    }

    /* =====================================================
       SUPABASE ENVIRONMENT
       ===================================================== */

    const supabaseUrl =
      Deno.env.get("SUPABASE_URL");

    const supabaseAnonKey =
      Deno.env.get("SUPABASE_ANON_KEY");

    const supabaseServiceRoleKey =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl) {
      console.error(
        "[lawyers-api] Missing SUPABASE_URL",
      );

      return errorResponse(
        "Server configuration error.",
        500,
      );
    }

    if (!supabaseAnonKey) {
      console.error(
        "[lawyers-api] Missing SUPABASE_ANON_KEY",
      );

      return errorResponse(
        "Server configuration error.",
        500,
      );
    }

    if (!supabaseServiceRoleKey) {
      console.error(
        "[lawyers-api] Missing SUPABASE_SERVICE_ROLE_KEY",
      );

      return errorResponse(
        "Server configuration error.",
        500,
      );
    }

    /* =====================================================
       PUBLIC CLIENT
       
       Used for reading lawyers.
       ===================================================== */

    const supabase = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    /* =====================================================
       SERVER CLIENT
       
       IMPORTANT:
       Service Role is used ONLY inside this Edge Function.
       
       It is NEVER returned to the frontend.
       ===================================================== */

    const profileClient = createClient(
      supabaseUrl,
      supabaseServiceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    /* =====================================================
       RANGE
       ===================================================== */

    const from =
      (page - 1) * limit;

    const to =
      from + limit - 1;

    /* =====================================================
       GET LAWYERS
       
       We intentionally do NOT use:
       
       profile:profiles(...)
       
       because profiles may be blocked by RLS or relationship
       metadata.
       ===================================================== */

    let query = supabase
      .from("lawyers")
      .select(
        `
        id,
        profile_id,
        license_number,
        specialization,
        bio,
        experience_years,
        office_address,
        is_verified,
        rating,
        created_at,
        updated_at
        `,
        {
          count: "exact",
        },
      )
      .order(
        "created_at",
        {
          ascending: false,
        },
      )
      .range(
        from,
        to,
      );

    /* =====================================================
       VERIFIED FILTER
       ===================================================== */

    if (verifiedOnly) {
      query = query.eq(
        "is_verified",
        true,
      );
    }

    /* =====================================================
       SPECIALIZATION FILTER
       ===================================================== */

    if (specialization) {
      query = query.ilike(
        "specialization",
        `%${specialization}%`,
      );
    }

    /* =====================================================
       SEARCH FILTER
       ===================================================== */

    if (search) {
      const safeSearch =
        search
          .replace(/,/g, "")
          .trim();

      if (safeSearch) {
        const orFilter =
          `specialization.ilike.%${safeSearch}%,bio.ilike.%${safeSearch}%`;

        query = query.or(orFilter);
      }
    }

    /* =====================================================
       EXECUTE LAWYERS QUERY
       ===================================================== */

    const {
      data: lawyerData,
      error: lawyerError,
      count,
    } = await query;

    if (lawyerError) {
      console.error(
        "[lawyers-api] Lawyers query error:",
        lawyerError.message,
      );

      return errorResponse(
        "Failed to fetch lawyers.",
        500,
      );
    }

    const lawyers =
      (lawyerData || []) as LawyerRow[];

    /* =====================================================
       COLLECT PROFILE IDS
       ===================================================== */

    const profileIds =
      Array.from(
        new Set(
          lawyers
            .map(
              (lawyer) =>
                lawyer.profile_id,
            )
            .filter(
              (
                id,
              ): id is string =>
                Boolean(id),
            ),
        ),
      );

    /* =====================================================
       GET REAL PROFILES
       
       lawyers.profile_id
              ↓
       profiles.id
       ===================================================== */

    let profiles: ProfileRow[] = [];

    if (profileIds.length > 0) {
      const {
        data: profileData,
        error: profileError,
      } = await profileClient
        .from("profiles")
        .select(
          `
          id,
          full_name,
          email,
          phone,
          avatar_url
          `,
        )
        .in(
          "id",
          profileIds,
        );

      if (profileError) {
        console.error(
          "[lawyers-api] Profiles query error:",
          profileError.message,
        );

        return errorResponse(
          "Failed to fetch lawyer profiles.",
          500,
        );
      }

      profiles =
        (profileData || []) as ProfileRow[];
    }

    /* =====================================================
       CREATE PROFILE MAP
       ===================================================== */

    const profileMap =
      new Map<
        string,
        ProfileRow
      >();

    for (const profile of profiles) {
      profileMap.set(
        profile.id,
        profile,
      );
    }

    /* =====================================================
       MERGE LAWYERS + PROFILES
       ===================================================== */

    const result: LawyerResponse[] =
      lawyers.map(
        (lawyer) => {
          const profile =
            profileMap.get(
              lawyer.profile_id,
            );

          return {
            id: lawyer.id,

            profile_id:
              lawyer.profile_id,

            license_number:
              lawyer.license_number,

            specialization:
              lawyer.specialization,

            bio:
              lawyer.bio,

            experience_years:
              lawyer.experience_years,

            office_address:
              lawyer.office_address,

            is_verified:
              lawyer.is_verified,

            rating:
              lawyer.rating,

            created_at:
              lawyer.created_at,

            updated_at:
              lawyer.updated_at,

            profile: profile
              ? {
                  full_name:
                    profile.full_name,

                  email:
                    profile.email,

                  phone:
                    profile.phone,

                  avatar_url:
                    profile.avatar_url,
                }
              : null,
          };
        },
      );

    /* =====================================================
       SERVER LOGS
       ===================================================== */

    console.log(
      `[lawyers-api] Lawyers found: ${lawyers.length}`,
    );

    console.log(
      `[lawyers-api] Profile IDs: ${profileIds.length}`,
    );

    console.log(
      `[lawyers-api] Profiles found: ${profiles.length}`,
    );

    console.log(
      `[lawyers-api] Names found: ${
        result.filter(
          (lawyer) =>
            Boolean(
              lawyer.profile?.full_name?.trim(),
            ),
        ).length
      }`,
    );

    /* =====================================================
       PAGINATION RESPONSE
       ===================================================== */

    const total =
      count ?? 0;

    const totalPages =
      Math.ceil(
        total / limit,
      );

    /* =====================================================
       FINAL RESPONSE
       
       JSON:
       /lawyers-api

       XML:
       /lawyers-api?format=xml
       ===================================================== */

    return formatResponse(
      req,
      "lawyers",
      {
        data: result,

        pagination: {
          page,
          limit,
          total,

          total_pages:
            totalPages,

          has_next:
            page < totalPages,

          has_prev:
            page > 1,
        },
      },
    );

  } catch (err) {
    console.error(
      "[lawyers-api] Unexpected error:",
      err instanceof Error
        ? err.message
        : String(err),
    );

    return errorResponse(
      "An unexpected error occurred.",
      500,
    );
  }
});