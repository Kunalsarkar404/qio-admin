export const API_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:4000/api/v1'

export class ApiRequestError extends Error {
    status: number
    constructor(message: string, status: number) {
        super(message)
        this.status = status
    }
}

type RequestOptions = {
    method?: string
    token?: string
    json?: unknown
    formData?: FormData
}

/** Shared fetch wrapper — logs every admin API call and normalizes error messages. */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', token, json, formData } = options
    const headers: Record<string, string> = {}
    if (token) headers.Authorization = `Bearer ${token}`
    if (json !== undefined) headers['Content-Type'] = 'application/json'

    const url = `${API_URL}${path}`
    console.info('[QIO admin] Request:', method, url)

    let response: Response
    try {
        response = await fetch(url, {
            method,
            headers,
            body: formData ?? (json !== undefined ? JSON.stringify(json) : undefined),
        })
    } catch (error) {
        console.error('[QIO admin] Network error:', error)
        throw new ApiRequestError(`Cannot reach backend at ${API_URL}`, 0)
    }

    const payload = await response.json().catch(() => ({}))
    console.info('[QIO admin] Response:', method, url, response.status, payload)

    if (!response.ok) {
        throw new ApiRequestError(payload.message || `Request failed (${response.status})`, response.status)
    }
    return payload.data as T
}
