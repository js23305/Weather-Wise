from django.urls import path
from forecast.views import forecast, send_weather_details_to_user

urlpatterns = [
    path('', forecast, name='forecast'),
    path('send_weather_details_to_user/', send_weather_details_to_user, name='send_weather'),
]