import Joi from 'joi';

export const itemRequestBody = Joi.object({
  name: Joi.string().required(),
  startingPrice: Joi.number().required(),
  duration: Joi.number().required(),
});
