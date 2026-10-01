import "server-only";
import { apiRequest, type HttpMethod } from "./request";
import { getAccessToken } from "@/lib/supabase/server";

export { ApiRequestError } from "./request";

const BASE_URL = process.env.API_URL ?? "http://localhost:8000";

async function call<T>(path: string, method: HttpMethod, body?: unknown): Promise<T> {
  const token = await getAccessToken();
  return apiRequest<T>(BASE_URL, path, method, body, token);
}

export const apiServer = {
  get: <T>(path: string) => call<T>(path, "GET"),
  post: <T>(path: string, body?: unknown) => call<T>(path, "POST", body),
  put: <T>(path: string, body?: unknown) => call<T>(path, "PUT", body),
  patch: <T>(path: string, body?: unknown) => call<T>(path, "PATCH", body),
  delete: <T>(path: string) => call<T>(path, "DELETE"),
};
