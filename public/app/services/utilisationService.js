 (function() {

 'use strict';
 
 angular.module('pmoApp').factory('utilisationService', Service);
 
 Service.$inject = ['$http', 'globalConfig'];
 
 function Service($http, globalConfig) {
 var url = "";
   return {
       getDesignations: function() {
       url = globalConfig.apiAddress + "/utilisation";
       return $http.get(url);
       },
       getDesignationForID: function(id) {
       url = globalConfig.apiAddress + "/utilisation/" + id;
       return $http.get(url);
       },
       createDesignation: function(utilisationDTO) {
       url = globalConfig.apiAddress + "/utilisation";
       return $http.post(url, utilisationDTO);
       },
       updateDesignation: function(utilisationDTO) {
       url = globalConfig.apiAddress + "/utilisation/" + utilisationDTO._id;
       return $http.put(url, utilisationDTO);
       },
       deleteDesignation: function(id) {
       url = globalConfig.apiAddress + "/utilisation/" + id;
       return $http.delete(url);
       }
   };
 }

 })();