import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import type DevTeam from '../../../models/DevTeam'
import type MeetingDraft from '../../../models/MeetingDraft'
import teamsService from '../../../services/TeamsService'
import { extractErrorMessage } from '../../../utils/errors'
import { addHoursToDateTimeLocal, fromDateTimeLocal, nowDateTimeLocal } from '../../../utils/dates'
import './MeetingForm.css'

interface MeetingFormProps {
    title: string
    submitLabel: string
    // when false (create), a start time in the past is rejected;
    // when true (update), past meetings may be edited
    allowPastStart: boolean
    initialDraft?: MeetingDraft
    onSubmit: (draft: MeetingDraft) => Promise<void>
}

export default function MeetingForm({ title, submitLabel, allowPastStart, initialDraft, onSubmit }: MeetingFormProps) {

    const [teams, setTeams] = useState<DevTeam[]>([])
    const [serverError, setServerError] = useState<string>('')

    const { handleSubmit, register, formState, getValues, setValue, reset, watch, trigger } = useForm<MeetingDraft>()

    // the start value the end-time rule is validated against (cross-field)
    const watchedStart = watch('startTime')

    // lower bound for the native pickers: on create the start cannot be in the past,
    // so the picker itself is floored to "now" (computed once when the form mounts)
    const minStart = useMemo(() => (allowPastStart ? undefined : nowDateTimeLocal()), [allowPastStart])

    useEffect(() => {
        (async () => {
            try {
                setTeams(await teamsService.getAllTeams())
            } catch (e) {
                setServerError(extractErrorMessage(e))
            }
        })()
    }, [])

    useEffect(() => {
        if (initialDraft) {
            reset(initialDraft)
        }
    }, [initialDraft, reset])

    // when the start time changes: if no end time is set yet, default it to one hour
    // later (a sensible meeting length); otherwise re-check the cross-field end-time
    // rule so its error message stays in sync with the watched start value
    useEffect(() => {
        if (!watchedStart) {
            return
        }
        if (getValues('endTime')) {
            trigger('endTime')
        } else {
            setValue('endTime', addHoursToDateTimeLocal(watchedStart, 1), { shouldValidate: false })
        }
    }, [watchedStart, trigger, getValues, setValue])

    async function submit(draft: MeetingDraft) {
        try {
            setServerError('')
            // send the typed wall-clock stamped as UTC so the server stores it verbatim
            await onSubmit({
                ...draft,
                startTime: fromDateTimeLocal(draft.startTime),
                endTime: fromDateTimeLocal(draft.endTime)
            })
        } catch (e) {
            setServerError(extractErrorMessage(e))
        }
    }

    return (
        <div className='MeetingForm'>
            <h1>{title}</h1>

            <form onSubmit={handleSubmit(submit)} noValidate>

                <label>Development team</label>
                <select {...register('devTeamCode', {
                    valueAsNumber: true,
                    validate: value => (!!value && !Number.isNaN(value)) || 'please choose a development team'
                })}>
                    <option value=''>-- Select a team --</option>
                    {teams.map(team => (
                        <option key={team.code} value={team.code}>{team.name}</option>
                    ))}
                </select>
                <div className='error'>{formState.errors.devTeamCode?.message}</div>

                <label>Start time</label>
                <input type='datetime-local' min={minStart} {...register('startTime', {
                    required: { value: true, message: 'start time is required' },
                    validate: value => {
                        if (allowPastStart) {
                            return true
                        }
                        return new Date(value).getTime() >= Date.now() || 'start time cannot be in the past'
                    }
                })} />
                <div className='error'>{formState.errors.startTime?.message}</div>

                <label>End time</label>
                <input type='datetime-local' min={watchedStart || minStart} {...register('endTime', {
                    required: { value: true, message: 'end time is required' },
                    validate: value => {
                        if (!watchedStart) {
                            return true
                        }
                        return new Date(value).getTime() > new Date(watchedStart).getTime() || 'end time must be after start time'
                    }
                })} />
                <div className='error'>{formState.errors.endTime?.message}</div>

                <label>Description</label>
                <textarea rows={4} placeholder='What is this meeting about?' {...register('description', {
                    required: { value: true, message: 'description is required' }
                })} />
                <div className='error'>{formState.errors.description?.message}</div>

                <label>Room</label>
                <input placeholder='e.g. Blue Room' {...register('room', {
                    required: { value: true, message: 'room is required' }
                })} />
                <div className='error'>{formState.errors.room?.message}</div>

                {serverError && <div className='error server-error'>{serverError}</div>}

                <button className='btn btn-primary' disabled={formState.isSubmitting}>
                    {formState.isSubmitting ? 'Saving...' : submitLabel}
                </button>
            </form>
        </div>
    )
}
