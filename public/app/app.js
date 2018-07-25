angular.module('pmoApp', ['appRoutes', 'userController', 'userServices', 'ngAnimate', 'mainController', 'authServices', 'appConstants', 'datatables', 'ngFileUpload'])

    .config(function ($httpProvider) {
        if (!$httpProvider.defaults.headers.common) {
            $httpProvider.defaults.headers.common = {};
        }
        $httpProvider.defaults.headers.common["Cache-Control"] = "no-cache";
        $httpProvider.defaults.headers.common.Pragma = "no-cache";
        $httpProvider.defaults.headers.common["If-Modified-Since"] = "0";

        $httpProvider.interceptors.push('AuthInterceptors');
    }).controller('footerCtrl', ['$scope', 'appConstants', function ($scope, appConstants) {
        $scope.rightToReserveMsg = appConstants.right_reserve;

    }]).constant("globalConfig", {
        apiAddress: 'http://din66008608.corp.capgemini.com:3000/api'
        //apiAddress: 'http://localhost:3000/api'
    });;  