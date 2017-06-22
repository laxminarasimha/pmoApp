var mongoose = require("mongoose"),
 Schema = mongoose.Schema,
 objectId = mongoose.Schema.ObjectId;
 
var regionSchema = new Schema(
                  {
                   _id: { type: objectId, auto: true },
                   regionname: { type: String, required: false }
                  }, 
                  {
                    collection: 'region'
                  }
                  );
 
var regionDAO = mongoose.model('region', regionSchema);
 
module.exports = regionDAO;