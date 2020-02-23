//Express set up
const express = require('express');
const router = express.Router();
// adds express check() and validator() methods
const { check, validationResult } = require('express-validator'); //originally: require('express-validator/check') but received error in CL: express-validator: requires to express-validator/check are deprecated.You should just use require("express-validator") instead.
    // const checkModule = require('express-validator/check');
    // const check = checkModule.check;
    // const validationResult = checkModule.validationResult;
//requirement for password hashing
const bcryptjs = require('bcryptjs');
//requirement for user authentication
const auth = require('basic-auth');

//import Models
const User = require('./models').User;
const Course = require('./models').Course;

/* Handler function to wrap each route. (eliminates need to write try/catch over and over in each route)*/
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      console.log("in asyncHandler CATCH");
      next(error);
    }
  }
}
//Modeled using: https://teamtreehouse.com/library/rest-api-authentication-with-express
const authenticateUser = async (req, res, next) => {
    let authErrorMessage = null; //variable to hold error messages
    const allUsers = await User.findAll(); //gets all user data and stores in the allUser variable
    const credentials = auth(req); //pulls the user credentials from the authorization header
    //credentials will contain two values:
        //name: the user's email address
        //pass: the user's password (in clear text).
    if (credentials) { //checks to see if user record exists using email entered
      const validUser = allUsers.find(user => user.emailAddress === credentials.name); //finds user email in the db that matches the credentials email. stores that entire db row(user instance) in the user var
      if (validUser) {  //checks to see if correct password was used with email
        // Use the bcryptjs npm package to compare the user's password
        // (from the Authorization header) to the user's password
        // that was retrieved from the data store.
        const authenticated = bcryptjs
          .compareSync(credentials.pass, validUser.password); //hashes the entered password(credentials.pass) and compares to the hashed database password (user.password)
        if (authenticated) {
          console.log(`Authentication successful for username: ${validUser.emailAddress}`);
  
          // Then store the retrieved user object on the request object
          // so any middleware functions that follow this middleware function
          // will have access to the user's information.
          req.currentAuthUser = validUser; //attaches validUser data to the req object so that the data can be called in the next fucnitno
        } else {
          authErrorMessage = `Authentication failure for username: ${validUser.emailAddress}`;
        }
      } else {
        authErrorMessage = `User not found for username: ${credentials.name}`;
      }
    } else {
      authErrorMessage = 'Auth header not found';
    }
  
    // If user authentication failed...
    if (authErrorMessage) {
      console.warn(authErrorMessage);
  
      // Return a response with a 401 Unauthorized HTTP status code.
      res.status(401).json({ message: 'Access Denied' });
    } else {
      // Or if user authentication succeeded...
      // Call the next() method.
      next();
    }
  };

//VALIDATION CHAINS
// check() returns a "validation chain". Any number of validation methods can be called on a validation chain to validate a field. 
const firstNameVC = check('firstName') //parameter is the model field that will be checked
  .exists({ checkNull: true, checkFalsy: true })
  .withMessage('Please provide a value for "firstName"');
const lastNameVC = check('lastName')
  .exists({ checkNull: true, checkFalsy: true })
  .withMessage('Please provide a value for "lastName"');
const emailVC = check('emailAddress')
  .exists({ checkNull: true, checkFalsy: true })
  .withMessage('Please provide a value for "emailAddress"')
  .isEmail()
  .withMessage('Please provide a valid email address')
  //CHECKING IF EMAIL ALREADY IN USER custom validation for email modeled after: https://express-validator.github.io/docs/custom-validators-sanitizers.html
  .custom(async (value) => { const user = await User.findOne({ 
    where: { 
      emailAddress: value
    } 
  });
  if (user) {
      return Promise.reject('E-mail already in use');
    }
  });
const passwordVC = check('password')
  .exists({ checkNull: true, checkFalsy: true })
  .withMessage('Please provide a value for "password"');
const titleVC = check('title')
  .exists({ checkNull: true, checkFalsy: true })
  .withMessage('Please provide a value for "title"');
const descriptionVC = check('description')
  .exists({ checkNull: true, checkFalsy: true })
  .withMessage('Please provide a value for "description"');


// *USER ROUTES*

// GET /api/users 200 - Returns the currently authenticated user
router.get('/users', authenticateUser, asyncHandler(async (req, res) => {
    const currentAuthUser = req.currentAuthUser; //req.currentUser from authenticateUser()
    const user = await User.findByPk(currentAuthUser.id, {
      attributes: {
        exclude: [
          'password',
          'createdAt',
          'updatedAt'
        ],
      }
    }); 
    res.status(200).json(user);
  }));

