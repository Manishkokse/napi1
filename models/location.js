var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var LocationSchema =  new Schema({}, { strict : false });
module.exports = mongoose.model('Location',LocationSchema,'locations');
