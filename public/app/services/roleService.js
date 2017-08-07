(function() {
 'use strict';
 
 angular.module('pmoApp').factory('roleService', Service);
 
 Service.$inject = ['$http', 'globalConfig'];
 
 function Service($http, globalConfig) {
 var url = "";
   return {
       getRole: function() {
       url = globalConfig.apiAddress + "/role";
       return $http.get(url);
       },
       getRoleForID: function(id) {
       url = globalConfig.apiAddress + "/role/" + id;
       return $http.get(url);
       },

       getRoleForName: function(rolename) {
       url = globalConfig.apiAddress + "/role/rolename/" + rolename;
       return $http.get(url);
       },
       createRole: function(role) {
       url = globalConfig.apiAddress + "/role";
       return $http.post(url, role);
       },
       updateRole: function(role) {
       url = globalConfig.apiAddress + "/role/" + role._id;
       return $http.put(url, role);
       },
       deleteRole: function(id) {
       url = globalConfig.apiAddress + "/role/" + id;
       return $http.delete(url);
       }
   };
 }
 
 })();