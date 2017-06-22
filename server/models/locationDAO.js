var mongoose = require("mongoose"),
 Schema = mongoose.Schema,
 objectId = mongoose.Schema.ObjectId;
 
var locationSchema = new Schema(
                  {
                   _id: { type: objectId, auto: true },
                   locationname: { type: String, required: false }
                  }, 
                  {
                    collection: 'location'
                  }
                  );
 
var locationDAO = mongoose.model('location', locationSchema);
 
module.exports = locationDAO;