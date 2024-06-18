const mongoose = require('mongoose');

// DB Schema for creating a new Author
const authorSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            unique: true,
            required: true,
        },
        hash: {
            type: String,
            required: true,
        },
        salt: {
            type: String,
            required: true,
        }
    },
    {
        timestamps: true
    },
);

// Extending the Schema with a hook to implement cascade deleting for all 
// posts associated with the author if a author is deleted
authorSchema.pre('remove', function(next) {
    this.model('Post').deleteMany({ author: this._id }, next)
});

module.exports = mongoose.model('Author', authorSchema);
