import Joi from 'joi';

export const verifyRequestBody = Joi.object({
  code: Joi.string().length(8).required(),
});
