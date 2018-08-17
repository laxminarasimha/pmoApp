(function () {

  'use strict';

  var app = angular.module('pmoApp');
  app.filter('resourceunique', function () {
    return function (collection, keyname) {
      var output = [],
        keys = [];

      angular.forEach(collection, function (item) {
        var key = item[keyname];
        if (keys.indexOf(key) === -1) {
          keys.push(key);
          output.push(item);
        }
      });

      return output;
    };
  })

  app.service('availableDaysService', Service);
  Service.$inject = ['$filter'];

  function Service($filter) {
    var allocation = [];
    var resourceMapped = [];
    var leaves = [];

    this.intialize = function (allocation, resoruceM, leave) {
      this.allocation = allocation;
      this.resourceMapped = resoruceM;
      this.leaves = leave;
    }

    this.getData = function (startDt, EndDt) {
      var month = months(startDt, EndDt);
      var uniqueResource = $filter('resourceunique')(this.allocation, 'resource');
      var list = filter(this.allocation, uniqueResource, this.resourceMapped, this.leaves, month, $filter);
      return list;

    }

    this.getAllocationStatus = function (resourceList) {

      var uniqueResource = [];
      var allocationList = this.allocation;
      var resourceMapped = this.resourceMapped;
      var leaves = this.leaves;
      var allocationFilter = [];

      angular.forEach(resourceList, function (mapping) {

        var resource = mapping.mappedResource.resourcename;
        var year = mapping.year;
        var month = monthsWithYear(year);

        for (var alloc = 0; alloc < allocationList.length; alloc++) {

          if (allocationList[alloc].year === mapping.year //&& allocationList[alloc].resourcetype === mapping.resourceType
            && allocationList[alloc].resource === mapping.mappedResource.resourcename) {

            for (var vmonth = 0; vmonth < allocationList[alloc].allocation.length; vmonth++) { // allocaiton mayn't have 12 months records
              for (var k = 0; k < 12; k++) {                  // iterate for each month in a year
                if (month[k].key === allocationList[alloc].allocation[vmonth].month) {
                  month[k].value += parseInt(allocationList[alloc].allocation[vmonth].value);
                }
              }
            }
          }
        }

        // Add leave to the mandays then extract from mapping allocation days

        var flilterLeaves = $filter('filter')(leaves, { resourcename: resource });

        angular.forEach(flilterLeaves, function (leave) {
          angular.forEach(leave.leavedaysinmonth, function (days) {
            angular.forEach(month, function (monthday) {
              if (monthday.key === days.month) {
                monthday.value += days.value;
              }
            });
          });
        });

        var mappedValueInYear = monthsWithYear(year);
        var flilterMapped = $filter('filter')(resourceMapped, { year: year });

        angular.forEach(flilterMapped, function (mappedMonth) {
          if (mappedMonth.mappedResource.resourcename === resource) {
            angular.forEach(mappedMonth.monthlyAvailableActualMandays, function (mandays, key) {
              mappedValueInYear[key].value += mandays.value;
            });
          }
        });

        for (var check = 0; check < 12; check++) {
          var value = mappedValueInYear[check].value - month[check].value;
          if (value < 0) {
            mapping.isConflict = true;
            break;
          }
        }
      });

      return resourceList;

    }
  }

  function filter(allocationList, resource, mappedResourceData, leaves, months, $filter) {

    var resourceDetails = [];
    var sMonth = [];
    var eMonth = [];

    angular.forEach(allocationList, function (item) {
      if (item.resource === resource) {
        resourceDetails.push(item);
      }
    });

    function Object() {
      this.month;
      this.year;
      this.allocation;
      this.type;
    }

    function Resource() {
      this.resource = "";
      this.location = "";
      this.region = "";
      this.status = "";
      this.skill = "";
      this.kinid = "";
      this.maps = [];
    }

    var allocationObj = new Array();
    var allocatonWithBufferTime = new Array();
    var projA = new Array();
    var allocA = new Array();
    var rLoop = false;
    var leavesFilter = null;
    var allocationFilter = null;

    angular.forEach(resource, function (rname) {

      var nResource = new Resource();
      nResource.resource = rname.resource;
      nResource.kinid = rname.kinId;

      leavesFilter = $filter('filter')(leaves, { resourcename: rname.resource });
      allocationFilter = $filter('filter')(allocationList, { resource: rname.resource });

      var duplicateCheck = [];

      angular.forEach(allocationFilter, function (allocFilter) {

        var vRecord = allocFilter.resourcetype + '-' + allocFilter.resource;
        if (duplicateCheck.indexOf(vRecord) === -1) {
          var object = new Object();
          object.type = allocFilter.resourcetype;
          object.allocation = mapAllocation(nResource.resource, months, allocationFilter, leavesFilter, mappedResourceData, object.type, allocFilter.year);
          nResource.maps.push(object);
          duplicateCheck.push(vRecord);
        }

      });

      mapResoruceDetails(nResource, mappedResourceData);
      allocationObj.push(nResource);
    });

    return allocationObj;
  }

  function mapAllocation(resource, months, allocationFilter, leaves, mappedResourceData, resourcetype, year) {

    var allocation = [];

    function Allocation() {
      this.month;
      this.project = [];
      this.allocation = [];
      this.leave;
      this.buffertime;
    }

    angular.forEach(months, function (month) {

      var vAlloc = new Allocation();
      vAlloc.month = month;
      var filterMappedResource;

      angular.forEach(allocationFilter, function (alloc) {
        if (alloc.resourcetype === resourcetype) {
          for (var k = 0; k < alloc.allocation.length; k++) {
            if (alloc.allocation[k].month === month) {
              vAlloc.project.push(alloc.project);
              vAlloc.allocation.push(alloc.allocation[k].value);
              break;
            }
          }
        }
      });

      for (var user = 0; user < mappedResourceData.length; user++) {
        if (mappedResourceData[user].mappedResource.resourcename === resource
          && mappedResourceData[user].resourceType === resourcetype
          && mappedResourceData[user].year == year) {

          filterMappedResource = mappedResourceData[user];
        }
      }

      setLeave(vAlloc, leaves, filterMappedResource);
      setBufferTime(vAlloc, resource, filterMappedResource);
      allocation.push(vAlloc);

    });

    return allocation;

  }

  function setLeave(object, leaves, mappedResourceData) {

    object.leave = 0;

    angular.forEach(leaves, function (leave) {
      angular.forEach(leave.leavedaysinmonth, function (monthD) {
        if (monthD.month === object.month) {
          object.leave = monthD.value;
          return;
        }
      });
    });

    if (mappedResourceData != null) {

      for (var adj = 0; adj < mappedResourceData.taggToEuroclear.length; adj++) {
        if (mappedResourceData.taggToEuroclear[adj].key === object.month) {
          var percent = mappedResourceData.taggToEuroclear[adj].value;
          var percentV = (object.leave * percent) / 100;
          object.leave = round(percentV, 1);
        }
      }
    }

  }

  function setBufferTime(object, resource, mappedResourceData) {

    object.buffertime = 0;
    var actualMandays = [];
    var mappedDays = 0;
    if (mappedResourceData != null) {
      for (var user = 0; user < mappedResourceData.monthlyAvailableActualMandays.length; user++) {
        if (mappedResourceData.monthlyAvailableActualMandays[user].key === object.month) {
          mappedDays = mappedResourceData.monthlyAvailableActualMandays[user].value;
          break;
        }
      }
    }
    var vBuffer = 0;

    for (var k = 0; k < object.allocation.length; k++) {
      vBuffer = vBuffer + parseInt(object.allocation[k]);
    }

    vBuffer = vBuffer + object.leave;
    object.buffertime = round((mappedDays - vBuffer), 1);

  }

  function mapResoruceDetails(nResource, mappedResourceData) {
    for (var user = 0; user < mappedResourceData.length; user++) {
      if (mappedResourceData[user].mappedResource.resourcename === nResource.resource) {
        nResource.location = mappedResourceData[user].location;
        nResource.region = mappedResourceData[user].region;
        nResource.status = mappedResourceData[user].status;
        nResource.skill = mappedResourceData[user].skill;
        nResource.kinid = mappedResourceData[user].mappedResource.kinId;
        break;
      }
    };
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

})();
