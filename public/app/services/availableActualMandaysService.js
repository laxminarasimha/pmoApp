 (function() {

 'use strict';
 
 angular.module('pmoApp').factory('availableActualMandaysService', Service);
 
 Service.$inject = ['$http', 'globalConfig'];
 
 function Service($http, globalConfig) {
 var url = "";
   return {
       search: function(availableActualMandaysDTO) {       
       url = globalConfig.apiAddress + "/avaactmandays/";
       return $http.post(url,availableActualMandaysDTO);
       } 
   };
 }

 })();