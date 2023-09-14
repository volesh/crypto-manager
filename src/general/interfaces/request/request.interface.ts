import { Request } from 'express';

export interface ReqUserI {
  id: string;
  token: string;
}

export interface ReqUserOAuth {
  email: string;
  name: string;
  accessToken: string;
  picture: string;
}

export interface IRequest extends Request {
  user: ReqUserI;
}

export interface IRequestOAuth extends Request {
  user: ReqUserOAuth;
}
