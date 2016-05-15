
var app = angular.module('tc', []);

app.controller('tcc', function($scope, $window, $http, $compile) {

    var auth2;
    var main = angular.element('#main');
    
    $scope.user = {};
    $scope.course = {};
    
    $scope.error = '';
    
    $window.GoogleLogin = function() {
        
        function userChanged(googleUser) {
            console.log('userChanged = ' + JSON.stringify(googleUser));
            if(googleUser.El != null && googleUser.hg != null) {
                var profile = googleUser.getBasicProfile();
                $scope.user.idToken   = googleUser.getAuthResponse().id_token;
                $scope.user.fullName  = profile.getName();
                $scope.user.firstName = profile.getGivenName();
                $scope.user.lastName  = profile.getFamilyName();
                $scope.user.photo     = profile.getImageUrl();
                $scope.user.email     = profile.getEmail();
                $scope.user.domain    = googleUser.getHostedDomain();
                $scope.user.timestamp = moment().format();
                $scope.user.ip        = VIH_HostIP;
            } else {
                $scope.user = {};
                main.html('');
            }
        }

        function signinChanged(signedIn) {
            console.log('signinChanged = ' + signedIn);
            if(signedIn) {
                $http.post('/signinchanged', $scope.user)
                .then(function onSuccess(response) {
                    console.log('/signinchanged onsuccess = ' + JSON.stringify(response));
                    if(response.status === 201) {
                        var joinCourse   = response.data.joinCourse;
                        var createCourse = response.data.createCourse;
                        main.html('');
                        
                        var html = '';
                        if(createCourse) {
                            html += '<a id="create-course" class="button x1" ng-click="createCourse()">Create Course</a>';
                        }
                        if(joinCourse) {
                            html += '<a id="join-course" class="button x1" ng-click="joinCourse()">Join Course</a>';
                        }
                        if(!createCourse && !joinCourse) {
                            html += 'This app is not yet public.';
                        }
                        main.append(html);
                        $compile(main.contents())($scope);
                    } else {
                        $scope.error = 'Unexpected status code = ' + response.status;
                    }
                }, function onError(response) {
                    console.log('/signinchanged onerror = ' + JSON.stringify(response));
                    $scope.error = 'Unexpected status code = ' + response.status;
                });
            } else {
                
            }
        }

        function initSigninV2() {
            auth2 = gapi.auth2.getAuthInstance();
            auth2.isSignedIn.listen(signinChanged);
            auth2.currentUser.listen(userChanged);
        }

        gapi.load('auth2', initSigninV2);
    };
    
    $scope.GoogleSignOut = function() {
        console.log('signing out');
        $scope.user = {};
        auth2.signOut();        
    };
    
    $scope.GoogleDisconnect = function() {
        console.log('disconnecting');
        $scope.user = {};
        auth2.disconnect();
    };
    
    $scope.createCourse = function() {
        console.log('create course');
        $http.get('parts/create-course.html').then(function(response) {
            console.log(response);
            main.html(response.data);
            $compile(main.contents())($scope);
            angular.element('.datepicker').datepicker();
        })
    };
    
    $scope.joinCourse = function() {
        console.log('join course');
    };
    
    $scope.saveCourse = function() {
        console.log('save course = ' + JSON.stringify($scope.course));
        $scope.course.email = $scope.user.email;
        $http.post('/savecourse', $scope.course)
        .then(function onSuccess(response) {
            console.log('/savecourse onsuccess = ' + JSON.stringify(response));
            if(response.status === 201) {
                var joinToken = response.data.joinToken;
                main.html('<p>Students can join this course with the following token: <span class="token">' + response.data + '</span></p>');
            } else {
                $scope.error = 'Unexpected status code = ' + response.status;
            }
        }, function onError(response) {
            console.log('/savecourse onerror = ' + JSON.stringify(response));
            $scope.error = 'Unexpected status code = ' + response.status;
        });
    };

});