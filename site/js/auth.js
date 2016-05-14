// https://developers.google.com/identity/sign-in/web/sign-in
// https://developers.google.com/identity/sign-in/web/listeners

var auth2;

var GoogleLogin = function() {
        
    var userChanged = function(googleUser) {
        console.log('userChanged = ' + googleUser);
        var profile = googleUser.getBasicProfile();
        var loginStamp = {
            idToken     : googleUser.getAuthResponse().id_token,
            fullName    : profile.getName(),
            firstName   : profile.getGivenName(),
            lastName    : profile.getFamilyName(),
            photo       : profile.getImageUrl(),
            email       : profile.getEmail(),
            timestamp   : moment().format(),
            ip          : VIH_HostIP
        };

        $.post('/onuserlogin', loginStamp, function(data, status, xhr) {
            switch(xhr.status) {
                case 201:
                    console.log('successful login record');
                    break;
                default:
                    console.log('default :( xhr.status = ' + xhr.status);
                    break;
            }
        });
    };
    
    var signinChanged = function(val) {
        console.log('signinChanged = ' + val);
    };
    
    var initSigninV2 = function() {
        auth2 = gapi.auth2.getAuthInstance();
        auth2.isSignedIn.listen(signinChanged);
        auth2.currentUser.listen(userChanged);
    };

    gapi.load('auth2', initSigninV2);
};
