angular.module('mainController',['authServices'])
.controller('mainCtrl', function(Auth, $http,$location,$timeout,$rootScope){	
	var app = this;
	app.loadMe = false;
	$rootScope.$on('$routeChangeStart', function(){		
		if(Auth.isLoggedIn()){			
			app.isLoggedIn = true;
			Auth.getUser().then(function(data){	
			console.log(data)		;
			app.username = data.data.username;
			app.email = data.data.email;
			app.loadMe = true;
		});
		}else{			
			app.isLoggedIn = false;
			app.username = '';
			app.loadMe = false;
		}
	});

	this.doLogin = function(loginData){
		app.loading =true;
		app.errorMsg = false;	
		app.successMsg = false;

		Auth.login(app.loginData).then(function(data){
			if(data.data.success){				
				app.loading =false;
				app.successMsg = data.data.message + '... Redirecting';
				$timeout(function(){$location.path('/about');
					app.loginData = '';
					app.successMsg = false;
				},2000);
				
			}else{
				app.loading =false;
				app.successMsg = false;
				app.errorMsg = data.data.message;
			}
		});
	};

	this.logout = function(){
		Auth.logout();
		$location.path('/logout');
		$timeout(function(){
			$location.path('/')
		}, 2000);
	};

});
