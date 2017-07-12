
 (function() {
 'use strict';
 
angular.module('pmoApp').controller('resourceMappingCtrl', Controller);
 
 Controller.$inject = ['$scope', '$rootScope', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile','resourceMappingService','resourceService','roleService','locationService',
                       'regionService','skillSetService','statusService','resourceTypeService','holidayListService',
                        'monthlyHeaderListService'];
  
 function Controller($scope, $rootScope, DTOptionsBuilder, DTColumnBuilder, $compile, resourceMappingService,resourceService,roleService,locationService,
                        regionService,skillSetService,statusService,resourceTypeService,holidayListService,monthlyHeaderListService) {

 //$scope.resourcemap = {};
 $rootScope.Title = "Resource Map Listing";
 var app = $scope;

 $scope.resourcemap = {        
        'taggToEuroclear': [],
        'monthlyAvailableActualMandays' :[]
    };

 $scope.mongoMappedResourceData = [];
 getMappedResourceData(resourceMappingService,$scope);

 $scope.resourceList = [];
 getResourceData(resourceService,$scope);

 //$scope.roleList = [];
 //getRoleData(roleService,$scope);


 $scope.locationList = [];
 getLocationData(locationService,$scope);

 $scope.regionList = [];
 getRegionData(regionService,$scope);
 
 
 $scope.skillSetList = [];
 getSkillSetData(skillSetService,$scope);

 $scope.statusList = [];
 getStatusData(statusService,$scope);
 
  
 $scope.resourceTypeList = [];
 getResourceTypeData(resourceTypeService,$scope);

 $scope.taggedToEuroclearList = [];
 prepareTagToEuroclearHeading($scope,monthlyHeaderListService);

 //$scope.aggegrateHolidayList = [];
 //$scope.monthWorkDaysListForLocation = [];
 //prepareHolidayListForLocation(holidayListService,$scope);
  
 $scope.clearFields = function (){
     $scope.resourcemap = {
        'taggToEuroclear': [],
        'monthlyAvailableActualMandays' : []
     };
     app.loading =false;
     app.successMsg = false;
     app.errorMsg = false;
     app.errorClass = "";
 }
 

 $scope.deleteResourceMapping = function(id) {
     if (confirm('Are you sure to delete?')) {
     resourceMappingService.deleteResourceMapping(id).then(function(res) {
     if (res.data == "deleted") {
       getMappedResourceData(resourceMappingService,$scope);
       app.loading = false;
       app.successMsg = "Resource mapping Deleted successfully";
       app.errorMsg = false;
     }
     }).catch(function(err) {
     console.log(err);
     });
     }
 };
 
$scope.editResourceMapping = function (id) {
     $rootScope.Title = "Edit Designation";
     resourceMappingService.getMappedResourceForID(id).then(function(res) {
     $scope.resourcemap = res.data;
     }).catch(function(err) {
     console.log(err);
     });
 
 };
 
 $scope.saveData = function(resourcemap) {
     $rootScope.Title = "Update resourcemap";
     if ($scope.resourceMappingForm.$valid) {
            prepareTaggedToEuroclearData($scope,resourcemap);        
            prepareData(resourceMappingService,app,holidayListService,$scope,resourcemap,false,monthlyHeaderListService);
     }else{
            app.loading =false;
            app.successMsg = false;
            app.errorMsg = "Please Enter Required value";
            app.errorClass = "error"
     }
 };
 
 $scope.createResourceMapping = function(resourcemap) {
     $rootScope.Title = "Create resourcemap";
     $scope.IsSubmit = true;             
     //if (false) {
     if ($scope.resourceMappingForm.$valid) {  
         prepareTaggedToEuroclearData($scope,resourcemap);        
         prepareData(resourceMappingService,app,holidayListService,$scope,resourcemap,true,monthlyHeaderListService);         
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
         
         $scope.childInfo = function(resourcemap, event){
            var scope = $scope.$new(true);      
                scope.resourcemap  = resourcemap;

            var link = angular.element(event.currentTarget),
                icon = link.find('.glyphicon'),
                tr = link.parent().parent(),
                table = $scope.vm.dtInstance.DataTable,        
                row = table.row(tr);
            
              if (row.child.isShown()) {
                icon.removeClass('glyphicon-minus-sign').addClass('glyphicon-plus-sign');             
                row.child.hide();
                tr.removeClass('shown');
              }
              else {
                icon.removeClass('glyphicon-plus-sign').addClass('glyphicon-minus-sign');
                row.child($compile('<div resourcemap-child-directive class="clearfix"></div>')(scope)).show();
                tr.addClass('shown');
              }
        }

}

function createResoucreMap(resourceMappingService,app,$scope){
    resourceMappingService.createResourceMapping($scope.resourcemap).then(function(res) {
         if (res.data == "created") {
            getMappedResourceData(resourceMappingService,$scope);
            $scope.resourcemap = {
                'taggToEuroclear': [],
                'monthlyAvailableActualMandays' : []
            };
            app.loading =false;
            app.successMsg = "Resource mapping created successfully";
            app.errorMsg = false;
         }
         }).catch(function(err) {
         console.log(err);
         });
}

function saveResoucreMap(resourceMappingService,app,$scope){
    resourceMappingService.updateResourceMapping($scope.resourcemap).then(function(res) {
         if (res.data == "updated") {
            getMappedResourceData(resourceMappingService,$scope);
            $scope.resourcemap = {
                'taggToEuroclear': [],
                'monthlyAvailableActualMandays' : []
            };
            app.loading =false;
            app.successMsg = "Resource mapping updated successfully";
            app.errorMsg = false;
         }
         }).catch(function(err) {
         console.log(err);
         });
}

function prepareData(resourceMappingService,app,holidayListService,$scope,resourcemap,isCreate,monthlyHeaderListService){

  prepareHolidayListForLocation(resourceMappingService,app,holidayListService,$scope,resourcemap,isCreate,monthlyHeaderListService);
}

function prepareHolidayListForLocation(resourceMappingService,app,holidayListService,$scope,resourcemap,isCreate,monthlyHeaderListService){          
           holidayListService.getAggegrateLocationHolidays(resourcemap.location).then(function(res) {
                         prepareWorkingDaysForGivenRange(resourceMappingService,app,$scope,res.data,resourcemap,isCreate,monthlyHeaderListService);
                         }).catch(function(err) {
                         console.log(err);
                     });         

    }

function prepareWorkingDaysForGivenRange(resourceMappingService,app, $scope,aggegrateHolidayList,resourcemap,isCreate,monthlyHeaderListService){
         var theMonths = monthlyHeaderListService.getMonthList();
         var monthWorkDays = [];
         var taggedToEuroclearList = $scope.taggedToEuroclearList;
         var location = resourcemap.location;
         
           for(var j=0; j<taggedToEuroclearList.length; j++){
               var leaveFound = false;
               for(var i=0; i< aggegrateHolidayList.length; i++){ 
                    var monthyearLabel = theMonths[aggegrateHolidayList[i]._id.month - 1]  + '-' + 
                             (aggegrateHolidayList[i]._id.year.toString()).substring(2, 4);
                     if(monthyearLabel == taggedToEuroclearList[j]){
                       var workdays =  getWorkDays(aggegrateHolidayList[i]._id.month - 1 ,aggegrateHolidayList[i]._id.year);
                       var realWorkDays = workdays - aggegrateHolidayList[i].number;
                       var monthWorkDaysObject = {"location" : location, "monthyear" : monthyearLabel, "value" : realWorkDays};
                       monthWorkDays.push(monthWorkDaysObject);
                       leaveFound = true;
                       break;
                     }
                
               }

               if(!leaveFound){
                     var headeingLabelArray = taggedToEuroclearList[j].split('-');
                     var month = theMonths.indexOf(headeingLabelArray[0]);
                     var year = '20' + headeingLabelArray[1] ;
                     var workdays =  getWorkDays(month ,year);
                     var monthWorkDaysObject = {"location" : location, "monthyear" : taggedToEuroclearList[j], "value" : workdays};
                     monthWorkDays.push(monthWorkDaysObject);
               }
                 
            }
          
          

         prepareActualAvailableMandaysData(resourceMappingService,app, $scope,resourcemap,monthWorkDays,isCreate,monthlyHeaderListService);
    }


function prepareActualAvailableMandaysData(resourceMappingService,app, $scope,resourcemap,monthWorkDaysListForLocation,isCreate,monthlyHeaderListService){
           var theMonths = monthlyHeaderListService.getMonthList();
           var taggedToEuroclearList = $scope.taggedToEuroclearList;
           var monthlyAvailableActualMandaysArray = [];
           var mappedResourceLocation = resourcemap.location;
                  
                for(var j=0; j<taggedToEuroclearList.length; j++){
                      
                     for(var k=0; k<monthWorkDaysListForLocation.length; k++){                   
                       if((mappedResourceLocation == monthWorkDaysListForLocation[k].location)
                             && (taggedToEuroclearList[j] == monthWorkDaysListForLocation[k].monthyear)){
                               var taggToEuroclearPercentage = getTaggToEuroclearPercentageForMonth(resourcemap,taggedToEuroclearList[j]);
                               var actualWorkingDays = (monthWorkDaysListForLocation[k].value)*(taggToEuroclearPercentage/100);
                               var actualWorkingDaysWithRound = monthlyHeaderListService.getRoundNumber(actualWorkingDays, 1);
                               var monthlyAvailableActualMandaysObject = {
                                "key" : taggedToEuroclearList[j],
                                "value" : actualWorkingDaysWithRound
                             };
                              monthlyAvailableActualMandaysArray.push(monthlyAvailableActualMandaysObject);
                              break;

                       }
                    }

               

                }


           $scope.resourcemap.monthlyAvailableActualMandays = monthlyAvailableActualMandaysArray;
           if(isCreate){
             createResoucreMap(resourceMappingService,app,$scope);
           }else{
             saveResoucreMap(resourceMappingService,app,$scope);
           }
           
    }

function getTaggToEuroclearPercentageForMonth(resourcemap,monthyear){

   for(var i=0; i<resourcemap.taggToEuroclear.length;i++){
     if(monthyear == resourcemap.taggToEuroclear[i].key){
          return resourcemap.taggToEuroclear[i].value;
     }
   }
}


function prepareTagToEuroclearHeading($scope,monthlyHeaderListService){
      
        $scope.taggedToEuroclearList = monthlyHeaderListService.getHeaderList();

    }

 function prepareTaggedToEuroclearData($scope,resourcemap){
     var taggedToEuroclearArray = [];
     var taggedToEuroclearObject = {};

     for(var i=0;i<$scope.taggedToEuroclearList.length;i++){
       var taggedToEuroclearObject = {
         "key" : $scope.taggedToEuroclearList[i],
         "value" : resourcemap.taggToEuroclear[i].value
       };
           taggedToEuroclearArray.push(taggedToEuroclearObject);
     }

     $scope.resourcemap.taggToEuroclear = taggedToEuroclearArray;
 }

 function getDaysInMonth(month,year) {
       return new Date(year, month+1, 0).getDate();
}

function getWorkDays(month, year){
        var days = getDaysInMonth(month, year);
        console.log(days);
        var workdays = 0;
        for(var i = 0; i < days; i++) {
            if (isWorkDay(year, month, i+1)) {
                workdays++;
                }
        }
        return workdays;

     }

function isWorkDay(year, month, day){
        var date = new Date(year, month, day);        
        var dayOfWeek =  date.getDay();    
        return (dayOfWeek >=1 && dayOfWeek <=5); // Sun = 0, Mon = 1, and so forth
    }


 function getMappedResourceData(resourceMappingService,$scope){
      resourceMappingService.getMappedResources().then(function(res) {
         $scope.mongoMappedResourceData = res.data;
         }).catch(function(err) {
         console.log(err);
     });
 }

 function getResourceData(resourceService,$scope){
      resourceService.getResources().then(function(res) {
         $scope.resourceList = res.data;
         }).catch(function(err) {
         console.log(err);
     });
 }

 /*function getRoleData(roleService,$scope){
      roleService.getRole().then(function(res) {
         $scope.roleList = res.data;
         }).catch(function(err) {
         console.log(err);
     });
 }*/

 function getLocationData(locationService,$scope){
      locationService.getLocation().then(function(res) {
         $scope.locationList = res.data;
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


 function getSkillSetData(skillSetService,$scope){
       skillSetService.getSkillSets().then(function(res) {
           $scope.skillSetList = res.data;
           }).catch(function(err) {
           console.log(err);
         });
 }

 function getStatusData(statusService,$scope){
      statusService.getStatus().then(function(res) {
         $scope.statusList = res.data;
         }).catch(function(err) {
         console.log(err);
     });
 }

  function getResourceTypeData(resourceTypeService,$scope){
      resourceTypeService.getResourceType().then(function(res) {
         $scope.resourceTypeList = res.data;
         }).catch(function(err) {
         console.log(err);
     });
 }

 })();