// POST /api/users 201 - Creates a user, sets the Location header to "/", and returns no content
router.post('/users', firstNameVC, lastNameVC, emailVC, passwordVC, asyncHandler(async (req, res) => { // firstNameVC, lastNameVC, emailVC, passwordVC,
    // Attempt to get the validation result from the Request object.
    const errors = validationResult(req); //validationResult extracts the validation errors from a request and makes them available in a Result object.
    // If there are validation errors...
    if (!errors.isEmpty()) {
      // Use the Array `map()` method to get a list of error messages.
      const errorMessages = errors.array().map(error => error.msg);
      // Return the validation errors to the client.
      res.status(400).json({ errors: errorMessages });
    } else {
      const user = req.body;
      user.password = bcryptjs.hashSync(user.password); //hashes the new user's password so that it isn't stored in plain text
      await User.create(req.body);//creates new instance of User model 
      // Set the status to 201 Created and end the response.
      res.status(201).location('/').end(); //sets response status & location header
    }
}));
  

// *COURSE ROUTES*
// GET /api/courses 200 - Returns a list of courses (including the user that owns each course)
router.get('/courses', asyncHandler(async (req, res) => {
    const courses = await Course.findAll({
        include: [
          {
            model: User, // indicates that we want any related Person model data
            as: 'instructor', //linked to course model and user model files that also have instructor alias defined
            attributes: [ 'id', 'firstName', 'lastName' ] // only these attributes returned
          },
        ],
        attributes: {
          exclude: [
              'createdAt',
              'updatedAt',
          ],
        }
        }); 
    res.status(200).json(courses);
}));

// GET /api/courses/:id 200 - Returns a the course (including the user that owns the course) for the provided course ID
router.get('/courses/:id', asyncHandler(async (req, res) => {
  const course = await Course.findByPk(req.params.id, {
      include: [
        {
          model: User, // indicates that we want any related Person model data
          as: 'instructor', //linked to course model and user model files that also have instructor alias defined
          attributes: [ 'id', 'firstName', 'lastName' ] // only these attributes returned
        },
      ],
      attributes: {
        exclude: [
            'createdAt',
            'updatedAt',
        ],
      }
  }); 
  res.status(200).json(course);
}));  

// POST /api/courses 201 - Creates a course, sets the Location header to the URI for the course, and returns no content
router.post('/courses', authenticateUser, titleVC, descriptionVC, asyncHandler(async (req, res) => {
  // Attempt to get the validation result from the Request object.
  const errors = validationResult(req); //validationResult extracts the validation errors from a request and makes them available in a Result object.
  // If there are validation errors...
  if (!errors.isEmpty()) {
    // Use the Array `map()` method to get a list of error messages.
    const errorMessages = errors.array().map(error => error.msg);
    // Return the validation errors to the client.
    res.status(400).json({ errors: errorMessages });
  } else {
    const specificCourse = await Course.create(req.body);//creates new instance of User model 
    // Set the status to 201 Created and end the response.
    res.status(201).location('courses/' + specificCourse.id).end(); //sets response status & location header
  }
}));
// PUT /api/courses/:id 204 - Updates a course and returns no content
router.put('/courses/:id', authenticateUser, titleVC, descriptionVC, asyncHandler(async (req, res) => {
  const currentAuthUser = req.currentAuthUser; //req.currentUser from authenticateUser()
  const errors = validationResult(req); //validationResult extracts the validation errors from a request and makes them available in a Result object.
  if (!errors.isEmpty()) { //if errors exist from the user input...
    const errorMessages = errors.array().map(error => error.msg); // Use the Array `map()` method to get a list of error messages.
    res.status(400).json({ errors: errorMessages }); //responds with error messages
  } else { //IF NO ERRORS EXIST:
    const course = await Course.findByPk(req.params.id); //finds course with the same id number as the one passed into the url path (request parameter of id)
    if (course) { //if course is found
      const courseAdmin = course.userId === currentAuthUser.id;
      if (courseAdmin) {
        await course.update(req.body); //update the course with the request body (passed in as a json object from postman for now)
        res.status(204).end(); //return status of 204 to
      } else {
        res.status(403).json({message: "ERROR: 403 - You are not authorized to update this course"}).end();
      }
    } else {
      res.status(404).json({message: "ERROR: 404 - No course found with that id number"}).end();
    }
}
}));



// DELETE /api/courses/:id 204 - Deletes a course and returns no content
router.delete('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {
  const currentAuthUser = req.currentAuthUser; //req.currentUser from authenticateUser()
  console.log("DELETE currentAuthUser.id: " + currentAuthUser.id);
  const course = await Course.findByPk(req.params.id);
  if(course) {
    console.log("DELETE2 currentAuthUser.id: " + currentAuthUser.id);
    let courseId = course.userId;
    let userId = currentAuthUser.id;
    console.log("courseId, userId: ", courseId, userId);
    const courseAdmin = courseId === userId;
    if (courseAdmin) {
      await course.destroy();
      res.status(204).end();
    } else {
      res.status(403).json(
        {
          message: "ERROR: 403 - You are not authorized to delete this course. The user id required is: " + course.userId + ". Your user id is: " + currentAuthUser.Id
        }).end();
    }
  } else {
    res.status(404).json({message: "ERROR: 404 - No course found with that id number"}).end();
  }
}));
  
module.exports = router;
   

