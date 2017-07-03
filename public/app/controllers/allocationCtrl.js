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
				};
			
		       	$scope.months.push($scope.monthWiseAllocation);

				var newDate = vStartDt.setMonth(vStartDt.getMonth() + 1);
       			vStartDt = new Date(newDate);

       		}

 			for(var res=0;res < $scope.resource.length;res++){
 				$scope.rowWiseAllocation = {
	      			resource: 				$scope.resource[res],
	     			project: 				$scope.projselect,
	     			allocationmonth: 		[],
     			};
     						
				angular.forEach($scope.months, function(item){
				      var obj=	new allocObject(item);
				      $scope.rowWiseAllocation.allocationmonth.push(obj);
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
  
		///////////////////////// start Datatable Code /////////////////////////////////


 		$scope.vm = {};
		$scope.vm.dtInstance = null;  
		$scope.vm.dtOptions = DTOptionsBuilder.newOptions()
		  .withOption('order', [0, 'asc']);
		
		$scope.childInfo = function(allocation, event){
			var scope = $scope.$new(true);      
		      	scope.allocation  = allocation;

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
	        console.log($scope.allocationList.length);
        }).catch(function(err) {
         console.log(err);
     });
	}
})();