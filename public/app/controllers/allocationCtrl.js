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

		angular.forEach(collection, function (item) {
			if (item.resource === resource && item.year === year) {
				allocationDetails.push(item);
			}
		});


		scope.monthLabel = months(year);

		angular.forEach(allocationDetails, function (item) {
			item.allocation = eachMonthAllocaiton(scope.monthLabel, item.allocation);

		});

		// create the hoilidays with month-year fromat and store in a map
		var monthyearLabel = new Map();
		for (var i = 0; i < holidayList.length; i++) {
			monthyearLabel.set(getMonth(holidayList[i]._id.month - 1) + '-' + (holidayList[i]._id.year.toString()).substring(2, 4), holidayList[i].number);
		}


		var mappedToResource = [];
		for (var user = 0; user < mappedResourceData.length; user++) {

			if (mappedResourceData[user].mappedResource.resourcename === resource && mappedResourceData[user].year === year) {

				if (typeof mappedResourceData[user].holidaydeduct === 'undefined') {  // if it is first time open, then holidays should not delte from the actually availablemanday.It is already dedcuted during load time
					for (var k = 0; k < mappedResourceData[user].monthlyAvailableActualMandays.length; k++) {
						var key = mappedResourceData[user].monthlyAvailableActualMandays[k].key;

						if (monthyearLabel.has(key)) {
							var holidays = monthyearLabel.get(key);
							var percent = mappedResourceData[user].taggToEuroclear[k].value;
							var actualHDays = (holidays * percent) / 100;
							actualHDays = getRoundNumber(actualHDays, 1);

							mappedResourceData[user].monthlyAvailableActualMandays[k].value = mappedResourceData[user].monthlyAvailableActualMandays[k].value - actualHDays;
							mappedResourceData[user].holidaydeduct = true;
						}
					}
				}
				mappedToResource.push(mappedResourceData[user]);
			}
		}


		var resoruceType = null;
		var object = null;
		var collection = [];
		var oldObject = null;
		var readonly = monthsReadonly(scope.monthLabel);


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
				object.buffertime = [];
				object.resourcetype = allocationDetails[k].resourcetype;
				object.year = allocationDetails[k].year;
				object.allocation.push(allocationDetails[k]);
				object.availabledays = [];
				object.mappercent = [];
				object.vacation = monthsWithYear(year);
				object.readonly = readonly;


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

		checkOverAllocaiton(scope, collection, year, leaveList, mappedToResource, resource);
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

	function checkOverAllocaiton(scope, alloCollection, year, leaveList, mappedResourceData, resource) {


		var buffertime = null;
		var count = 0;
		var totalAllocDays = monthsWithYear(year);

		// map indivial leaves to map a 12 months map
		var leaves = monthsWithYear(year);
		angular.forEach(leaveList, function (leave) {
			angular.forEach(leave.leavedaysinmonth, function (days) {
				angular.forEach(leaves, function (leaveDay) {
					if (leaveDay.key === days.month) {
						leaveDay.value = leaveDay.value + days.value;

					}
				});
			});
		});


		//adjust the leave with each allocaiton type 
		for (var adj = 0; adj < alloCollection.length; adj++) {
			var item = alloCollection[adj];
			for (var k = 0; k < 12; k++) {
				var percent = item.mappercent[k].value;
				var percentV = (leaves[k].value * percent) / 100;
				item.vacation[k].value = round(percentV, 1);
			}
		}

		var isConflict = false;

		angular.forEach(alloCollection, function (item) {

			buffertime = new Array();
			buffertime = Array(12).fill(0);

			angular.forEach(item.allocation, function (alloc) {
				count = 0;
				angular.forEach(alloc.allocation, function (monthlyAloc) {
					buffertime[count] = buffertime[count] + round(monthlyAloc.value, 1);
					count++;
				});
			});

			for (var k = 0; k < item.availabledays.length; k++) {
				buffertime[k] = round((item.availabledays[k].value - buffertime[k]), 1);        // this check the status of mapping value with allocaiton value only with add leaves
				buffertime[k] = round((buffertime[k] - item.vacation[k].value), 1);	            // minus the leave days from totaldays as well
				totalAllocDays[k].value = totalAllocDays[k].value + item.availabledays[k].value;  // this sums actual available days as per mapping percentage

				if (buffertime[k] < 0) {
					isConflict = true;
				}
			}
			item.buffertime = buffertime;
			item.isConflict = isConflict;

		});


		// if there is not allocation done yet,so it only shows the available mandays after deduct leaves on the months

		if (alloCollection.length <= 0 && mappedResourceData.length > 0) {

			scope.noallocation = [];
			function NoAllocation() {
				this.type;
				this.availableday = [];
				this.percent = [];
			}

			for (var map = 0; map < mappedResourceData.length; map++) {
				var noalloc = new NoAllocation();
				noalloc.type = mappedResourceData[map].resourceType;
				noalloc.availableday = mappedResourceData[map].monthlyAvailableActualMandays;
				noalloc.percent = mappedResourceData[map].taggToEuroclear;
				for (var month = 0; month < leaves.length; month++) {
					noalloc.availableday[month].value = round((noalloc.availableday[month].value - leaves[month].value), 1);
				}

				scope.noallocation.push(noalloc);

			}

		}

	}


	Controller.$inject = ['$scope', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', 'resourceService', 'projectService', 'allocationService', 'leaveService', 'resourceMappingService', '$filter', 'availableDaysService', 'holidayListService'];

	function Controller($scope, DTOptionsBuilder, DTColumnBuilder, $compile, resourceService, projectService, allocationService, leaveService, resourceMappingService, $filter, availableDaysService, holidayListService) {

		$scope.resource = [];
		//$scope.resourceWiseAllocaiton = [];
		$scope.startDate;
		$scope.endDate;
		$scope.months = [];
		$scope.allocationList = [];
		$scope.leaveList = [];
		$scope.mappedResourceData = [];
		$scope.mappingValue = [];
		$scope.conflict = false;
		$scope.holidayList = [];
		$scope.ShowSpinnerStatus = true;

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


		getMappedResourceData($scope, resourceMappingService, holidayListService);
		getAlloctionData(allocationService, $scope);
		getLeaveData(leaveService, $scope);
		//getHolidayData(holidayListService, $scope, new Date().getFullYear()); // get all the date from current year
		getGraphData($scope, allocationService, leaveService, resourceMappingService, availableDaysService);


		$scope.updateAllocaiton = function (resource, year, loc, rowIndex, event) {
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
			$scope.childInfo(resource, year, loc, rowIndex, event, true);
		}


		/*	$scope.deleteConfirmation = function (rowIndex, event) {
	
				var myRadio = $('input[name="action"]');
				var checkedValue = myRadio.filter(':checked').val();
	
				if (checkedValue == null) {
					alert('Please select a record to delete.')
					return;
				} else {
					$scope.msg = checkedValue;
					$scope.deletedID = checkedValue;
					openDialog();
				}
				$scope.delRowIndex = event;
			}*/

		$scope.deleteAllocation = function (resource, year, loc, rowIndex, event) {

			var myRadio = $('input[name="action"]');
			$scope.deletedID = myRadio.filter(':checked').val();

			if (confirm("Are you sure want to delete the record?")) {
				txt = "You pressed OK!";

				if ($scope.deletedID != null) {
					var data = $scope.deletedID.split("~");
					for (var count = 0; count < $scope.allocationList.length; count++) {
						var item = $scope.allocationList[count];
						if (item._id == data[4]) {
							allocationService.deleteAllocation(item._id).then(function (res) {
								if (res.data == "deleted") {
									app.loading = false;
									app.successMsg = "Resource allocation deleted successfully";
									app.errorMsg = false;
									$scope.msg = "";
								}
							}).catch(function (err) {
								console.log(err);
							});
						}
					}
				}

				var div_header = document.getElementById(data[4]);
				var div_detail = document.getElementById(data[4] + '_detail');

				if (div_header.style.display != "none") {
					div_header.style.display = "none";
					div_detail.style.display = "none";
				}

				//$scope.updateAllocaiton(data[0], data[2], $scope.delLoc, $scope.delRowIndex, event, true);
				getAlloctionData(allocationService, $scope);
				//$scope.childInfo(data[0], data[2], $scope.delLoc, rowIndex, event, true);
				$scope.childInfo(resource, year, loc, rowIndex, event, true);
			}


		};
		///////////////////////// start Datatable Code /////////////////////////////////

		$scope.vm = {};
		$scope.vm.dtInstance = null;
		$scope.vm.dtOptions = DTOptionsBuilder.newOptions()
			.withOption('order', [0, 'asc']);

		$scope.childInfo = function (resource, year, region, listIndex, event, updateTable) {

			var scope = $scope.$new(true);
			var link = angular.element(event.currentTarget),
				icon = link.find('.glyphicon'),
				tr = link.parent().parent(),
				table = $scope.vm.dtInstance.DataTable,
				row = table.row(tr);

			//var leaves = $filter('filter')($scope.leaveList, { resourcename: resource });
			//var holidays = $filter('filter')($scope.holidayList, { year: year, locationname: location });

			var childShown = false;
			if (updateTable == null)
				childShown = row.child.isShown();


			var leaves = $filter('filter')($scope.leaveList, { resourcename: resource });
			holidayListService.getAggegrateLocationHolidays(region).then(function (res) {
				scope.allocCollection = filter(scope, $scope.allocationList, resource, year, $scope.mappedResourceData, leaves, res.data, childShown);
			}).catch(function (err) {
				console.log(err);
			});


			if (typeof scope.allocCollection !== "undefined") {
				var isConflict = false;
				angular.forEach(scope.allocCollection, function (item) {
					if (item.isConflict)
						isConflict = true;
				});

				$scope.mappingValue[listIndex].isConflict = isConflict;
			}

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

		$scope.getAllocationStatus = function () {
			$scope.mappingValue = availableDaysService.getAllocationStatus($scope.mappingValue);
		}

	}


	function checkmonth(index) {
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
		//$scope.ShowSpinnerStatus = false;
		resourceMappingService.getMappedResources().then(function (res) {
			$scope.ShowSpinnerStatus = false;
			var spinner = document.getElementById("spinner");
			if (spinner.style.display != "none") {
				spinner.style.display = "none";

			}

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



	function getGraphData($scope, allocationService, leaveService, resourceMappingService, availableDaysService) {
		var allocation = [];
		var resoruceMapping = [];
		var leave = [];
		allocationService.getAllAllocation().then(function (res) {
			allocation = res.data;
			leaveService.getLeave().then(function (res) {
				leave = res.data;
				resourceMappingService.getMappedResources().then(function (res) {
					resoruceMapping = res.data;
					availableDaysService.intialize(allocation, resoruceMapping, leave);
					$scope.getAllocationStatus(availableDaysService);
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


	function daysInMonthAndYear(year, holidays) {
		var holidayList = [];
		var monthWiseDays = [];

		angular.forEach(holidays, function (holiday) {
			holidayList.push(formatDate(holiday.holidayDate));
		});

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
					if (holidayList.indexOf(formatDate(tmpDate)) === -1) {
						days.push(tmpDate);
					}
				}
				date.setDate(date.getDate() + 1);
			}
			monthWiseDays.push(new Object(monthNames[month] + "-" + year.substr(-2), days.length));

		}
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

	function monthsReadonly(monthLabel) {
		var arr = [];
		for (var i = 0; i < monthLabel.length; i++) {
			var date = moment(monthLabel[i], "MMM-YYYY");
			arr.push(date < getToday());
		}
		return arr;
	}


	function getMonth(month) {
		var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
			"Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		return monthNames[month];
	}

	function getToday() {

		var date = new Date();
		var year = String(date.getFullYear());
		return moment(getMonth(date.getMonth()) + '-' + year.substr(-2), "MMM-YYYY");

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

	function getRoundNumber(value, precision) {
		var multiplier = Math.pow(10, precision || 0);
		return Math.round(value * multiplier) / multiplier;
	}


	function openDialog() {
		$('#confirmModal').modal('show');
	}

})();

