import { ApiError } from "../errors/ApiError"

const BASE_URL = import.meta.env.VITE_API_URL

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE"

async function request<T>(method: HttpMethod, path: string, body?: unknown): Promise<T> {
    const token = localStorage.getItem('reflexer_token')

    const response = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
    })

    if (! response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new ApiError(
            data.code    ?? "UNKNOWN_ERROR",
            data.message ?? `HTTP ${response.status}`,
            response.status
        )
    }
    
    if (response.status === 204) return undefined as T

    return response.json() as Promise<T>
}

export const api = {
    get:    <T>(path: string)                  => request<T>("GET",    path),
    post:   <T>(path: string, body: unknown)   => request<T>("POST",   path, body),
    patch:  <T>(path: string, body: unknown)   => request<T>("PATCH",  path, body),
    delete: <T>(path: string)                  => request<T>("DELETE", path),
}
