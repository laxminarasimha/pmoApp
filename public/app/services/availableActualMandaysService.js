 (function() {

 'use strict';
 
 angular.module('pmoApp').factory('availableActualMandaysService', Service);
 
 Service.$inject = ['$http', 'globalConfig'];
 
 function Service($http, globalConfig) {
 var url = "";
   return {
       getDesignations: function() {
       url = globalConfig.apiAddress + "/avaactmandays";
       return $http.get(url);
       },
       getDesignationForID: function(id) {
       url = globalConfig.apiAddress + "/avaactmandays/" + id;
       return $http.get(url);
       },
       createDesignation: function(availableActualMandaysDTO) {
       url = globalConfig.apiAddress + "/avaactmandays";
       return $http.post(url, availableActualMandaysDTO);
       },
       updateDesignation: function(availableActualMandaysDTO) {
       url = globalConfig.apiAddress + "/avaactmandays/" + availableActualMandaysDTO._id;
       return $http.put(url, availableActualMandaysDTO);
       },
       deleteDesignation: function(id) {
       url = globalConfig.apiAddress + "/avaactmandays/" + id;
       return $http.delete(url);
       }
   };
 }

 })();