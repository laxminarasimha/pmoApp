var mongoose = require("mongoose"),
 Schema = mongoose.Schema,
 objectId = mongoose.Schema.ObjectId;
 
var leaveSchema = new Schema(
                  {
                   _id: { type: objectId, auto: true },
                   resourcename: { type: String, required: true },
        				   locationname: { type: String, required: true },
        				   fromDate: { type: Date, required: true },
        				   toDate: { type: Date, required: true },
        				   numberOfLeaves: { type: String, required: true },
                   leavedaysinmonth:[]
                  }, 
                  {
                    collection: 'leave'
                  }
                  );
 
var leaveDAO = mongoose.model('leave', leaveSchema);
 
module.exports = leaveDAO;