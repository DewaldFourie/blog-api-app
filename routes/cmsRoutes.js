let express = require('express');
let router = express.Router();
const jwt = require('jsonwebtoken');
const cmsController = require('../controllers/cmsController');
const { json } = require('body-parser');


// routes for admin login and logout
router.post('/login', cmsController.login);                
router.post('/logout', verifyToken, cmsController.logout);

// Route to CREATE a new author
router.post('/new_author', cmsController.create_author);

// routes to GET posts         
router.get('/posts', verifyToken, cmsController.get_posts_list);
router.get('/posts/:postid', verifyToken, cmsController.get_post);

// routes to UPDATE posts
router.put('/posts/:postid/publish', verifyToken, handlePublish, cmsController.publish_post);
router.put('/posts/:postid/unpublish', verifyToken, handleUnpublish, cmsController.publish_post);

// routes to CREATE, UPDATED and DELETE a post
router.post('/posts', verifyToken, cmsController.create_post);
router.put('/posts/:postid', verifyToken, cmsController.update_post);
router.delete('/posts/:postid', verifyToken, cmsController.delete_post);

// route to DELETE a comment on a post
router.delete('/posts/:postid/comment/:commentid', verifyToken, cmsController.delete_comment);


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

// function to update post to Unpublished
function handleUnpublish(req, res, next) {
    // set the req parameter 'publish' to false 
    req.publish = false;
    next();
};

// function to update post to Published
function handlePublish(req, res, next) {
    // set the req parameter 'publish' to true 
    req.publish = true;
    next();
};


module.exports = router;