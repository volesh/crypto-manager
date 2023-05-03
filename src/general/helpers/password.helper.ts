import * as bcrypt from 'bcrypt';

export class PasswordHelper {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hashSync(password, 10);
  }
  static async comparePassword(hashedPass, password): Promise<boolean> {
    return bcrypt.compareSync(password, hashedPass);
  }
}
