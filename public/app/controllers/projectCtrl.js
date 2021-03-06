(function() {
 'use strict';
 
angular.module('pmoApp').controller('projectCtrl', Controller);
 
 Controller.$inject = ['$scope', '$rootScope', 'projectService','regionService','resourceService', 'DTOptionsBuilder', 'DTColumnBuilder','$window','$filter'];
  
 function Controller($scope, $rootScope, projectService,regionService,resourceService, DTOptionsBuilder, DTColumnBuilder,$window,$filter) {
 $scope.mongoProjectData = [];
 $scope.regionList = [];
 var app = $scope;

 $scope.region = $window.localStorage.getItem("region");
 
 $rootScope.Title = "Project Listing";
 getProjectData(projectService,$scope); 
 getRegionData(regionService,$scope);


 $scope.resourceList = [];
 getResourceData(resourceService,$scope);
  
 $scope.clearFields = function (){
 
     $scope.project = {};
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
 
 $scope.cancel = function(event){
    $scope.msg = "";
    $scope.deletedID = "";
 }
 
 $scope.delete = function(event) {
     //if (confirm('Are you sure to delete?')) {
         projectService.deleteProject($scope.deletedID).then(function(res) {
         if (res.data == "deleted") {
           getProjectData(projectService,$scope);
    	   app.loading = false;
           app.successMsg = "Project Deleted successfully";
           app.errorMsg = false;
           $scope.msg = "";
           $scope.deletedID = "";
         }
         }).catch(function(err) {
         console.log(err);
         });
     //}
 };
 
$scope.editProject = function (id) {
     $rootScope.Title = "Edit Project";
     projectService.getProjectForID(id).then(function(res) {
         res.data.startDate =  $filter('date')(new Date(res.data.startDate), 'dd-MMM-yy');
         res.data.endDate =  $filter('date')(new Date(res.data.endDate), 'dd-MMM-yy');
     $scope.project = res.data;
     }).catch(function(err) {
     console.log(err);
     });
 
 };
 
 $scope.saveData = function(project) {
     if ($scope.projectForm.$valid) {
     projectService.updateProject(project).then(function(res) {
     if (res.data == "updated") {
        getProjectData(projectService,$scope);
        $scope.project = {};
		app.loading =false;
        app.successMsg = "Project Updated successfully";
        app.errorMsg = false;
     }
     }).catch(function(err) {
     console.log(err);
     });
     }

    
 };

 $scope.numberofdays = function (startDate, endDate) {
    
                if (endDate != null && startDate != null) {
                    if (new Date(startDate) > new Date(endDate)) {
                        console.log("Start Date should be less than End date");
                        app.loading = false;
                        app.successMsg = false;
                        app.errorMsg = "Start Date should be less than End date";
                        app.errorClass = "error"
                    } 
                }
            };

            function monthwiseLeave(days, fromDate, toDate, $scope) {
                
                            var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                
                            $scope.monthwiseLeave = [];
                
                            function Object(month, days) {
                                this.month = month
                                this.value = days
                            }
                
                            var totalDays = days;
                            var fDate = new Date(fromDate);
                            var lDate = new Date(fDate.getFullYear(), fDate.getMonth() + 1, 0);
                            var dt = 0;
                            var month = "";
                            while (totalDays > 0) {
                                dt = daysDiff(fDate, lDate);
                                month = monthNames[fDate.getMonth()] + "-" + fDate.getFullYear().toString().substr(-2);
                                if (totalDays > dt) {
                                    $scope.monthwiseLeave.push(new Object(month, dt));
                                    totalDays = totalDays - dt;
                                    fDate = new Date(fDate.getFullYear(), fDate.getMonth() + 1, 1);
                                    lDate = new Date(fDate.getFullYear(), fDate.getMonth() + 1, 0);
                                } else {
                                    $scope.monthwiseLeave.push(new Object(month, totalDays));
                                    break;
                                }
                            }
                
                        }
 
 $scope.createProject = function(project) {
     $rootScope.Title = "Create Project";
     $scope.IsSubmit = true;
     if ($scope.projectForm.$valid) {
         projectService.getProjectForName($scope.project.projectname,$scope.project.regionname).then(function(res) {
            console.log(res.data.length);
            if(res.data.length == 0){
              projectService.createProject(project).then(function(res) {  
            
                     if (res.data == "created") {
                        getProjectData(projectService,$scope); 
                        $scope.project = {};
                        app.loading =false;
                        app.successMsg = "Project created successfully";
                        app.errorMsg = false;                        
                     }
                     }).catch(function(err) {
                         console.log(err);
                         app.loading =false;
                         app.errorMsg = "Error in creation";
                         app.successMsg = false;
                         app.errorClass = "error";
                     });
            }else  if(res.data.length > 0){
                         app.loading =false;
                         app.errorMsg = "Project already exist";
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

//=========================Data table==========================//
        $scope.vm = {};
        $scope.vm.dtInstance = null;  
        $scope.vm.dtOptions = DTOptionsBuilder.newOptions().withOption('order', [0, 'asc']);
        $scope.vm.dtOptions.withDOM('Bfrtip');
        $scope.vm.dtOptions.withOption('buttons',['copy', 'print', 'pdf','excel']);
//=============================================================//

   $scope.exportToExcel = function(){
         projectService.getExportToExcelData().then(function(res) {  
              var byteCharacters = $window.atob(res.data);
                    var byteArrays = [];
                    var contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                    var sliceSize = sliceSize || 512;
                    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                      var slice = byteCharacters.slice(offset, offset + sliceSize);
                      var byteNumbers = new Array(slice.length);
                      for (var i = 0; i < slice.length; i++) {
                        byteNumbers[i] = slice.charCodeAt(i);
                      }
                      var byteArray = new Uint8Array(byteNumbers);
                      byteArrays.push(byteArray);
                    }
                    var blob = new Blob(byteArrays, {type: contentType});
                    var blobUrl = URL.createObjectURL(blob);
                    $window.location = blobUrl;
                    //$window.open(blob);

             }).catch(function(err) {
             console.log(err);
         });

       }


 }

 function getProjectData(projectService,$scope){
      projectService.getProject($scope.region).then(function(res) {
         $scope.mongoProjectData = res.data;
         }).catch(function(err) {
         console.log(err);
     });
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

 function openDialog(){
    $('#confirmModal').modal('show');
 }
 
   })();