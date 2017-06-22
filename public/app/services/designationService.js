 (function() {

 'use strict';
 
 angular.module('pmoApp').factory('designationService', Service);
 
 Service.$inject = ['$http', 'globalConfig'];
 
 function Service($http, globalConfig) {
 var url = "";
   return {
       getDesignations: function() {
       url = globalConfig.apiAddress + "/designation";
       return $http.get(url);
       },
       getDesignationForID: function(id) {
       url = globalConfig.apiAddress + "/designation/" + id;
       return $http.get(url);
       },
       createDesignation: function(designation) {
       url = globalConfig.apiAddress + "/designation";
       return $http.post(url, designation);
       },
       updateDesignation: function(designation) {
       url = globalConfig.apiAddress + "/designation/" + designation._id;
       return $http.put(url, designation);
       },
       deleteDesignation: function(id) {
       url = globalConfig.apiAddress + "/designation/" + id;
       return $http.delete(url);
       }
   };
 }

 })();