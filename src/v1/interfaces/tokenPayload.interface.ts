import { JwtPayload } from 'jsonwebtoken';

export interface TokenPayload extends JwtPayload {
  iat: number;
  nbf: number;
  exp: number;
  type: string;
  identity: string;
  jti: string;
}
