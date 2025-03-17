from django.shortcuts import render
from django.template import loader
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render

def forecast(request):

    template = loader.get_template('weather.html')

    context = {
        'title': 'Forecast',
        'content': 'Welcome to the weather forecast'
    }

    return HttpResponse(template.render(context, request))

def send_weather_details_to_user(data):

    print(data.Post)

    message = "Sorry, city not found"

    return JsonResponse({
        "message": message,
        "status_code": 200
    })

