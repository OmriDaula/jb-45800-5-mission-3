import Joi from "joi";

export const teamCodeParamsValidator = Joi.object({
    code: Joi.number().integer().positive().required()
})
