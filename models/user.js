const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstname: {
        type: String,
        default: ''
    },
    lastname:{
        type: String,
        default: ''
    },
    admin: {
        type: Boolean,
        default: false
    },
    facebookId: String,
});

userSchema.plugin(passportLocalMongoose);

// Here, we're exporting a new Mongoose model called User, and saying it uses the userSchema as a framework
module.exports = mongoose.model('User', userSchema);