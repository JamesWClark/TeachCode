// https://developers.google.com/identity/sign-in/web/sign-in
// https://developers.google.com/identity/sign-in/web/listeners

var auth2;

var GoogleLogin = function() {
    console.log('loading api');
    
    var updateHtml = function(googleUser) {
        console.log('update html: ', googleUser === false ? 'dashes' : googleUser);
        if(googleUser) {
            // http://jsonmate.com/permalink/5735656a180f6b4d110f51ba
            var loginStamp = {
                fullName    : googleUser.wc.wc,
                firstName   : googleUser.wc.Za,
                lastName    : googleUser.wc.Na,
                photo       : googleUser.wc.Ph,
                email       : googleUser.wc.hg,
                ip          : VIH_HostIP,
                timestamp   : moment().format()
            };
            
            $.post('/onuserlogin', loginStamp).done(function(data) {
                alert(data.status);
                // should check 201 status? or something else?
            });

        } else {

        }
    };
    
    // this seems to fire right before the signout happens, as if to provide a reference to the user object on their way out of the application
    var userChanged = function(googleUser) {
        console.log('user changed: ', googleUser);
        // if the page is refreshed and user is signed out, the script still generates a user with null fields
        if(googleUser.El == null && googleUser.hg == null) {
            updateHtml(false);
        } else {
            updateHtml(googleUser);
        }
    };
    
    var signinChanged = function(val) {
        console.log('signin state changed to ', val);
        if(val === false) {
            updateHtml(false);
        }
    };
    
    var initSigninV2 = function() {
        console.log('init signin v2');
        auth2 = gapi.auth2.getAuthInstance();
        auth2.isSignedIn.listen(signinChanged);
        auth2.currentUser.listen(userChanged);
    };

    gapi.load('auth2', initSigninV2);
};
