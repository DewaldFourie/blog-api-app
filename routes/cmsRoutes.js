let express = require('express');
let router = express.Router();
const jwt = require('jsonwebtoken');
const cmsController = require('../controllers/cmsController');

// routes for admin login and login
router.post('/login')                 // NB FINISH THIS AFTER TESTING OTHER ROUTES
router.post('/logout')


// routes for getting posts           // NB NEED TO ADD AUTH MIDDLEWARE 