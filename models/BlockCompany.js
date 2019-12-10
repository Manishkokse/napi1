var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var Schema = mongoose.Schema;
var BlockCompanySchema =  new Schema({
	 jobseeker_id:{
		type: mongoose.Schema.Types.ObjectId,
            ref: 'Jobseeker',
        },        
}, { strict : false });


BlockCompanySchema.plugin(deepPopulate);
module.exports = mongoose.model('BlockCompany',BlockCompanySchema,'block_company');

