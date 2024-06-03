let express = require('express');
let router = express.Router();
const jwt = require('jsonwebtoken');
const cmsController = require('../controllers/cmsController');
const { json } = require('body-parser');

// routes for admin login and logout
router.post('/login', cmsController.login);                
router.post('/logout', verifyToken, cmsController.logout);

// Route for creating a new author
router.post('/new_author', cmsController.create_author);


// routes for getting posts         
router.get('/posts', verifyToken, cmsController.get_posts_list);
router.get('/posts/:postid', verifyToken, cmsController.get_post);

// routes for handling a post
router.post('/posts',verifyToken, cmsController.create_post);



// Function to verify the jwt token of the author using Cookies  
function verifyToken(req, res, next) {
    // fetch the token cookie from the req cookies
    const httpOnlyCookie = req.cookies.token;
    // if the cookie is present, parse the JSON string to extract the token
    const jsonCookie = httpOnlyCookie ? JSON.parse(httpOnlyCookie) : {};
    // check if token is present in the parsed string
    if (jsonCookie.token) {
        // if token is present, extract it
        const cookieToken = jsonCookie.token
        // verify the extracted token with jsonwebtoken
        jwt.verify(cookieToken, process.env.SECRET, (err, authData) => {
            if (err) {
                // if verification fails, send forbidden error
                res.sendStatus(403);
            } else {
                // if verification succeeds, attach token and decoded auth data to the req object 
                req.token = cookieToken;
                req.authData = authData;
            }
        });
        // pass control to next middleware function
        next();
    } else {
        // if token not present in cookies, send forbidden error
        res.sendStatus(403);
    }
}



module.exports = router;