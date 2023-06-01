FROM node:18-alpine
# setting build arguments
ARG NODE_ENV
# setting env files form build arguments
ENV NODE_ENV=$NODE_ENV
# where will be the project files will be listed inside the dontainer
WORKDIR /app
# copy the package.json and package-lock.json first to the workdir
COPY package*.json ./
# run npm clean install to install all the dependencies first
RUN npm install
# then copy all the project files to the workdir except the files listed in .dockerignore
COPY . .
# then run build command for building build file from typescript files
RUN npm run build
# run the npm start command to start the server
CMD ["npm", "start"]
# expose the 3030 port
EXPOSE 3030