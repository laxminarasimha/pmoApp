(function () {

    'use strict';

    angular.module('pmoApp').factory('projectService', Service);

    Service.$inject = ['$http', 'globalConfig'];

    function Service($http, globalConfig) {
        var url = "";
        return {
            getProject: function (region) {
                url = globalConfig.apiAddress + "/project/region/" + region;
                console.log(url);
                return $http.get(url);
            },
            getProjectForID: function (id) {
                url = globalConfig.apiAddress + "/project/" + id;
                return $http.get(url);
            },
            createProject: function (project) {
                url = globalConfig.apiAddress + "/project";
                console.log(url);
                return $http.post(url, project);
            },
            getProjectForName: function (projectname, regionname) {
                url = globalConfig.apiAddress + "/project/projectname/" + projectname + "/" + regionname;
                return $http.get(url);
            },
            updateProject: function (project) {
                url = globalConfig.apiAddress + "/project/" + project._id;
                return $http.put(url, project);
            },
            deleteProject: function (id) {
                url = globalConfig.apiAddress + "/project/" + id;
                return $http.delete(url);
            },
            getExportToExcelData: function () {
                url = globalConfig.apiAddress + "/project/excel";
                return $http.get(url);
            }
        };
    }

})();