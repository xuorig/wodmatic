var express = require('express');
var router = express.Router();
var User     = require('../models/user');
var mailer   = require('../mailer');

/* POST users listing. */
router.post('/', function(req, res, next) {
  var email = req.body.email;
  new User({
    email: email,
    types: ['S','G','C']
  })
  .save(function(err) {
    if (err) {
      res.status(400).send("Could not create user");
    } else {
      mailer.sendWelcomeEmail(email);
      res.render('registered', { title: 'wodmatic' });
    }
  })
  
});

module.exports = router;
