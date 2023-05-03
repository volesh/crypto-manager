import { TokensI } from '../tokens/tokens.interface';
import { CreatedUserI } from './created.user.interface';

export interface LoginResponseI {
  user: CreatedUserI;
  tokens: TokensI;
}
