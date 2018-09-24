import dotenv from 'dotenv';
// Load environment variables from .env file, where API keys and passwords are configured
dotenv.config({ path: '.env' });

import express from 'express';
import { Response, Request, NextFunction } from 'express';
// const RedisStore = connectRedis(session);
import compression from 'compression';  // compresses requests
import bodyParser from 'body-parser';
import logger from './utils/logger';
import path from 'path';

// const redisClient = redis.createClient(`redis://${process.env.REDIS_HOST || 'localhost'}:6379/1`);

import 'reflect-metadata';
import { createConnection, getRepository } from 'typeorm';
import cors from 'cors';

// Controllers (route handlers)
import router from './routes/api-route';

// Create Express server
const app = express();

// Connect to DB
// createConnection().then(async connection => { }).catch(error => console.log(error));

// app.use(session({ secret: 'vmvmvm', resave: false, store: new RedisStore({}) }));
app.use(cors());

// Express configuration
app.set('port', process.env.PORT || 3000);
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * Primary app routes.
 */
app.use('/', router);

export default app;