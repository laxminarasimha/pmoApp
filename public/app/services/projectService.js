 (function() {

 'use strict';
 
 angular.module('pmoApp').factory('projectService', Service);
 
 Service.$inject = ['$http', 'globalConfig'];
 
 function Service($http, globalConfig) {
 var url = "";
   return {
       getProject: function() {
       url = globalConfig.apiAddress + "/project";
       return $http.get(url);
       },
       getProjectForID: function(id) {
       url = globalConfig.apiAddress + "/project/" + id;
       return $http.get(url);
       },
       createProject: function(project) {
       url = globalConfig.apiAddress + "/project";
       return $http.post(url, project);
       },
       updateProject: function(project) {
       url = globalConfig.apiAddress + "/project/" + project._id;
       return $http.put(url, project);
       },
       deleteProject: function(id) {
       url = globalConfig.apiAddress + "/project/" + id;
       return $http.delete(url);
       },
       getExportToExcelData: function() {
       url = globalConfig.apiAddress + "/project/excel";
       return $http.get(url);
       }
    };
}

})();