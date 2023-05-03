import { config } from 'dotenv';
config();

export const envConfig = {
  port: Number(process.env.PORT),
  access_key: process.env.ACCESS_SECRET_KEY,
  refresh_key: process.env.REFRESH_SECRET_KEY,
};