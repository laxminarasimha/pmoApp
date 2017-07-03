var mongoose = require("mongoose"),
 Schema = mongoose.Schema,
 objectId = mongoose.Schema.ObjectId;
 
var holidaySchema = new Schema(
                  {
                   _id: { type: objectId, auto: true },
                   locationname: { type: String, required: false } ,
                   holidayDate: { type: Date, required: false }
                  }, 
                  {
                    collection: 'holidaylist'
                  }
                  );
 
var holidayDAO = mongoose.model('holidaylist', holidaySchema);
 
module.exports = holidayDAO;