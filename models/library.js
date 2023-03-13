const mongoose = require('mongoose');

const librarySchema = new mongoose.Schema(
    {
        user: {
            type: String,
            required: true,
            unique: true
        },
        library: {
            type: Array,
            required: false
        }
    },
);

const Library = mongoose.model('Library', librarySchema);
module.exports = Library;