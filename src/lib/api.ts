import { supabase } from '@/lib/supabase';

const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  } else {
    headers['apikey'] = import.meta.env.VITE_SUPABASE_ANON_KEY;
  }
  return headers;
}

async function getPublicHeaders(): Promise<Record<string, string>> {
  return {
    'Content-Type': 'application/json',
    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
  };
}

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

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `Server error (${response.status})`;
    try {
      const errorBody = await response.json();
      if (errorBody?.error) message = errorBody.error;
    } catch { /* ignore parse error */ }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

// ─── laws-api ──────────────────────────────────────────────

export async function fetchLaws(params: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}): Promise<PaginatedResponse<import('@/types').Law>> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.search) query.set('search', params.search);
  if (params.category && params.category !== 'all') query.set('category', params.category);

  const headers = await getPublicHeaders();
  const response = await fetch(`${FUNCTIONS_URL}/laws-api?${query}`, { headers });
  return handleResponse<PaginatedResponse<import('@/types').Law>>(response);
}

// ─── lawyers-api ────────────────────────────────────────────

export async function fetchLawyers(params: {
  page?: number;
  limit?: number;
  search?: string;
  specialization?: string;
  verified?: boolean;
}): Promise<PaginatedResponse<import('@/types').Lawyer>> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.search) query.set('search', params.search);
  if (params.specialization) query.set('specialization', params.specialization);
  if (params.verified) query.set('verified', 'true');

  const headers = await getPublicHeaders();
  const response = await fetch(`${FUNCTIONS_URL}/lawyers-api?${query}`, { headers });
  return handleResponse<PaginatedResponse<import('@/types').Lawyer>>(response);
}

// ─── consultations-api ─────────────────────────────────────

export async function fetchConsultations(params: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<PaginatedResponse<import('@/types').Consultation>> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.status) query.set('status', params.status);

  const headers = await getAuthHeaders();
  const response = await fetch(`${FUNCTIONS_URL}/consultations-api?${query}`, {
    method: 'GET',
    headers,
  });
  return handleResponse<PaginatedResponse<import('@/types').Consultation>>(response);
}

export async function createConsultation(body: {
  subject: string;
  question: string;
  lawyer_id?: string;
}): Promise<{ data: import('@/types').Consultation }> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${FUNCTIONS_URL}/consultations-api`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  return handleResponse<{ data: import('@/types').Consultation }>(response);
}

// ─── auth-api ──────────────────────────────────────────────

export async function fetchAuthUser(): Promise<{
  user: import('@/types').Profile;
}> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${FUNCTIONS_URL}/auth-api`, { headers });
  return handleResponse<{ user: import('@/types').Profile }>(response);
}
