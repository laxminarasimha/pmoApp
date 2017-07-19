var mongoose = require("mongoose"),
 Schema = mongoose.Schema,
 objectId = mongoose.Schema.ObjectId;
 var timeZone = require('mongoose-timezone');
 
var projectSchema = new Schema(
                  {
                   _id: { type: objectId, auto: true },
                   projectname: { type: String, required: false },
				   regionname: { type: String, required: false },
           manager: { type: String, required: false },
           subDocument: {
                          subDate: {
                              type: Date,
                          },
                      },
				   startDate: { type: Date, required: false },
				   endDate: { type: Date, required: false }
           
                  },
                  {
                    collection: 'project'
                  }
                  );
 
 projectSchema.plugin(timeZone, { paths: ['startDate', 'subDocument.subDate'] });
 projectSchema.plugin(timeZone, { paths: ['endDate', 'subDocument.subDate'] });
var projectDAO = mongoose.model('project', projectSchema);
 
module.exports = projectDAO;