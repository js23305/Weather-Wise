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

