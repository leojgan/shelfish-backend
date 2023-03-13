const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    library: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Library'
    },
    facebookId: String,
});

userSchema.plugin(passportLocalMongoose);

// Here, we're exporting a new Mongoose model called User, and saying it uses the userSchema as a framework
module.exports = mongoose.model('User', userSchema);