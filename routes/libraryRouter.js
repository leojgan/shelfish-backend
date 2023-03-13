const express = require('express');
const authenticate = require('../authenticate');
const cors = require('./cors');
const User = require('../models/user');
const axios = require('axios');
const bga = require('../bin/bgaUrls');

const libraryRouter = express.Router();
const bgaLibrary = bga.fields + 'id,name,year_published,min_players,max_players,min_playtime,max_playtime,min_age,thumb_url,average_user_rating,average_learning_complexity,average_strategy_complexity,description_preview' + bga.clientId;
// const bgaGame = bga.fields + 'id,name,year_published,min_players,max_players,min_playtime,max_playtime,min_age,image_url,mechanics,categories,average_user_rating,average_learning_complexity,average_strategy_complexity,description_preview&pretty=true' + bga.clientId;
// sans mechanics and categories:
const bgaGame = bga.fields + 'id,name,year_published,min_players,max_players,min_playtime,max_playtime,min_age,image_url,average_user_rating,average_learning_complexity,average_strategy_complexity,description_preview&pretty=true' + bga.clientId;

libraryRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    // find the User's document in the database
    User.findOne({ _id: req.user._id })
    .then(user => {
        if (user.library.length > 0) {
            axios.get(bga.apiRoot + user.library + bgaLibrary)
            .then(games => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(games.data);
            })
        } else {
            res.statusCode = 404;
            res.end(`User "${req.user.username}" does not have any games in the library.`);
        }        
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    User.findOne({ _id: req.user._id })
    .then(user => {
        console.log("gameIds:" + req.body.gameIds);
        req.body.gameIds.forEach(gameId => {
            if (!user.library.includes(gameId)) user.library.push(gameId);
        })
        user.save();
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(user.library);
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /library');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    User.findOne({ _id: req.user._id })
    .then(user => {
        user.library.splice(0, user.library.length)
        user.save();
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(user);
    })
    .catch(err => next(err));
});

libraryRouter.route('/:gameId')
.options(cors.corsWithOptions, authenticate.verifyUser, (req, res) => res.sendStatus(200))
.get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    console.log("BGA URL: " + bga.apiRoot + req.params.gameId + bgaGame);
    // res.end(`GET call on ~/library/${req.params.gameId} is working properly.`);
    axios.get(bga.apiRoot + req.params.gameId + bgaGame)
    .then(game => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(game.data);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    User.findOne({ _id: req.user._id })
    .then(user => {
        if(!user.library.includes(req.params.gameId)) {
            user.library.push(req.params.gameId);
            user.save();
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(user.library);
        } else {
            res.statusCode = 403;
            res.end(`The game ID "${req.params.gameId}" is already in ${req.user.username}'s library.`);
        }
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported for /library/${req.params.gameId}`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    User.findOne({ _id: req.user._id })
    .then(user => {
        const targetIndex = user.library.indexOf(req.params.gameId);
        if (targetIndex >= 0) {
            user.library.splice(targetIndex, 1)
            user.save()
                .then(user => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(user.library);
                })
                .catch(err => next(err));
        } else {
            res.statusCode = 403;
            res.end(`The game ID "${req.params.gameId}" is not in ${req.user.username}'s library.`);
        }
    })
    .catch(err => next(err));
});

module.exports = libraryRouter;