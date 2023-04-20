import * as devEnvVariables from './environment.development';
import * as stageEnvVariables from './environment.staging';
import * as prodEnvVariables from './environment.production';
import * as testEnvVariables from './environment.testing';

let envVariables;
switch (process.env.NODE_ENV) {
  case 'development':
    envVariables = devEnvVariables.default;
    break;
  case 'staging':
    envVariables = stageEnvVariables.default;
    break;
  case 'production':
    envVariables = prodEnvVariables.default;
    break;
  case 'testing':
    envVariables = testEnvVariables.default;
    break;
  default:
    envVariables = devEnvVariables.default;
    break;
}

export const environment = envVariables;
