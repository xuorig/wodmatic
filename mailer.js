var path           = require('path')
var templatesDir   = path.join(__dirname, 'templates')
var emailTemplates = require('email-templates');
var sendgrid  = require('sendgrid')(process.env.SENDGRID_USER, process.env.SENDGRID_PASS);


var sendWodToUser = function(email, wod) {
  emailTemplates(templatesDir, function(err, template) {

    var locals = {
      site: wod.site,
      date: wod.date,
      content: wod.content
    };

    var payload = {
      to      : email,
      from    : 'wodmatic@wodmatic.co',
      subject : 'Your Daily Workout By WodmMatic',
      text    : wod.content
    };

    template('wod-email', locals, function(err, html, text) {
      payload.html = html;
      sendgrid.send(payload, function(err, json) {
        if (err) { console.error(err); }
        console.log(json);
      });
    });
  
  });
}

var sendWelcomeEmail= function(email) {
  emailTemplates(templatesDir, function(err, template) {

    var locals = {};

    var payload = {
      to      : email,
      from    : 'wodmatic@wodmatic.co',
      subject : 'Thanks for registering to wodmatic',
      text    : 'Thank you for registering to wodmatic'
    };

    template('welcome-mail', locals, function(err, html, text) {
      payload.html = html;
      sendgrid.send(payload, function(err, json) {
        if (err) { console.error(err); }
        console.log(json);
      });
    });
  
  });
}

module.exports = {
  sendWodToUser: sendWodToUser,
  sendWelcomeEmail: sendWelcomeEmail
};


