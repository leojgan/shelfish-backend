const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const passport = require('passport');
const config = require('./config');
// const axios = require('axios');

const indexRouter = require('./routes/index');
const libraryRouter = require('./routes/libraryRouter');
const userRouter = require('./routes/userRouter');
const uploadRouter = require('./routes/uploadRouter');

// Spin up Mongoose connection to MongoDB
const mongoose = require('mongoose');
const url = config.mongoUrl;
const connectMongo = mongoose.connect(url, {
  useCreateIndex: true,
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true
});

connectMongo.then(
  () => console.log('Connection to shelfish collection in the MongoDB server successful.'), // first argument, what to do once Promise is resolved
  err => console.log(err) // second argument, what to do if Promise throws an error
);

const app = express();

// Secure traffic only

app.all('*', (req, res, next) => {
  if (req.secure) {
    return next();
  } else {
    console.log(`Redirecting to: https://${req.hostname}:${app.get('secPort')}${req.url}`);
    res.redirect(301, `https://${req.hostname}:${app.get('secPort')}${req.url}`);
  }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());


app.use(passport.initialize());

app.use('/', indexRouter);
app.use('/user', userRouter);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/library', libraryRouter);
app.use('/imageUpload', uploadRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
