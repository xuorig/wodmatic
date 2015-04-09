var request = require('request');
var cheerio = require('cheerio');
var async   = require('async');
var _       = require('underscore');
var Wod     = require('./models/wod');
var User    = require('./models/user');
var mailer  = require('./mailer');
var mongoose   = require('mongoose');

mongoose.connect(process.env.MONGOLAB_URI); // connect to our database

var scrapeAll = function() {
  // Add all scrapers here
  async.parallel([
    function(callback) {
      _getPageAndScrape('http://www.crossfit.com/', _scrapeCrossfitDotCom, callback)
    },
    function(callback) {
      _getPageAndScrape('http://theoutlawway.com/category/blog/', _scrapeOutlawWay, callback)
    },
    function(callback) {
      _getPageAndScrape('http://competitorstraining.com/', _scrapeCompetitorsTraining, callback)
    }
  ],
  function(err, results){
      // send a random wod from what we scraped
      // TODO Pick using preferences
      var wod = results[Math.floor(Math.random() * results.length)];
      User.find({}, function(err, users) {
        _.each(users, function(user) {
          mailer.sendWodToUser(user.email, wod);
        })
      });
  });
}

_createAndSaveWod = function(site, date, content, types, callback) {
  var newWod = new Wod({
    site: site,
    date: date,
    content: content.replace('\n', '<br>'),
    types: types
  });
  //.save(function(err) {
  callback(null, newWod);
  //});
}

var _getPageAndScrape = function (url, scraperFunction, callback) {
  request(url, function (error, response, html) {
    if (!error && response.statusCode == 200) {
      scraperFunction(cheerio.load(html), callback);
    }
  });
}

var _scrapeCompetitorsTraining = function ($, callback) {
  var blogPost = $('article').first();
  var wodDate = blogPost.find('header').find('h1').find('a').text();
  wodDate = wodDate.split(" ")[1]; //m.dd.yy

  // Parse Date
  var m = wodDate.substr(0,1) - 1,
      d = wodDate.substr(2,2),
      y = '20' + wodDate.substr(5,2);
  wodDate = new Date(y,m,d);

  // Get Paragraphs without images
  var wodContent = blogPost.find('div.entry-content').find('p').filter(function(i, el) {
    return !$(this).find('img').length;
  }).text();

  _createAndSaveWod('Competitors Training', wodDate, wodContent, ['S','G','C'], callback);
}

var _scrapeCrossfitDotCom = function ($, callback) {
  var wodDate = Date.parse($('div.date').eq(1).text());
  var blogPost = $('div.blogbody').eq(1);
  var wodContent = blogPost.find('h3').next().text();

  _createAndSaveWod('Crossfit.com', wodDate, wodContent, ['S','G','C'], callback);
}

var _scrapeOutlawWay = function ($, callback) {
  var blogPost = $('article').first();
  var wodDate = blogPost.find('header.article-header').find('h2.entry-title').text();

  // Parse Date
  var y = '20' + wodDate.substr(0,2),
      m = wodDate.substr(2,2) - 1,
      d = wodDate.substr(4,2);
  wodDate = new Date(y,m,d);

  var wodContentSplitted = blogPost.find('section.entry-content').find('p');
  var wodBeginRegex = /^WOD [0-9]*:$/
  var beginIndex = 0;

  wodContentSplitted.each(function(i, p) {
    if($(this).text().match(wodBeginRegex)) {
      // Found beggining of WOD description, save index
      beginIndex = i;
    }
  });

  var wodContent = wodContentSplitted.slice(beginIndex).text();

  _createAndSaveWod('Outlaw Way', wodDate, wodContent, ['S','G','C'], callback);
}

scrapeAll();