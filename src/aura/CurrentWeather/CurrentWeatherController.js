({
    /**
     * Function is called via the init handler in the CurrentWeather component.
     * Handles the initialization of the UI, for devices that have visited page in 
     * the past week, a cookie storing a session Id can be used to pull previously
     * requested location data.
     */ 
    initPage : function( cmp, evt, hlp) {
        var SESSION_ID_COOKIE = 'WEATHER_SESSION_ID=';
        
        // hide data body, check for pre-existing cookie and init page
        hlp.setVisibility( cmp, evt, hlp, 'main', 'HIDE');
        hlp.setVisibility( cmp, evt, hlp, 'main_ten_day_body', 'HIDE');
        hlp.setVisibility( cmp, evt, hlp, 'main_input_body', 'HIDE');
        hlp.setVisibility( cmp, evt, hlp, 'loading_spinner', 'SHOW');
        
        // get current cookies & split, find session cookie if present
        var cookieVal = hlp.getCookieValue( cmp, evt, hlp, SESSION_ID_COOKIE);   
        var action = cmp.get( 'c.serverInitWeatherDetails');
        action.setParams({
            'sessionId' : cookieVal
		});
        
        action.setCallback( this, function( response) {
            
            var state = response.getState();
            if ( state === 'SUCCESS') {
                var responseObject = response.getReturnValue();
              	cmp.set( 'v.record', responseObject);
                cmp.set( 'v.weatherList', responseObject.forecastList);
                
                if ( responseObject.currentLocation === 'NO_DATA') {
                    
                    // no data already cached, don't render anything
                    hlp.setVisibility( cmp, evt, hlp, 'main_input_body', 'SHOW');
                } else {
                    
                    // show the data body && set cookie val
                    hlp.setVisibility( cmp, evt, hlp, 'main', 'SHOW');
                    hlp.setCookieValue( cmp, evt, hlp, responseObject.sessionId);
                }
                
                // hide the spinner either way
                hlp.setVisibility( cmp, evt, hlp, 'loading_spinner', 'HIDE');
            }
        });
        
        $A.enqueueAction( action);
    },
    
    /**
     * Function is responsible for requesting weather data for a given input zip code.
     */ 
    getWeather : function( cmp, evt, hlp) {
        
        hlp.getWeather( cmp, evt, hlp);
    },
    
    /**
     * Function is responsible for requesting ten day forecast data for current location.
     */
    getTenDayForecast : function( cmp, evt, hlp) {
        
        hlp.getTenDayForecast( cmp, evt, hlp);
    },
    
    /**
     * Function handles enter key press in search box
     */
    detectEnter : function( cmp, evt, hlp) {
        var ENTER_KEY = 13;
        
        var code = (evt.keyCode ? evt.keyCode : evt.which);
        if ( code == ENTER_KEY) {
            getWeather();
        }
    }
})