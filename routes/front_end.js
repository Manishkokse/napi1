var mongoose = require("mongoose");
var jwt    = require('jsonwebtoken');
var md5 = require('md5');
var url = require('url');
var mime = require('mime');

var Employer = require('../models/employer');
var ScheduledInterview = require('../models/ScheduledInterview');
var JobPosting = require('../models/jobposting');
var Jobseeker = require('../models/jobseeker');
var Company = require('../models/company');

var Test = require('../models/test');
var PreTest = require('../models/pre_test');

var Location = require('../models/location');

module.exports = function(app) {

app.get('/recent-jobs',(req, res) => {
	JobPosting.find({status:'Active',is_approved:true,archived:false})
	.sort({date_created: -1})
	.limit(Number(9))
	//.populate("company_profile_id")
	 .populate('company_profile_id','company_name company_logo')
 	 .select('technology company_profile_id.company_name company_profile_id.company_logo job_title salary salary1 education industry experience city country job_desc salary_as_per_industry  curr_type compensation job_level job_type')
	.exec(function (err, jobs) {
		if(err){
			res.json({"success":false,"message":"Not found"});
		}
		else{
			if(jobs){
				res.json({"success":true,"message":"Data found","data":jobs});
			}
			else{
				res.json({"success":false,"message":"Not found"});
			}
			
		}

	});
	
});

app.get('/jobs-by-company/:id',(req, res) => {
	var id = req.params.id;
	JobPosting.find({company_profile_id: mongoose.Types.ObjectId(req.params.id), status:'Active',is_approved:true,archived:false})
	.sort({date_created: -1})
	.limit(Number(5))
	.populate("company_profile_id")
	.exec(function (err, jobs) {
		if(err){
			res.json({"success":false,"message":"Not found"});
		}
		else{
			if(jobs){
				res.json({"success":true,"message":"Data found","data":jobs});
			}
			else{
				res.json({"success":false,"message":"Not found"});
			}
			
		}

	});
	
});

app.get('/top-employers',(req, res) => {
	Employer.find({is_active:'Active',is_approved:true})
	.sort({date_created: -1})
	.limit(Number(5))
	.populate("company_profile_id")
	.exec(function (err, employers) {
		if(err){
			res.json({"success":false,"message":"Not found"});
		}
		else{
			if(employers){
				res.json({"success":true,"message":"Data found","data":employers});
			}
			else{
				res.json({"success":false,"message":"Not found"});
			}
			
		}

	});
	
});

app.get('/top-companies',(req, res) => {
	Company.find()
	.sort({date_created: -1})
	.limit(Number(5))
	//.populate("company_profile_id")
	.exec(function (err, companies) {
		if(err){
			res.json({"success":false,"message":"Not found"});
		}
		else{
			if(companies){
				res.json({"success":true,"message":"Data found","data":companies});
			}
			else{
				res.json({"success":false,"message":"Not found"});
			}
			
		}

	});
	
});


app.get('/job-detail/:id',(req, res) => {
	var id = req.params.id;
	JobPosting.find({ '_id': mongoose.Types.ObjectId(id)})
	.sort({date_created: -1})
	.populate("company_profile_id")
	.exec(function (err, job) {
		if(err){
			res.json({"success":false,"message":"Not found"});
		}
		else{
			if(job){
				res.json({"success":true,"message":"Data found","data":job});
			}
			
		}

	});
	
});

app.post('/related-job',(req, res) => {
	
	var industry = req.body.industry;
	var func_area = req.body.func_area;
	console.log(func_area);
	console.log(industry);
	JobPosting.find({'industry':industry,'fun_area':func_area,'status':'Active','is_approved':true,archived:false})
		.limit(Number(5))
		.sort({date_created:'desc'})
		.populate("company_profile_id")
		.select('job_title city job_type date_created fun_area short_desc')
		.exec(function(err, jobs) {
			//console.log(jobs);
			if(err){
				res.json({"success":false,"message":"Not found"});
			}
			else{
				if(jobs){
					res.json({"success":true,"message":"Data found","data":jobs});
				}
				else{
					res.json({"success":true,"message":"Data not found","data":''});
				}
			}
		});
	
	
});


app.get('/job_test_exist/:id',(req, res) => {
          console.log(req.params.id)
           PreTest.findOne({'job_post_id': mongoose.Types.ObjectId(req.params.id),'is_deleted':false},{'_id':1})
           //.select('candidates.$.jobseeker_id')
           .exec(function(err, test) {
      	console.log(test);
          if(err){
            res.json({"success":false,"message":"Not found"});
          }
          else{
            if(test){
              res.json({"success":true,"message":"Data found","data":test});
            }
            else{
              res.json({"success":true,"message":"Data not found","data":''});
            }
          }
        });
          });

app.get('/autocomplete_cities/:query',(req, res) => {
	var query = req.params.query;
	Location.aggregate([
	{ $unwind : "$states" },
	{ $unwind : "$states.cities" },
	{$match: {
		"states.cities.name":  new RegExp('^'+query+'', "i") ,
	}},
	{ $project: {
		"name":1,
		"states.name":1,
		"states.cities.name":1,
	}
	}],function(err,results) {
		if(err){
			res.json({"success":false,"data":0});
		}
		if(results){
			res.json({"success":true,"data":results});
		}
		else{
			res.json({"success":false,"data":0});
		}
	});
});


app.post('/mime_type_to_extension',(req, res) => {

	var mType = req.body.mime_type;
	if(mType){
		var ext = mime.getExtension(mType);  
		res.json({"success":true,"data":ext});
	}
	else{
		res.json({"success":false,"data":""});
	}
	
	
});
	
};
