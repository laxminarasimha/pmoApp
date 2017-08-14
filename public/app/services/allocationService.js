(function () {

      'use strict';

      angular.module('pmoApp').factory('allocationService', Service);

      Service.$inject = ['$http', 'globalConfig'];

      function Service($http, globalConfig) {
            var url = "";
            return {

                  getAllAllocation: function () {
                        url = globalConfig.apiAddress + "/allocation";
                        return $http.get(url);
                  },

                  getAlloctionForResource: function (id) {
                        url = globalConfig.apiAddress + "/allocation/" + id;
                        return $http.get(url);
                  },

                  createAllocation: function (allocation) {
                        url = globalConfig.apiAddress + "/allocation";
                        return $http.post(url, allocation);
                  },

                  updateAllocation: function (allocation) {
                        url = globalConfig.apiAddress + "/allocation/" + allocation._id;
                        console.log(url);
                        return $http.put(url, allocation);
                  },

                  deleteAllocation: function (id) {
                        url = globalConfig.apiAddress + "/allocaiton/" + id;
                        return $http.delete(url);
                  },

                  getAllocation: function (resource, type, year, project) {
                        url = globalConfig.apiAddress + "/allocation/type/" + resource + "/" + type + "/" + year + "/" + project;
                        return $http.get(url);
                  },

            };
      }

})();