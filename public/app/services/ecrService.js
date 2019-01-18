(function(){
    'use strict';
    angular.module('pmoApp').factory('ecrService', Service);
    Service.$inject = ['$http', 'globalConfig'];
    function Service($http, globalConfig) {
        var url = "";
        return {
            getEcrForName: function (ecrname, regionname) {
                url = globalConfig.apiAddress + "/ecr/ecrName/" + ecrname + "/" + regionname;
                console.log(url);
                return $http.get(url);
            },
            createEcr: function (ecr) {
                url = globalConfig.apiAddress + "/ecr";
                console.log(url);
                return $http.post(url, ecr);
            },
            getEcr: function (region) {
                url = globalConfig.apiAddress + "/ecr/" + region;
                return $http.get(url);
            },
            getEcrForID: function (id) {
                url = globalConfig.apiAddress + "/ecr/ecrId/" + id;
                console.log(url);
                return $http.get(url);
            },
            updateECR: function (ecr) {
                url = globalConfig.apiAddress + "/ecr/" + ecr._id;
                return $http.put(url, ecr);
            }
        };
    }
})();
