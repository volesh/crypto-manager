import { Request } from 'express';

export interface ReqUserI {
  id: string;
  token: string;
}

export interface IRequest extends Request {
  user: ReqUserI;
}
