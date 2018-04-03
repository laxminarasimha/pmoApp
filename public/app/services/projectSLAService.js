(function () {
    
    'use strict';
  
    angular.module('pmoApp').factory('projectSLAService', Service);
  
    Service.$inject = ['$http', 'globalConfig'];
  
    function Service($http, globalConfig) {
      var url = "";
      return {
            
        getSlaResources: function () {
          url = globalConfig.apiAddress + "/sla";
          return $http.get(url);
        },
        updateSlaResource: function (sla) {
          url = globalConfig.apiAddress + "/sla/"+ sla._id;
          console.log("sla id:"+sla._id);
          console.log(url);
          return $http.put(url, sla);
        }             
       
      };
    }
  })();