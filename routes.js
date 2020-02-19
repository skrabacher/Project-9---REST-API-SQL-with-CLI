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

// *USER ROUTES*

// GET /api/users 200 - Returns the currently authenticated user
router.get('/users', asyncHandler(async (req, res) => {
  const currentUser = PLACEHOLDER; //DRAFT*** need auth criteria
  const authUser = await User.findByPk(currentUser.id); 
    res.status(200).json(authUser);
}));

//VALIDATION CHAINS
// check() returns a "validation chain". Any number of validation methods can be called on a validation chain to validate a field. 
const firstNameVC = check('firstName')
  .exists({ checkNull: true, checkFalsy: true })
  .withMessage('Please provide a value for "firstName"');
const lastNameVC = check('lastName')
  .exists({ checkNull: true, checkFalsy: true })
  .withMessage('Please provide a value for "lastName"');
const emailVC = check('emailAddress')
  .exists({ checkNull: true, checkFalsy: true })
  .isEmail()
  .withMessage('Please provide a value for "emailAddress"');
const passwordVC = check('password')
  .exists({ checkNull: true, checkFalsy: true })
  .withMessage('Please provide a value for "password"');
const titleVC = check('title')
  .exists({ checkNull: true, checkFalsy: true })
  .withMessage('Please provide a value for "title"');
const descriptionVC = check('description')
  .exists({ checkNull: true, checkFalsy: true })
  .withMessage('Please provide a value for "description"');


// POST /api/users 201 - Creates a user, sets the Location header to "/", and returns no content
router.post('/users', asyncHandler(async (req, res) => { // firstNameVC, lastNameVC, emailVC, passwordVC,
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
    const courses = await Course.findAll(); //DRAFT***
    res.status(200).json(courses);
}));
// GET /api/courses/:id 200 - Returns a the course (including the user that owns the course) for the provided course ID
router.get('/courses/:id', asyncHandler(async (req, res) => {
  const course = await Course.findByPk(req.params.id); //DRAFT***
  res.status(200).json(course);
}));  
// POST /api/courses 201 - Creates a course, sets the Location header to the URI for the course, and returns no content
router.post('/courses', titleVC, descriptionVC, asyncHandler(async (req, res) => {
  // Attempt to get the validation result from the Request object.
  const errors = validationResult(req); //validationResult extracts the validation errors from a request and makes them available in a Result object.
  // If there are validation errors...
  if (!errors.isEmpty()) {
    // Use the Array `map()` method to get a list of error messages.
    const errorMessages = errors.array().map(error => error.msg);
    // Return the validation errors to the client.
    res.status(400).json({ errors: errorMessages });
  } else {
    await Course.create(req.body);//creates new instance of User model 
    // Set the status to 201 Created and end the response.
    res.status(201).location(PLACEHOLDER).end(); //sets response status & location header
  }
}));
// PUT /api/courses/:id 204 - Updates a course and returns no content
router.put('/courses/:id', titleVC, descriptionVC, asyncHandler(async (req, res) => {
  const errors = validationResult(req); //validationResult extracts the validation errors from a request and makes them available in a Result object.
  if (!errors.isEmpty()) { //if errors exist
    const errorMessages = errors.array().map(error => error.msg); // Use the Array `map()` method to get a list of error messages.
    res.status(400).json({ errors: errorMessages }); //responds with error messages
  } else {
    await course.update(req.body);
    res.status(204).end();
}
}));
// DELETE /api/courses/:id 204 - Deletes a course and returns no content
router.delete('/courses/:id', asyncHandler(async (req, res) => {
  
  res.status(204).end();
}));
  
module.exports = router;
   
   //***SJK NOTE*** DRAFT from here: C:\Users\Sarah\Documents\Treehouse Tech Degree\Unit 9\PRACTICE- data-relationships-with-sql-and-sequelize\starter-files\app.js
        // Retrieve movies:
                  // const movies = await Movie.findAll({
                  //   include: [
                  //     {
                  //       model: Person, // indicates that we want any related Person model data
                  //       as: 'director',
                  //     },
                  //   ],
                  // });
                  // console.log(movies.map(movie => movie.get({ plain: true })));
                  // // Retrieve people
                  // const people = await Person.findAll({
                  //   include: [
                  //     {
                  //       model: Movie,
                  //       as: 'director',
                  //     },
                  //   ],
                  // });
                  // console.log(people.map(person => person.get({ plain: true })));
