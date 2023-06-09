var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var majorRouter = require('./routes/major')
var friendsRouter = require('./routes/friends')
var courseRouter = require('./routes/course')
import connectToDatabase from "./config/db-connect";
import mongoose from "mongoose";
import { initCourseData, initMajorData, initUserData } from "./config/db-init";
import jwksRsa from 'jwks-rsa';
const { expressjwt: jwt } = require('express-jwt');
const cors = require('cors');

var app = express();

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: "https://dev-7wmg2yatswbx560y.us.auth0.com/.well-known/jwks.json"
  }),
  audience: "https://studybuddy",
  issuer: "https://dev-7wmg2yatswbx560y.us.auth0.com/",
  algorithms: ['RS256']
})

app.use(checkJwt)
app.use(cors())
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/major', majorRouter);
app.use('/friends', friendsRouter)
app.use('/courses', courseRouter)


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

connectToDatabase()
mongoose.connection.on('open', function (error) {
  if (error) {
    console.log("failed")
  } else {
    console.log("DB connection is successful")
  }
})
initUserData()
initMajorData()
initCourseData()

module.exports = app;
