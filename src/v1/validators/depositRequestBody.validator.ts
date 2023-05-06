import Joi from 'joi';

export const depositRequestBody = Joi.object({
  amount: Joi.number().greater(0).required(),
});
