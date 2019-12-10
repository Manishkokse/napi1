var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var CompanySchema =  new Schema({}, { strict : false });
module.exports = mongoose.model('Company',CompanySchema,'company_profile');