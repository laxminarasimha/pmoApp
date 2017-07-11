
 (function() {
    
 'use strict';
 
 angular.module('pmoApp').controller('paginationCtrls', Controller);
 
 Controller.$inject = ['$scope', '$rootScope', 'skillSetService'];
  
 function Controller($scope, $rootScope, skillSetService) {

    $scope.mongoSkillData = [];
    getSkillDataCount(skillSetService,$scope);

 }

 function getSkillDataCount(skillSetService,$scope){
      skillSetService.getSkillSetsCount().then(function(res) {
        console.log(res.data.data);
         $scope.totalRecords = res.data.data;
         $scope.size = 10;
         callPagination($scope.totalRecords,5,skillSetService,$scope);
         populateTable(1,skillSetService,$scope);
         }).catch(function(err) {
         console.log(err);
     });
 }


 function callPagination(totalRecords,size,skillSetService,$scope){
        $('#pagerTop,#pagerBottom').bootpag({
        total: Math.ceil(totalRecords/size),
        page : 1,
        maxVisible : 5        
        }).on("page", function(event, num) {
            populateTable(num,skillSetService,$scope);

        });
}


function populateTable(page,skillSetService,$scope){
       skillSetService.getSkillSetsPaginationData(page,5).then(function(res) {
            $scope.mongoSkillData = res.data;
         }).catch(function(err) {
         console.log(err);
     });

}


 })();