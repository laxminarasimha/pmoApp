var mongoose = require("mongoose"),
 Schema = mongoose.Schema,
 objectId = mongoose.Schema.ObjectId;
 
var leaveSchema = new Schema(
                  {
                   _id: { type: objectId, auto: true },
                   resourcename: { type: String, required: false },
				   regionname: { type: String, required: false },
				   startDate: { type: Date, required: false },
				   endDate: { type: Date, required: false },
				   numberOfLeaves: { type: String, required: false }
                  }, 
                  {
                    collection: 'leave'
                  }
                  );
 
var leaveDAO = mongoose.model('leave', leaveSchema);
 
module.exports = leaveDAO;