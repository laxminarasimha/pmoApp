var mongoose = require("mongoose"),
 Schema = mongoose.Schema,
 objectId = mongoose.Schema.ObjectId;
var bcrypt = require('bcrypt-node');
 
var resourceESESSchema = new Schema({},  
    {
      collection: 'esesresorce'
    }
    );


 
var resourceESESDAO = mongoose.model('esesresorce', resourceESESSchema);
 
module.exports = resourceESESDAO;