(function() {
 'use strict';
 
 angular.module('pmoApp').factory('resourceTypeService', Service);
 
 Service.$inject = ['$http', 'globalConfig'];
 
 function Service($http, globalConfig) {
 var url = "";
   return {
       getResourceType: function() {
       url = globalConfig.apiAddress + "/resourceType";
       return $http.get(url);
       },
       getResourceTypeForID: function(id) {
       url = globalConfig.apiAddress + "/resourceType/" + id;
       return $http.get(url);
       },
       getResourceTypenameForName: function(resourceTypename) {
       url = globalConfig.apiAddress + "/resourceType/resourceTypename/" + resourceTypename;
       return $http.get(url);
       },
       createResourceType: function(resourceType) {
       url = globalConfig.apiAddress + "/resourceType";
       return $http.post(url, resourceType);
       },
       updateResourceType: function(resourceType) {
       url = globalConfig.apiAddress + "/resourceType/" + resourceType._id;
       return $http.put(url, resourceType);
       },
       deleteResourceType: function(id) {
       url = globalConfig.apiAddress + "/resourceType/" + id;
       return $http.delete(url);
       }
   };
 }
 
 })();