import { Router } from "express";
import { createMeeting, deleteMeeting, getSingleMeeting, updateMeeting } from "../controllers/meetings/controller";
import bodyValidation from "../middlewares/body-validation";
import paramsValidation from "../middlewares/params-validation";
import { meetingCodeParamsValidator, newMeetingValidator, updateMeetingValidator } from "../controllers/meetings/validator";

const meetingsRouter = Router()

meetingsRouter.get('/:code', paramsValidation(meetingCodeParamsValidator), getSingleMeeting)
meetingsRouter.post('/', bodyValidation(newMeetingValidator), createMeeting)
meetingsRouter.put('/:code', paramsValidation(meetingCodeParamsValidator), bodyValidation(updateMeetingValidator), updateMeeting)
meetingsRouter.delete('/:code', paramsValidation(meetingCodeParamsValidator), deleteMeeting)

export default meetingsRouter
