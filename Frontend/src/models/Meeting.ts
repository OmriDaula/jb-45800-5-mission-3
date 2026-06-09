import type DevTeam from "./DevTeam"

export default interface Meeting {
    code: number
    devTeamCode: number
    startTime: string
    endTime: string
    description: string
    room: string
    devTeam?: DevTeam
}
