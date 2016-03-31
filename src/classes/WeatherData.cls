/** 
 * WeatherData.cls
 * 
 * @abstract: View class with @AuraEnabled properties for representing data in Lightning components.
 *
 * @author: Chase Logan
 */
public with sharing class WeatherData {

	public WeatherData() {

		forecastList = new List<ForecastWrapper>();
	}
	
	@AuraEnabled
	public String currentLocation { get; set; }
	
	@AuraEnabled
	public String currentZip { get; set; }
	
	@AuraEnabled
	public String currentTemp { get; set; }
	
	@AuraEnabled
	public String currentWeather { get; set; }
	
	@AuraEnabled
	public String currentHumidity { get; set; }
	
	@AuraEnabled
	public String currentWind { get; set; }

	@AuraEnabled
	public String currentWeatherImageURL { get; set; }

	@AuraEnabled
	public String currentWeatherRadarImageURL { get; set; }

	@AuraEnabled
	public String sessionId { get; set; }

	@AuraEnabled
	public List<ForecastWrapper> forecastList { get; set; }
	
	// wrapper class for displaying forecastDay data
	// 1-n days are returned as a List to client-side controller
	// for presentation
	public class ForecastWrapper {
		
		@AuraEnabled
		public String title { get; set; }
		@AuraEnabled	
		public String text { get; set; }
		@AuraEnabled
		public String imageURL { get; set; }
		@AuraEnabled
		public String imageText { get; set; }
		@AuraEnabled
		public String windText { get; set; }
	}
	
}