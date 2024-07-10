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
            maxLength: 5000,
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
        },
        imageURL: {
            type: String,
        }
    }, 
    { 
        timestamps: true 
    },
)

// Extending the Schema with a hook to implement cascade deleting for all 
// comments associated with the post if a post is deleted
postSchema.pre('remove', function(next) {
    this.model('Comment').deleteMany({ post: this._id }, next)
});

module.exports = mongoose.model('Post', postSchema);