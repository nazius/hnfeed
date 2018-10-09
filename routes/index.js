const express = require('express');
const router = express.Router();
const _ = require('lodash');
const moment = require('moment');

moment.updateLocale('en', {
  calendar: {
      sameDay: () => 'HH:mm a',
      lastDay: ()=> '[Yesterday]',
      lastWeek: () => 'MMM DD',
      sameElse: ()=> 'MMM DD'
  }
});

router.get('/', (req, res, next) => {
  req.collection.find({},{},(e, docs) => {
    res.render('index', {
        title: 'HN Feed',
        subtitle: 'We <3 hacker news!',
        news: _.orderBy(docs, ['created_at'], ['desc']),
        prettyDate: (date)=> moment(date).calendar()
    });
  });
});

router.post('/delete', (req, res, next) => {
  req.collection.findOneAndUpdate({ objectID: _.get(req, 'query.objectID') },{ $set: {deleted: true} })
  .then(() => {
    res.send({status: 200})
  })
  .catch(() => {
    res.send({status: 500})
  })
});

module.exports = router;
