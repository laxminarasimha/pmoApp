var mongoose = require("mongoose"),
 Schema = mongoose.Schema,
 objectId = mongoose.Schema.ObjectId;

 var resourceDAO = require("./resourceDAO.js");
 
var resourceMappingSchema = new Schema(
                  {
                   _id: { type: objectId, auto: true },
                   mappedResource: {type: mongoose.Schema.Types.Object, ref: 'resourceDAO'},
                   //role: { type: String, required: false },
                   location: { type: String, required: false },
                   region: { type: String, required: false },
                   skill: { type: String, required: false },
                   status: { type: String, required: false },
                   resourceType: { type: String, required: false }
                   //manager: { type: String, required: false }
                  }, 
                  {
                    collection: 'resourceMapping'
                  }
                  );
 
var resourceMappingDAO = mongoose.model('resourceMapping', resourceMappingSchema);
 
module.exports = resourceMappingDAO;