var express = require('express');
var router = express.Router();
var User     = require('../models/user');

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
      res.status(201).send("User Created");
    }
  })
  
});

module.exports = router;
