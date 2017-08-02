var mongoose = require("mongoose"),
 Schema = mongoose.Schema,
 objectId = mongoose.Schema.ObjectId;
 var timeZone = require('mongoose-timezone');
 
var holidaySchema = new Schema(
                  {
                   _id: { type: objectId, auto: true },
                   locationname: { type: String, required: false } ,
                   holidayDate: { type: Date, required: false },
                   year: { type: String, required: false },
                    subDocument: {
                           subDate: {
                               type: Date,
                           },
                       },
                    comments: { type: String, required: false }
                  }, 
                  {
                    collection: 'holidaylist'
                  }
                  );

holidaySchema.plugin(timeZone, { paths: ['holidayDate', 'subDocument.subDate'] });
 
var holidayDAO = mongoose.model('holidaylist', holidaySchema);
 
module.exports = holidayDAO;