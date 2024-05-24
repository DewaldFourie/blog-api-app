const { isValidObjectId } = require('mongoose');
const Post = require('../models.js/post');
const Comment = require('../models.js/comment');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');


// controller to GET the last N number of post list from the DB
exports.get_last_post_list = asyncHandler(async (req, res, next) => {
    // check to see if the post N number is valid
    if (!req.params.number || req.params.number <=0) {
        // if not send error
        res.sendStatus(400);
    } else {
        // fetch the posts
        const posts = await Post.find({ 'published': true })
            .sort({ 'createdAt': -1 })
            .limit(req.params.number)
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
    }
});



// controller to GET all posts list from the DB
exports.get_posts_list = asyncHandler(async (req, res, next) => {
    // fetch the posts
    const posts = await Post.find({ 'published': true })
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
        res.send(400);
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
            // check to see if the post is published
            if (!post.published) {
                // if not, send forbidden error
                res.sendStatus(403);
            } else {
                // there is a post and it is published, respond with json format of posts and comments
                res.json({ post, comments });
            }
        }
    }
});



// controller to POST a new comment to the DB
exports.post_comment = asyncHandler(async (req, res, next) => {
    // checks to see if there is a postID and if the postID is valid and if the required fields are provided
    if (!req.params.postid || !isValidObjectId(req.params.postid) || !req.body.author || !req.body.text) {
        // if not, send error
        res.sendStatus(400);
    } else {
        const post = await Post.findById(req.params.postid).populate('author', 'username').exec()
        // check to see if there is a post
        if (!post) {
            // if not, send not found error
            res.sendStatus(404);
        } else {
            // if there is a post, check to see if it is published or not
            if (!post.published) {
                // if not, send forbidden error
                res.sendStatus(403);
            } else {
                // post is published, create a new comment object
                const comment = new Comment({
                    author: req.body.author,
                    text: req.body.text,
                    post: req.params.postid,
                    likes: 0,
                });

                // save the new comment to the DB and respond with a json result
                await comment.save();
                res.json({ result: 'done' });
            } 
        }
    }
});