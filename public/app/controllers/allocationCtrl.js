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

	app.filter('resourcewise', function() {
		return function(collection, resourcename) {
			console.log('resourcename'+resourcename)	;
		    var output = [];
		    angular.forEach(collection, function(item) {
		    	if(item.resource === resourcename) {
		              output.push(item);
		        }
		    });
		    return output;
		};
	})

	function filter(collection, resource,showdetail) {
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

		console.log('StartDt'+sMonth[0]);
		console.log('EndDate'+eMonth[0]);




		console.log(resourceDetails.length);
		return resourceDetails;
	}

 	
Controller.$inject = ['$scope','DTOptionsBuilder', 'DTColumnBuilder', '$compile','resourceService','projectService','allocationService','$filter'];

	function Controller($scope,DTOptionsBuilder, DTColumnBuilder, $compile,resourceService,projectService,allocationService,$filter) {

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
			
			var vStartDt = new Date($scope.startDate);
    		var vEndDt = new Date($scope.endDate);

			while(vStartDt <= vEndDt){
				$scope.monthWiseAllocation = {
					date:vStartDt, // this is allocation date 
					month :vStartDt.monthName(),  // this is allocation month name
					label : vStartDt.monthName()+"/"+vStartDt.getFullYear().toString().substring(2), // this value show header of row as month/year
					allocationValues : 0,
				};
			
		       	$scope.months.push($scope.monthWiseAllocation);

				var newDate = vStartDt.setMonth(vStartDt.getMonth() + 1);
       			vStartDt = new Date(newDate);

       		}

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

    		//$scope.users.push($scope.inserted);
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


		$scope.saveDetails = function(){

			//$scope.allocationList
			alert('save details');
		}

  
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

	          scope.allocCollection  = filter(allocationList,resource,row.child.isShown());	

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
	  // This is a comparison function that will result in dates being sorted in
	  // ASCENDING order. As you can see, JavaScript's native comparison operators
	  // can be used to compare dates. This was news to me.
	  if (date1 > date2) return 1;
	  if (date1 < date2) return -1;
	  return 0;
	}

	function date_sort_desc(date1, date2) {
		  // This is a comparison function that will result in dates being sorted in
		  // DESCENDING order.
		  if (date1 > date2) return -1;
		  if (date1 < date2) return 1;
		  return 0;
	}

})();