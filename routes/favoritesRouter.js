const express = require('express');
const cors = require('./cors');
const authenticate = require('../authenticate');
const Campsite = require('../models/campsite');
const Favorite = require('../models/favorite');

const favoriteRouter = express.Router();

favoriteRouter.route('/')
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({user: req.user._id})
    .populate('user')
    .populate('campsite')
    .then(favorite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
    // pass the result (user's Fav doc OR null) into the .then method
    .then(favorite => {
        // check user's favorite doc exists
        if (favorite) {
            // if it does, check each element of req.body array
            req.body.forEach(id => {
                // if it is not included in the user's campsites array, add it
                if (!favorite.campsites.includes(id._id)) {
                    favorite.campsites.push(id._id);
                }
            });
            // once the forEach loop has finished, save favorite to the db, close out response:
            favorite.save();
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
        } else {
            // if the faves doc does not exist, create it and push req.body array to campsites
            Favorite.create({ user: req.user._id })
            .then(favorite => {
                req.body.forEach(id => {
                    favorite.campsites.push(id._id);
                });
                favorite.save();
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch(err => next(err));
        }
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({user: req.user._id})
    .then(response => {
        if (response) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(response);
        } else {
            res.end('You do not have any favorites to delete');
        }
    })
});

favoriteRouter.route('/:campsiteId')
.get(cors.cors, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`GET operation not supported on ~/favorites/${req.params.campsiteId}`);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Campsite.find({}, {_id: 1})
    .then(campId => {
        let validIds = [];
        campId.forEach(id => {
            validIds.push(id._id.toString());
        });
        if(validIds.includes(req.params.campsiteId)){
            console.log("If Statement: true");
            Favorite.findOne({ user: req.user._id })
            .then(favorite => {
                // if the user has a valid favorite page...
                if (favorite) {
                    // verify campsite id is not already included in array
                    if (!favorite.campsites.includes(req.params.campsiteId)) {
                        // add campsiteId to the favorite campsites array
                        favorite.campsites.push(req.params.campsiteId);
                        favorite.save()
                        .then(favorite => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                        .catch(err => next(err));
                    } else {
                        res.statusCode = 403;
                        res.end(`${req.params.campsiteId} is already a favorite campsite.`)
                    }
                } else {
                    // create the user's favorite doc
                    Favorite.create({ user: req.user._id })
                    .then(favorite => {
                        // add campsiteId to the favorite campsites array
                        favorite.campsites.push(req.params.campsiteId);
                        favorite.save()
                        .then(favorite => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                        .catch(err => next(err));
                    })
                    .catch(err => next(err));
                }
            })
        } else {
            console.log("If Statement False");
            res.statusCode = 403;
            res.end(`${req.params.campsiteId} is not a valid campsite ID.`)
        }
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on ~/favorites/${req.params.campsiteId}`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    // get the User's favorite document
    Favorite.findOne({user: req.user._id})
    .then(favorite => {
        // if document exists
        console.log("favorite campsites: " + favorite.campsites);
        if (favorite){
            // check that campsiteId is listed in user's favorite campsites array
            if (favorite.campsites.includes(req.params.campsiteId)) {
                favorite.campsites = favorite.campsites.filter(id => id.toString() !== req.params.campsiteId);
                favorite.save()
                .then(favorite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
                .catch(err => next(err));
            } else {
                res.statusCode = 403;
                res.end(`CampsiteId(${req.params.campsiteId}) is not a listed favorite.`);
            }
        } else {
            res.statusCode = 403;
            res.end('User does not have a favorites document.');
        }
    })
});

module.exports = favoriteRouter;