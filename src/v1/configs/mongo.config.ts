import { environment } from '../environments/index';

const { MONGO_URL, MONGO_USERNAME, MONGO_PASSWORD } = environment;

const config = {
  url: MONGO_URL,
  username: MONGO_USERNAME,
  password: MONGO_PASSWORD,
};

const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
  useNewUrlParser: true,
};

export const MongoConfig = { config, options };
