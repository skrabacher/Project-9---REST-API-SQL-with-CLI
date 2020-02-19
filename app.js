'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');
//define a variable(sequelize) that holds a Sequelize instance you can interact with.
const { sequelize } = require('./models'); //index does not need to be included it is the default run file in the folder
// TEST CONNECTION TO THE DB w/ IIFE and Authenticate() method
(async () => { //keyword async defines an asynchronous function
  try { //use the await keyword to wait for a Promise (await must be used inside an async function)
      await sequelize.authenticate(); //Sequelize's authenticate() function returns a promise that resolves to a successful, authenticated connection to the database.
      console.log('Connection to the database successful!');
  } catch (error) {
      console.error('Error connecting to the database: ', error);
  }
})();

// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// create the Express app
const app = express();

// setup morgan which gives us http request logging
app.use(morgan('dev'));

// TODO setup your api routes here

// setup a friendly greeting for the root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API project!',
  });
});

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {},
  });
});

// set our port
app.set('port', process.env.PORT || 5000);

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});

//  npx sequelize model:create --name Course --attributes firstName:string,lastName:string,emailAddress:string,password:string
