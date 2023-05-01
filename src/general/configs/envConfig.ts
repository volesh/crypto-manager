import { config } from 'dotenv';
config();

export const envConfig = {
  port: Number(process.env.PORT),
};
