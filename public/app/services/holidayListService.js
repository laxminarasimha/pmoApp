(function () {

  'use strict';

  angular.module('pmoApp').factory('holidayListService', Service);

  Service.$inject = ['$http', 'globalConfig', '$filter'];

  function Service($http, globalConfig, $filter) {
    var url = "";
    return {

      getHolidays: function () {
        url = globalConfig.apiAddress + "/holiday";
        return $http.get(url);
      },
      getLocationHolidays: function (locationname) {
        url = globalConfig.apiAddress + "/holiday/location/" + locationname;
        return $http.get(url);
      },

      getLocationHolidaysWithYear: function (year) {
        url = globalConfig.apiAddress + "/holiday/aggegrate/byyear/" + year;
        return $http.get(url);
      },

      getLocationHolidaysYearRange: function (startYear,endYear) {
        url = globalConfig.apiAddress + "/holiday/aggegrate/byyear/range/" + startYear +"/"+endYear;
        return $http.get(url);
      },

      getAggegrateLocationHolidays: function (location) {
        url = globalConfig.apiAddress + "/holiday/aggegrate/" + location;
        return $http.get(url);
      },

      getHolidayForID: function (id) {
        url = globalConfig.apiAddress + "/holiday/" + id;
        return $http.get(url);
      },
      createHoliday: function (holiday) {
        url = globalConfig.apiAddress + "/holiday";
        return $http.post(url, holiday);
      },
      updateHoliday: function (holiday) {
        url = globalConfig.apiAddress + "/holiday/" + holiday._id;
        return $http.put(url, holiday);
      },
      deleteHoliday: function (id) {
        url = globalConfig.apiAddress + "/holiday/" + id;
        return $http.delete(url);
      },

    };
  }
})();
