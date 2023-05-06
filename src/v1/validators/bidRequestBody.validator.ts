import Joi from 'joi';

export const bidRequestBody = Joi.object({
  bid: Joi.number().greater(0).required(),
});
