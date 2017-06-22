var mongoose = require("mongoose"),
 Schema = mongoose.Schema,
 objectId = mongoose.Schema.ObjectId;
 
var roleSchema = new Schema(
                  {
                   _id: { type: objectId, auto: true },
                   rolename: { type: String, required: false }
                  }, 
                  {
                    collection: 'role'
                  }
                  );
 
var roleDAO = mongoose.model('role', roleSchema);
 
module.exports = roleDAO;