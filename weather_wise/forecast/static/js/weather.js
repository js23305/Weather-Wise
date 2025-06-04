// Get CSRF token from cookies
const getCSRFToken = () => {
    return document.cookie.split('; ').find(row => row.startsWith('csrftoken=')).split('=')[1];
};

// Return weather icon HTML based on weather code (WMO codes)
const getWeatherIconByCode = (weathercode) => {
    // See https://open-meteo.com/en/docs for WMO weather codes
    if (weathercode === 0) return '<i class="bi bi-brightness-high-fill" title="Clear sky" aria-label="Clear sky"></i>';
    if ([1, 2, 3].includes(weathercode)) return '<i class="bi bi-cloud-sun-fill" title="Mainly clear/partly cloudy" aria-label="Partly cloudy"></i>';
    if ([45, 48].includes(weathercode)) return '<i class="bi bi-cloud-fog2-fill" title="Fog" aria-label="Fog"></i>';
    if ([51, 53, 55, 56, 57].includes(weathercode)) return '<i class="bi bi-cloud-drizzle-fill" title="Drizzle" aria-label="Drizzle"></i>';
    if ([61, 63, 65, 80, 81, 82].includes(weathercode)) return '<i class="bi bi-cloud-rain-heavy-fill" title="Rain" aria-label="Rain"></i>';
    if ([66, 67].includes(weathercode)) return '<i class="bi bi-cloud-hail-fill" title="Freezing rain" aria-label="Freezing rain"></i>';
    if ([71, 73, 75, 77, 85, 86].includes(weathercode)) return '<i class="bi bi-cloud-snow-fill" title="Snow" aria-label="Snow"></i>';
    if ([95, 96, 99].includes(weathercode)) return '<i class="bi bi-cloud-lightning-rain-fill" title="Thunderstorm" aria-label="Thunderstorm"></i>';
    return '<i class="bi bi-cloud-fill" title="Cloudy" aria-label="Cloudy"></i>';
};

// Show a loading spinner while fetching weather data
const showLoading = () => {
    if ($('#loadingSpinner').length === 0) {
        $('body').append('<div id="loadingSpinner" style="position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.6);"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>');
    }
};

// Hide the loading spinner
const hideLoading = () => {
    $('#loadingSpinner').remove();
};

// Display error message in a user-friendly way
const showError = (message) => {
    if ($('#errorAlert').length === 0) {
        $('body').append(`<div id="errorAlert" class="alert alert-danger" style="position:fixed;top:20px;right:20px;z-index:10000;min-width:200px;">${message}</div>`);
        setTimeout(() => { $('#errorAlert').fadeOut(400, function() { $(this).remove(); }); }, 3500);
    }
};

