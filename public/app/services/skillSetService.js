
 (function() {

 'use strict';
 
 angular.module('pmoApp').factory('skillSetService', Service);
 
 Service.$inject = ['$http', 'globalConfig'];
 
 function Service($http, globalConfig) {
 var url = "";
   return {
       getSkillSets: function() {
       url = globalConfig.apiAddress + "/skillSet";
       return $http.get(url);
       },
       getSkillSetsCount: function() {
       url = globalConfig.apiAddress + "/skillSet/count/"+"countNo";
       return $http.get(url);
       },
       getSkillSetsPaginationData: function(page,size) {
       url = globalConfig.apiAddress + "/skillSet/pagination/"+page+"/"+size;
       return $http.get(url);
       },
       getSkillSetsForID: function(id) {
       url = globalConfig.apiAddress + "/skillset/" + id;
       return $http.get(url);
       },
       getSkillSetsForName: function(skillname) {
       url = globalConfig.apiAddress + "/skillset/skillname/" + skillname;
       return $http.get(url);
       },

       createSkillSet: function(skillset) {
       url = globalConfig.apiAddress + "/skillset";
       return $http.post(url, skillset);
       },
       updateSkillSet: function(skillset) {
       url = globalConfig.apiAddress + "/skillset/" + skillset._id;
       return $http.put(url, skillset);
       },
       deleteSkillSet: function(id) {
       url = globalConfig.apiAddress + "/skillset/" + id;
       return $http.delete(url);
       }
   };
 }
 
 })();