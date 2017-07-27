var mongoose = require("mongoose"),
 Schema = mongoose.Schema,
 objectId = mongoose.Schema.ObjectId;
 var timeZone = require('mongoose-timezone');
 
var leaveSchema = new Schema(
                  {
                   _id: { type: objectId, auto: true },
                   resourcename: { type: String, required: false },
        				   locationname: { type: String, required: false },
        				   fromDate: { type: Date, required: false },
        				   toDate: { type: Date, required: false },
                   subDocument: {
                          subDate: {
                              type: Date,
                          },
                      },
        				   numberOfLeaves: { type: String, required: false },
                   leavedaysinmonth:[]
                  }, 
                  {
                    collection: 'leave'
                  }
                  );
 
leaveSchema.plugin(timeZone, { paths: ['fromDate', 'subDocument.subDate'] });
leaveSchema.plugin(timeZone, { paths: ['toDate', 'subDocument.subDate'] });
var leaveDAO = mongoose.model('leave', leaveSchema);
 
module.exports = leaveDAO;