(function() {
    
    'use strict';
    
    angular.module('pmoApp').controller('uploadDataFileCtrl', Controller);
    
    Controller.$inject = ['$scope', '$rootScope','Upload','$window','globalConfig','$http'];
     
    function Controller($scope, $rootScope,Upload,$window,globalConfig,$http) {
    $scope.mongoStatusData = [];
    
    var app = $scope;
    $scope.excelData = "";
    $scope.visible = false;

   $scope.clearData = function(){
       $scope.excelData =  '';
       $scope.visible = false;
   }
    //getExcelData(globalConfig,$http,$scope);
    $scope.fileSelected = function(files) {
       $scope.excelData =  '';
       $scope.visible = false;
       if (files && files.length) {
       $scope.myFile = files[0];
       }}
      
   $scope.submit = function(){ 
       if(!$scope.report){
           alert("Please choose the file type");
       }else{
           if ($scope.myFile) 
           {
           $scope.upload($scope.myFile); 
           }
       }
       
      }
      
      $scope.upload = function (file) {          
       Upload.upload({
       url: globalConfig.apiAddress+'/uploadDataFile/'+$scope.report, 
       file:file
       }).then(function (res) { 
           console.log(res.data.data);
           //$scope.excelData = res.data.data;
           $scope.visible = true;
       });
       };


       /*$scope.getExcelData = function (){
           var url =  globalConfig.apiAddress+'/uploadDataFile/';
              $http.get(url).then(function(res) {
               $scope.excelData = res.data;
               console.log(resp.data);
               }).catch(function(err) {
               console.log(err);
           });
       }*/
        
    }

    function getExcelData(globalConfig,$http,$scope){
       console.log("method called");
       var url =  globalConfig.apiAddress+'/uploadDataFile/'+$scope.report;
          $http.get(url).then(function(res) {
           $scope.excelData = res.data.data;
           console.log(res.data.data);
           }).catch(function(err) {
           console.log(err);
       });
   }    
   
})();
   