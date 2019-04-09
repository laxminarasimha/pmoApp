(function(){
    'use strict';
    angular.module('pmoApp').controller('ECRManagementCtrl', Controller);
    Controller.$inject = ['$scope', '$rootScope', 'ecrService','regionService','resourceService', 'DTOptionsBuilder', 'DTColumnBuilder','$window','$filter'];

    function Controller($scope, $rootScope,ecrService,regionService,resourceService, DTOptionsBuilder, DTColumnBuilder,$window,$filter){
         var app = $scope;
        $scope.region = $window.localStorage.getItem("region");
        $scope.regionList = [];
        getRegionData(regionService,$scope);
        $scope.resourceList = [];
        getResourceData(resourceService,$scope);
        $scope.mongoECRData = [];
        getECRData(ecrService,$scope);
        
        $scope.clearFields = function (){
 
            $scope.ecr = {};
            app.loading =false;
            app.successMsg = false;
            app.errorMsg = false;
            app.errorClass = "";
        }

        $scope.deleteConfirmation = function(id,name){
            $scope.msg = name;
            $scope.deletedID = id;
            openDialog();
        
         }

         $scope.numberofdays = function (startDate, endDate) {
    
            if (endDate != null && startDate != null) {
                if (new Date(startDate) > new Date(endDate)) {
                   // console.log("Start Date should be less than End date");
                    app.loading = false;
                    app.successMsg = false;
                    app.errorMsg = "Start Date should be less than End date";
                    app.errorClass = "error"
                } 
            }
        };
        
    $scope.createECR = function(ecr) {

            $rootScope.Title = "Create ECR";
            $scope.IsSubmit = true;
            if ($scope.ECRManagementForm.$valid) {
            ecrService.getEcrForName($scope.ecr.ecrname,$scope.ecr.regionname).then(function(res) {

               if(res.data.length == 0){
                 ecrService.createEcr(ecr).then(function(res) {  
                           if (res.data == "created") {
                               getECRData(ecrService,$scope);
                               $scope.ecr = {};
                               app.loading =false;
                               app.successMsg = "Ecr created successfully";
                               app.errorMsg = false;                        
                            }
                           }).catch(function(err) {
                                console.log(err);
                                app.loading =false;
                                app.errorMsg = "Error in creation";
                                app.successMsg = false;
                                 app.errorClass = "error";
                            });
                   }
                
                   else  if(res.data.length > 0){
                               app.loading =false;
                               app.errorMsg = "ECR already exist";
                               app.successMsg = false;
                                app.errorClass = "error";
                   }
               }).catch(function(err) {
                console.log(err);
               }); 
            }else 
            {
                   app.loading =false;
                   app.successMsg = false;
                   app.errorMsg = "Please Enter Required value";
                   app.errorClass = "error"
            }
            
        }


         $scope.editEcr = function (id) {
             $rootScope.Title = "Edit Ecr";
             ecrService.getEcrForID(id).then(function(res) {
                 res.data.startDate =  $filter('date')(new Date(res.data.startDate), 'dd-MMM-yy');
                 res.data.endDate =  $filter('date')(new Date(res.data.endDate), 'dd-MMM-yy');
             $scope.ecr = res.data;
             }).catch(function(err) {
             console.log(err);
             });
        
         }

         $scope.delete = function(event) {
            //if (confirm('Are you sure to delete?')) {
                ecrService.deleteEcr($scope.deletedID).then(function(res) {
                if (res.data == "deleted") {
                    getECRData(ecrService,$scope);
                  app.loading = false;
                  app.successMsg = "Ecr Deleted successfully";
                  app.errorMsg = false;
                  $scope.msg = "";
                  $scope.deletedID = "";
                }
                }).catch(function(err) {
                console.log(err);
                });
            //}
        };

         $scope.saveData = function(ecr) {
           
            if ($scope.ECRManagementForm.$valid) {
            ecrService.updateECR(ecr).then(function(res) {
            if (res.data == "updated") {
                getECRData(ecrService,$scope);
               $scope.ecr = {};
               app.loading =false;
               app.successMsg = "ECR Updated successfully";
               app.errorMsg = false;
            }
            }).catch(function(err) {
            console.log(err);
            });
            }
       
           
        };
    

}
    function getRegionData(regionService,$scope){
        regionService.getRegion().then(function(res) {
           $scope.regionList = res.data;
           }).catch(function(err) {
           console.log(err);
       });
   }

    function getResourceData(resourceService,$scope){
        resourceService.getResources($scope.region).then(function(res) {
           $scope.resourceList = res.data;
           }).catch(function(err) {
           console.log(err);
       });
     }

    function getECRData(ecrService,$scope){
        ecrService.getEcr($scope.region).then(function(res) {
           $scope.mongoECRData = res.data;
           }).catch(function(err) {
           console.log(err);
       });
   }

   function openDialog() {
    $('#confirmModal').modal('show');
    }

})();