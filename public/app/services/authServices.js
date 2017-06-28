angular.module('authServices',[])
.factory('Auth', function($http, authToken){
	authFactory ={};

	authFactory.login = function(loginData) {
		return $http.post('/api/authenticate', loginData).then(function(data){	
			console.log(data);
			authToken.setToken(data.data.token);			
			return data;
		});
	}
 	//Auth.isLoggedIn()
	authFactory.isLoggedIn = function(){
		if(authToken.getToken()){			
			return true;			
		} else {			
			return false;
		}
	}

	authFactory.getUser = function(){		
		if(authToken.getToken()){			
			return $http.post('api/me');
		}
		else{
			$q.reject({message: 'User has no Token'});
		}
	}

	authFactory.resetPassword = function(userData){		
		if(authToken.getToken()){			
			return $http.put('api/resetpassword',userData);
		}
		else{
			$q.reject({message: 'User has no Token'});
		}
	}


	//Auth.logout()	
	authFactory.logout = function(){
		authToken.setToken();
	};

	return authFactory;
})
.factory('authToken', function($window){
	var authTokenFactory = {};
	//authTokenFactory.setToken(token);
	authTokenFactory.setToken = function(token){
		if(token)
			$window.localStorage.setItem('token',token);
		else
			$window.localStorage.removeItem('token');
	}

	authTokenFactory.getToken = function(){				
		return $window.localStorage.getItem('token');
	};
	return authTokenFactory;
})

.factory('AuthInterceptors', function(authToken) {
	var authInterceptorsFactory = {};
	
	authInterceptorsFactory.request = function(config){

	var token = authToken.getToken();	

	if(token) config.headers['x-access-token'] = token;

	return config;
};

	return authInterceptorsFactory;
});