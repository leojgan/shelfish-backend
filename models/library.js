const mongoose = require('mongoose');

const librarySchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            unique: true
        },
        games: {
            type: Array,
            required: false
        }
    },
);

const Library = mongoose.model('Library', librarySchema);
module.exports = Library;