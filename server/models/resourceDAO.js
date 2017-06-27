var mongoose = require("mongoose"),
 Schema = mongoose.Schema,
 objectId = mongoose.Schema.ObjectId;
 
var resourceSchema = new Schema({
      _id: { type: objectId, auto: true },
      resourcename: { type: String, required: false },
      email: { type: String, required: false },
      designation: { type: String, required: false },
      password: { type: String, required: false },
      alias: { type: String, required: false },
      etype: { type: String, required: false },
      kinId: { type: String, required: false }
    },  
    {
      collection: 'resource'
    }
    );
 
var resourceDAO = mongoose.model('resource', resourceSchema);
 
module.exports = resourceDAO;


