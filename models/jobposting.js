var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var Schema = mongoose.Schema;
var JobPostingSchema =  new Schema({
 company_profile_id:{
		type: mongoose.Schema.Types.ObjectId,
            ref: 'Company',
        },
 bookmark: [{
        jobseeker_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Jobseeker',
        },
        applied_date: Date
  }],
   applied: [{
        jobseeker_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Jobseeker',
        },
        applied_date: Date
  }],

}, { strict : false, toObject: { virtuals: true } , toJSON: { virtuals: true } });

JobPostingSchema.virtual('scheduled_interviews', {
  ref: 'ScheduledInterview', // The model to use
  localField: 'applied.jobseeker_id', // Find people where `localField`
  foreignField: 'jobseeker_id', // is equal to `foreignField`
  // If `justOne` is true, 'members' will be a single doc as opposed to
  // an array. `justOne` is false by default.
  justOne: false
});

JobPostingSchema.plugin(deepPopulate);
module.exports = mongoose.model('JobPosting',JobPostingSchema,'job_posting');
