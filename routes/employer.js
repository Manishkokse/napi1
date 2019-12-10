var mongoose = require("mongoose");
var jwt    = require('jsonwebtoken');
var md5 = require('md5');
var Employer = require('../models/employer');
var ScheduledInterview = require('../models/ScheduledInterview');
var JobPosting = require('../models/jobposting');
var Jobseeker = require('../models/jobseeker');
var Test = require('../models/test');
var PreTest = require('../models/pre_test');
var BlockCompany = require('../models/BlockCompany');
module.exports = function(app,checkEmpAuth) {

app.post('/employer_login',(req, res) => {
	//console.log(req.body);
	Employer.findOne({
		email: req.body.email
	}, function(err, user) {

		if (err) throw err;

		if (!user) {
			res.json({ success: false, message: 'Authentication failed. User not found.' });
		} else if (user) {
			// to convert json values into double quoted string
			user = JSON.stringify(user);
			user = JSON.parse(user);				
			enc_password = md5(req.body.password);			
			if (user.password != enc_password) {				
				res.json({ success: false, message: 'Authentication failed. Wrong password.' });
			} else {

				// if user is found and password is right
				// create a token
				var payload = {
					employer: true
				}
				var token = jwt.sign(payload, app.get('superSecret'), {
					expiresIn: 86400 // expires in 24 hours
				});

				res.json({
					success: true,
					message: 'Enjoy your token!',
					token: token
				});
			}
		}

	});
});

app.get('/bookmarks/:employer_id',checkEmpAuth,(req, res) => {
	var id = req.params.employer_id;
	//console.log(id);
	var cDate = new Date();
	if(id){
		Employer.findOne({ '_id': mongoose.Types.ObjectId(id) },'fname')
		//.populate('bookmarks','fname lname email mobile personal_info.keyword resume')  
		.populate({
			path: 'bookmarks.jobseeker_id',			
			select : '_id fname lname email mobile personal_info.keyword resume',
			populate: {
				path: 'scheduled_interviews',
				match: {employer_id: mongoose.Types.ObjectId(id),interview_date: {'$gte':cDate } }
			} 
		})
		.populate({
			path: 'bookmarks.job_post_id',
			select : '_id job_title fun_area city'
		})		
		.exec(function (err, employer) {
			if(err){
				res.json({"success":false,"message":"Not found"});
			}
			//console.log(employer);
			res.json({"success":true,"message":"Data found","data":employer});
		});
		
	}
	else{
		res.json({"success":false,"message":"Please provide employer id"});
	}
});
	
app.get('/jobappliers/:employer_id',checkEmpAuth,(req, res) => {
	var id = req.params.employer_id;
	console.log(id);
	if(id){
		var cDate = new Date();
		//console.log(cDate);
		JobPosting.find({'employer_id':mongoose.Types.ObjectId(id)},'job_title job_type applied')
		.populate({
			path: 'applied.jobseeker_id',
			select: 'fname lname email mobile personal_info.city',
			populate: {
				path: 'scheduled_interviews',
				match: { interview_date: {'$gte':cDate } }
			}
		})
		.populate("company_profile_id")
		.exec(function (err, jobs) {
			if(err){
				res.json({"success":false,"message":"Not found"});
			}
			else{
				//console.log(jobs);
				res.json({"success":true,"message":"Data found","data":jobs});
			}
			
		});
	}
	else{
		res.json({"success":false,"message":"Please provide employer id"});
	}
});

app.get('/total-applied-counts/:employer_id',checkEmpAuth,(req, res) => {
var id = req.params.employer_id;
if(id){

	JobPosting.aggregate([
	{ $unwind : "$applied" },
	{$match: {
		employer_id: mongoose.Types.ObjectId(id),
	}},
	{ $group: {
		_id: '',
		count: { $sum: 1 }
	}
	}],function(err,results) {
		if(err){
			res.json({"success":false,"data":0});
		}
		if(results.length > 0){
			res.json({"success":true,"data":results[0].count});
		}
		else{
			res.json({"success":false,"data":0});
		}
	});
}
else{
	res.json({"success":false,"message":"Please provide employer id"});
}
});
	
app.get('/upcoming-interviews-counts/:employer_id',checkEmpAuth,(req, res) => {
var employer_id = req.params.employer_id;
var cDate = new Date();
var lDate = new Date(cDate.getTime() + (7 * 24 * 60 * 60 * 1000));
console.log(cDate+"--"+lDate);
	
if(employer_id){

	ScheduledInterview.aggregate([
	//{ $unwind : "$applied" },
	{$match: {
		employer_id: mongoose.Types.ObjectId(employer_id),
		interview_date : {'$gte':cDate, '$lte':lDate}
	}},
	{ $group: {
		_id: '',
		count: { $sum: 1 }
	}
	}],function(err,results) {
		//console.log(results);
		if(err){
			res.json({"success":false,"data":0});
		}
		if(results.length > 0){
			res.json({"success":true,"data":results[0].count});
		}
		else{
			res.json({"success":false,"data":0});
		}
		
	});
}
else{
	res.json({"success":false,"message":"Please provide employer id"});
}
});
	
app.get('/employers',checkEmpAuth,(req, res) => {
  Employer.find({})
            //.populate('postedBy')
            .exec(function(error, users) {
              res.json({ users: users});
               //console.log(JSON.stringify(posts, null, "\t"))
   });
});
	
app.post('/search_resumes',checkEmpAuth,(req, res) => {
	var employer_id = req.body.employer_id || null;
	var company_id = req.body.company_id || null;
	var keyword =  req.body.keyword || null;
	var education =  req.body.education || null;
	var country =  req.body.country || null;
        var city =  req.body.city || null;
	var profile_type =  req.body.profile_type || null;
	
	var cond = {};
	var cDate = new Date();
	//console.log(employer_id);
	if(keyword){
		 
		cond["personal_info.keyword"] = {"$regex": new RegExp("^" + keyword+".*","i")};
	}	
	if(education){
		cond["education_details.qualification"] = education;
	}
	if(country){
		//cond["personal_info.country"] = new RegExp('^'+country+'', "i");
		cond["personal_info.country"] = country;
	}
	if(city){
		//cond["personal_info.city"] = new RegExp('^'+city+'', "i");
		if(city=='National Capital Reg- All'){
		 city = ["National Capital Reg- Caloocan City","National Capital Reg- Makati city","National Capital Reg- Las Pinas City","National Capital Reg- Malabon City","National Capital Reg- Mandaluyong City","National Capital Reg- Manila City","National Capital Reg- Marikina City","National Capital Reg- Muntinlupa City","National Capital Reg- Navotas City","National Capital Reg- Paranaque City","National Capital Reg- Pasay City","National Capital Reg- Pasig City","National Capital Reg- Pateros City","National Capital Reg- Quezon City","National Capital Reg- San Juan City","National Capital Reg- Taguig City","National Capital Reg- Valenzuela City"];
                 console.log("LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL");
		cond["personal_info.city"]={"$in": city};
		}else{
                console.log("IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII");
		cond["personal_info.city"] = city;
		}
		
	}
	if(profile_type){
		cond["profile_type"] = profile_type;
	}
	//cond["job_alert_setting.looking_job"] = 'yes';
	console.log(cond);
	if(keyword || education || country || profile_type){
		//console.log(req.body);
		Jobseeker.find(cond,'fname lname email mobile visibility education_details.qualification personal_info.pre_city')
		.populate({
			path: 'employer_bookmarks.employer_id',
			match: { _id: mongoose.Types.ObjectId(employer_id)},
			select : '_id fname lname',
			options: { limit: 1 }
			

		})
		.populate({
			path: 'scheduled_interviews',
			match: {employer_id: mongoose.Types.ObjectId(employer_id), interview_date: {'$gte':cDate } }
		})
		.populate({
			path: 'block_company',
			match: {company_id: mongoose.Types.ObjectId(company_id)}
		})
		.exec(function (err, jobseekers) {
			if(err){
				res.json({"success":false,"message":"Not found"});
			}
			else{
				//console.log(jobs);
				res.json({"success":true,"message":"Data found","data":jobseekers});
			}			
		});
	}
	else{
		res.json({"success":false,"message":"Not found, Provide some filter"});
	}
	
});
	
app.get('/tests_list/:employer_id',checkEmpAuth,(req, res) => {
	var id = req.params.employer_id;
	console.log(id);
	if(id){
		var cDate = new Date();
		//console.log(cDate);
		Test.find({'employer_id':mongoose.Types.ObjectId(id),'is_deleted':false})
		.populate({
			path: 'candidates.jobseeker_id',
			select: 'fname lname email mobile personal_info.city',			
		})		
		.exec(function (err, tests) {
			if(err){
				res.json({"success":false,"message":"Not found"});
			}
			else{
				if(tests){
					res.json({"success":true,"message":"Data found","data":tests});
				}
				else{
					res.json({"success":false,"message":"Not found"});
				}
			}
			
		});
	}
	else{
		res.json({"success":false,"message":"Please provide employer id"});
	}
});	


	
app.get('/answers_detail/:test_id/:jobseeker_id',checkEmpAuth,(req, res) => {
	var test_id = req.params.test_id;
	var jobseeker_id = req.params.jobseeker_id;
	
	if(test_id && jobseeker_id){
		
	/*
	///// Tried aggregate ////////	
	Test.aggregate([	
	{$match: {
		"_id": mongoose.Types.ObjectId(test_id),
		"candidates.jobseeker_id": mongoose.Types.ObjectId(jobseeker_id),
		"is_deleted":false,
	}},
	
	],function(err,results) {
		console.log(result);
		if(err){
			res.json({"success":false,"data":0});
		}
		if(results.length > 0){
			res.json({"success":true,"data":results});
		}
		else{
			res.json({"success":false,"data":0});
		}
	});
	///// Tried aggregate ////////
	*/
	Test.findOne(
		{
			'_id':mongoose.Types.ObjectId(test_id),
			'candidates.jobseeker_id':mongoose.Types.ObjectId(jobseeker_id),
			'is_deleted':false},
		{
			'name':1,'questions':1,
			'candidates.jobseeker_id.$': 1,
			'candidates.answers':1,
			'candidates.expected_date':1,
			'candidates.finished':1,
			'candidates.finished_on':1,
			'candidates.resulted':1
		})
		.populate({
			path: 'candidates.jobseeker_id',
			select: 'fname lname email mobile personal_info.city',
		})
		.exec(function (err, test) {
			if(err){
				res.json({"success":false,"message":"Not found"});
			}
			else{
				if(test){
					test = JSON.stringify(test);
					test = JSON.parse(test);
					res.json({"success":true,"message":"Data found","data":test});
				}
				else{
					res.json({"success":false,"message":"Not found"});
				}
			}

		});
	}
	else{
		res.json({"success":false,"message":"Please provide test id and jobeeker id"});
	}
});

/*
app.get('/answers_detail/:test_id/:jobseeker_id',checkEmpAuth,(req, res) => {
	var test_id = req.params.test_id;
	var jobseeker_id = req.params.jobseeker_id;
	console.log(test_id);
	if(test_id && jobseeker_id){		
		Test.findOne({'_id':mongoose.Types.ObjectId(test_id),'candidates.jobseeker_id':mongoose.Types.ObjectId(jobseeker_id),'is_deleted':false},{ 'candidates.jobseeker_id.$': 1,'candidates.answers':1})
		.populate({
			path: 'candidates.jobseeker_id',
			select: 'fname lname email mobile personal_info.city',
		})
		.exec(function (err, test) {
			if(err){
				res.json({"success":false,"message":"Not found"});
			}
			else{
				if(test){
					test = JSON.stringify(test);
					test = JSON.parse(test);
					//console.log(JSON.stringify(test));					
					for(var i=0;i<test.candidates[0].answers.length;i++){
					
						Test.findOne({
						'_id':mongoose.Types.ObjectId(test_id),							
						'questions._id':mongoose.Types.ObjectId(test.candidates[0].answers[i].question_id),
						'is_deleted':false 
						}, 
						{'questions.$': 1,}, function (err2, question) {
							question = JSON.stringify(question);
							question = JSON.parse(question);
							console.log(i)
							test.candidates[0].answers[0].question_detail = {"data":"aa"};
						//	test.candidates[0].answers[i].question_detail = {"data":question};
						
						});					
						
						//test.candidates[0].answers[i].question_detail = {"aaa":"bbbb"};
						//console.log(test.candidates[0].answers[i]);
					}
					
					res.json({"success":true,"message":"Data found","data":test});
				}
				else{
					res.json({"success":false,"message":"Not found"});
				}
			}
			
		});
	}
	else{
		res.json({"success":false,"message":"Please provide test id and jobeeker id"});
	}
});
*/	
	
app.get('/test_result/:test_id/',checkEmpAuth,(req, res) => {
	var test_id = req.params.test_id;	
	if(test_id){	
	Test.findOne(
		{
			'_id':mongoose.Types.ObjectId(test_id),
			'is_deleted':false,
			"candidates.resulted":true,
		},
		{
			'name':1,
			'questions':1,
			'candidates': 1,
		})
		.populate({
			path: 'candidates.jobseeker_id',
			select: 'fname lname email mobile personal_info.city',
		})		
		.exec(function (err, test) {
			if(err){
				res.json({"success":false,"message":"Not found"});
			}
			else{
				if(test){
					test = JSON.stringify(test);
					test = JSON.parse(test);					
					res.json({"success":true,"message":"Data found","data":test});
				}
				else{
					res.json({"success":false,"message":"Not found"});
				}
			}
			
		});
	}
	else{
		res.json({"success":false,"message":"Please provide test id"});
	}
});

////////// Pre Assesment //////////
app.get('/pre_tests_list/:employer_id',checkEmpAuth,(req, res) => {
	var id = req.params.employer_id;
	console.log(id);
	if(id){
		var cDate = new Date();
		//console.log(cDate);
		PreTest.find({'employer_id':mongoose.Types.ObjectId(id),'is_deleted':false})
		.populate({
			path: 'candidates.jobseeker_id',
			select: 'fname lname email mobile personal_info.city',			
		})
		.populate({
			path: 'job_post_id',
			select: 'job_title',			
		})		
		.exec(function (err, tests) {
			if(err){
				res.json({"success":false,"message":"Not found"});
			}
			else{
				if(tests){
					res.json({"success":true,"message":"Data found","data":tests});
				}
				else{
					res.json({"success":false,"message":"Not found"});
				}
			}
			
		});
	}
	else{
		res.json({"success":false,"message":"Please provide employer id"});
	}
});

app.get('/pre_test_result/:test_id/',checkEmpAuth,(req, res) => {
	var test_id = req.params.test_id;	
	if(test_id){	
	PreTest.findOne(
		{
			'_id':mongoose.Types.ObjectId(test_id),
			'is_deleted':false,
			"candidates.resulted":true,
		},
		{
			'name':1,
			'questions':1,
			'candidates': 1,
		})
		.populate({
			path: 'candidates.jobseeker_id',
			select: 'fname lname email mobile personal_info.city',
		})
		.populate({
			path: 'job_post_id',
			select: 'job_title',			
		})
		.exec(function (err, test) {
			if(err){
				res.json({"success":false,"message":"Not found"});
			}
			else{
				if(test){
					test = JSON.stringify(test);
					test = JSON.parse(test);					
					res.json({"success":true,"message":"Data found","data":test});
				}
				else{
					res.json({"success":false,"message":"Not found"});
				}
			}
			
		});
	}
	else{
		res.json({"success":false,"message":"Please provide test id"});
	}
});

app.get('/pre_answers_detail/:test_id/:jobseeker_id',checkEmpAuth,(req, res) => {
	var test_id = req.params.test_id;
	var jobseeker_id = req.params.jobseeker_id;
	
	if(test_id && jobseeker_id){	
	PreTest.findOne(
		{
			'_id':mongoose.Types.ObjectId(test_id),
			'candidates.jobseeker_id':mongoose.Types.ObjectId(jobseeker_id),
			'is_deleted':false},
		{
			'name':1,'questions':1,
			'candidates.jobseeker_id.$': 1,
			'candidates.answers':1,
			'candidates.expected_date':1,
			'candidates.finished':1,
			'candidates.finished_on':1,
			'candidates.resulted':1
		})
		.populate({
			path: 'candidates.jobseeker_id',
			select: 'fname lname email mobile personal_info.city',
		})		
		.exec(function (err, test) {
			if(err){
				res.json({"success":false,"message":"Not found"});
			}
			else{
				if(test){
					test = JSON.stringify(test);
					test = JSON.parse(test);					
					res.json({"success":true,"message":"Data found","data":test});
				}
				else{
					res.json({"success":false,"message":"Not found"});
				}
			}
			
		});
	}
	else{
		res.json({"success":false,"message":"Please provide test id and jobeeker id"});
	}
});
///////// Pre Assessment Ends//////


app.get('/recommended_jobseekers/:id',checkEmpAuth,(req, res) => {

    var id=mongoose.Types.ObjectId(req.params.id);
	var cDate = new Date();
    //console.log(id);
	if(id){
	JobPosting.findOne({_id: id})
	.exec(function(error, jobDetail) {
		if(error){
			console.log(error);
			res.json({"success":false,"message":"Not found"});
		}
		else{
			if(jobDetail){
				jobDetail = JSON.stringify(jobDetail);
				jobDetail = JSON.parse(jobDetail);
				
				var employer_id = (jobDetail["employer_id"])?mongoose.Types.ObjectId(jobDetail["employer_id"]):null;
				var company_profile_id = (jobDetail["company_profile_id"])?mongoose.Types.ObjectId(jobDetail["company_profile_id"]):null;				
				var country = (jobDetail["country"])?jobDetail["country"]:[];
				var city = (jobDetail["city"])?jobDetail["city"]:[];
				var keywords = (jobDetail["technology"])?jobDetail["technology"]:[];
				console.log(keywords);
				
				////////////////////
				keywordsRegex=[];
				if(keywords){
					keywordsRegex = keywords.map(function (e) { return new RegExp("^.*" + e+"","i") });
				}
				
				var cond = [];
				if(keywords){
					cond.push({"personal_info.keyword":{"$in":keywordsRegex}});
				}
				if(country){
					cond.push({"personal_info.country":country});
				}
				if(city){
					cond.push({"personal_info.city":{"$in": city}});					
				}
				
				finalCond = {"status":"Active", "personal_info.keyword":{"$in":keywordsRegex}, "$or":cond};
				
				Jobseeker.find(finalCond)
				.populate({
					path: 'employer_bookmarks.employer_id',
					match: { _id: employer_id},
					select : '_id fname lname',
					options: { limit: 1 }
				})
				.populate({
					path: 'scheduled_interviews',
					match: {employer_id: employer_id, interview_date: {'$gte':cDate } }
				})
				.populate({
					path: 'block_company',
					match: {company_id: company_profile_id}
				})
				.exec(function(jsError, jobseekers) {
				if(jsError){
					console.log(jsError);
					res.json({"success":false,"message":"Not found"});
				}
				else{
					if(jobseekers){
						res.json({"success":true,"message":"Data found","data":jobseekers});
					}
				}
				});
				///////////////////
			}
		}
	});
	}
	else{
		res.json({"success":false,"message":"Please provide Job ID"});
	}
});

app.get('/recommended_jobseekers_count/:id',checkEmpAuth,(req, res) => {

    var id=mongoose.Types.ObjectId(req.params.id);
    //console.log(id);
	if(id){
	JobPosting.findOne({_id: id})
	.exec(function(error, jobDetail) {
		if(error){
			console.log(error);
			res.json({"success":false,"message":"Not found"});
		}
		else{
			if(jobDetail){
				jobDetail = JSON.stringify(jobDetail);
				jobDetail = JSON.parse(jobDetail);
				
				var country = (jobDetail["country"])?jobDetail["country"]:[];
				var city = (jobDetail["city"])?jobDetail["city"]:[];
				var keywords = (jobDetail["technology"])?jobDetail["technology"]:[];
				console.log(keywords);
				
				////////////////////
				keywordsRegex=[];
				if(keywords){
					keywordsRegex = keywords.map(function (e) { return new RegExp("^.*" + e+"","i") });
				}
				
				var cond = [];
				if(keywords){
					cond.push({"personal_info.keyword":{"$in":keywordsRegex}});
				}
				if(country){
					cond.push({"personal_info.country":country});
				}
				if(city){
					cond.push({"personal_info.city":{"$in": city}});					
				}
				
				finalCond = {"status":"Active", "personal_info.keyword":{"$in":keywordsRegex}, "$or":cond};
				Jobseeker.count(finalCond)
				.exec(function(jsError, jobseekers) {
				if(jsError){
					console.log(jsError);
					res.json({"success":false,"message":"Not found"});
				}
				else{
					if(jobseekers){
						res.json({"success":true,"message":"Data found","data":jobseekers});
					}
				}
				});
				///////////////////
			}
		}
	});
	}
	else{
		res.json({"success":false,"message":"Please provide Job ID"});
	}
});

};
