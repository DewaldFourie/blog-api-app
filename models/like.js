const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true
        },
        postId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
            required: true,
        }
    }, 
    {
        timestamps: true
    },
)

module.exports = mongoose.model('Like', likeSchema);