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
    const httpOnlyCookie = req.cookies.token;
    const jsonCookie = httpOnlyCookie ? JSON.parse(httpOnlyCookie) : {};

    if (jsonCookie.token) {
        const cookieToken = jsonCookie.token
        // verify the token 
        jwt.verify(cookieToken, process.env.SECRET, (err, authData) => {
            if (err) {
                res.sendStatus(403);
            } else {
                req.token = cookieToken;
                req.authData = authData;
            }
        });
        next();
    } else {
        res.sendStatus(403);
    }
}



module.exports = router;