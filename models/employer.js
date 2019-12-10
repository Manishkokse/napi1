var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var EmployerSchema =  new Schema({
	company_profile_id:{
		type: mongoose.Schema.Types.ObjectId,
            ref: 'Company',
        },
	bookmarks: [{
	jobseeker_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Jobseeker',
		},
	job_post_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'JobPosting',
		},

	}],
	
}, { strict : false, toObject: { virtuals: true } , toJSON: { virtuals: true } });

EmployerSchema.virtual('scheduled_interviews', {
  ref: 'ScheduledInterview', // The model to use
  localField: '_id', // Find people where `localField`
  foreignField: 'employer_id', // is equal to `foreignField`
  // If `justOne` is true, 'members' will be a single doc as opposed to
  // an array. `justOne` is false by default.
  justOne: false
});

module.exports = mongoose.model('Employer',EmployerSchema,'employer');
