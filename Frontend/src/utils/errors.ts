import axios from "axios"

// Pulls a human-readable message out of an unknown error.
// The backend sends a plain-text message body for 422 / 404 responses.
export function extractErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data
        if (typeof data === 'string' && data.trim()) {
            return data
        }
        return error.message
    }
    if (error instanceof Error) {
        return error.message
    }
    return 'Something went wrong'
}
