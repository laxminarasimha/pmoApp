var mongoose = require("mongoose"),
 Schema = mongoose.Schema,
 objectId = mongoose.Schema.ObjectId;
 
var resourceTypeSchema = new Schema(
                  {
                   _id: { type: objectId, auto: true },
                   resourceTypename: { type: String, required: false }
                  }, 
                  {
                    collection: 'resourceType'
                  }
                  );
 
var resourceTypeDAO = mongoose.model('resourceType', resourceTypeSchema);
 
module.exports = resourceTypeDAO;