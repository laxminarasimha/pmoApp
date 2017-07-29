var mongoose = require("mongoose"),
  Schema = mongoose.Schema,
  objectId = mongoose.Schema.ObjectId;

var allocationSchema = new Schema(
  {
    _id: { type: objectId, auto: true },
    resource: { type: String, required: true },
    resourcetype: { type: String, required: true },
    project: { type: String, required: true },
    year: { type: String, required: true },
    allocation: []
  },
  {
    collection: 'allocation'
  }
);

var allocationDAO = mongoose.model('allocation', allocationSchema);

module.exports = allocationDAO;