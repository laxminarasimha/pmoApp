(function() {

 'use strict';
 
angular.module('pmoApp').factory('dashboardService', Service);

Service.$inject = ['$http', 'globalConfig'];
 
function Service($http, globalConfig) {
 var url = "";
   return {
       getProject: function(region) {
       url = globalConfig.apiAddress + "/project/region/"+ region;
       return $http.get(url);
       },

       getProjectForID: function(id) {
       url = globalConfig.apiAddress + "/project/" + id;
       return $http.get(url);
       }       
   };
  }

})();