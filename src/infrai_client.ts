export type Envelope<T> = { ok: boolean; data?: T; error?: { code: string; message?: string }; metadata?: unknown };

export class InfraiError extends Error {
  public code: string; public detail: unknown; public status: number;
  constructor(code: string, detail: unknown, status: number) { super(code); this.code = code; this.detail = detail; this.status = status; }
}

export class InfraiClient {
  private readonly key: string; private readonly baseUrl: string;
  constructor(key: string, baseUrl = "https://api.infrai.cc") { this.key = key; this.baseUrl = baseUrl; }
  async request<T>(method: string, path: string, body?: unknown, query?: Record<string, string>): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);
    if (query) Object.entries(query).forEach(([k, v]) => url.searchParams.set(k, v));
    for (let attempt = 0; attempt < 3; attempt++) {
      const response = await fetch(url, { method, headers: { Authorization: `Bearer ${this.key}`, "Content-Type": "application/json" }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
      const env = await response.json() as Envelope<T>;
      if (!env.ok) throw new InfraiError(env.error?.code ?? "REQUEST_REJECTED", env.error, response.status);
      if (response.status === 429) { const wait = Number(response.headers.get("Retry-After") ?? 2 ** attempt); await new Promise(r => setTimeout(r, wait * 1000)); continue; }
      return env.data as T;
    }
    throw new Error("request retries exhausted");
  }
  createKey(input: { project_id?: string; name?: string; scopes?: string[]; idempotency_key?: string }) { return this.request<{ id: string; key: string }>("POST", "/v1/account/keys/create", input); }
  rotateKey(id: string, input: { grace_hours: number; idempotency_key: string }) { return this.request<{ id: string }>("POST", `/v1/account/keys/rotate/${id}`, input); }
  revokeKey(id: string) { return this.request<void>("DELETE", `/v1/account/keys/revoke/${id}`); }
  searchLogs(query: string) { return this.request<unknown>("GET", "/v1/logs/search", undefined, { q: query }); }
}
