const mongoose = require('mongoose');

const librarySchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User' 
        },
        games: [{
            type: Array,
            required: false
        }]
    },
);

const Library = mongoose.model('Library', librarySchema);
module.exports = Library;