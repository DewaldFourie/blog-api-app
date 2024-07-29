const Author = require('../models/author');
const Post = require('../models/post');
const Comment = require('../models/comment');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const { isValidObjectId } = require('mongoose');
const genPassword = require('../lib/passwordUtils').genPassword;
const validPassword = require('../lib/passwordUtils').validPassword;
const dayjs = require('dayjs');
const { json } = require('body-parser');


// controller to handle POST route for author login
exports.login = asyncHandler(async (req, res, next) => {
    // check to see if the query args are present
    if (!req.body.username || !req.body.password) {
        // if not, send error Bad Request
        res.status(400).json({ message: "Please fill in ALL Fields." });
    } else {
        // check to see if an author with that username exists
        const author = await Author.findOne({ username: req.body.username }).exec();
        if (!author) {
            // if there is no author with that username, send not found error
            res.status(404).json({ message: "The Username is not Registered." });
        } else {
            // check if the passwords match using passwordUtils
            const match = validPassword(req.body.password, author.hash, author.salt);
            if (!match) {
                // if the passwords don't match, send unauthorized error
                res.status(401).json({ message: "Password is Incorrect." });
            } else {
                // passwords is a match, send back the JWT token with httpOnly    NB= CAN ADJUST TIME LIMIT AS NEEDED
                const expirationDate = dayjs().add(30, "minutes").toDate(); // if updated, the expires in value below must be updated
                jwt.sign({ author }, process.env.SECRET, { expiresIn: "30m" }, (err, token) => {
                    res.cookie("token", JSON.stringify({ token: token }), {
                        httpOnly: true,
                        expires: expirationDate,
                        sameSite: "none",
                        secure: true,
                    });
                    res.json({ result: "logged in", token: expirationDate, authorId: author._id, username: author.username });
                });
            }
        }
    }
});


// controller to handle POST route for author logout
exports.logout = asyncHandler(async (req, res, next) => {
    // Setting a cookie with a token value of 'none' and an expiration
    // date of '5s' effectively invalidating the token
    const expirationDate = dayjs().add(5, "seconds").toDate();
    res.cookie("token", JSON.stringify({ token: "none" }), {
        httpOnly: true,
        expires: expirationDate,
        sameSite: "none",
        secure: true,
    });
    // response message to confirm logout
    res.json({ result: "logged out", token: expirationDate });
});


// controller to GET all posts list from the DB
exports.get_posts_list = asyncHandler(async (req, res, next) => {
    // fetch the posts
    const posts = await Post.find()
        .sort({ 'createdAt': -1 })
        .populate('author', 'username')
        .exec();
    // check if there are any posts
    if (!posts) {
        // if not, send not found error
        res.sendStatus(404);
    } else {
        // if there are posts, respond with json format of posts
        res.json({ posts });
    }
});


// controller to GET a specific post from the DB 
exports.get_post = asyncHandler(async (req, res, next) => {
    // checks to see if there is a postID and if the postID is a valid MongoDB Object
    if (!req.params.postid || !isValidObjectId(req.params.postid)) {
        // if not send error
        res.sendStatus(400);
    } else {
        // fetch the post and its related comments
        const [post, comments] = [
            await Post.findById(req.params.postid).populate('author', 'username').exec(),
            await Comment.find({ 'post': req.params.postid }).sort({ 'timestamp': -1 }).exec(),
        ]
        // check if there are any posts
        if (!post) {
            // if not, send not found error
            res.sendStatus(404);
        } else {
            // there is a post, respond with json format of posts and comments
            res.json({ post, comments });
        }
    }
});


// controller to UPDATE a post to published in the DB
exports.publish_post = asyncHandler(async (req, res, next) => {
    // checks to see if there is a postID and if the postID is a valid MongoDB Object
    if (!req.params.postid || !isValidObjectId(req.params.postid)) {
        // if not send error
        res.sendStatus(400);
    } else {
        // get the post from DB and update its published value
        const post = await Post.findById(req.params.postid).exec();
        // check if there is a post
        if  (!post) {
            // if not, send not found error
            res.sendStatus(404);
        } else {
            // there is a post, update the post attribute published to true or false according to need
            post.published = req.publish;
            await Post.findByIdAndUpdate(post._id, post);
            res.json({ result: 'done', published: req.publish, url: post.url });
        }
    }
});


