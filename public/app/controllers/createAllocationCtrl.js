(function () {

	var app = angular.module('pmoApp');


	app.controller('createAllocationCtrl', Controller);

	app.filter('projectfilter', function () {
		return function (collection, keyname) {
			var output = [];
			angular.forEach(collection, function (item) {
				if (item.projectname != keyname) {
					output.push(item);
				}
			});
			return output;
		};
	});


	function eachMonthAllocaiton(source, target) {

		function Object(month, value) {  // new object create for each month
			this.month = month;
			this.value = value;
		}

		var tempAlloc = 0;
		var newAlloc = [];
		angular.forEach(source, function (month) {
			tempAlloc = 0;
			angular.forEach(target, function (oldMonth) {
				if (oldMonth.month === month) {
					tempAlloc = oldMonth.value;
					return;
				}

			});
			newAlloc.push(new Object(month, tempAlloc));

		});

		return newAlloc;
	};


	Controller.$inject = ['$scope', 'projectService', 'resourceMappingService', 'allocationService', 'resourceTypeService', '$filter'];

	function Controller($scope, projectService, resourceMappingService, allocationService, resourceTypeService, $filter) {

		$scope.detailDiv = true;
		$scope.resource = [];
		$scope.resourceWiseAllocaiton = [];
		$scope.resourceTypeList = [];
		$scope.startDate;
		$scope.endDate;
		$scope.months = [];
		$scope.mappedResourceData = [];
		$scope.successMsg = "";
		$scope.errorMsg = "";
		$scope.hidden = "none";

		function allocObject(object) {
			var month;
			var allocation;
			var date;
			return {
				month: object.month,
				value: object.value,
				date: object.date,
				project: object.project,
				label: object.label,
			}
		};

		getMappedResourceData(resourceMappingService, $scope);
		getProjectData(projectService, $scope);
		getResourceTypeData(resourceTypeService, $scope);

		$scope.createAllocation = function () {

			if ($scope.resource.length <= 0) {
				$scope.errorMsg = "Please select a resource."
				return;
			}

			var strDt = $scope.startDate.split("/");
			var endDt = $scope.endDate.split("/");

			var date_1 = new Date(strDt[1], parseInt(strDt[0]) - 1);
			var date_2 = new Date(endDt[1], parseInt(endDt[0]) - 1);
			var monthCol = "";
			if (date_1 != "Invalid Date" && date_2 != "Invalid Date") {
				if (date_2 >= date_1) {
					monthCol = months($scope.startDate, $scope.endDate);
				} else {
					$scope.errorMsg = "Please select a date range."
				}
			}


			// Date.prototype.monthName = function () {
			// 	return this.toUTCString().split(' ')[2]
			// };

			var monthCol = months($scope.startDate, $scope.endDate);
			angular.forEach(monthCol, function (label) {
				$scope.monthWiseAllocation = {
					month: label,  // this is allocation month name
					value: 0,
				}
				$scope.months.push($scope.monthWiseAllocation);
			});

			for (var res = 0; res < $scope.resource.length; res++) {
				$scope.rowWiseAllocation = {
					resource: $scope.resource[res],
					project: $scope.projselect,
					resourcetype: $scope.resourcetype,
					startdate: $scope.startDate,
					enddate: $scope.endDate,
					allocation: [],
					rowSelect: true
				};

				angular.forEach($scope.months, function (item) {
					var obj = new allocObject(item);
					$scope.rowWiseAllocation.allocation.push(obj);
				});

				$scope.resourceWiseAllocaiton.push($scope.rowWiseAllocation);
			}
			$scope.resource = [];
			$scope.detailDiv = false;
			$scope.hidden = "";

		}

		$scope.saveAllocation = function () {
			if ($scope.resourceWiseAllocaiton.length > 0) {
				angular.forEach($scope.resourceWiseAllocaiton, function (item) {
					if (item.rowSelect) {// if row delete in screen,then it should not save
						if (item.project === undefined && typeof item.project === "undefined") {
							$scope.errorMsg = "Please select a project.";
							error = true;
							return;
						}

						allocationService.createAllocation(item).then(function (res) {
							if (res.data == "created") {
								$scope.successMsg = "Allocaiton created successfully";
								$('#resource-select').multiselect('rebuild');
								$scope.startDate = "";
								$scope.endDate = "";
							}
						}).catch(function (err) {
							console.log(err);
						});
					}
				});
			} else {
				$scope.errorMsg = "Please select a project.";
			}
		}

		$scope.cancel = function () {
			$scope.detailDiv = true;
		}



		$scope.removeAllocation = function (rowId) {
			$("#" + rowId).hide();
			$scope.resourceWiseAllocaiton[rowId].rowSelect = false;
			var rowDelete = $filter('filter')($scope.resourceWiseAllocaiton, { rowSelect: false });
			if ($scope.resourceWiseAllocaiton.length === rowDelete.length) {
				$scope.months = [];
			}
		}


		$scope.clearAllocation = function (rowId) {
			angular.forEach($scope.resourceWiseAllocaiton[rowId].allocation, function (item) {
				item.value = 0;
			});
		}

		$scope.clearFields = function () {
			$('#resource-select').multiselect('rebuild');
			$scope.startDate = "";
			$scope.endDate = "";
			$scope.months = [];
			$scope.resourceWiseAllocaiton = [];
			$scope.hidden = "none";
		}


		function getProjectData(projectService, $scope) {
			projectService.getProject().then(function (res) {
				$scope.project = res.data;
			}).catch(function (err) {
				console.log(err);
			});

		}

		function getResourceTypeData(resourceTypeService, $scope) {
			resourceTypeService.getResourceType().then(function (res) {
				$scope.resourceTypeList = res.data;
			}).catch(function (err) {
				console.log(err);
			});
		}


		function getMappedResourceData(resourceMappingService, $scope) {
			resourceMappingService.getMappedResources().then(function (res) {
				$scope.mappedResourceData = filterUniqueResource(res.data);
				var htm = '';

				angular.forEach($scope.mappedResourceData, function (item) {
					htm += '<option>' + item.mappedResource.resourcename + '</option>';
				});

				$('#resource-select').append(htm);
				$('#resource-select').multiselect('rebuild');
			}).catch(function (err) {
				console.log(err);
			});
		}

		function filterUniqueResource(collection) {

			var output = [], keys = [], item;
			for (var col = 0; col < collection.length; col++) {
				item = collection[col];
				if (keys.indexOf(item.mappedResource.resourcename) <= -1) {
					output.push(item);
					keys.push(item.mappedResource.resourcename);
				}
			}
			return output;

		}



		function months(from, to) {
			var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
				"Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
			var arr = [];
			var datFrom = from.split("/");
			var datTo = to.split("/");

			var fromYear = parseInt(datFrom[1]);
			var toYear = parseInt(datTo[1]);

			var monthFrom = parseInt(datFrom[0]) - 1;
			var monthTo = parseInt(datTo[0]) - 1;

			var diffYear = (12 * (toYear - fromYear)) + monthTo;
			for (var i = monthFrom; i <= diffYear; i++) {
				arr.push(monthNames[i % 12] + "-" + Math.floor(fromYear + (i / 12)).toString().substr(-2));
			}

			return arr;
		}
	}

})();