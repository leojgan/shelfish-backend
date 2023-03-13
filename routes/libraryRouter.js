const express = require('express');
const authenticate = require('../authenticate');
const cors = require('./cors');
const Library = require('../models/library');
const axios = require('axios');
const bga = require('../bin/bgaUrls');

const libraryRouter = express.Router();
const bgaLibrary = bga.fields + 'id,name,year_published,min_players,max_players,min_playtime,max_playtime,min_age,thumb_url,average_user_rating,average_learning_complexity,average_strategy_complexity,description_preview' + bga.clientId;
const bgaGame = bga.fields + 'id,name,year_published,min_players,max_players,min_playtime,max_playtime,min_age,image_url,mechanics,categories,average_user_rating,average_learning_complexity,average_strategy_complexity,description_preview&pretty=true' + bga.clientId;

libraryRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    // find the User's document in the database
    Library.findOne({ userId: req.user._id })
    .then(library => {
        // return the array of gameIds from user.library
        // *** Add in API call to BGA for library page game info (name, year, )
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
.get(cors.corsWithOptions, (req, res, next) => {
    console.log("BGA URL: " + bga.apiRoot + req.params.gameId + bgaGame);
    axios.get(bga.apiRoot + req.params.gameId + bgaGame)
    .then(game => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(game.data);
    })
    .catch(err => next(err));
})
.post()
.put()
.delete();

module.exports = libraryRouter;