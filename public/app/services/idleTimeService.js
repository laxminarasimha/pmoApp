 (function() {

 'use strict';
 
 angular.module('pmoApp').factory('idleTimeService', Service);
 
 Service.$inject = ['$http', 'globalConfig'];
 
 function Service($http, globalConfig) {
 var url = "";
   return {
       getDesignations: function() {
       url = globalConfig.apiAddress + "/idletime";
       return $http.get(url);
       },
       getDesignationForID: function(id) {
       url = globalConfig.apiAddress + "/idletime/" + id;
       return $http.get(url);
       },
       createDesignation: function(idleTimeDTO) {
       url = globalConfig.apiAddress + "/idletime";
       return $http.post(url, idleTimeDTO);
       },
       updateDesignation: function(idleTimeDTO) {
       url = globalConfig.apiAddress + "/idletime/" + idleTimeDTO._id;
       return $http.put(url, idleTimeDTO);
       },
       deleteDesignation: function(id) {
       url = globalConfig.apiAddress + "/idletime/" + id;
       return $http.delete(url);
       }
   };
 }

 })();