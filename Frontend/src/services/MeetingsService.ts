import axios from "axios"
import type Meeting from "../models/Meeting"
import type MeetingDraft from "../models/MeetingDraft"

class MeetingsService {

    async getSingleMeeting(code: number): Promise<Meeting> {
        const { data } = await axios.get<Meeting>(`${import.meta.env.VITE_REST_SERVER_URL}/meetings/${code}`)
        return data
    }

    async createMeeting(draft: MeetingDraft): Promise<Meeting> {
        const { data } = await axios.post<Meeting>(`${import.meta.env.VITE_REST_SERVER_URL}/meetings`, draft)
        return data
    }

    async updateMeeting(code: number, draft: MeetingDraft): Promise<Meeting> {
        const { data } = await axios.put<Meeting>(`${import.meta.env.VITE_REST_SERVER_URL}/meetings/${code}`, draft)
        return data
    }

    async deleteMeeting(code: number): Promise<void> {
        await axios.delete(`${import.meta.env.VITE_REST_SERVER_URL}/meetings/${code}`)
    }

}

const meetingsService = new MeetingsService()
export default meetingsService
