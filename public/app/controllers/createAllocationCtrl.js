 (function() {
 
var app =angular.module('pmoApp');


app.controller('createAllocationCtrl', Controller);
	
 	app.filter('projectfilter', function() {
		   return function(collection, keyname) {
		      var output = []; 
		      angular.forEach(collection, function(item) {
		           if(item.projectname != keyname) {
		              output.push(item);
		          }
		      });
		      return output;
		   };
	});
 		

	function eachMonthAllocaiton(source,target){

			function Object(month,value) {  // new object create for each month
				  this.month = month;
				  this.value = value;
			}

			var tempAlloc =0;
			var newAlloc = [];
			angular.forEach(source,function(month){
				tempAlloc =0;
				angular.forEach(target,function(oldMonth){
					if(oldMonth.month === month){
						tempAlloc = oldMonth.value;
						return;
					}

				});
				newAlloc.push(new Object(month,tempAlloc));

			});

		 	return newAlloc;
    };
  
   	
Controller.$inject = ['$scope','resourceService','projectService','resourceMappingService','allocationService','$filter'];

	function Controller($scope,resourceService,projectService,resourceMappingService,allocationService,$filter) {

		$scope.detailDiv =true;
		$scope.resource = [];
 		$scope.projects = [];
 		$scope.resourceWiseAllocaiton =[]; 
 		$scope.startDate;
 		$scope.endDate;
		$scope.months=[];
		$scope.mappedResourceData=[];
		$scope.successMsg ="";
		$scope.errorMsg ="";
	
		function allocObject(object){
		 	var month;
		 	var allocation;
		 	var date;
  			return {
		  		month : object.month,
		  		value: object.value,
		  		date : object.date,
		  		project:object.project,
		  		label:object.label,
			}
    	};

    	getMappedResourceData(resourceMappingService,$scope);
      	getProjectData(projectService,$scope);
      		
		$scope.createAllocation = function(){

			if($scope.resource.length <= 0){
				$scope.errorMsg ="Please select a resource."
				return;
			}

			if($scope.startDate === undefined && typeof $scope.startDate === "undefined" || 
				$scope.endDate === undefined && typeof $scope.endDate === "undefined"){
				$scope.errorMsg ="Please select a date range."
				return;
			}

			Date.prototype.monthName = function() {
    			return this.toUTCString().split(' ')[2]
			};
			
    		var monthCol =  months($scope.startDate,$scope.endDate);
			angular.forEach(monthCol,function(label){
				$scope.monthWiseAllocation = {
					month : label,  // this is allocation month name
					value : 0,
				}
		       	$scope.months.push($scope.monthWiseAllocation);
       		});

 			for(var res=0;res < $scope.resource.length;res++){
 				$scope.rowWiseAllocation = {
	      			resource: 			$scope.resource[res],
	     			project: 			$scope.projselect,
	     			startdate:          $scope.startDate,
	     			enddate:            $scope.endDate,
	     			allocation: 		[],
	     			rowSelect:          true
     			};
     						
				angular.forEach($scope.months, function(item){
				      var obj=	new allocObject(item);
				      $scope.rowWiseAllocation.allocation.push(obj);
				});

     			$scope.resourceWiseAllocaiton.push($scope.rowWiseAllocation);
 			}
    		$scope.resource = [];
			$scope.detailDiv = false;
		}

		$scope.saveAllocation = function(){
			if($scope.resourceWiseAllocaiton.length > 0){
				angular.forEach($scope.resourceWiseAllocaiton,function(item){
					if(item.rowSelect) {// if row delete in screen,then it should not save
						if(item.project === undefined && typeof item.project === "undefined"){
							$scope.errorMsg="Please select a project.";
							error = true;
							return;
						}

			  		    allocationService.createAllocation(item).then(function(res) {
					        if (res.data == "created") {
					        	$scope.successMsg ="Allocaiton created successfully";
					        }
				         }).catch(function(err) {
				         	console.log(err);
				      	});
				    }
			    });
			}else{
				$scope.errorMsg="Please select a project.";
			}
		   
	    }
 
 		$scope.cancel = function(){
			$scope.detailDiv = true;
		}



		$scope.removeAllocation = function(rowId){
			$("#"+rowId).hide();
			$scope.resourceWiseAllocaiton[rowId].rowSelect=false;
			var rowDelete =$filter('filter')($scope.resourceWiseAllocaiton, {rowSelect: false}); 
			if($scope.resourceWiseAllocaiton.length === rowDelete.length){
				$scope.months=[];
			}
		}


		$scope.clearAllocation = function(rowId){
			angular.forEach($scope.resourceWiseAllocaiton[rowId].allocation,function(item){
				item.value =0;
			});
		}

		$scope.clearFields = function(){
			$scope.startDate="";
 			$scope.endDate="";
 			$scope.months=[];
 			$scope.resourceWiseAllocaiton=[];
 			/*var checkedElements =$('#resource-select');
 			console.log(checkedElements.length);
 			for(var i = 0, length = checkedElements.length; i < length; i++) {	
 				console.log(checkedElements[i].selected);
			    checkedElements[i].selected = false;
			};
 			$('#resource-select').find($('option')).attr('selected',false);*/
 			

		}

		
 	function getProjectData(projectService,$scope){
      	projectService.getProject().then(function(res) {
	        $scope.project=res.data;
	    }).catch(function(err) {
        console.log(err);
     });
         
	}


	function getMappedResourceData(resourceMappingService,$scope){
      resourceMappingService.getMappedResources().then(function(res) {
        $scope.mappedResourceData = res.data;
        var htm = '';
      
        angular.forEach($scope.mappedResourceData, function(item){
        	htm += '<option>' + item.mappedResource.resourcename + '</option>';
        });
        
        $('#resource-select').append(htm);
        $('#resource-select').multiselect('rebuild');
        }).catch(function(err) {
         console.log(err);
     });
 	}

	
    function months(from, to) {
    	var monthNames = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
        var arr = [];
        var datFrom = new Date(from);
        var datTo = new Date(to);
        var fromYear =  datFrom.getFullYear();
        var toYear =  datTo.getFullYear();
        var diffYear = (12 * (toYear - fromYear)) + datTo.getMonth();
    
        for (var i = datFrom.getMonth(); i <= diffYear; i++) {
            arr.push(monthNames[i%12] + "-" + Math.floor(fromYear+(i/12)).toString().substr(-2));
        }        
        
        return arr;
    }
}

})();