var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var JobseekerSchema =  new Schema({
	employer_bookmarks: [{
	employer_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Employer',
		},
	job_post_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'JobPosting',
		},

	}],
}, { strict : false, toObject: { virtuals: true } , toJSON: { virtuals: true } });

JobseekerSchema.virtual('scheduled_interviews', {
  ref: 'ScheduledInterview', // The model to use
  localField: '_id', // Find people where `localField`
  foreignField: 'jobseeker_id', // is equal to `foreignField`
  // If `justOne` is true, 'members' will be a single doc as opposed to
  // an array. `justOne` is false by default.
  justOne: false
});

JobseekerSchema.virtual('block_company', {
  ref: 'BlockCompany', // The model to use
  localField: '_id', // Find people where `localField`
  foreignField: 'jobseeker_id', // is equal to `foreignField`
  // If `justOne` is true, 'members' will be a single doc as opposed to
  // an array. `justOne` is false by default.
  justOne: false
});

module.exports = mongoose.model('Jobseeker',JobseekerSchema,'jobseeker');
