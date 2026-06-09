import { Router } from "express";
import { getAllTeams, getTeamMeetings } from "../controllers/teams/controller";
import paramsValidation from "../middlewares/params-validation";
import { teamCodeParamsValidator } from "../controllers/teams/validator";

const teamsRouter = Router()

teamsRouter.get('/', getAllTeams)
teamsRouter.get('/:code/meetings', paramsValidation(teamCodeParamsValidator), getTeamMeetings)

export default teamsRouter
