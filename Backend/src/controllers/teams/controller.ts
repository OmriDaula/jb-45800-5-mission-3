import type { NextFunction, Request, Response } from "express";
import DevTeam from "../../models/DevTeam";
import Meeting from "../../models/Meeting";

export async function getAllTeams(request: Request, response: Response, next: NextFunction) {
    try {
        const teams = await DevTeam.findAll({
            order: [['name', 'ASC']]
        })
        response.json(teams)
    } catch (e) {
        next(e)
    }
}

export async function getTeamMeetings(request: Request<{ code: string }>, response: Response, next: NextFunction) {
    try {
        const { code } = request.params

        const meetings = await Meeting.findAll({
            where: { devTeamCode: code },
            order: [['startTime', 'ASC']]
        })

        response.json(meetings)
    } catch (e) {
        next(e)
    }
}
