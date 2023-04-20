import { environment } from '../environments/index';

const { BASE_API_ROUTE, API_PORT, API_HOST, API_PROTOCOL } = environment;

export const AppConfig = {
  version: 'v1',
  baseRoute: BASE_API_ROUTE,
  port: API_PORT,
  host: API_HOST,
  protocol: API_PROTOCOL,
};
