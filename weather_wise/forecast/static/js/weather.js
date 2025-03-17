function testJS() {
    alert("Hello");
}

function sendWeatherToServer() {

    console.log("Hello")

    var formData = new FormData()
    formData.append('city', $('#inputCity').val())

    $ajax(
        {
            url: "/forecast/send_weather_details_to_user/",
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                if(response['status_Code'] == 200) {
                   
                    var listItem = `
                        <a href="#" class="list-group-item list-group-item-action d-flex gap-3 py-3" aria-current="true">
                            <img src="https://github.com/twbs.png" alt="twbs" width="32" height="32" class="rounded-circle flex-shrink-0">
                            <div class="d-flex gap-2 w-100 justify-content-between">
                                <div>
                                    <h6 class="mb-0">Laguna</h6>
                                    <p class="mb-0 opacity-75">` + response['message'] + `</p>
                                </div>
                                <small class="opacity-50 text-nowrap">now</small>
                            </div>
                        </a>
                    `;

                    $('#weatherResponses').append(listItem);

                    $('#inputGenre').val('')
                }
            },

            error: function(error) {
                console.log(error)
            }

        }
    )
}