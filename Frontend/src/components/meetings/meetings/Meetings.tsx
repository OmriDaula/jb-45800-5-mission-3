import { useEffect, useState, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import type DevTeam from '../../../models/DevTeam'
import type Meeting from '../../../models/Meeting'
import teamsService from '../../../services/TeamsService'
import meetingsService from '../../../services/MeetingsService'
import { displayDateTime, formatDuration, isPast } from '../../../utils/dates'
import { extractErrorMessage } from '../../../utils/errors'
import './Meetings.css'

export default function Meetings() {

    const [teams, setTeams] = useState<DevTeam[]>([])
    const [selectedTeam, setSelectedTeam] = useState<number | ''>('')
    const [meetings, setMeetings] = useState<Meeting[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string>('')

    const navigate = useNavigate()

    useEffect(() => {
        (async () => {
            try {
                setTeams(await teamsService.getAllTeams())
            } catch (e) {
                setError(extractErrorMessage(e))
            }
        })()
    }, [])

    async function loadMeetings(teamCode: number) {
        try {
            setLoading(true)
            setError('')
            setMeetings(await teamsService.getTeamMeetings(teamCode))
        } catch (e) {
            setError(extractErrorMessage(e))
        } finally {
            setLoading(false)
        }
    }

    function teamChanged(event: ChangeEvent<HTMLSelectElement>) {
        const value = event.currentTarget.value
        if (!value) {
            setSelectedTeam('')
            setMeetings([])
            return
        }
        const teamCode = Number(value)
        setSelectedTeam(teamCode)
        loadMeetings(teamCode)
    }

    async function deleteMeeting(code: number) {
        if (!confirm('Are you sure you want to delete this meeting?')) {
            return
        }
        try {
            await meetingsService.deleteMeeting(code)
            setMeetings(current => current.filter(meeting => meeting.code !== code))
        } catch (e) {
            alert(extractErrorMessage(e))
        }
    }

    return (
        <div className='Meetings'>
            <div className='Meetings-head'>
                <h1>Team Meetings</h1>
                <button className='btn btn-primary' onClick={() => navigate('/meetings/new')}>
                    + New Meeting
                </button>
            </div>

            <div className='Meetings-filter'>
                <label htmlFor='team-select'>Development team</label>
                <select id='team-select' value={selectedTeam} onChange={teamChanged}>
                    <option value=''>-- Select a team --</option>
                    {teams.map(team => (
                        <option key={team.code} value={team.code}>{team.name}</option>
                    ))}
                </select>
            </div>

            <div className='Meetings-legend'>
                <span className='dot dot-future'></span> Future meeting
                <span className='dot dot-past'></span> Past meeting
            </div>

            {error && <p className='Meetings-error'>{error}</p>}

            {loading && <p className='Meetings-info'>Loading meetings...</p>}

            {!loading && selectedTeam !== '' && meetings.length === 0 && !error && (
                <p className='Meetings-info'>This team has no meetings yet.</p>
            )}

            {!loading && selectedTeam === '' && (
                <p className='Meetings-info'>Choose a team above to see its meetings.</p>
            )}

            <div className='Meetings-grid'>
                {meetings.map(meeting => {
                    const past = isPast(meeting.startTime)
                    return (
                        <div key={meeting.code} className={`MeetingCard ${past ? 'is-past' : 'is-future'}`}>
                            <div className='MeetingCard-top'>
                                <span className='MeetingCard-room'>{meeting.room}</span>
                                <span className='MeetingCard-badge'>{past ? 'Past' : 'Upcoming'}</span>
                            </div>

                            <p className='MeetingCard-desc'>{meeting.description}</p>

                            <div className='MeetingCard-times'>
                                <div>
                                    <span className='label'>Start</span>
                                    <span>{displayDateTime(meeting.startTime)}</span>
                                </div>
                                <div>
                                    <span className='label'>End</span>
                                    <span>{displayDateTime(meeting.endTime)}</span>
                                </div>
                                <div>
                                    <span className='label'>Duration</span>
                                    <span className='MeetingCard-duration'>
                                        {formatDuration(meeting.startTime, meeting.endTime)}
                                    </span>
                                </div>
                            </div>

                            <div className='MeetingCard-actions'>
                                <button
                                    className='btn-sm btn-edit'
                                    onClick={() => navigate(`/meetings/${meeting.code}/edit`)}
                                >
                                    Edit
                                </button>
                                <button
                                    className='btn-sm btn-delete'
                                    onClick={() => deleteMeeting(meeting.code)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
