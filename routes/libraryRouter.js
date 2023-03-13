const express = require('express');
const authenticate = require('../authenticate');
const cors = require('./cors');
const Library = require('../models/library');

const libraryRouter = express.Router();

libraryRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    // find the User's document in the database
    Library.findOne({ userId: req.user._id })
    .then(library => {
        // return the array of gameIds from user.library
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(library.games);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /library');
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /library');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Library.findOne({ userId: req.user._id })
    .then(library => {
        library.games = [];
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(library);
    })
    .catch(err => next(err));
});

libraryRouter.route('/:gameId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get()
.post()
.put()
.delete();

module.exports = libraryRouter;