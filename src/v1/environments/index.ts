import * as devEnvVariables from './environment.development';
import * as stageEnvVariables from './environment.staging';
import * as prodEnvVariables from './environment.production';
import * as testEnvVariables from './environment.testing';

let envVariables;
switch (process.env.NODE_ENV) {
  case 'development':
    envVariables = devEnvVariables.environment;
    break;
  case 'staging':
    envVariables = stageEnvVariables.environment;
    break;
  case 'production':
    envVariables = prodEnvVariables.environment;
    break;
  case 'testing':
    envVariables = testEnvVariables.environment;
    break;
  default:
    envVariables = devEnvVariables.environment;
    break;
}

export const environment = envVariables;
