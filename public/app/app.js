angular.module('pmoApp',['appRoutes','userController','userServices', 'ngAnimate','mainController','authServices','appConstants','datatables'])

.config(function($httpProvider){
	$httpProvider.interceptors.push('AuthInterceptors');
}).controller('footerCtrl', ['$scope','appConstants', function($scope,appConstants) {
          $scope.rightToReserveMsg = appConstants.right_reserve;         
          
      }]).constant("globalConfig", {
 apiAddress: 'http://localhost:3000/api'
 });;  