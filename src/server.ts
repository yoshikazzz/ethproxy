import errorHandler from 'errorhandler';
import https from 'https';
import http from 'http';
import fs from 'fs';

import app from './app';

/**
 * Error Handler. Provides full stack - remove for production
 */
app.use(errorHandler());

/**
 * Start Express server.
 */
/* const options = {
  key: fs.readFileSync(process.env.SSL_KEY_PATH),
  cert: fs.readFileSync(process.env.SSL_CERT_PATH)
}; */

// const server = https.createServer(options, app).listen(process.env.PORT, () => {
const server = http.createServer(app).listen(process.env.PORT, () => {
  console.log(
    `  App is running at https://localhost:${process.env.PORT} in %s mode`,
    app.get('port'),
    app.get('env')
  );
  console.log('  Press CTRL-C to stop\n');
});

export default server;
