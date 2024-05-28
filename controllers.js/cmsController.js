const Author = require('../models.js/author');
const Post = require('../models.js/post');
const comment = require('../models.js/comment');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const { isValidObjectId } = require('mongoose');


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
            // there is a post, update the post attribute published to true
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
            author: req.authData.user._id, // Get the User's ID from the token
            likes: 0,
            published: false,
        });
        const createdPost = await newPost.save();
        res.json({ result: 'done', id: createdPost._id, url: createdPost.url });
    }
});


// controller to Update a post in the DB
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
            await Post.findByIdAndUpdate(req.params.postid, post).exec();
            res.json({ result: 'done', url: post.url });
        }
    }
});