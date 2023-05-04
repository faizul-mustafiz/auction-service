import { Request } from 'express';
export const getAuthorizationHeader = (req: Request) => {
  return req.headers['authorization'] || req.headers['Authorization'];
};

export const splitAuthorizationHeader = (authorization: any) => {
  const bearer =
    authorization && authorization.startsWith('Bearer ') ? authorization : null;
  const token = bearer ? bearer.split('Bearer ')[1] : null;
  return {
    bearer,
    token,
  };
};
