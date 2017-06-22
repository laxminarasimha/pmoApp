var mongoose = require("mongoose"),
 Schema = mongoose.Schema,
 objectId = mongoose.Schema.ObjectId;
 
var statusSchema = new Schema(
                  {
                   _id: { type: objectId, auto: true },
                   statusname: { type: String, required: false }
                  }, 
                  {
                    collection: 'status'
                  }
                  );
 
var statusDAO = mongoose.model('status', statusSchema);
 
module.exports = statusDAO;