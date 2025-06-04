import requests
import json
from django.template import loader
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from django.conf import settings
import os
from dotenv import load_dotenv

load_dotenv()

def forecast(request):
    print("Forecast view is being accessed!")  # Debugging statement

    return render(request, 'weather.html', {'title': "Forecast"})
 


def send_weather_details_to_user(data):
    if data.method == "POST":
        city_name = data.POST.get('city')

        if not city_name:
            return JsonResponse({"error": "No city provided"})

        google_api_key = os.getenv('GOOGLE_API_KEY')
        # Geocoding API to get latitude and longitude of the city
        geocoding_url = f'https://maps.googleapis.com/maps/api/geocode/json?address={city_name}&key={google_api_key}'
        geo_response = requests.get(geocoding_url).json()
        print(f"[DEBUG] Geocoding response for '{city_name}': {geo_response}")

        if 'results' not in geo_response or not geo_response['results']:
            return JsonResponse({"error": "City not found"})

        location = geo_response['results'][0]['geometry']['location']
        latitude, longitude = location['lat'], location['lng']

        # Fetch 7-day weather forecast from Open-Meteo
        weather_url = (
            f'https://api.open-meteo.com/v1/forecast?latitude={latitude}&longitude={longitude}'
            f'&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode,wind_speed_10m_max,relative_humidity_2m_max,relative_humidity_2m_min,sunrise,sunset'
            f'&current_weather=true&timezone=auto'
        )
        weather_response = requests.get(weather_url).json()
        print(f"[DEBUG] Open-Meteo response for lat={latitude}, lon={longitude}: {weather_response}")

        if 'current_weather' in weather_response and 'daily' in weather_response:
            current = weather_response['current_weather']
            daily = weather_response['daily']
            # Prepare daily forecast list
            forecast_days = []
            for i in range(len(daily['time'])):
                forecast_days.append({
                    'date': daily['time'][i],
                    'temp_max': daily['temperature_2m_max'][i],
                    'temp_min': daily['temperature_2m_min'][i],
                    'precipitation': daily['precipitation_sum'][i],
                    'weathercode': daily['weathercode'][i],
                    'wind_speed': daily['wind_speed_10m_max'][i],
                    'humidity_max': daily['relative_humidity_2m_max'][i],
                    'humidity_min': daily['relative_humidity_2m_min'][i],
                    'sunrise': daily['sunrise'][i],
                    'sunset': daily['sunset'][i],
                })

            # Clothing and Activity Recommendations (based on current temp)
            temperature = current['temperature']
            clothing_recommendation = ""
            activity_recommendation = ""
            if temperature < 10:
                clothing_recommendation = "Wear a jacket or coat to stay warm."
                activity_recommendation = "It's a cold day! Consider indoor activities like reading a book or enjoying a hot beverage."
            elif temperature < 20:
                clothing_recommendation = "A sweater or long sleeves should be fine."
                activity_recommendation = "It's a cool day! Perfect for indoor activities."
            else:
                clothing_recommendation = "Wear light clothing, like a t-shirt or shorts."
                activity_recommendation = "It's warm and sunny! Great for outdoor activities like hiking, cycling, or a picnic."

            return JsonResponse({
                "city": city_name,
                "temperature": temperature,
                "wind_speed": current.get('windspeed'),
                "weathercode": current.get('weathercode'),
                "forecast": forecast_days,
                "clothing_recommendation": clothing_recommendation,
                "activity_recommendation": activity_recommendation
            })
        else:
            # Provide more details in the error for debugging
            return JsonResponse({
                "error": "Weather data unavailable",
                "details": weather_response
            })

    return JsonResponse({"error": "Invalid request method"}, status=400)