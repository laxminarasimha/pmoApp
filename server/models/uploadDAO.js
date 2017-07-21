var mongoose = require("mongoose"),
 Schema = mongoose.Schema,
 objectId = mongoose.Schema.ObjectId;
 
var uploadSchema = new Schema(
                  {
                   _id: { type: objectId, auto: true },
                   kinId: { type: String, required: true },
                   img: { data: Buffer, contentType: String }
                  }, 
                  {
                    collection: 'upload'
                  }
                  );
 
var uploadDAO = mongoose.model('upload', uploadSchema);
 
module.exports = uploadDAO;