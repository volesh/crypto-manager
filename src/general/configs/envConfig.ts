import { config } from 'dotenv';

config();

export const envConfig = {
  port: Number(process.env.PORT),
  access_key: process.env.ACCESS_SECRET_KEY,
  refresh_key: process.env.REFRESH_SECRET_KEY,
  admin_email: process.env.ADMIN_EMAIL,
  email_password: process.env.EMAIL_PASSWORD,
  exchange_api_key: process.env.EXCHANGE_API_KEY,
  google_client_id: process.env.GOOGLE_CLIENT_ID,
  google_client_secret: process.env.GOOGLE_CLIENT_SECRET,
  google_callback_url: process.env.GOOGLE_CALLBACK_URL,
};
