import Joi from "joi";

// shared fields for both create and update
const baseFields = {
    devTeamCode: Joi.number().integer().positive().required(),
    description: Joi.string().trim().required(),
    room: Joi.string().trim().required(),
    // end_time must be strictly AFTER start_time (enforced on both create and update)
    endTime: Joi.date().greater(Joi.ref('startTime')).required()
}

// on CREATE: start_time must not be in the past
export const newMeetingValidator = Joi.object({
    startTime: Joi.date().min('now').required(),
    ...baseFields
})

// on UPDATE: a past meeting may be edited (do NOT block past start)
export const updateMeetingValidator = Joi.object({
    startTime: Joi.date().required(),
    ...baseFields
})

export const meetingCodeParamsValidator = Joi.object({
    code: Joi.number().integer().positive().required()
})
