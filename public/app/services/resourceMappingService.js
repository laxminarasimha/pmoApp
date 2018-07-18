(function () {

  'use strict';

  angular.module('pmoApp').factory('resourceMappingService', Service);

  Service.$inject = ['$http', 'globalConfig'];

  function Service($http, globalConfig) {
    var url = "";
    return {
      getMappedResources: function (region) {
        console.log("Server side region"+ region);
        url = globalConfig.apiAddress + "/mappedresource/region/" + region;
        return $http.get(url);
      },

      getMappedResourcesByYear: function (startYr, EndYr) {
        url = globalConfig.apiAddress + "/mappedresource/" + startYr + "/" + EndYr;
        return $http.get(url);
      },
      getMappedResourceForID: function (id) {
        url = globalConfig.apiAddress + "/mappedresource/" + id;
        return $http.get(url);
      },
      getMappedResourceForKinID: function (Id) {
        url = globalConfig.apiAddress + "/mappedresource/kinId/" + Id;
        return $http.get(url);
      },
      createResourceMapping: function (resourcemap) {
        url = globalConfig.apiAddress + "/mappedresource";
        return $http.post(url, resourcemap);
      },
      updateResourceMapping: function (resourcemap) {
        url = globalConfig.apiAddress + "/mappedresource/" + resourcemap._id;
        return $http.put(url, resourcemap);
      },
      deleteResourceMapping: function (id) {
        console.log(id);
        url = globalConfig.apiAddress + "/mappedresource/" + id;
        return $http.delete(url);
      },
      getMappedResourceForKinIDtoDelete: function (Id) {
        url = globalConfig.apiAddress + "/mappedresource/kinId/ForDelete/" + Id;
        return $http.get(url);
      }




    };
  }
})();