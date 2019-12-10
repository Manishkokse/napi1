var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var PreTestSchema =  new Schema({
	employer_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Employer',
		},	
	company_profile_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Company',
	},
	job_post_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'JobPosting',
	},
	candidates: [{
	jobseeker_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Jobseeker',
		},
	}],
	
}, { strict : false });

module.exports = mongoose.model('PreTest',PreTestSchema,'pre_tests');
