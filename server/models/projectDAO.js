var mongoose = require("mongoose"),
 Schema = mongoose.Schema,
 objectId = mongoose.Schema.ObjectId;
 
var projectSchema = new Schema(
                  {
                   _id: { type: objectId, auto: true },
                   projectname: { type: String, required: false },
				   regionname: { type: String, required: false },
				   startDate: { type: Date, required: false },
				   endDate: { type: Date, required: false }
                  }, 
                  {
                    collection: 'project'
                  }
                  );
 
var projectDAO = mongoose.model('project', projectSchema);
 
module.exports = projectDAO;