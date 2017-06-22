 (function() {
 'use strict';
 
 angular.module('pmoApp').factory('locationService', Service);
 
 Service.$inject = ['$http', 'globalConfig'];
 
 function Service($http, globalConfig) {
 var url = "";
   return {
       getLocation: function() {
       url = globalConfig.apiAddress + "/location";
       return $http.get(url);
       },
       getLocationForID: function(id) {
       url = globalConfig.apiAddress + "/location/" + id;
       return $http.get(url);
       },
       createLocation: function(location) {
       url = globalConfig.apiAddress + "/location";
       return $http.post(url, location);
       },
       updateLocation: function(location) {
       url = globalConfig.apiAddress + "/location/" + location._id;
       return $http.put(url, location);
       },
       deleteLocation: function(id) {
       url = globalConfig.apiAddress + "/location/" + id;
       return $http.delete(url);
       }
   };
 }

})();