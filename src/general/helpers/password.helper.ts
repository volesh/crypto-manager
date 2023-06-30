import * as bcrypt from 'bcrypt';

export class PasswordHelper {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hashSync(password.trim(), 10);
  }
  static async comparePassword(hashedPass: string, password: string): Promise<boolean> {
    return bcrypt.compareSync(password.trim(), hashedPass);
  }
}
