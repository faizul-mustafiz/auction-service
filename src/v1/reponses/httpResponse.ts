import { Response } from 'express';
import { HttpResponsePayload } from '../interfaces/httpResponsePayload.interface';

export const Success = (res: Response, payload: HttpResponsePayload) => {
  return res.status(200).json({
    success: true,
    message: payload.message,
    result: payload.result,
  });
};
export const Created = (res: Response, payload: HttpResponsePayload) => {
  return res.status(201).json({
    success: true,
    message: payload.message,
    result: payload.result,
  });
};

export const BadRequest = (res: Response, payload: HttpResponsePayload) => {
  return res.status(400).json({
    success: false,
    message: payload.message,
    result: payload.result,
  });
};
