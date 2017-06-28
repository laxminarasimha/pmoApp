
 (function() {

 'use strict';
 
 angular.module('pmoApp').factory('holidayListService', Service);
 
 Service.$inject = ['$http', 'globalConfig'];
 
 function Service($http, globalConfig) {
 var url = "";
   return {
   
       getHolidays: function() {
       url = globalConfig.apiAddress + "/holiday";
       return $http.get(url);
       },
       getLocationHolidays: function(locationname) {
       url = globalConfig.apiAddress + "/holiday/location/" +locationname;
       return $http.get(url);
       },

       getHolidayForID: function(id) {
       url = globalConfig.apiAddress + "/holiday/" + id;
       return $http.get(url);
       },
       createHoliday: function(holiday) {
       url = globalConfig.apiAddress + "/holiday";
       return $http.post(url, holiday);
       },
       updateHoliday: function(holiday) {
       url = globalConfig.apiAddress + "/holiday/" + holiday._id;
       return $http.put(url, holiday);
       },
       deleteHoliday: function(id) {
       url = globalConfig.apiAddress + "/holiday/" + id;
       return $http.delete(url);
       }
       
   };
 }
  })();