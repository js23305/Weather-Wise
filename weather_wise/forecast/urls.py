from django.urls import path
from forecast.views import forecast

urlpatterns = [
    path('', forecast, name='forecast'),
]