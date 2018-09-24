FROM node:8
RUN mkdir /code
WORKDIR /code
ADD package.json /code/
RUN npm install
ADD . /code/