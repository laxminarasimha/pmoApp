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


	function filter(scope, collection, resource, year, mappedResourceData, leaveList, holidayList, showdetail) {
		if (showdetail) return; // if details is going to close then return

		var allocationDetails = [];
		//var sMonth = [];
		//var eMonth = [];

		angular.forEach(collection, function (item) {
			if (item.resource === resource && item.year === year) {
				allocationDetails.push(item);
			}
		});


		scope.monthLabel = months(year);

		angular.forEach(allocationDetails, function (item) {
			item.allocation = eachMonthAllocaiton(scope.monthLabel, item.allocation);

		});



		var mappedToResource = [];

		for (var user = 0; user < mappedResourceData.length; user++) {
			if (mappedResourceData[user].mappedResource.resourcename === resource && mappedResourceData[user].year === year) {
				mappedToResource.push(mappedResourceData[user]);
			}
		}

		var resoruceType = null;
		var object = null;
		var collection = [];
		var oldObject = null;

		for (var k = 0; k < allocationDetails.length; k++) {
			resoruceType = allocationDetails[k].resourcetype;

			angular.forEach(collection, function (item) {
				if (item.resourcetype === resoruceType) {
					oldObject = item;
					return;
				}
			});

			if (oldObject != null) {
				oldObject.allocation.push(allocationDetails[k]);
			} else {
				object = new Object();
				collection.push(object);
				object.allocation = [];
				object.resourcetype = allocationDetails[k].resourcetype;
				object.year = allocationDetails[k].year;
				object.allocation.push(allocationDetails[k]);
				object.availabledays = [];
				object.mappercent = [];
				object.vacation = vacation(leaveList, year);
				object.readonly = monthsReadonly(year);

				for (var j = 0; j < mappedToResource.length; j++) {
					if (mappedToResource[j].resourceType === allocationDetails[k].resourcetype) {
						object.availabledays = mappedToResource[j].monthlyAvailableActualMandays;
						object.mappercent = mappedToResource[j].taggToEuroclear;
						break;
					}
				}

				if (object.availabledays.length <= 0) {
					var arr = monthsWithYear(object.year);
					object.availabledays = arr;
					object.mappercent = arr;

				}

			}
			oldObject = null;
		}

		checkOverAllocaiton(collection);
		//collection.vacation = vacation(leaveList, year);


		// for (var k = 0; k < daysInMonth.length; k++) {
		// 	console.log(daysInMonth[k].key);
		// }

		console.log(collection);
		return collection;
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


	function vacation(leaveCollection, year) {

		var vacationList = monthsWithYear(year);
		angular.forEach(leaveCollection, function (leave) {
			angular.forEach(leave.leavedaysinmonth, function (days) {
				angular.forEach(vacationList, function (leavedays) {
					if (days.month === leavedays.key) {
						leavedays.value = parseInt(leavedays.value) + parseInt(days.value);

					}
				});
			});
		});

		return vacationList;

	}


	/*function eachMonthLeave(source, target) {
	
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
	};*/



	function checkOverAllocaiton(collection) {
		var totalalloc = null;
		var count = 0;
		angular.forEach(collection, function (item) {
			totalalloc = new Array();
			totalalloc = Array(12).fill(0);
			angular.forEach(item.allocation, function (alloc) {
				count = 0;
				angular.forEach(alloc.allocation, function (monthlyAloc) {
					totalalloc[count] = totalalloc[count] + parseInt(monthlyAloc.value);
					count++;
				});
			});

			for (var k = 0; k < item.availabledays.length; k++) {
				totalalloc[k] = parseInt(item.availabledays[k].value) - totalalloc[k];
			}
			item.monthtot = totalalloc;

		});

	}


	/*function bufferTime(resourceDetails, actualMandays, tagToEurocelar, monthLabel) {
	
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
	}*/

	Controller.$inject = ['$scope', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', 'resourceService', 'projectService', 'allocationService', 'leaveService', 'resourceMappingService', '$filter', 'monthlyHeaderListService', 'availableDaysService', 'holidayListService'];

	function Controller($scope, DTOptionsBuilder, DTColumnBuilder, $compile, resourceService, projectService, allocationService, leaveService, resourceMappingService, $filter, monthlyHeaderListService, availableDaysService, holidayListService) {

		//$scope.detailDiv = true;
		$scope.resource = [];
		//$scope.projects = [];
		$scope.resourceWiseAllocaiton = [];
		$scope.startDate;
		$scope.endDate;
		$scope.months = [];
		$scope.allocationList = [];
		$scope.leaveList = [];
		$scope.mappedResourceData = [];
		$scope.mappingValue = [];
		$scope.conflict = false;
		$scope.holidayList = [];


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


		//getProjectData(projectService, $scope);

		//$scope.headingList = [];
		//prepareTableHeading($scope, monthlyHeaderListService);

		getMappedResourceData($scope, resourceMappingService, holidayListService);
		getAlloctionData(allocationService, $scope);
		getLeaveData(leaveService, $scope);
		getHolidayData(holidayListService, $scope, new Date().getFullYear()); // get all the date from current year



		$scope.updateAllocaiton = function (resource, year, loc, event) {
			angular.forEach($scope.allocationList, function (item) {
				if (item.resource === resource && item.year === year) {
					allocationService.updateAllocation(item).then(function (res) {
						if (res.data == "updated") {
							console.log('updated');
						}
					}).catch(function (err) {
						console.log(err);
					});
				}
			});
			$scope.childInfo(resource, year, loc, event, loc, true);
		}

		


		///////////////////////// start Datatable Code /////////////////////////////////

		$scope.vm = {};
		$scope.vm.dtInstance = null;
		$scope.vm.dtOptions = DTOptionsBuilder.newOptions()
			.withOption('order', [0, 'asc']);

		$scope.childInfo = function (resource, year, location, event, updateTable) {
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



			scope.allocCollection = filter(scope, $scope.allocationList, resource, year, $scope.mappedResourceData, leaves, $scope.holidayList, childShown);

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

		// 	$scope.prepareFinalData = function ($scope, availableDaysService, monthlyHeaderListService, mappedData) {

		// 		console.log(mappedData);

		// 		var fromDate = "01-" + $scope.headingList[0];
		// 		var toDate = "01-" + $scope.headingList[$scope.headingList.length - 1];
		// 		var list = availableDaysService.getData(fromDate, toDate);
		// 		for (var i = 0; i < list.length; i++) {
		// 			var name = list[i].resource;
		// 			var isConflict = false;
		// 			for (var j = 0; j < list[i].maps[0].length; j++) {
		// 				var allocationOBJ = list[i].maps[0][j];

		// 				if (isNaN(allocationOBJ.buffertime)) {
		// 					allocationOBJ.buffertime = 0.0;
		// 				}

		// 				if (allocationOBJ.buffertime >= 0) {
		// 					continue;
		// 				} else {
		// 					isConflict = true;
		// 					break;
		// 				}
		// 			}
		// 			list[i]['isConflict'] = isConflict;

		// 		}

		// 		for (var i = 0; i < mappedData.length; i++) {
		// 			for (var j = 0; j < list.length; j++) {
		// 				if (mappedData[i].mappedResource.resourcename === list[j].resource) {
		// 					mappedData[i]['isConflict'] = list[j]['isConflict'];
		// 					break;
		// 				}
		// 			}
		// 		}

		// 		$scope.mappedResourceData = mappedData;
		// 		var htm = '';

		// 		angular.forEach($scope.mappedResourceData, function (item) {
		// 			htm += '<option>' + item.mappedResource.resourcename + '</option>';
		// 		});

		// 		$('#resource-select').append(htm);
		// 		$('#resource-select').multiselect('rebuild');

		// 	}
		// }


		// function getProjectData(projectService, $scope) {
		// 	projectService.getProject().then(function (res) {
		// 		$scope.project = res.data;
		// 	}).catch(function (err) {
		// 		console.log(err);
		// 	});

		// }
	}


	function checkmonth (index) {
			console.log(index);
			var currentMonth = new Date().getMonth();
			return index < currentMonth;

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


	function getMappedResourceData($scope, resourceMappingService, holidayListService) {
		resourceMappingService.getMappedResources().then(function (res) {

			var collection = res.data;
			var key = "";

			var resource = [], keys = [], item;
			for (var col = 0; col < collection.length; col++) {
				item = collection[col];
				key = item.mappedResource.resourcename + '-' + item.year;
				if (keys.indexOf(key) <= -1) {
					resource.push(item);
					keys.push(key);
				}
			}

			//getGraphData($scope, allocationService, leaveService, resourceMappingService, availableDaysService, monthlyHeaderListService, resource);
			$scope.mappedResourceData = res.data;
			$scope.mappingValue = resource;

		}).catch(function (err) {
			console.log(err);
		});
	}


	function getHolidayData(holidayListService, $scope, year) {
		holidayListService.getLocationHolidaysWithYear(year).then(function (res) {
			$scope.holidayList = res.data;
		}).catch(function (err) {
			console.log(err);
		});
	}


	function daysInMonthIAndYear(year, holidays) {
		var holidayList = [];
		var monthWiseDays = [];


		//holidayList.push(formatDate(new Date(value.holidayDate), 'yyyy-MM-dd'));


		var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		var days = 0;

		function Object(key, value) {
			this.key = key;
			this.value = value;
		};

		for (var month = 0; month < monthNames.length; month++) {
			var date = new Date(year, month, 1);
			var days = [];
			var tmp = 0;
			while (date.getMonth() === month) {
				var tmpDate = new Date(date);
				var weekDay = tmpDate.getDay();

				if (weekDay % 6) { // exclude 0=Sunday and 6=Saturday
					// if (holidayList.indexOf(formatDate(tmpDate)) === -1) {
					// 	days.push(tmpDate);
					// }
				}
				date.setDate(date.getDate() + 1);
			}
			monthWiseDays.push(new Object(monthNames[month] + "-" + year.substr(-2), days.length));
		}
		//console.log(monthWiseDays);
		return monthWiseDays;

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

	function months(year) {
		var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
			"Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		var arr = [];
		for (var i = 0; i < monthNames.length; i++) {
			arr.push(monthNames[i] + "-" + year.substr(-2));
		}
		return arr;
	}

	function monthsReadonly(year) {
	
		var arr = [];
		var currentMont = new Date().getMonth();
		for (var i = 0; i < 12; i++) {
			arr.push(i < currentMont);
		}
		return arr;
	}

	function monthsWithYear(year) {
		var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
			"Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

		var arr = [];
		function Object(key, value) {
			this.key = key;
			this.value = value;
		};

		for (var i = 0; i < monthNames.length; i++) {
			arr.push(new Object(monthNames[i] + "-" + year.substr(-2), 0));
		}


		return arr;
	}

	function round(value, precision) {
		var multiplier = Math.pow(10, precision || 0);
		return Math.round(value * multiplier) / multiplier;
	}

	function formatDate(date) {
		var d = new Date(date),
			dArr = [d.getFullYear(),
			pad(d.getMonth() + 1),
			pad(d.getDate())];
		return dArr.join('-');
	}


	function pad(num) {
		return ("0" + num).slice(-2);
	}


	// function getGraphData($scope, allocationService, leaveService, resourceMappingService, availableDaysService, monthlyHeaderListService, mappedData) {
	// 	var allocation = [];
	// 	var resoruceM = [];
	// 	var leave = [];
	// 	allocationService.getAllAllocation().then(function (res) {
	// 		allocation = res.data;
	// 		leaveService.getLeave().then(function (res) {
	// 			leave = res.data;
	// 			resourceMappingService.getMappedResources().then(function (res) {
	// 				resoruceM = res.data;
	// 				availableDaysService.intialize(allocation, resoruceM, leave);
	// 				$scope.prepareFinalData($scope, availableDaysService, monthlyHeaderListService, mappedData);
	// 			}).catch(function (err) {
	// 				console.log(err);
	// 			});
	// 		}).catch(function (err) {
	// 			console.log(err);
	// 		});
	// 	}).catch(function (err) {
	// 		console.log(err);
	// 	});
	// }

	// function prepareTableHeading($scope, monthlyHeaderListService) {
	// 	$scope.headingList = monthlyHeaderListService.getHeaderList();
	// }


})();