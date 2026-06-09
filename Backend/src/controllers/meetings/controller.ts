import type { NextFunction, Request, Response } from "express";
import Meeting from "../../models/Meeting";
import DevTeam from "../../models/DevTeam";

interface MeetingBody {
    devTeamCode: number
    startTime: Date
    endTime: Date
    description: string
    room: string
}

// makes sure the referenced dev team exists, otherwise responds with 422
async function assertDevTeamExists(devTeamCode: number, next: NextFunction): Promise<boolean> {
    const team = await DevTeam.findByPk(devTeamCode)
    if (!team) {
        next({
            status: 422,
            message: `dev team with code ${devTeamCode} does not exist`
        })
        return false
    }
    return true
}

export async function getSingleMeeting(request: Request<{ code: string }>, response: Response, next: NextFunction) {
    try {
        const { code } = request.params

        const meeting = await Meeting.findByPk(code, {
            include: [DevTeam]
        })

        if (!meeting) {
            return next({
                status: 404,
                message: `meeting with code ${code} not found`
            })
        }

        response.json(meeting)
    } catch (e) {
        next(e)
    }
}

export async function createMeeting(request: Request<{}, {}, MeetingBody>, response: Response, next: NextFunction) {
    try {
        const { devTeamCode, startTime, endTime, description, room } = request.body

        if (!(await assertDevTeamExists(devTeamCode, next))) {
            return
        }

        const meeting = await Meeting.create({
            devTeamCode,
            startTime,
            endTime,
            description,
            room
        })

        response.status(201).json(meeting)
    } catch (e) {
        next(e)
    }
}

export async function updateMeeting(request: Request<{ code: string }, {}, MeetingBody>, response: Response, next: NextFunction) {
    try {
        const { code } = request.params
        const { devTeamCode, startTime, endTime, description, room } = request.body

        const meeting = await Meeting.findByPk(code)

        if (!meeting) {
            return next({
                status: 404,
                message: `meeting with code ${code} not found`
            })
        }

        if (!(await assertDevTeamExists(devTeamCode, next))) {
            return
        }

        await meeting.update({
            devTeamCode,
            startTime,
            endTime,
            description,
            room
        })

        response.json(meeting)
    } catch (e) {
        next(e)
    }
}

export async function deleteMeeting(request: Request<{ code: string }>, response: Response, next: NextFunction) {
    try {
        const { code } = request.params

        const meeting = await Meeting.findByPk(code)

        if (!meeting) {
            return next({
                status: 404,
                message: `meeting with code ${code} not found`
            })
        }

        await meeting.destroy()

        response.status(204).send()
    } catch (e) {
        next(e)
    }
}
