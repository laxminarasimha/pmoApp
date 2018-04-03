var mongoose = require("mongoose"),
 Schema = mongoose.Schema,
 objectId = mongoose.Schema.ObjectId;
var bcrypt = require('bcrypt-node');
 
var resourceEBSchema = new Schema({},  
    {
      collection: 'ebresource'
    }
    );


 
var resourceEBDAO = mongoose.model('ebresource', resourceEBSchema);
 
module.exports = resourceEBDAO;
