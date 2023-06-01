# Auction Service

This an auction system service where you can perform CRUD for item and publish items for bidding for a specific time window and users can bid on published item within that time frame and the bidding is completed after bidding window expired.

There is also a `JWT` based authentication and authorization system where users can register and login using email and password.

This application leverages technologies like `Node.js`, `Express`, `Typescript` `MongoDB`, `Redis/Redis Cluster`, `JWT`.

## Table of contents

- Quick Start
- Features
- Project Structure
- Environment Variables
- API Endpoints
- Testing
- Authentication and Authorization Flow
- Items creation and publish process
- Bidding process

## Quick Start

To get started with the project quickly do these steps

Clone the repo:

```
git colone https://github.com/faizul-mustafiz/auction-service.git
```

Install the dependencies:

```
npm install
# OR
npm ci
```

Set the environment variables:
To run the project set up the environment variables. An `env.example` file is present listing the necessary variables of the project.
Make new file name `.env` at the root of the project and edit them with your config.

Run the project locally:

```
npm start
```

Or you can try the other commands listed in the `script` section of package.json

## Features

- **Dependency Management:** with [npm](https://www.npmjs.com/)
- **Database:** [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) with object data modeling using [Mongoose](https://www.npmjs.com/package/mongoose)
- **Cache Database:** [Redis](https://redis.io/)
- **Authentication and Authorization:**Custom implementation of [JWT](https://jwt.io/)
- **Validation:** request data validation using [Joi](https://www.npmjs.com/package/joi)
- **Logging:** using [Winston](https://www.npmjs.com/package/winston) and [Morgan](https://www.npmjs.com/package/morgan)
- **Testing:** using [Mocha](https://mochajs.org/) and [Chai.js](https://www.chaijs.com/)
- **Error Handling:** Centralized error handling with base error handler class and other errors extending base error handler class
- **Environment variables:** using [dotenv](https://www.npmjs.com/package/dotenv)
- **Security:** Implementation of verifying sign-in and sign-up process with verify token and code for added security
- **CORS:** Cross-Origin Resource-Sharing enabled using [cors](https://www.npmjs.com/package/cors)
- **Linting:** using [Prettier](https://prettier.io/) and [pretty-quick](https://www.npmjs.com/package/pretty-quick)

## Project Structure

```
|--src\v1
    |--configs\        # config of plugins and environments
    |--controllers\    # controller functions for different routes
    |--enums\          # required enums
    |--environments\   # different types of environment configuration
    |--errors\         # Error handling files fro different types of error
    |--generators\     # generator functions of different values
    |--helpers\        # route controller helpers functions
    |--interfaces\     # interfaces for different types and functions
    |--logger\         # base logger and file logger config files
    |--middlewares\    # express middlewares related to auth and validation
    |--models\         # mongoose schema and models
    |--plugins\        # plugins for project like redis and mongodb
    |--responses\      # success response object builder
    |--routes\         # route definitions
    |--tests\          # unit test definition functions
    |--utility\        # utility functions
    |--validators\     # request validator functions
    |--app.ts          # express application init and injections
|--.env.example        # env file example
|--.gitignore          # git ignore list
|--.mocharc.json       # mocha config
|--.prettierignore     # prettier ignore list
|--.prettierrc         # prettier config
|--index.ts            # application entry point, server, shutdown
|--package-lock.json
|--package.json
|--README.md
|--tsconfig.json
```

## Environment Variables

The environment variables example can be found in `.env.example` and edit these fields in `.env` file

```
#app environment variables
API_PROTOCOL="http"
API_HOST="0.0.0.0"
API_PORT=3030
BASE_API_ROUTE="/api/v1"

# bidding environment variables
# after which duration an individual user can bid on a specific item
BIDDING_INTERVAL=5

# redis environment variables
# this url is for redis configured is redis-Labs/docker container/Kubernetes cluster
REDIS_URL="your-redis-labs-connection-string"

# redis test environment variables
REDIS_URL_TEST="your-redis-test-db-connection-string"

# mongodb environment variables
MONGO_URL="your-mongo-connection-string"

# mongodb test environment variables
MONGO_URL_TEST="your-mongo-test-db-connection-string"

# encryption and decryption environment variables
HASHING_ALGORITHM='AES-GCM'

# JWT environment variables
ACCESS_TOKEN_SECRET="Your access token secret"
ACCESS_TOKEN_EXPIRY_TIME=10800

REFRESH_TOKEN_SECRET="Your refresh token secret"
REFRESH_TOKEN_EXPIRY_TIME=43200

VERIFY_TOKEN_SECRET="Your verify token secret"
VERIFY_TOKEN_EXPIRY_TIME=3600

RESET_PASSWORD_TOKEN_SECRET="Your reset password token secret"
RESET_PASSWORD_TOKEN_EXPIRY_TIME=3600

CHANGE_PASSWORD_TOKEN_SECRET="Your change password token secret"
CHANGE_PASSWORD_TOKEN_EXPIRY_TIME=3600

PUBLIC_KEY="your-public-key"
PRIVATE_KEY="your-private-Key"
```

there is a generator file `/src/v1/generators/key.generator.ts` you can generate JWT keys form here. The JWT encryption and decryption is based on `{ algorithm: 'ES512' }` so you need to generate public key and private key using openssl commands.

Run this commands to generate a private key and public key and then update the `.env` file with those keys.

```
# For PRIVATE_KEY
openssl ecparam -genkey -name secp521r1 -noout -out private-key-name.pem

# For PRIVATE_KEY
openssl ec -in private-key-name.pem -pubout -out public-key-name.pem

# To get the keys
cat private-key-name.pem
cat public-key-name.pem
```

## API Endpoints

### Auth

- `[POST]` sign-up: `http://{host}:{port}/api/v1/auth/sign-up`
- `[POST]` sign-in: `http://{host}:{port}/api/v1/auth/sign-in`
- `[POST]` sign-out: `http://{host}:{port}/api/v1/auth/sign-out`
- `[POST]` verify: `http://{host}:{port}/api/v1/auth/verify`
- `[POST]` forgot-password: `http://{host}:{port}/api/v1/auth/forgot-password`
- `[POST]` change-password: `http://{host}:{port}/api/v1/auth/change-password`
- `[POST]` refresh: `http://{host}:{port}/api/v1/auth/refresh`
- `[POST]` revoke-access-token: `http://{host}:{port}/api/v1/auth/revoke-at`
- `[POST]` revoke-refresh-token: `http://{host}:{port}/api/v1/auth/revoke-rt`

### Users

- `[GET]` get-all-user: `http://{host}:{port}/api/v1/users`
- `[GET]` deposit: `http://{host}:{port}/api/v1/users/deposit`
- `[GET]` get-one-user: `http://{host}:{port}/api/v1/users/{userId}`
- `[POST]` update-one-user: `http://{host}:{port}/api/v1/users/{userId}`
- `[DELETE]` delete-one-user: `http://{host}:{port}/api/v1/users/{userId}`

### items

- `[GET]` get-all-items: `http://{host}:{port}/api/v1/items`
- `[GET]` search: `http://{host}:{port}/api/v1/search?status=<itemStatus>`
- `[GET]` get-one-item: `http://{host}:{port}/api/v1/items/{itemId}`
- `[POST]` update-one-item: `http://{host}:{port}/api/v1/items/{itemId}`
- `[DELETE]` delete-one-item: `http://{host}:{port}/api/v1/items/{usitemIderId}`
- `[POST]` publish-item: `http://{host}:{port}/api/v1/items/publish/{itemId}`

### Bid

- `[POST]` bid-on-item: `http://{host}:{port}/api/v1/bid/{itemId}`

## Testing

For testing Mocha and Chai.js is used. you can see the test command in `package.json` file.

**Note:** You need to add two keys in `.env` file `REDIS_TEST_URL` and `MONGO_TEST_URL` as the test files deletes all the collection data in mongo for test purpose and flush redis db for redis data. So if you do this on your main collection or redis then you will lose all data after test.

### Run this command to test manually

```
npm test
```

## Authentication and Authorization Flow

There are multi layers of middleware for authentication and authorization with custom validation middleware. After passing these middleware injected on routes a request is passed to designated controller.

### Sing Up

For `sign-up` process user requests at `http://{host}:{port}/api/v1/auth/sign-up` this route with `custom headers`. Then client application will get a `verify_token` and `verify_code`. Using this verification code in body and token as `Authorization` header users will complete sign-up at route `http://{host}:{port}/api/v1/auth/verify`.
On completing sign-up a new user is created and provided with `accessToken` and `refreshToken`

### Sing In

Like `sign-up` process user requests at `http://{host}:{port}/api/v1/auth/sign-in` for `sign-in` process with `custom headers`. Then client application will get a `verify_token` and `verify_code`. Using this verification code in body and token as `Authorization` header users will complete sign-up at route `http://{host}:{port}/api/v1/auth/verify`.
On completing sign-up a new user is created and provided with `accessToken` and `refreshToken`

### Sign Out

There are two different routes for revoking accessToken and refreshToken. It is encouraged to `revoke-at` and `revoke-rt` for sign out but there is also a simpler version where only refresh-token is needed and revoked.

All the required fields, headers, schemas, response schemas are described inside swagger documentation.

## Forgot Password Flow

Just like sign-up and sign-in users request for forgot password at `http://{host}:{port}/api/v1/auth/forgot-password` this route. Here user is provided with change-password token and change-password code. then user request with the code and new-password inside request body and then token as Authorization header at `http://{host}:{port}/api/v1/auth/change-password`. Client applications need to add the custom headers for this rout as mentioned earlier.

## Items creation and publish process

For creating an item you need to hit `http://{host}:{port}/api/v1/items` page with required fields for item creation. By default the item is created in a `DRAFT` state and you need to publish that particular item to initiate bidding using this route `http://{host}:{port}/api/v1/items/publish/{itemId}`

## Bidding process

For bidding you can only bid on published items only. you can bid on item which has to be greater than the starting price and current height bid if there is any. After the bidding window is expired the bidding is completed automatically and `currentHeightBid` and `currentHeightBidder` information is stored.

Also every bid information is stored fro future logging purpose

## Docker Deployment

To deploy auction-service using docker you need to build the image first.

### Build

```
docker build --build-arg NODE_ENV=<environment_name> -t auction-service:<tag_name> .
```

then when the build is compete then use this command to run the container.

### Run

```
docker run --rm -dp 3030:80 --restart unless-stopped --name auction-service auction-service:<tag_name>
```

We need to pass `NODE_ENV` value as build argument `--build-arg` in the run command. The environments are

- development
- staging
- production
- testing