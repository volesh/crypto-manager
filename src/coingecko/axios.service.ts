import axios from 'axios';
import { baseURL } from 'src/general/configs/coingecko.config';

export const axiosService = axios.create({ baseURL });
