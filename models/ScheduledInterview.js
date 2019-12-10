var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var Schema = mongoose.Schema;
var ScheduledInterviewSchema =  new Schema({
	 jobseeker_id:{
		type: mongoose.Schema.Types.ObjectId,
            ref: 'Jobseeker',
        },
        job_post_id:{
		type: mongoose.Schema.Types.ObjectId,
            ref: 'JobPosting',
        },
}, { strict : false });


ScheduledInterviewSchema.plugin(deepPopulate);
module.exports = mongoose.model('ScheduledInterview',ScheduledInterviewSchema,'scheduled_interviews');

