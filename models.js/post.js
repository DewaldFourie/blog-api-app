const mongoose = require('mongoose');

// New DB Schema for creating a new Blog Post
const postSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            maxLength: 50,
        },
        text: {
            type: String,
            required: true,
            maxLength: 2000,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Author',
            required: true,
        },
        likes: {
            type: Number,
            min: 0,
            default: 0,
        },
        published: {
            type: Boolean,
            default: false,
        }
    }, 
    { 
        timestamps: true 
    },
)

const Post = mongoose.model('Post', postSchema);

export default Post;