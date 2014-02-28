angular.module('cg').controller(
	'HomeController',
	function($scope, socket, $location, responseHandler) {
		$scope.quickActions = {
			repo_url: '',
			repo_email: '',
			listed: true,
			quickAddRepo: function() {
				if($scope.quickAddForm.$valid) {
					socket.post('/repository/create', {
						url: this.repo_url,
						email: this.repo_email,
						listed: this.listed
					}, function(response) {

						$scope.globalUtils.responseHandler(response, function(
							response) {

							// Repo created successfully, redirect to the repo
							$location.path('/repo/' + response.repo.name);

						}, "Could not create repo");
					});
				}
			},
		};

		var now = new Date(Date.now());
		now = now.getHours();
		if(now == 0) {
			$scope.now = "12am";
		} else if(now < 12) {
			$scope.now = now + "am";
		} else if(now == 12) {
			$scope.now = "12pm";
		} else {
			$scope.now = (now - 12) + "pm";
		}

	});