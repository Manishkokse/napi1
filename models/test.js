var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var TestSchema =  new Schema({
	employer_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Employer',
		},	
		company_profile_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Company',
		},
		
	candidates: [{
	jobseeker_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Jobseeker',
		},
	}],
	
}, { strict : false });

module.exports = mongoose.model('Test',TestSchema,'tests');
