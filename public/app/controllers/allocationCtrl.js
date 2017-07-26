(function () {

	var app = angular.module('pmoApp');

	app.filter('unique', function () {
		return function (collection, condition) {
			var output = [],
				keys = [];
			var splitKeys = condition.split('.');

			angular.forEach(collection, function (item) {
				var key = {};
				angular.copy(item, key);
				for (var i = 0; i < splitKeys.length; i++) {
					key = key[splitKeys[i]];
				}

				if (keys.indexOf(key) === -1) {
					keys.push(key);
					output.push(item);
				}
			});

			return output;
		};
	});


	app.controller('allocationCtrl', Controller);

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
	})


	function filter(scope, collection, resource, mappedResourceData, leaveList, showdetail) {
		if (showdetail) return; // if details is going to close then return

		var resourceDetails = [];
		var sMonth = [];
		var eMonth = [];

		angular.forEach(collection, function (item) {
			if (item.resource === resource) {
				resourceDetails.push(item);
				sMonth.push(item.startdate);
				eMonth.push(item.enddate);
			}
		});

		sMonth.sort(date_sort_asc);
		eMonth.sort(date_sort_desc);

		scope.monthLabel = months(sMonth[0], eMonth[0]);


		angular.forEach(resourceDetails, function (item) {
			item.allocation = eachMonthAllocaiton(scope.monthLabel, item.allocation);

		});

		//// Vacation  Calculate ////////////////////

		var leaveAllocation = {
			resource: resource,
			project: "Vacation",
			allocation: eachMonthLeave(scope.monthLabel, leaveList),
		};

		resourceDetails.push(leaveAllocation);

		//// Buffer time Calculate ////////////////////

		var actualMandays = [];
		var tagToEurocelar = [];

		for (var user = 0; user < mappedResourceData.length; user++) {

			if (mappedResourceData[user].mappedResource.resourcename === resource) {
				actualMandays.push(mappedResourceData[user].monthlyAvailableActualMandays);
				tagToEurocelar.push(mappedResourceData[user].taggToEuroclear);
				break;
			}
		}

		var bufferTotal = {
			resource: resource,
			project: "",
			allocation: bufferTime(resourceDetails, actualMandays, tagToEurocelar, scope.monthLabel),
		};

		resourceDetails.push(bufferTotal);
		return resourceDetails;
	}

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

	function eachMonthLeave(source, target) {

		function Object(month, value) {  // new object create for each month Leave
			this.month = month;
			this.value = value > 0 ? value : 0;
		}

		var temp = 0;
		var leaves = [];

		angular.forEach(source, function (monthLabel) {
			temp = 0;
			angular.forEach(target, function (leaves) {
				angular.forEach(leaves.leavedaysinmonth, function (leave) {
					if (leave.month === monthLabel) {
						temp = leave.value;
						return;
					}
				});
				if (temp > 0) return;
			});
			leaves.push(new Object(monthLabel, temp));
		});
		return leaves;
	};


	function bufferTime(resourceDetails, actualMandays, tagToEurocelar, monthLabel) {

		var total = [];
		var bufferTotal = [];

		function Object(month, value, conflict, actualMandays, percentalloc) {  // new object create for each month Leave
			this.month = month;
			this.value = value;
			this.conflict = conflict;
			this.actualMandays;
			this.percentalloc;
		}

		angular.forEach(resourceDetails, function (eachRows) {
			count = 0;
			angular.forEach(eachRows.allocation, function (months) {
				total[count] = parseInt(months.value) + parseInt((total[count] > 0 ? total[count] : 0));
				count++;
			});
		});

		var count = 0;
		angular.forEach(total, function (eachMonthTotal) {
			bufferTotal.push(new Object(monthLabel[count], eachMonthTotal));
			count++;
		});

		var lreturn = false;
		angular.forEach(bufferTotal, function (buffTot) {
			lreturn = false;
			angular.forEach(actualMandays, function (actualTime) {
				angular.forEach(actualTime, function (mappedDay, $index) {
					if (mappedDay.key === buffTot.month) {
						buffTot.value = round((mappedDay.value - buffTot.value), 1);
						buffTot.actualMandays = mappedDay.value;
						buffTot.conflict = buffTot.value < 0 ? true : false;
						if (tagToEurocelar[0][$index].key === (mappedDay.key)) {
							buffTot.percentalloc = tagToEurocelar[0][$index].value;
						}
						lreturn = true;
						return;
					}
				});
				if (lreturn) return;
			});
		});
		return bufferTotal;
	}

	Controller.$inject = ['$scope', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', 'resourceService', 'projectService', 'allocationService', 'leaveService', 'resourceMappingService', '$filter', 'monthlyHeaderListService', 'availableDaysService'];

	function Controller($scope, DTOptionsBuilder, DTColumnBuilder, $compile, resourceService, projectService, allocationService, leaveService, resourceMappingService, $filter, monthlyHeaderListService, availableDaysService) {

		$scope.detailDiv = true;
		$scope.resource = [];
		$scope.projects = [];
		$scope.resourceWiseAllocaiton = [];
		$scope.startDate;
		$scope.endDate;
		$scope.months = [];
		$scope.allocationList = [];
		$scope.leaveList = [];
		$scope.mappedResourceData = [];
		$scope.conflict = false;


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


		getProjectData(projectService, $scope);

		$scope.headingList = [];
		prepareTableHeading($scope, monthlyHeaderListService);

		getMappedResourceData($scope, allocationService, leaveService, resourceMappingService, availableDaysService, monthlyHeaderListService);
		getAlloctionData(allocationService, $scope);
		getLeaveData(leaveService, $scope);



		// $scope.createAllocation = function () {

		// 	if ($scope.resource.length <= 0) {
		// 		alert('Please select a resource');
		// 		return;
		// 	}

		// 	Date.prototype.monthName = function () {
		// 		return this.toUTCString().split(' ')[2]
		// 	};

		// 	var monthCol = months($scope.startDate, $scope.endDate);
		// 	angular.forEach(monthCol, function (label) {
		// 		$scope.monthWiseAllocation = {
		// 			month: label,  // this is allocation month name
		// 			value: 0,
		// 		}
		// 		$scope.months.push($scope.monthWiseAllocation);
		// 	});

		// 	for (var res = 0; res < $scope.resource.length; res++) {
		// 		$scope.rowWiseAllocation = {
		// 			resource: $scope.resource[res],
		// 			project: $scope.projselect,
		// 			startdate: $scope.startDate,
		// 			enddate: $scope.endDate,
		// 			allocation: [],
		// 			rowSelect: true
		// 		};

		// 		angular.forEach($scope.months, function (item) {
		// 			var obj = new allocObject(item);
		// 			$scope.rowWiseAllocation.allocation.push(obj);
		// 		});

		// 		$scope.resourceWiseAllocaiton.push($scope.rowWiseAllocation);
		// 	}

		// 	$scope.resource = [];
		// 	$scope.detailDiv = false;

		// 	console.log($scope.resourceWiseAllocaiton);

		// }

		$scope.updateAllocaiton = function (resource, event) {
			angular.forEach($scope.allocationList, function (item) {
				if (item.resource === resource) {
					allocationService.updateAllocation(item).then(function (res) {
						if (res.data == "updated") {
							console.log('updated');
						}
					}).catch(function (err) {
						console.log(err);
					});
				}
			});
			$scope.childInfo(resource, event, true);
		}


		///////////////////////// start Datatable Code /////////////////////////////////

		$scope.vm = {};
		$scope.vm.dtInstance = null;
		$scope.vm.dtOptions = DTOptionsBuilder.newOptions()
			.withOption('order', [0, 'asc']);

		$scope.childInfo = function (resource, event, updateTable) {
			var scope = $scope.$new(true);

			var link = angular.element(event.currentTarget),
				icon = link.find('.glyphicon'),
				tr = link.parent().parent(),
				table = $scope.vm.dtInstance.DataTable,
				row = table.row(tr);

			var leaves = $filter('filter')($scope.leaveList, { resourcename: resource });

			var childShown = false;
			if (updateTable == null)
				childShown = row.child.isShown();

			scope.allocCollection = filter(scope, $scope.allocationList, resource, $scope.mappedResourceData, leaves, childShown);

			if (updateTable) {
				row.child($compile('<div tmpl class="clearfix"></div>')(scope)).show();

			} else {
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

		}

		///////////////////////// End  Datatable Code /////////////////////////////////

		$scope.prepareFinalData = function ($scope, availableDaysService, monthlyHeaderListService, mappedData) {

			console.log(mappedData);

			var fromDate = "01-" + $scope.headingList[0];
			var toDate = "01-" + $scope.headingList[$scope.headingList.length - 1];
			var list = availableDaysService.getData(fromDate, toDate);
			for (var i = 0; i < list.length; i++) {
				var name = list[i].resource;
				var isConflict = false;
				for (var j = 0; j < list[i].maps[0].length; j++) {
					var allocationOBJ = list[i].maps[0][j];

					if (isNaN(allocationOBJ.buffertime)) {
						allocationOBJ.buffertime = 0.0;
					}

					if (allocationOBJ.buffertime >= 0) {
						continue;
					} else {
						isConflict = true;
						break;
					}
				}
				list[i]['isConflict'] = isConflict;

			}

			for (var i = 0; i < mappedData.length; i++) {
				for (var j = 0; j < list.length; j++) {
					if (mappedData[i].mappedResource.resourcename === list[j].resource) {
						mappedData[i]['isConflict'] = list[j]['isConflict'];
						break;
					}
				}
			}

			$scope.mappedResourceData = mappedData;
			var htm = '';

			angular.forEach($scope.mappedResourceData, function (item) {
				htm += '<option>' + item.mappedResource.resourcename + '</option>';
			});

			$('#resource-select').append(htm);
			$('#resource-select').multiselect('rebuild');

		}
	}


	function getProjectData(projectService, $scope) {
		projectService.getProject().then(function (res) {
			$scope.project = res.data;
		}).catch(function (err) {
			console.log(err);
		});

	}

	function getAlloctionData(allocationService, $scope) {
		allocationService.getAllAllocation().then(function (res) {
			$scope.allocationList = res.data;
		}).catch(function (err) {
			console.log(err);
		});
	}

	function getLeaveData(leaveService, $scope) {
		leaveService.getLeave().then(function (res) {
			$scope.leaveList = res.data;
		}).catch(function (err) {
			console.log(err);
		});
	}

	function getMappedResourceData($scope, allocationService, leaveService, resourceMappingService, availableDaysService, monthlyHeaderListService) {
		resourceMappingService.getMappedResources().then(function (res) {

			var collection = res.data;

			var resource = [], keys = [], item;
			for (var col = 0; col < collection.length; col++) {
				item = collection[col];
				if (keys.indexOf(item.mappedResource.resourcename) <= -1) {
					resource.push(item);
					keys.push(item.mappedResource.resourcename);
				}
			}

			getGraphData($scope, allocationService, leaveService, resourceMappingService, availableDaysService, monthlyHeaderListService, resource);
			//$scope.mappedResourceData = res.data;

		}).catch(function (err) {
			console.log(err);
		});
	}


	function date_sort_asc(date1, date2) {
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
		var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
			"Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		var arr = [];
		var datFrom = new Date(from);
		var datTo = new Date(to);
		var fromYear = datFrom.getFullYear();
		var toYear = datTo.getFullYear();
		var diffYear = (12 * (toYear - fromYear)) + datTo.getMonth();

		for (var i = datFrom.getMonth(); i <= diffYear; i++) {
			arr.push(monthNames[i % 12] + "-" + Math.floor(fromYear + (i / 12)).toString().substr(-2));
		}

		return arr;
	}

	function round(value, precision) {
		var multiplier = Math.pow(10, precision || 0);
		return Math.round(value * multiplier) / multiplier;
	}


	function getGraphData($scope, allocationService, leaveService, resourceMappingService, availableDaysService, monthlyHeaderListService, mappedData) {
		var allocation = [];
		var resoruceM = [];
		var leave = [];
		allocationService.getAllAllocation().then(function (res) {
			allocation = res.data;
			leaveService.getLeave().then(function (res) {
				leave = res.data;
				resourceMappingService.getMappedResources().then(function (res) {
					resoruceM = res.data;
					availableDaysService.intialize(allocation, resoruceM, leave);
					$scope.prepareFinalData($scope, availableDaysService, monthlyHeaderListService, mappedData);
				}).catch(function (err) {
					console.log(err);
				});
			}).catch(function (err) {
				console.log(err);
			});
		}).catch(function (err) {
			console.log(err);
		});
	}

	function prepareTableHeading($scope, monthlyHeaderListService) {
		$scope.headingList = monthlyHeaderListService.getHeaderList();
	}

})();