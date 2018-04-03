 (function() {

 'use strict';
 
 angular.module('pmoApp').factory('resourceService', Service);
 
 Service.$inject = ['$http', 'globalConfig'];
 
 function Service($http, globalConfig) {
 var url = "";
   return {
    getEBResources: function () {
      url = globalConfig.apiAddress + "/resource/eb";
      return $http.get(url);
    },
    getEsesResources: function () {
      url = globalConfig.apiAddress + "/resource/eses";
      return $http.get(url);
    },
    getHCResources: function () {
      url = globalConfig.apiAddress + "/resource/hc";
      return $http.get(url);
    },
       getResources: function() {
       url = globalConfig.apiAddress + "/resource";
       return $http.get(url);
       },
       getResourceForID: function(id) {
       url = globalConfig.apiAddress + "/resource/" + id;
       return $http.get(url);
       },
       createResource: function(resource) { 
       url = globalConfig.apiAddress + "/resource";
       return $http.post(url, resource);
       },
       getResourceForKinId: function(kinId) {
       url = globalConfig.apiAddress + "/resource/kinId/" + kinId;
       return $http.get(url);
       },
       updateResource: function(resource) {
       url = globalConfig.apiAddress + "/resource/" + resource._id;
       return $http.put(url, resource);
       },
       deleteResource: function(id) {
       url = globalConfig.apiAddress + "/resource/" + id;
       return $http.delete(url);
       },
       deleteEbResource: function (id) {
        url = globalConfig.apiAddress + "/resource/eb/" + id;
        return $http.delete(url);
      },
      deleteHcResource: function (id) {
        url = globalConfig.apiAddress + "/resource/hcDelete/" + id;
        return $http.delete(url);
      },
      deleteEsesResource: function (id) {
        url = globalConfig.apiAddress + "/resource/eses/" + id;
        return $http.delete(url);
      },
       getExportToExcelData: function() {
       url = globalConfig.apiAddress + "/resource/excel";
       return $http.get(url);
       },
       sendEmailToResource: function(resource) {
       url = globalConfig.apiAddress + "/resource/email";
       return $http.post(url,resource);
       }
   };
 }
  })();