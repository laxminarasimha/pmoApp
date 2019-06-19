(function () {

      'use strict';

     var app = angular.module('pmoApp').factory('allocationService', Service);

      Service.$inject = ['$http', 'globalConfig'];

      app.filter('removeSpaces', [function() {
            return function(string) {
                if (!angular.isString(string)) {
                    return string;
                }
                return string.replace(/[\s]/g, '');
            };
        }])

      function Service($http, globalConfig) {
            var url = "";
            return {

                  getAllAllocation: function () {
                        url = globalConfig.apiAddress + "/allocation";
                        return $http.get(url);
                  },

                  getAllAllocationByYear: function (startYr, endYr,region) {                        
                        url = globalConfig.apiAddress + "/allocation/" + startYr + "/" + endYr+"/" + region;
                        return $http.get(url);
                  },

                  /*getAlloctionForResource: function (id) {
                        url = globalConfig.apiAddress + "/allocation/" + id;
                        return $http.get(url);
                  },*/
                  getAlloctionForResource: function (resourcename) {
                        url = globalConfig.apiAddress + "/allocation/byName/" + resourcename;;
                        return $http.get(url);
                  },

                  createAllocation: function (allocation) {
                        url = globalConfig.apiAddress + "/allocation";
                        return $http.post(url, allocation);

                  },

                  updateAllocation: function (allocation) {
                        url = globalConfig.apiAddress + "/allocation/" + allocation._id;
                        return $http.put(url, allocation);
                  },

                  deleteAllocation: function (deletedID) {
                        url = globalConfig.apiAddress + "/allocation/delete/" + deletedID;
                        return $http.delete(url);

                  },

                  deleteAllocationByName: function (deletedName) {
                        url = globalConfig.apiAddress + "/allocation/delete/name/" + deletedName;
                        return $http.delete(url);

                  },
                  deleteAllocationByYear: function (resource,allocationyear) {
                        url = globalConfig.apiAddress + "/allocation/delete/resource/byyear/" + allocationyear +"/"+resource;
                        return $http.delete(url);

                  }

                  // getAllocation: function (resource, type, year, project,region) {
                  //       url = globalConfig.apiAddress + "/allocation/type/" + resource + "/" + year + "/" + region;
                  //       return $http.get(url);

                  // },

            };
      }

})();