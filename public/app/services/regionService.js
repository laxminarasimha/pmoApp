 (function() {
 'use strict';
 
 angular.module('pmoApp').factory('regionService', Service);
 
 Service.$inject = ['$http', 'globalConfig'];
 
 function Service($http, globalConfig) {
 var url = "";
   return {
       getRegion: function() {
       url = globalConfig.apiAddress + "/region";
       return $http.get(url);
       },
       getRegionForID: function(id) {
       url = globalConfig.apiAddress + "/region/" + id;
       return $http.get(url);
       },
       createRegion: function(region) {
       url = globalConfig.apiAddress + "/region";
       return $http.post(url, region);
       },
       updateRegion: function(region) {
       url = globalConfig.apiAddress + "/region/" + region._id;
       return $http.put(url, region);
       },
       deleteRegion: function(id) {
       url = globalConfig.apiAddress + "/region/" + id;
       return $http.delete(url);
       }
   };
 }

})();