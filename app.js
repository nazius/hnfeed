var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var monk = require('monk');
var db = monk('localhost:27017/hnfeed');
var newsCollection = db.get('news');  

var _ = require('lodash');
var cron = require('node-cron');
var axios = require('axios');

var indexRouter = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req,res,next){
  req.collection = db.get('news');
  next();
});

app.use('/', indexRouter);

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


const updateDocument = (news) => {
  newsCollection.findOne({'objectID': news.objectID})
    .then((doc) => {
      if(_.isNull(doc)){
        newsCollection.insert(news);
      }
    });
};

const requestNews = () => {
  axios.get('https://hn.algolia.com/api/v1/search_by_date?query=nodejs')
    .then(function (response) {
      _.forEach(_.get(response, 'data.hits'), (news) => { updateDocument(news) })
    })
    .catch(function (error) {
      console.log('error', error);
    })
}

cron.schedule('*/60 * * * *', () => { requestNews() });
requestNews()

module.exports = app;
