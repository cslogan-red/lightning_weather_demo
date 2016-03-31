({
    /**
     * Controls the visibility of a component by checking to first see
     * if the "toggle" CSS class is applied and then either applies or 
     * removes this class based on the supplied action.
     */
	setVisibility : function( cmp, evt, hlp, targetCmp, action) {
        var HIDE_ACTION = 'HIDE';
        var SHOW_ACTION = 'SHOW';
        var TOGGLE_CLASS = 'toggle';
        
        // show
        if ( targetCmp !== null && targetCmp !== '' 
            	&& action === SHOW_ACTION) {
            
            var toggle = cmp.find( targetCmp);
            if ( $A.util.hasClass( toggle, TOGGLE_CLASS)) {
                
                $A.util.toggleClass( toggle, TOGGLE_CLASS);
            }
        // hide
        } else if ( targetCmp !== null && targetCmp !== '' 
                   && action === HIDE_ACTION) {
            
            var toggle = cmp.find( targetCmp);
            if ( $A.util.hasClass( toggle, TOGGLE_CLASS) === false) {
                
                $A.util.toggleClass( toggle, TOGGLE_CLASS);
            }
        }
    },
    
    /**
     * Retreives the session Id cookie value if present based on
     * supplied cookieName
     */ 
    getCookieValue : function( cmp, evt, hlp, cookieName) {
        var cookieVal;
        
        if ( cookieName !== '') {
            // get current cookies & split, find session cookie if present
            var cookie = document.cookie;
            console.log( 'ALL COOKIES:::' + cookie);
            var splitArr = cookie.split( ';');
            
            for ( i = 0; i < splitArr.length; i++) {
                
                var c = splitArr[i];
                while ( c.charAt(0) == ' ') c = c.substring( 1);
                if ( c.indexOf( cookieName) == 0) {
                    
                    cookieVal = c.substring( name.length, c.length);
                    cookieVal = cookieVal.substring( cookieVal.indexOf( '=') + 1);
                }
            }
            
            // if cookie doesn't exist, null or empty value will initiate 
            // creation of new session ID value in Apex controller
            console.log( 'SESSION COOKIE VALUE:::' + cookieVal);   
        }
        
        return cookieVal;
    },
    
    /**
     * Sets the session cookie ID value
     */
    setCookieValue : function ( cmp, evt, hlp, sessionId) {
        var SESSION_ID_COOKIE = 'WEATHER_SESSION_ID=';
        
        // set the cookie && expire it seven days from now
        var d = new Date();
        d.setTime( d.getTime() + 7 * 86400000);
        document.cookie = SESSION_ID_COOKIE + sessionId +
            '; expires=' + d.toUTCString();
    },
	
	/*	    
	 * Handles the actual work of requesting three day forecast data from
	 * server, getting and setting of cookie value, and rendering page
	 */
    getWeather : function ( cmp, evt, hlp) {
        var SESSION_ID_COOKIE = 'WEATHER_SESSION_ID=';
        var MENU_BUTTON_ID = 'menuSubmitButton';
        var FORM_BUTTON_ID = 'formSubmitButton';
        var locZip = cmp.get( 'v.weatherLoc');
        var inputZipCmp;
        
        // make sure there's a location to request
        if ( locZip === null || locZip === '') {
            
            if ( evt.target.id === MENU_BUTTON_ID) {
                        
                inputZipCmp = cmp.find( 'locationZipMenu');
            } else if ( evt.target.id === FORM_BUTTON_ID) {
                
                inputZipCmp = cmp.find( 'locationZip');
            }
            
            // set error message
            inputZipCmp.set( 'v.errors', 
                            [{ message: 'Zip code is required.'}]);
        } else {
            
            // show the spinner, hide the data body
            hlp.setVisibility( cmp, evt, hlp, 'loading_spinner', 'SHOW');
            hlp.setVisibility( cmp, evt, hlp, 'main', 'HIDE');
            hlp.setVisibility( cmp, evt, hlp, 'main_ten_day_body', 'HIDE');
            hlp.setVisibility( cmp, evt, hlp, 'main_input_body', 'HIDE');
            
            // get current cookies & split, find session cookie if present
            var cookieVal = hlp.getCookieValue( cmp, evt, hlp, SESSION_ID_COOKIE);
            var action = cmp.get( 'c.serverGetCurrentWeatherDetailsByZip');
            action.setParams({
                'inputZip' : locZip,
                'inputSessionId' : cookieVal
            });
            
            action.setCallback( this, function( response) {
                
                var state = response.getState();
                if ( state === 'SUCCESS') {
                    var responseObject = response.getReturnValue();
                    cmp.set( 'v.record', responseObject);
                    cmp.set( 'v.weatherList', responseObject.forecastList);

                    if ( evt.target.id === MENU_BUTTON_ID) {
                        
                        inputZipCmp = cmp.find( 'locationZipMenu');
                    } else if ( evt.target.id === FORM_BUTTON_ID) {
                        
                        inputZipCmp = cmp.find( 'locationZip');
                    }
                    
                    if ( responseObject.currentLocation === 'NO_DATA') {
                        
                        // set error message
                        inputZipCmp = cmp.find( 'locationZip');
                        inputZipCmp.set( 'v.errors', 
                            [{ message: 'Service may be unavailable, no data returned. Please check search criteria.'}]);
                        hlp.setVisibility( cmp, evt, hlp, 'main', 'HIDE');
                        hlp.setVisibility( cmp, evt, hlp, 'main_input_body', 'SHOW');
                    } else {
                        
                        // set the cookie value
                        hlp.setCookieValue( cmp, evt, hlp, responseObject.sessionId);

                        // fire submitted event for radar component
                        $A.get( 'e.c:WeatherZipSubmitted').setParams({
                            zip : locZip
                        }).fire();
                        
                        inputZipCmp.set( 'v.errors', null);
                        cmp.set( 'v.weatherLoc', '');
                        
                        hlp.setVisibility( cmp, evt, hlp, 'main', 'SHOW');
                    }
                    
                    // hide the spinner
                    hlp.setVisibility( cmp, evt, hlp, 'loading_spinner', 'HIDE');
                }
            });
            
            $A.enqueueAction( action);
        }
    }, 
    
    /*	    
	 * Handles the actual work of requesting ten day forecast data from
	 * server, getting and setting of cookie value, and rendering page
	 */
    getTenDayForecast : function( cmp, evt, hlp) {
        var SESSION_ID_COOKIE = 'WEATHER_SESSION_ID=';
        var tenDayButtonCmp;
        
        // show the spinner, hide the data body
        hlp.setVisibility( cmp, evt, hlp, 'loading_spinner', 'SHOW');
        hlp.setVisibility( cmp, evt, hlp, 'main', 'HIDE');
        hlp.setVisibility( cmp, evt, hlp, 'main_ten_day_body', 'HIDE');
        hlp.setVisibility( cmp, evt, hlp, 'main_input_body', 'HIDE');
            
        // get current cookies & split, find session cookie if present
        var cookieVal = hlp.getCookieValue( cmp, evt, hlp, SESSION_ID_COOKIE);
        var action = cmp.get( 'c.serverGetTenDayForecast');
        action.setParams({
            'sessionId' : cookieVal
        });
            
        action.setCallback( this, function( response) {
            
            var state = response.getState();
            if ( state === 'SUCCESS') {
                var responseObject = response.getReturnValue();
                cmp.set( 'v.weatherList', responseObject.forecastList);
                tenDayButtonCmp = cmp.find( 'menuTenDayButton');
                
                if ( responseObject.currentLocation === 'NO_DATA') {
                    
                    // set error message
                    tenDayButtonCmp.set( 'v.errors', 
                    	[{ message: 'Service may be unavailable, no data returned. Please check search criteria.'}]);
                    hlp.setVisibility( cmp, evt, hlp, 'main', 'SHOW');
                } else {
                    
                    hlp.setVisibility( cmp, evt, hlp, 'main_ten_day_body', 'SHOW');
                }
                
                // hide the spinner
                hlp.setVisibility( cmp, evt, hlp, 'loading_spinner', 'HIDE');
            }
        });
            
            $A.enqueueAction( action);
        }
    }
})