var mongoose = require("mongoose"),
  Schema = mongoose.Schema,
  objectId = mongoose.Schema.ObjectId;
var bcrypt = require('bcrypt-node');

var projectSLASchema = new Schema({ 
  
  _id: { type: objectId, auto: true },
  ScheduleCompliance: { type: String, required: false },
  AverageDefectResolutionTime: { type: String, required: false },
  AverageDefectDensity: { type: String, required: false },
  ProductionDefects: { type: String, required: false },
  SLALoss: { type: String, required: false },
  OTACE: { type: String, required: false },
  Year: { type: String, required: false },
  Platinum: { type: String, required: false },
  Gold: { type: String, required: false },
  Silver: { type: String, required: false },
  Bronze: { type: String, required: false },
  Text1: { type: String, required: false },
  Text2: { type: String, required: false },
  Text3: { type: String, required: false },

},

  {
    collection: 'projectSla'
  }
);

var projectSLASchema = mongoose.model('projectSla', projectSLASchema);

module.exports = projectSLASchema;