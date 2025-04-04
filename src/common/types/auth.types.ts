import { Request } from 'express';

export interface RequestWithCookies extends Request {
  cookies: {
    access_token?: string;
    refresh_token?: string;
  };
}
export interface RequestWithUser extends Request {
  user: {
    id: number;
    username: string;
  };
}

export interface JwtPayload {
  sub: number;
  username: string;
}

export interface ValidatedUser {
  id: number;
  username: string;
}
