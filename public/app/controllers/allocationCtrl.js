 (function() {
 
var app =angular.module('pmoApp');

app.controller('allocationCtrl', Controller);

	app.directive('selectproject', function() {
	    var directive = {};
	    directive.restrict = 'E';
	    scope: {
	            filterby:'=';
	     }

    	directive.compile = function(element, attributes) {
	        var linkFunction = function($scope, element, atttributes) {

	        var selectHtml=	'<select ng-model="allocRows.project"  style="">'+
	        			'<option value="?" selected="selected"></option><option label="CR" value="string:CR">CR</option><option label="Vacation" value="string:Vacation">Vacation</option>'+
	        			'</select>';


	           	/*var selectHtml="<select id='f'  ng-model='allocRows.project' class='ng-untouched ng-dirty ng-empty ng-invalid ng-invalid-required'>";
	    		angular.forEach($scope.project, function(item){
       				selectHtml += "<option value="+item.projectname+">" + item.projectname + "</option>";
        		});
	           	selectHtml +="<select>";*/

	           element.replaceWith(selectHtml);
	        }



	        return linkFunction;
		}
		return directive;
	});

 	app.filter('resourceunique', function() {
		   return function(collection, keyname) {
		      var output = [], 
		          keys = [];

		      angular.forEach(collection, function(item) {
		          var key = item[keyname];
		          if(keys.indexOf(key) === -1) {
		              keys.push(key);
		              output.push(item);
		          }
		      });

		      return output;
		   };
	})

	
	function filter(scope,collection, resource,leaveService,showdetail) {
		if(showdetail) return; // if details is going to close then return
		
		var resourceDetails = [];
		var sMonth=[];
		var eMonth=[];

		angular.forEach(collection, function(item) {
			if(item.resource === resource) {
				resourceDetails.push(item);
				sMonth.push(item.startdate);
				eMonth.push(item.enddate);
			}
		});

		sMonth.sort(date_sort_asc);
		eMonth.sort(date_sort_desc);

		scope.monthLabel = months(sMonth[0],eMonth[0]);

		angular.forEach(resourceDetails,function(item){
			item.allocation = eachMonthAllocaiton(scope.monthLabel,item.allocation);
			
		});

		console.log(sMonth[0]+'='+eMonth[0]);

		leaveService.getLeaveForResource(resource,'2017-07-30','2018-02-13').then(function(res) {
         	console.log(res.data);
         }).catch(function(err) {
         console.log(err);
     });

		return resourceDetails;
	}

	function eachMonthAllocaiton(source,target){

			function Object(month,value) {  // new object create for each month
				  this.month = month;
				  this.allocationValues = value;
			}

			var tempAlloc =0;
			var newAlloc = [];
			angular.forEach(source,function(month){
				tempAlloc =0;
				angular.forEach(target,function(oldMonth){
					if(oldMonth.month === month){
						tempAlloc = oldMonth.allocationValues;
						return;
					}

				});
				newAlloc.push(new Object(month,tempAlloc));

			});

		 	return newAlloc;
    };

 	
Controller.$inject = ['$scope','DTOptionsBuilder', 'DTColumnBuilder', '$compile','resourceService','projectService','allocationService','leaveService','$filter'];

	function Controller($scope,DTOptionsBuilder, DTColumnBuilder, $compile,resourceService,projectService,allocationService,leaveService,$filter) {

		$scope.detailDiv =true;
		$scope.resource = [];
 		$scope.projects = [];
 		$scope.resourceWiseAllocaiton =[]; 
 		$scope.startDate;
 		$scope.endDate;
		$scope.months=[];
		$scope.allocationList =[]; 


		function allocObject(object){
		 	var month;
		 	var allocation;
		 	var date;
  			return {
		  		month : object.month,
		  		allocationValues: object.allocationValues,
		  		date : object.date,
		  		project:object.project,
		  		label:object.label,
			}
    	};

 		getProjectData(projectService,$scope);
 		getResourceData(resourceService,$scope);
		getAlloctionData(allocationService,$scope);
	
		$scope.createAllocation = function(){

			if($scope.resource.length <= 0){
				alert('Please select a resource');
				return;
			}

			Date.prototype.monthName = function() {
    			return this.toUTCString().split(' ')[2]
			};
			
    		var monthCol =  months($scope.startDate,$scope.endDate);
			angular.forEach(monthCol,function(label){
				$scope.monthWiseAllocation = {
					month : label,  // this is allocation month name
					allocationValues : 0,
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
			angular.forEach($scope.resourceWiseAllocaiton,function(item){
	  		    allocationService.createAllocation(item).then(function(res) {
			         if (res.data == "created") {
			            getAlloctionData(allocationService,$scope);
			         }
		         }).catch(function(err) {
		         	console.log(err);
		      	});
		    });
		    $scope.resourceWiseAllocaiton=[];
	    }
 
 		$scope.cancel = function(){
			$scope.detailDiv = true;
		}


		$scope.updateAllocaiton = function(resource){
			angular.forEach($scope.allocationList,function(item){
				if(item.resource === resource){
					console.log(item);
					allocationService.updateAllocation(item).then(function(res) {
				         if (res.data == "created") {
				         		console.log('updated');
				         }
			         }).catch(function(err) {
			         	console.log(err);
			      	});
			     }

			});
	
			
		}

		/*$scope.completeProjects=function(){
			var projectnames = [];
		    angular.forEach($scope.project, function(value,key){
		    	projectnames.push(value.projectname);
	           	console.log("#######################"+projectnames);
	         });
		   	 $( "#project" ).autocomplete({	    	
		      source: projectnames
	   		 });
   		 } */

   		 /*$scope.completeResources=function(){
			var resourcenames = [];
		    console.log($scope.resourceData);
		    angular.forEach($scope.resourceData, function(value,key){
		    	resourcenames.push(value.resourcename);
	           	console.log("#######################"+resourcenames);
	         });
		   	 $( "#resource" ).autocomplete({	    	
		      source: resourcenames;
	   		 });
   		 } */


  		///////////////////////// start Datatable Code /////////////////////////////////

 		$scope.vm = {};
		$scope.vm.dtInstance = null;  
		$scope.vm.dtOptions = DTOptionsBuilder.newOptions()
		  .withOption('order', [0, 'asc']);
		
		$scope.childInfo = function(allocationList,resource, event){
			var scope = $scope.$new(true);      
		    var link = angular.element(event.currentTarget),
	          	icon = link.find('.glyphicon'),
	          	tr = link.parent().parent(),
	          	table = $scope.vm.dtInstance.DataTable,        
	          	row = table.row(tr);

	        scope.allocCollection  = filter(scope,allocationList,resource,leaveService,row.child.isShown());	
	        
		    if (row.child.isShown()) {
		        icon.removeClass('glyphicon-minus-sign').addClass('glyphicon-plus-sign');             
		        row.child.hide();
		        tr.removeClass('shown');
		    }
		    else {
		        icon.removeClass('glyphicon-plus-sign').addClass('glyphicon-minus-sign');
		        row.child($compile('<div tmpl class="clearfix"></div>')(scope)).show();
		        tr.addClass('shown');
		    }
		}
		
		///////////////////////// End  Datatable Code /////////////////////////////////
	}

 	
	function getResourceData(resourceService,$scope){

      	resourceService.getResources().then(function(res) {
        $scope.resourceData = res.data;
        var htm = '';
      
        angular.forEach($scope.resourceData, function(item){
        	htm += '<option>' + item.resourcename + '</option>';
        });
        $('#resource-select').append(htm);
        $('#resource-select').multiselect('rebuild');


         }).catch(function(err) {
         console.log(err);
     });
 	}

 	function getProjectData(projectService,$scope){
      	projectService.getProject().then(function(res) {
	        $scope.project=res.data;
         }).catch(function(err) {
         console.log(err);
     });
	}

	function getAlloctionData(allocationService,$scope){
      	allocationService.getAllAllocation().then(function(res) {
	        $scope.allocationList=res.data;
	        angular.forEach($scope.allocationList,function(item){
	        });
        }).catch(function(err) {
         console.log(err);
     });
	}
	
	function date_sort_asc (date1, date2) {
	  if (date1 > date2) return 1;
	  if (date1 < date2) return -1;
	  return 0;
	}

	function date_sort_desc(date1, date2) {
		  if (date1 > date2) return -1;
		  if (date1 < date2) return 1;
		  return 0;
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

})();