import { mkdirSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';
const dirPath = join(__dirname, '../logs');
const appLogFilePath = join(__dirname, '../logs', 'app.log');
const errorLogFilePath = join(__dirname, '../logs', 'error.log');

const checkIfDirectoryExists = (dirName: string) => {
  return existsSync(dirName);
};
const checkIfFileExists = (fileName: string) => {
  return existsSync(fileName);
};
const createLogsDirectory = () => {
  if (!checkIfFileExists(dirPath)) {
    mkdirSync(dirPath);
    console.log('logs directory created');
  }
};
const createAppLogFile = () => {
  try {
    if (!checkIfFileExists(appLogFilePath)) {
      const result = writeFileSync(appLogFilePath, '');
      console.log('App log file created');
    }
  } catch (error) {
    console.log('createAppLogFile-error:', error);
  }
};
const createErrorLogFile = () => {
  try {
    if (!checkIfFileExists(errorLogFilePath)) {
      const result = writeFileSync(errorLogFilePath, '');
      console.log('Error log file created');
    }
  } catch (error) {
    console.log('createErrorLogFile-error:', error);
  }
};
console.log('check-if-logs-dir-exists', checkIfDirectoryExists(dirPath));
createLogsDirectory();
console.log('check-if-app-log-file-exists', checkIfFileExists(appLogFilePath));
console.log(
  'check-if-error-log-file-exists',
  checkIfFileExists(errorLogFilePath),
);
createAppLogFile();
createErrorLogFile();
