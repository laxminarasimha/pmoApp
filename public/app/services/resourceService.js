 (function() {

 'use strict';
 
 angular.module('pmoApp').factory('resourceService', Service);
 
 Service.$inject = ['$http', 'globalConfig'];
 
 function Service($http, globalConfig) {
 var url = "";
   return {
       getResources: function() {
       url = globalConfig.apiAddress + "/resource";
       return $http.get(url);
       },
       getResourceForID: function(id) {
       url = globalConfig.apiAddress + "/resource/" + id;
       return $http.get(url);
       },
       createResource: function(resource) { 
       url = globalConfig.apiAddress + "/resource";
       return $http.post(url, resource);
       },
       updateResource: function(resource) {
       url = globalConfig.apiAddress + "/resource/" + resource._id;
       return $http.put(url, resource);
       },
       deleteResource: function(id) {
       url = globalConfig.apiAddress + "/resource/" + id;
       return $http.delete(url);
       },
       getExportToExcelData: function() {
       url = globalConfig.apiAddress + "/resource/excel";
       return $http.get(url);
       },
       sendEmailToResource: function(resource) {
       url = globalConfig.apiAddress + "/resource/email";
       return $http.post(url,resource);
       }
   };
 }
  })();