const { isValidObjectId } = require('mongoose');
const Post = require('../models/post');
const Comment = require('../models/comment');
const Like = require('../models/like');
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


// controller to POST a like to a post in the DB
exports.post_like = asyncHandler(async (req, res, next) => {
    // check to  see if there is a postID and if the postID is valid
    if (!req.params.postid || !isValidObjectId(req.params.postid)) {
        // if not, send error
        return res.status(400).json({ message: 'invalid post ID' });
    } else {
        // set the userID from the headers
        const userId = req.headers['x-user-id'];
        // check to see if there is a userID
        if (!userId) {
            // if not , send error
            return res.status(400).json({message: 'User ID is required'});
        } else {
            const post = await Post.findById(req.params.postid).exec()
            // check if the post exists and is published
            if (!post) {
                // if not, send not found error
                return res.status(404).json({ message: 'Post not found' });
            } else {
                // if there is a post, check to see if it is published or not
                if (!post.published) {
                    //if not, send forbidden error
                    return res.status(403).json({ message: 'Post not published' });
                } else {
                    // post is published, check if the user has already liked the post
                    const existingLike = await Like.findOne({ userId, postId: req.params.postid }).exec();
                    if (existingLike) {
                        // user has already liked the post, send error
                        return res.status(400).json({ message: 'User has already liked this post' });
                    } else {
                        // user has not yet liked this post
                        // Increment the post's like count and save to DB
                        post.likes += 1;
                        await post.save();
                        // Record the like in the Like model and save to DB
                        const newLike = new Like({ userId, postId: req.params.postid });
                        await newLike.save();
                        // Respond with a success JSON result
                        res.json({ message: 'Like recorded', result: 'done' });
                    }
                }
            }
        }
    }
})

// controller to check if a user has liked a post
exports.check_like = asyncHandler(async (req, res, next) => {
    // check to  see if there is a postID and if the postID is valid
    if (!req.params.postId || !isValidObjectId(req.params.postid)) {
        // if not, send error
        return res.status(400).json({ message: 'invalid post ID' });
    } else {
        // set the userID from the headers
        const userId = req.headers['x-user-id'];
        // check to see if userID exists
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        } else {
            const existingLike = await Like.findOne({ userId, postId: req.params.postId}).exec();
            // check to see if there is an existing like from the user, if yes, return true, else false
            if (existingLike) {
                return res.json({ liked: true });
            } else {
                return res.json({ liked: false });
            }
        }
    }
});
