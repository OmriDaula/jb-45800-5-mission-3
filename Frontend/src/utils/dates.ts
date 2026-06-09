// Datetimes from the API are wall-clock values (e.g. "2026-05-04 10:00:00", and we
// also tolerate ISO like "2026-05-04T10:00:00.000Z"). We treat them as wall-clock and
// NEVER convert through the browser's timezone, so a meeting entered at 14:00 always
// shows as 14:00 in the list and in the update form.

interface WallClock {
    year: number
    month: number
    day: number
    hour: number
    minute: number
}

function parseWallClock(dateTime: string): WallClock {
    const match = dateTime.match(/(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/)
    if (!match) {
        return { year: 0, month: 1, day: 1, hour: 0, minute: 0 }
    }
    const [, year, month, day, hour, minute] = match
    return { year: +year, month: +month, day: +day, hour: +hour, minute: +minute }
}

// Epoch millis treating the wall-clock as UTC — used only for arithmetic/comparison,
// so the result is independent of the browser's timezone.
function wallClockToUtcMillis(dateTime: string): number {
    const { year, month, day, hour, minute } = parseWallClock(dateTime)
    return Date.UTC(year, month - 1, day, hour, minute)
}

// True if the meeting's start is before "now".
export function isPast(dateTime: string): boolean {
    return wallClockToUtcMillis(dateTime) < Date.now()
}

// Human-readable duration between two datetimes, e.g. "1h 30m".
export function formatDuration(startTime: string, endTime: string): string {
    const ms = wallClockToUtcMillis(endTime) - wallClockToUtcMillis(startTime)
    if (ms <= 0) {
        return '0m'
    }

    const totalMinutes = Math.round(ms / 60000)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    const parts: string[] = []
    if (hours > 0) {
        parts.push(`${hours}h`)
    }
    if (minutes > 0) {
        parts.push(`${minutes}m`)
    }
    return parts.join(' ')
}

// Nicely formatted date + time for display, e.g. "May 4, 2026, 10:00 AM".
// Formatted in UTC so the wall-clock digits are preserved exactly.
export function displayDateTime(dateTime: string): string {
    const { year, month, day, hour, minute } = parseWallClock(dateTime)
    return new Date(Date.UTC(year, month - 1, day, hour, minute)).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC'
    })
}

// Converts a stored datetime into the value a datetime-local input expects:
// "YYYY-MM-DDTHH:mm", using the wall-clock digits directly (no timezone shift).
export function toDateTimeLocal(dateTime: string): string {
    const { year, month, day, hour, minute } = parseWallClock(dateTime)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}`
}

// Converts a datetime-local input value into what we send to the server.
// We stamp the typed wall-clock as UTC ("...Z") so the server stores the exact
// digits the user typed, regardless of the server's own timezone.
// "2026-05-04T14:00" -> "2026-05-04T14:00:00Z"
export function fromDateTimeLocal(localValue: string): string {
    const withSeconds = localValue.length === 16 ? `${localValue}:00` : localValue
    return `${withSeconds}Z`
}

const pad2 = (n: number) => String(n).padStart(2, '0')

// Formats a JS Date as the "YYYY-MM-DDTHH:mm" value a datetime-local input expects,
// using the browser's local wall-clock (which is what the picker shows/compares against).
function dateToDateTimeLocal(date: Date): string {
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}T${pad2(date.getHours())}:${pad2(date.getMinutes())}`
}

// The current local time as a datetime-local value — used as the `min` bound so the
// native picker won't let the user choose a start in the past when creating.
export function nowDateTimeLocal(): string {
    return dateToDateTimeLocal(new Date())
}

// Adds whole hours to a datetime-local value, returning the same format.
// Used to default the end time to one hour after the chosen start.
export function addHoursToDateTimeLocal(localValue: string, hours: number): string {
    const date = new Date(localValue)
    if (Number.isNaN(date.getTime())) {
        return localValue
    }
    date.setHours(date.getHours() + hours)
    return dateToDateTimeLocal(date)
}
