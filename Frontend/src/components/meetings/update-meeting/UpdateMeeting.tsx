import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type MeetingDraft from '../../../models/MeetingDraft'
import meetingsService from '../../../services/MeetingsService'
import MeetingForm from '../meeting-form/MeetingForm'
import { toDateTimeLocal } from '../../../utils/dates'
import { extractErrorMessage } from '../../../utils/errors'

export default function UpdateMeeting() {

    const { code } = useParams<'code'>()
    const navigate = useNavigate()

    const [initialDraft, setInitialDraft] = useState<MeetingDraft>()
    const [loadError, setLoadError] = useState<string>('')

    useEffect(() => {
        (async () => {
            try {
                const meeting = await meetingsService.getSingleMeeting(Number(code))
                setInitialDraft({
                    devTeamCode: meeting.devTeamCode,
                    startTime: toDateTimeLocal(meeting.startTime),
                    endTime: toDateTimeLocal(meeting.endTime),
                    description: meeting.description,
                    room: meeting.room
                })
            } catch (e) {
                setLoadError(extractErrorMessage(e))
            }
        })()
    }, [code])

    async function updateMeeting(draft: MeetingDraft) {
        await meetingsService.updateMeeting(Number(code), draft)
        navigate('/meetings')
    }

    if (loadError) {
        return <p style={{ color: 'var(--danger)' }}>{loadError}</p>
    }

    if (!initialDraft) {
        return <p>Loading meeting...</p>
    }

    return (
        <MeetingForm
            title='Update Meeting'
            submitLabel='Save Changes'
            allowPastStart={true}
            initialDraft={initialDraft}
            onSubmit={updateMeeting}
        />
    )
}
