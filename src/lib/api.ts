import { supabase } from '@/lib/supabase';

const FUNCTIONS_URL =
  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

// ─── Authentication Headers ─────────────────────────────────

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    headers['Authorization'] =
      `Bearer ${session.access_token}`;
  } else {
    headers['apikey'] =
      import.meta.env.VITE_SUPABASE_ANON_KEY;
  }

  return headers;
}

// ─── Public Headers ──────────────────────────────────────────

async function getPublicHeaders(): Promise<Record<string, string>> {
  return {
    'Content-Type': 'application/json',
    'apikey':
      import.meta.env.VITE_SUPABASE_ANON_KEY,
    'Authorization':
      `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
  };
}

// ─── Response Types ──────────────────────────────────────────

interface PaginatedResponse<T> {
  data: T[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

// ─── Response Handler ────────────────────────────────────────

async function handleResponse<T>(
  response: Response
): Promise<T> {

  if (!response.ok) {

    let message =
      `Server error (${response.status})`;

    try {

      const errorBody =
        await response.json();

      if (errorBody?.error) {
        message =
          errorBody.error;
      }

      if (errorBody?.message) {
        message =
          errorBody.message;
      }

    } catch {
      // Ignore JSON parse errors
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

// ─── laws-api ────────────────────────────────────────────────

export async function fetchLaws(params: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}): Promise<
  PaginatedResponse<import('@/types').Law>
> {

  const query =
    new URLSearchParams();

  if (params.page) {
    query.set(
      'page',
      String(params.page)
    );
  }

  if (params.limit) {
    query.set(
      'limit',
      String(params.limit)
    );
  }

  if (params.search) {
    query.set(
      'search',
      params.search
    );
  }

  if (
    params.category &&
    params.category !== 'all'
  ) {
    query.set(
      'category',
      params.category
    );
  }

  const headers =
    await getPublicHeaders();

  const response =
    await fetch(
      `${FUNCTIONS_URL}/laws-api?${query}`,
      {
        method: 'GET',
        headers,
      }
    );

  return handleResponse<
    PaginatedResponse<
      import('@/types').Law
    >
  >(response);
}

// ─── lawyers-api ─────────────────────────────────────────────

export async function fetchLawyers(params: {
  page?: number;
  limit?: number;
  search?: string;
  specialization?: string;
  verified?: boolean;
}): Promise<
  PaginatedResponse<import('@/types').Lawyer>
> {

  const query =
    new URLSearchParams();

  if (params.page) {
    query.set(
      'page',
      String(params.page)
    );
  }

  if (params.limit) {
    query.set(
      'limit',
      String(params.limit)
    );
  }

  if (params.search) {
    query.set(
      'search',
      params.search
    );
  }

  if (params.specialization) {
    query.set(
      'specialization',
      params.specialization
    );
  }

  if (params.verified) {
    query.set(
      'verified',
      'true'
    );
  }

  const headers =
    await getPublicHeaders();

  const response =
    await fetch(
      `${FUNCTIONS_URL}/lawyers-api?${query}`,
      {
        method: 'GET',
        headers,
      }
    );

  return handleResponse<
    PaginatedResponse<
      import('@/types').Lawyer
    >
  >(response);
}

// ─── consultations-api ───────────────────────────────────────

export async function fetchConsultations(params: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<
  PaginatedResponse<
    import('@/types').Consultation
  >
> {

  const query =
    new URLSearchParams();

  if (params.page) {
    query.set(
      'page',
      String(params.page)
    );
  }

  if (params.limit) {
    query.set(
      'limit',
      String(params.limit)
    );
  }

  if (params.status) {
    query.set(
      'status',
      params.status
    );
  }

  const headers =
    await getAuthHeaders();

  const response =
    await fetch(
      `${FUNCTIONS_URL}/consultations-api?${query}`,
      {
        method: 'GET',
        headers,
      }
    );

  return handleResponse<
    PaginatedResponse<
      import('@/types').Consultation
    >
  >(response);
}

// ─── Create Consultation ─────────────────────────────────────

export async function createConsultation(body: {
  subject: string;
  question: string;
  lawyer_id?: string;
}): Promise<{
  data: import('@/types').Consultation;
}> {

  const headers =
    await getAuthHeaders();

  const response =
    await fetch(
      `${FUNCTIONS_URL}/consultations-api`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      }
    );

  return handleResponse<{
    data: import('@/types').Consultation;
  }>(response);
}

// ─── auth-api ────────────────────────────────────────────────

export async function fetchAuthUser(): Promise<{
  user: import('@/types').Profile;
}> {

  const headers =
    await getAuthHeaders();

  const response =
    await fetch(
      `${FUNCTIONS_URL}/auth-api`,
      {
        method: 'GET',
        headers,
      }
    );

  return handleResponse<{
    user: import('@/types').Profile;
  }>(response);
}

// ─── SANAD AI Agent ──────────────────────────────────────────

const AI_AGENT_URL =
  import.meta.env.VITE_AI_AGENT_URL ||
  'http://127.0.0.1:5002';


// ─── Agent Response ─────────────────────────────────────────

export interface AgentResponse {

  success?: boolean;

  answer?: string;

  response?: string;

  message?: string;

  session_id?: string;

  user_id?: string;

  sources?: unknown[];

  analysis?: unknown;

  intent?: string;

  domain?: string;

  activity_log?: string[];

  mode?: string;

  fallback?: boolean;

  reason?: string;

  [key: string]: unknown;
}


// ─── Send Message To Agent ──────────────────────────────────

export async function sendAgentMessage(
  message: string,
  sessionId: string = 'default'
): Promise<AgentResponse> {

  const cleanMessage =
    message.trim();

  if (!cleanMessage) {

    throw new Error(
      'اكتب رسالتك أولًا.'
    );
  }

  // الحصول على جلسة المستخدم الحالية
  const {
    data: { session },
    error: sessionError,
  } =
    await supabase.auth.getSession();

  if (sessionError) {

    throw new Error(
      'تعذر الحصول على جلسة تسجيل الدخول.'
    );
  }

  // المستخدم يجب أن يكون مسجل الدخول
  if (!session?.access_token) {

    throw new Error(
      'يجب تسجيل الدخول إلى SANAD أولًا لاستخدام المساعد.'
    );
  }

  // إرسال JWT إلى الـAgent
  const headers: Record<string, string> = {

    'Content-Type':
      'application/json',

    'Authorization':
      `Bearer ${session.access_token}`,
  };

  const response =
    await fetch(
      `${AI_AGENT_URL}/api/chat`,
      {
        method: 'POST',

        headers,

        body: JSON.stringify({
          message: cleanMessage,
          session_id: sessionId,
        }),
      }
    );

  return handleResponse<AgentResponse>(
    response
  );
}