// Shape of the data the create/update forms collect.
// startTime / endTime are kept as the datetime-local string the input produces.
export default interface MeetingDraft {
    devTeamCode: number
    startTime: string
    endTime: string
    description: string
    room: string
}
