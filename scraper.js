var request = require('request');
var cheerio = require('cheerio');
var _       = require('underscore');
var Wod     = require('./models/wod');

var scrapeAll = function() {
  _getPageAndScrape('http://www.crossfit.com/', _scrapeCrossfitDotCom);
  _getPageAndScrape('http://theoutlawway.com/category/blog/', _scrapeOutlawWay);
  _getPageAndScrape('http://competitorstraining.com/', _scrapeCompetitorsTraining);
}

var _getPageAndScrape = function (url, scraperFunction) {
  request(url, function (error, response, html) {
    if (!error && response.statusCode == 200) {
      scraperFunction(cheerio.load(html));
    }
  });
}

var _scrapeCompetitorsTraining = function ($) {
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

  var newWod = new Wod({
    site: "Competitors Training",
    date: wodDate,
    content: wodContent,
    types: ['S', 'C', 'G']
  });

  console.log(newWod);

}

var _scrapeCrossfitDotCom = function ($) {
  var wodDate = Date.parse($('div.date').eq(1).text());
  var blogPost = $('div.blogbody').eq(1);
  var wodContent = blogPost.find('h3').next().text();

  var newWod = new Wod({
    site: "Crossfit.com",
    date: wodDate,
    content: wodContent,
    types: ['S', 'C', 'G']
  });

  console.log(newWod);

}

var _scrapeOutlawWay = function ($) {
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

  var newWod = new Wod({
    site: "The Outlaw Way",
    date: wodDate,
    content: wodContent,
    types: ['S', 'C', 'G']
  });

  console.log(newWod);
}


scrapeAll();