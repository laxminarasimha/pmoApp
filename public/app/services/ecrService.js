(function(){
    'use strict';
    angular.module('pmoApp').factory('ecrService', Service);
    Service.$inject = ['$http', 'globalConfig'];
    function Service($http, globalConfig) {
        var url = "";
        return {
            
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
            },
            deleteEcr:function(id){
                url = globalConfig.apiAddress + "/ecr/" + id;
                console.log(url);
                return $http.delete(url);
            }
        };
    }
})();
