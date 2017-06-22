var mongoose = require("mongoose"),
 Schema = mongoose.Schema,
 objectId = mongoose.Schema.ObjectId;
 
var designationSchema = new Schema(
                  {
                   _id: { type: objectId, auto: true },
                   designationname: { type: String, required: false }
                  }, 
                  {
                    collection: 'designation'
                  }
                  );
 
var designationDAO = mongoose.model('designation', designationSchema);
 
module.exports = designationDAO;