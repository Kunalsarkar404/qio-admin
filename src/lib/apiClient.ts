export const API_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:4000/api/v1'

const TOKEN_STORAGE_KEY = 'qio_admin_token'

export class ApiRequestError extends Error {
    status: number
    constructor(message: string, status: number) {
        super(message)
        this.status = status
    }
}

type QueryValue = string | number | boolean | null | undefined

type RequestOptions = {
    method?: string
    json?: unknown
    formData?: FormData
    query?: Record<string, QueryValue>
}

// ---- Centralized auth state -------------------------------------------------
// The token lives here (mirrored to localStorage) so every request attaches it,
// and AuthContext registers a callback so any 401 signs the admin out.

function readStoredToken() {
    try {
        return localStorage.getItem(TOKEN_STORAGE_KEY) || ''
    } catch {
        return ''
    }
}

let authToken = readStoredToken()
let unauthorizedHandler: (() => void) | null = null

export function getAuthToken() {
    return authToken
}

export function setAuthToken(token: string) {
    authToken = token
    try {
        if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token)
        else localStorage.removeItem(TOKEN_STORAGE_KEY)
    } catch {
        // storage unavailable (private mode) — keep the in-memory token
    }
}

/** Registers the callback fired when an authenticated request returns 401. Returns an unregister function. */
export function setUnauthorizedHandler(handler: (() => void) | null) {
    unauthorizedHandler = handler
    return () => {
        if (unauthorizedHandler === handler) unauthorizedHandler = null
    }
}

// ---- Helpers ------------------------------------------------------------------

export function buildQuery(query?: Record<string, QueryValue>) {
    if (!query) return ''
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null || value === '') continue
        params.append(key, String(value))
    }
    const text = params.toString()
    return text ? `?${text}` : ''
}

function logRequest(method: string, path: string, status: number | string) {
    // Method + path (without query string) + status only — never headers or payloads.
    if (import.meta.env.DEV) console.debug('[QIO admin]', method, path, status)
}

async function send(path: string, method: string, body: BodyInit | undefined, headers: Record<string, string>) {
    const token = authToken
    if (token) headers.Authorization = `Bearer ${token}`

    let response: Response
    try {
        response = await fetch(`${API_URL}${path}`, { method, headers, body })
    } catch {
        logRequest(method, path.split('?')[0], 'network-error')
        throw new ApiRequestError(`Cannot reach the backend at ${API_URL}`, 0)
    }
    logRequest(method, path.split('?')[0], response.status)

    if (response.status === 401 && token) unauthorizedHandler?.()
    return response
}

async function errorFromResponse(response: Response) {
    const payload = await response.json().catch(() => null)
    const message = payload && typeof payload.message === 'string' && payload.message ? payload.message : `Request failed (${response.status})`
    return new ApiRequestError(message, response.status)
}

/** Shared fetch wrapper — attaches the admin JWT, unwraps the `{ data }` envelope and normalizes errors. */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', json, formData, query } = options
    const headers: Record<string, string> = {}
    if (json !== undefined) headers['Content-Type'] = 'application/json'

    const response = await send(`${path}${buildQuery(query)}`, method, formData ?? (json !== undefined ? JSON.stringify(json) : undefined), headers)
    if (!response.ok) throw await errorFromResponse(response)

    const payload = await response.json().catch(() => ({}))
    return payload.data as T
}

/** Downloads a CSV export (authenticated GET → blob → browser download). */
export async function downloadCsv(path: string, query: Record<string, QueryValue> | undefined, fallbackName: string) {
    const response = await send(`${path}${buildQuery(query)}`, 'GET', undefined, {})
    if (!response.ok) throw await errorFromResponse(response)

    const disposition = response.headers.get('Content-Disposition') || ''
    const match = /filename="?([^";]+)"?/i.exec(disposition)
    const filename = match?.[1] || `${fallbackName}-${new Date().toISOString().slice(0, 10)}.csv`

    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 0)
}

export function errorMessage(error: unknown, fallback = 'Something went wrong') {
    return error instanceof Error && error.message ? error.message : fallback
}
