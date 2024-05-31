let express = require('express');
let router = express.Router();
const jwt = require('jsonwebtoken');
const cmsController = require('../controllers/cmsController');

// routes for admin login and login
// router.post('/login')                 // NB FINISH THIS AFTER TESTING OTHER ROUTES
// router.post('/logout')

// Route for creating a new author
router.post('/new_author', cmsController.create_author);


// routes for getting posts           // NB NEED TO ADD AUTH MIDDLEWARE 

module.exports = router;