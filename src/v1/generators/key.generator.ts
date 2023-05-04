import { randomBytes } from 'crypto';
const accessToken = randomBytes(64).toString('hex');
const refreshToken = randomBytes(64).toString('hex');
const verifyToken = randomBytes(32).toString('hex');
const changePasswordToken = randomBytes(32).toString('hex');
const resetPasswordToken = randomBytes(32).toString('hex');
console.table({
  accessToken,
  refreshToken,
  verifyToken,
  changePasswordToken,
  resetPasswordToken,
});
