import { useNavigate } from 'react-router-dom'
import type MeetingDraft from '../../../models/MeetingDraft'
import meetingsService from '../../../services/MeetingsService'
import MeetingForm from '../meeting-form/MeetingForm'

export default function NewMeeting() {

    const navigate = useNavigate()

    async function createMeeting(draft: MeetingDraft) {
        await meetingsService.createMeeting(draft)
        navigate('/meetings')
    }

    return (
        <MeetingForm
            title='Schedule a New Meeting'
            submitLabel='Create Meeting'
            allowPastStart={false}
            onSubmit={createMeeting}
        />
    )
}
