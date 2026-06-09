import axios from "axios"
import type DevTeam from "../models/DevTeam"
import type Meeting from "../models/Meeting"

class TeamsService {

    async getAllTeams(): Promise<DevTeam[]> {
        const { data } = await axios.get<DevTeam[]>(`${import.meta.env.VITE_REST_SERVER_URL}/teams`)
        return data
    }

    async getTeamMeetings(teamCode: number): Promise<Meeting[]> {
        const { data } = await axios.get<Meeting[]>(`${import.meta.env.VITE_REST_SERVER_URL}/teams/${teamCode}/meetings`)
        return data
    }

}

const teamsService = new TeamsService()
export default teamsService
