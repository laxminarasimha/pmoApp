(function() {
 
 'use strict';
 
 angular.module('pmoApp').factory('statusService', Service);
 
 Service.$inject = ['$http', 'globalConfig'];
 
 function Service($http, globalConfig) {
 var url = "";
   return {
       getStatus: function() {
       url = globalConfig.apiAddress + "/status";
       return $http.get(url);
       },
       getStatusForID: function(id) {
       url = globalConfig.apiAddress + "/status/" + id;
       return $http.get(url);
       },
       createStatus: function(status) {
       url = globalConfig.apiAddress + "/status";
       return $http.post(url, status);
       },
       updateStatus: function(status) {
       url = globalConfig.apiAddress + "/status/" + status._id;
       return $http.put(url, status);
       },
       deleteStatus: function(id) {
       url = globalConfig.apiAddress + "/status/" + id;
       return $http.delete(url);
       }
   };
 }
 
 })();