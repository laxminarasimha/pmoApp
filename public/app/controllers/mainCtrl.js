angular.module('mainController',['authServices'])
.controller('mainController', function(Auth, $http,$location,$timeout,$rootScope,$scope,$window){	
	var app = this;
	app.loadMe = false;		

	$rootScope.$on('$locationChangeStart', function(){	
		if(Auth.isLoggedIn()){					
			app.isLoggedIn = true;			
			Auth.getUser().then(function(data){										
				app.username = data.data.resourcename;
				app.email = data.data.email;
				app._id = data.data._id;
				app.kinId = data.data.kinId;
				app.designation = data.data.designation;
				app.alias = data.data.alias;
				app.etype = data.data.etype;
				app.region = data.data.region;
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
				Auth.getUser().then(function(data){										
					app.username = data.data.resourcename;
					console.log("app.username"+app.username);
					app.email = data.data.email;
					app._id = data.data._id;
					app.kinId = data.data.kinId;
					app.designation = data.data.designation;
					app.alias = data.data.alias;
					app.etype = data.data.etype;
					app.region = data.data.region;
					
					console.log("app.region"+app.region);
					$rootScope.region = data.data.region;
					if ($rootScope.region !== undefined)
					$window.localStorage.setItem("region", $rootScope.region);
					
					app.loadMe = true;
				});
		
			app.loading =false;
			app.successMsg = data.data.message + '... Redirecting';

			$timeout(function(){$location.path('/Resources');
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
		$window.localStorage.clear();
		Auth.logout();
		$location.path('/logout');
		$timeout(function(){
			$location.path('/login')
		}, 2000);
	};

	this.changePassword = function(userData){		
		app.loading = true;				
		var password = app.userData.password;
		var vpassword = app.userData.vpassword;
		if(password.length > 8 && password === vpassword)
		{
			if(Auth.isLoggedIn()){			
				app.isLoggedIn = true;
				Auth.getUser().then(function(data){	
					app.userData.username = data.data.username;
					app.userData.alias = data.data.alias;
					Auth.resetPassword(app.userData).then(function(ndata){
						app.loading = false;				
						app.errorMsg  = false;				
						app.successMsg = "Password Updated.... Please login back with new password";
						Auth.logout();
						$timeout(function(){
							$location.path('/login')
						}, 2000);						
					});					
				});
			}

		}else
		{
				app.loading =false;
				app.successMsg = false;
				app.errorMsg = "Password not matched basic criteria";
		}
	}

});
