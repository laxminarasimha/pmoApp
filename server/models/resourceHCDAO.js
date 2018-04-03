var mongoose = require("mongoose"),
 Schema = mongoose.Schema,
 objectId = mongoose.Schema.ObjectId;
var bcrypt = require('bcrypt-node');
 
var resourceEBSchema = new Schema({},  
    {
      collection: 'headcount'
    }
    );


 
var resourceHCDAO = mongoose.model('headcount', resourceEBSchema);
 
module.exports = resourceHCDAO;