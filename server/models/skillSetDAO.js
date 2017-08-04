var mongoose = require("mongoose"),
 Schema = mongoose.Schema,
 objectId = mongoose.Schema.ObjectId;
 
var skillSetSchema = new Schema(
                  {
                   _id: { type: objectId, auto: true  },
                   skillname: { type: String, required: false,index: { unique: true } }
                  }, 
                  {
                    collection: 'skillset'
                  }
                  );
 
var skillSetDAO = mongoose.model('skillset', skillSetSchema);
 
module.exports = skillSetDAO;