// controller to POST a new post to the DB
exports.create_post = asyncHandler(async (req, res, next) => {
    // check and validate the query args presence
    if (!req.body.title || !req.body.text) {
        // send error if args not valid/present
        res.sendStatus(400);
    } else {
        // args okay, create new Post object.
        const newPost = new Post({
            title: req.body.title,
            text: req.body.text,
            author: req.authData.author._id, // Get the Author's ID from the token
            likes: 0,
            published: false,
            imageURL: req.body.imageURL,
        });
        const createdPost = await newPost.save();
        res.json({ result: 'done', id: createdPost._id, url: createdPost.url });
    }
});


// controller to UPDATE a post in the DB
exports.update_post = asyncHandler(async (req, res, next) => {
    // check and validate the query args presence
    if (!req.params.postid || !isValidObjectId(req.params.postid) || !req.body.title || !req.body.text) {
        // send error if args not valid/present
        res.sendStatus(400)
    } else {
        // check if the post exists 
        const post = await Post.findById(req.params.postid).exec();
        if (!post) {
            // if the post does not exists in the DB, send not found error
            res.sendStatus(404);
        } else {
            // post exists and is valid, update the post accordingly
            post.title = req.body.title;
            post.text = req.body.text;
            post.imageURL = req.body.imageURL;
            await Post.findByIdAndUpdate(req.params.postid, post).exec();
            res.json({ result: 'done', url: post.url });
        }
    }
});


// controller to DELETE a post in the DB
exports.delete_post = asyncHandler(async (req, res, next) => {
    // checks to see if there is a postID and if the postID is a valid MongoDB Object
    if (!req.params.postid || !isValidObjectId(req.params.postid)) {
        // if not send error
        res.sendStatus(400);
    } else {
        // check if the post exists
        const post = await Post.findById(req.params.postid).exec();
        if (!post) {
            //if the post does not exists in the DB, send not found error
            res.sendStatus(404);
        } else {
            // posts exists and is valid, delete associated comments first
            await post.model('Comment').deleteMany({ post: post._id }).exec();
            // then delete the post
            await Post.deleteOne({ _id: req.params.postid }).exec();
            res.json({ result: 'done' });
        }
    }
});


// controller to DELETE a comment of a post
exports.delete_comment = asyncHandler(async (req, res, next) => {
    // checks to see if there is a postID & commentID and if the postID & commentID is valid MongoDB Objects
    if (!req.params.postid || !isValidObjectId(req.params.postid) || !req.params.commentid || !isValidObjectId(req.params.commentid)) {
        // if not send error
        res.sendStatus(400);
    } else {
        // check if the post and related comment exist
        const [post, comment] = [
            await Post.findById(req.params.postid).exec(),
            await Comment.findById(req.params.commentid).exec(),
        ];
        if (!post || !comment) {
            // if no post or no related comment exist, send not found error
            res.sendStatus(404);
        } else {
            // comment and post exits, delete the related comment
            await Comment.findByIdAndDelete(req.params.commentid).exec();
            res.json({ result: 'done' });
        }
    }
});

// controller to create a new author
exports.create_author = asyncHandler(async (req, res, next) => {

    // check if the username already exists
    const existingAuthor = await Author.findOne({ username: req.body.username }).exec();
    if (existingAuthor) {
        // if the username already exists, send a conflict error
        return res.sendStatus(409).json({ error: 'Username already exists' });
    } else {
        // generate a password with the genPassword function using the req body password data
        const saltHash = genPassword(req.body.password);
        // extract the salt and hash values to be saved with the newAuthor object
        const salt = saltHash.salt;
        const hash = saltHash.hash;
        // create a new Author instance with req body username data
        const newAuthor = new Author({
            username: req.body.username,
            salt: salt,
            hash: hash,
        });
        // save the new Author instance in the DB
        await newAuthor.save();
        res.json({ result: 'done'});
    }
});

