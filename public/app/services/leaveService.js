 (function() {

 'use strict';
 
 angular.module('pmoApp').factory('leaveService', Service);
 
 Service.$inject = ['$http', 'globalConfig'];
 
 function Service($http, globalConfig) {
 var url = "";
   return {
       getLeave: function() {
       url = globalConfig.apiAddress + "/leave";
       return $http.get(url);
       },
       getLeaveForID: function(id) {
       url = globalConfig.apiAddress + "/leave/" + id;
       return $http.get(url);
       },
       createLeave: function(leave) {
       url = globalConfig.apiAddress + "/leave";
       return $http.post(url, leave);
       },
       updateLeave: function(leave) {
       url = globalConfig.apiAddress + "/leave/" + leave._id;
       return $http.put(url, leave);
       },
       deleteLeave: function(id) {
       url = globalConfig.apiAddress + "/leave/" + id;
       return $http.delete(url);
       },
       getLeaveForResourceName: function(resourcename) {
       url = globalConfig.apiAddress + "/leave/kin/" + resourcename;
       return $http.get(url);
       }

    };
 }
  })();