var mongoose = require("mongoose"),
 Schema = mongoose.Schema,
 objectId = mongoose.Schema.ObjectId;
 var timeZone = require('mongoose-timezone');
 
var ecrSchema = new Schema(
                  {
                   _id: { type: objectId, auto: true },
                   ecrname: { type: String, required: false },
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
                    collection: 'ecr'
                  }
                  );
 
 ecrSchema.plugin(timeZone, { paths: ['startDate', 'subDocument.subDate'] });
 ecrSchema.plugin(timeZone, { paths: ['endDate', 'subDocument.subDate'] });
var ecrDAO = mongoose.model('ecr', ecrSchema);
 
module.exports = ecrDAO;