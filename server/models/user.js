var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-node');

mongoose.Promise = global.Promise;

var UserSchema = new Schema({
	username:{type:String, lowercase:true, required:true, unique:true},
	password:{type:String, required:true},
	emailID:{type:String, lowercase:true,required:true}
},{
                    collection: 'user'
                  } 
);

UserSchema.pre('save', function(next){
	var user = this;
	bcrypt.hash(user.password,null,null, function(err,hash){
		if(err) return next(err);
		user.password = hash;
		next();
	});

});

UserSchema.methods.comparePasswords = function(password){

	return bcrypt.compareSync(password, this.password);
}
module.exports = mongoose.model('user', UserSchema);