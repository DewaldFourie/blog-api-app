const mongoose = require('mongoose');

// DB Schema for creating a new Author
const authorSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            unique: true,
            required: true,
        },
        password: {
            type: String,
            required: true,
        }
    },
    {
        timestamps: true
    },
);

module.exports = mongoose.model('Author', authorSchema);
