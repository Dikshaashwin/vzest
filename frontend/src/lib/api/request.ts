import { toCamelCase, toSnakeCase } from "./case";

export class ApiRequestError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export async function apiRequest<T>(
  baseUrl: string,
  path: string,
  method: HttpMethod,
  body: unknown | undefined,
  token: string | null,
): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(toSnakeCase(body)) : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    let detail: unknown = res.statusText;
    try {
      const data = await res.json();
      detail = data?.detail ?? detail;
    } catch {
      // response body wasn't JSON — fall back to statusText
    }
    throw new ApiRequestError(res.status, typeof detail === "string" ? detail : JSON.stringify(detail));
  }

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  if (!text) return undefined as T;
  return toCamelCase(JSON.parse(text)) as T;
}
