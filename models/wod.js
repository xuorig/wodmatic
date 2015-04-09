var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var WodSchema = new Schema({
    site: String,
    date: Date,
    content: String,
    types: [String]
});

module.exports = mongoose.model('Wod', WodSchema);