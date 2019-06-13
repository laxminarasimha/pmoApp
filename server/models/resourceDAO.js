
var mongoose = require("mongoose"),
 Schema = mongoose.Schema,
 objectId = mongoose.Schema.ObjectId;
var bcrypt = require('bcrypt-node');
 
var resourceSchema = new Schema({
      _id: { type: objectId, auto: true },
      resourcename: { type: String, required: false },
      email: { type: String, required: false },
      designation: { type: String, required: false },
      password: { type: String, required: false },
      alias: { type: String, required: false },
      etype: { type: String, required: false },
      kinId: { type: String, required: false },
      baseentity: { type: String, required: false },
      skill:{ type: String, required: false },
      status:{ type: String, required: false },
      isManager:{ type: Boolean, required: false},
      role:{ type: String, required: false },
      region:{ type: String, required: false },
      resourceType: { type: String, required: false },
      taggedP: { type: Number,  required: false }
    },  
    {
      collection: 'resource'
    }
    );

resourceSchema.pre('save', function(next){
  var user = this;
  bcrypt.hash(user.password,null,null, function(err,hash){
    if(err) return next(err);
    user.password = hash;
    next();
  });

});

resourceSchema.methods.comparePasswords = function(password){

  return bcrypt.compareSync(password, this.password);
}
 
var resourceDAO = mongoose.model('resource', resourceSchema);
 
module.exports = resourceDAO;


