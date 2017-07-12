angular.module('mainController',['authServices'])
.controller('mainCtrl', function(Auth, $http,$location,$timeout,$rootScope){	
	var app = this;
	app.loadMe = false;
	$rootScope.$on('$routeChangeStart', function(){	

		if(Auth.isLoggedIn()){					
			app.isLoggedIn = true;			
			Auth.getUser().then(function(data){										
			if(data.data.resourcename !== ""){	
				app.username = data.data.resourcename;
				app.email = data.data.email;
				app._id = data.data._id;
				app.kinId = data.data.kinId;
				app.designation = data.data.designation;
				app.alias = data.data.alias;
				app.loadMe = true;
			}else{
				app.isLoggedIn = false;
				app.username = '';
				app.loadMe = false;				
				Auth.logout();	
				$location.path('/login');					
			}

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
				$timeout(function(){$location.path('/Home');
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
					Auth.resetPassword(app.userData).then(function(ndata){
						app.loading = false;				
						app.errorMsg  = false;				
						app.successMsg = "Password Updated.... Please login back with new password";
						Auth.logout();
						$timeout(function(){
							$location.path('/')
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
