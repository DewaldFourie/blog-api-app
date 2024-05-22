const mongoose = require('mongoose');

// New DB Schema for creating a new Comment
const commentSchema = new mongoose.Schema(
    {
        author: {
            type: String,
            required: true,
            maxLength: 20,
        },
        text: {
            type: String,
            required: true,
            maxLength: 100,
        },
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
            required: true,
        },
        likes: {
            type: Number,
            min: 0,
            default: 0,
        },
    },
    {
        timestamps: true
    }
);

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;