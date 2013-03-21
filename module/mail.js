var   path = require('path')
	, templatesDir = path.resolve(__dirname,'templates')
	, emailtemplates = require('email-templates')
	, nodemailer = require('nodemailer');


function email(mailinglist,templatename){
	this.mailinglist = mailinglist;
	this.templatename = templatename;
};
exports.module = email;

email.prototype.Sendmail = function Sendmail(){
	emailtemplates(templatesDir,function(err,template){
		if(err){
			console.log(err);
		}else{
			var transport = nodemailer.createTransport("SMTP",{
				sevice: "Gmail",
				auth: {
					user: "langtailcphengshengv@gmail.com",
					pass: "liveneo123"
				}
			});
			template(this.templatename,this.mailinglist,function(err,html,text){
				if(err) console.log(err);
				else{
					transport.sendMail({
						from: 'admin <admin@minifund.com>',
						to: this.mailinglist.email,
						subject: 'fdsafda',
						html: html,
						text: text
					}, function(err,responseStatus){
						if(err) console.log(err);
						else	console.log(responseStatus.message);
					});
				}
			});
		}
	});
};