// Send weather request to server and update UI
const sendWeatherToServer = (event) => {
    event.preventDefault();
    showLoading();
    console.log("Sending request....");

    const formData = new FormData();
    formData.append('city', $('#inputCity').val());

    $.ajax({
        url: "/forecast/send_weather_details_to_user/",
        type: "POST",
        headers: { "X-CSRFToken": getCSRFToken() },
        data: formData,
        processData: false,
        contentType: false,
        success: (response) => {
            hideLoading();
            window.lastWeatherResponse = response;
            // Remove debug info box, restore normal rendering
            // console.log("Weather API response:", response); // You can keep this for troubleshooting
            if (response.error) {
                showError(response.error);
            } else {
                $('#weatherResponses').html("");
                updateBackgroundTheme(response.weathercode, response.temperature);
                // Use weather code for icon
                const weatherIcon = getWeatherIconByCode(response.weathercode);
                // Current weather summary
                const currentWeather = `
                    <a href="#" class="list-group-item list-group-item-action d-flex gap-3 py-3 align-items-center" aria-current="true" tabindex="0" aria-label="Current weather">
                        <span style="font-size: 2rem;">${weatherIcon}</span>
                        <div class="d-flex gap-2 w-100 justify-content-between">
                            <div>
                                <h6 class="mb-0">Weather in ${response.city}</h6>
                                <p class="mb-0 opacity-75">Temperature: ${response.temperature}°C</p>
                                <p class="mb-0 opacity-75">Wind: ${response.wind_speed ?? '-'} km/h</p>
                            </div>
                            <small class="opacity-50 text-nowrap">now</small>
                        </div>
                    </a>
                `;
                $('#weatherResponses').append(currentWeather);
                // 7-day forecast
                if (response.forecast && response.forecast.length > 0) {
                    let forecastHtml = '<div class="mt-4"><h5>7-Day Forecast</h5><div class="row">';
                    response.forecast.forEach(day => {
                        forecastHtml += `
                            <div class="col-12 col-md-4 col-lg-3 mb-3">
                                <div class="card h-100 shadow-sm" tabindex="0" aria-label="Forecast for ${day.date}">
                                    <div class="card-body">
                                        <h6 class="card-title">${day.date}</h6>
                                        <div style="font-size: 2rem;">${getWeatherIconByCode(day.weathercode)}</div>
                                        <p class="card-text mb-1">Max: ${day.temp_max}°C / Min: ${day.temp_min}°C</p>
                                        <p class="card-text mb-1">Humidity: ${day.humidity_min ?? '-'}–${day.humidity_max ?? '-'}%</p>
                                        <p class="card-text mb-1">Wind: ${day.wind_speed ?? '-'} km/h</p>
                                        <p class="card-text mb-1">Precipitation: ${day.precipitation ?? '-'} mm</p>
                                        <p class="card-text mb-1">Sunrise: ${day.sunrise ? day.sunrise.split('T')[1] : '-'}</p>
                                        <p class="card-text mb-1">Sunset: ${day.sunset ? day.sunset.split('T')[1] : '-'}</p>
                                    </div>
                                </div>
                            </div>
                        `;
                    });
                    forecastHtml += '</div></div>';
                    $('#weatherResponses').append(forecastHtml);
                }
                // Clothing and activity recommendations
                const recommendation = `
                    <div class="mt-3 p-3 rounded" style="background: rgba(255,255,255,0.92); color: #222; max-width: 500px; margin: 0 auto; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                        <h5 class="fw-bold mb-2">Clothing Recommendation:</h5>
                        <p class="mb-2">${response.clothing_recommendation}</p>
                        <h5 class="fw-bold mb-2">Activity Recommendation:</h5>
                        <p class="mb-0">${response.activity_recommendation}</p>
                    </div>
                `;
                $('#weatherResponses').append(recommendation);
                $('#inputCity').val('');
            }
        },
        error: (error) => {
            hideLoading();
            showError("Something went wrong! Please try again.");
            console.log(error);
        }
    });
};

// Update the background theme based on weather code and temperature, using UTC time from API if available
const updateBackgroundTheme = (weathercode, temperature) => {
    let isDay = null;
    if (window.lastWeatherResponse && window.lastWeatherResponse.current_weather) {
        // Open-Meteo returns is_day: 1 (day) or 0 (night)
        isDay = window.lastWeatherResponse.current_weather.is_day;
    }
    // Fallback: use UTC time from API if available
    if ((isDay === null || isDay === undefined) && window.lastWeatherResponse && window.lastWeatherResponse.current_weather && window.lastWeatherResponse.current_weather.time) {
        // Parse the time string (e.g., '2025-06-03T00:00')
        const apiTime = new Date(window.lastWeatherResponse.current_weather.time + 'Z');
        const hours = apiTime.getUTCHours();
        isDay = (hours >= 6 && hours < 18) ? 1 : 0;
    }
    // Fallback: use browser time
    if (isDay === null || isDay === undefined) {
        const currentTime = new Date();
        const hours = currentTime.getHours();
        isDay = (hours >= 6 && hours < 18) ? 1 : 0;
    }
    $('body').removeClass('body-day body-night weather-snow weather-rainy weather-sunny weather-thunder weather-fog weather-cloudy');
    // Day/night
    if (isDay) {
        $('body').addClass('body-day');
    } else {
        $('body').addClass('body-night');
    }
    // Weather condition
    if ([71, 73, 75, 77, 85, 86].includes(weathercode)) {
        $('body').addClass('weather-snow');
    } else if ([61, 63, 65, 80, 81, 82].includes(weathercode)) {
        $('body').addClass('weather-rainy');
    } else if ([95, 96, 99].includes(weathercode)) {
        $('body').addClass('weather-thunder');
    } else if ([45, 48].includes(weathercode)) {
        $('body').addClass('weather-fog');
    } else if ([1, 2, 3].includes(weathercode)) {
        $('body').addClass('weather-cloudy');
    } else {
        $('body').addClass('weather-sunny');
    }
};


