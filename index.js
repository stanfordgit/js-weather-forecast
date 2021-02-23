$(function(){    
    $('.tabContent').css({"display" : "none"})
    $('#todayContent').css({"display" : "block"})
    $('#today').addClass('selectedTitle')

    $('.title').click(function(e){
        $('.title').removeClass('selectedTitle')
        $(this).addClass('selectedTitle')
        $('.tabContent').css("display","none")
        $(`#${e.target.id}Content`).css("display","block")
    })

    let lat = 0
    let lon = 0
    let apiKey = '4a5b1aa65da8baa5bc9de8c2c08c5647'

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(geolocationSuccess, geolocationFailure);
		
        $('#currentWeather').text("Идет загрузка данных ...")		
	}
	else {
        alert("Ваш браузер не поддерживает геолокацию")
        lat = 50.38
        lon = 30.37
        loadContent()
        loadingCurentWeather()
        loadingHourlyWeather()
        loadingNearByPlacesWeather()
	}

    function geolocationSuccess(position) {
        lat = position.coords.latitude
        lon = position.coords.longitude 
        loadContent() 
        loadingCurentWeather() 
        loadingHourlyWeather() 
        loadingNearByPlacesWeather()    
    }

    function geolocationFailure(positionError) {
        lat = 50.38
        lon = 30.37
        loadContent()
        loadingCurentWeather()
        loadingHourlyWeather()
        loadingNearByPlacesWeather()
    }

    function loadContent(){
        $('.tabContent').html('')
        let htmlTodayContent = `<div class="currentWeatherDate">
                                    <div id="currentWeather">Current weather</div>
                                    <div id="currentDate"></div>
                                </div>
                                <div class="currentWeatherDetails">
                                    <div class="weatherImageDescription">
                                        <div id="weatherImage"></div>
                                        <div id="weatherDescription"></div>
                                    </div>
                                    <div class="currentTemperatureFeelsLike">
                                        <div id="currentTemperature"></div>
                                        <div id="feelsLike"></div>
                                    </div>
                                    <div class="sunriseSunsetDuration">
                                        <div id="sunrise"></div>
                                        <div id="sunset"></div>
                                        <div id="duration"></div>
                                    </div>
                                </div>

                                <div class="hourlyWeather" id="hourlyWeatherHtml">
                                                    
                                </div>

                                <div class="nearByPlacesWeather">
                                    <div class="nearByPlacesText"></div>
                                    <div class="nearByPlacesContent">                    
                                    </div>
                                </div>`

        let htmlfiveDaysContent =  `<div id="fiveDaysFirstBlock"></div>
                                    <div id="fiveDaysSecondBlock"></div>` 
                                    
        $('#todayContent').html(htmlTodayContent)
        $('#fiveDaysContent').html(htmlfiveDaysContent)

    }

    function loadingCurentWeather(){
        let url = `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
        $.ajax({
            url: `${url}`,        
            dataType: 'json',
            success: function(apiResponse) {                
                $('#inputCity').val(`${apiResponse.name}, ${apiResponse.sys.country}`)
                $('#currentWeather').text('Current weather')
                $('#currentDate').text((new Date()).toLocaleDateString())
                
                $('#weatherImage').empty()
                $('<img>', {
                    'src': `http://openweathermap.org/img/wn/${apiResponse.weather[0].icon}@2x.png`,
                    'width': '60px'
                }).appendTo('#weatherImage')
                $('#weatherDescription').text(`${apiResponse.weather[0].description}`)
                
                $('#currentTemperature').text(`${Math.round(apiResponse.main.temp)}℃`)
                $('#feelsLike').html(`Real Feel: ${Math.round(apiResponse.main.feels_like)}<sup>o</sup>`)

                $('#sunrise').html(`Sunrise: ${dateUnixLocal(apiResponse.sys.sunrise)} AM`)
                $('#sunset').html(`Sunset: ${dateUnixLocal(apiResponse.sys.sunset)} PM`)
                
                let diffTime = apiResponse.sys.sunset - apiResponse.sys.sunrise
                let hh = Math.floor(diffTime / 3600)
                let mm = Math.floor((diffTime - hh * 3600) / 60)
                $('#duration').text(`Duration: ${hh}:${mm} hr`)
                
            }
        })
    }

    function loadingHourlyWeather(){
        let url = `http://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current&units=metric&appid=${apiKey}`
        $.ajax({
            url: `${url}`,        
            dataType: 'json',
            success: function(response) {  
                //-------hourly-------//  
                let htmlHourly =`<div class="hourlyText">Hourly</div>
                                <div class="hourlyContent">
                                    <div class="hourlyContentFirstElem upperText">
                                        TODAY
                                    </div>
                                    <div id="hourlyToday" class="hourlyContentSecondElem"></div>
                                </div>
                                <div class="hourlyContent">
                                    <div class="hourlyContentFirstElem">
                
                                    </div>
                                    <div id="hourlyIcon" class="hourlyContentSecondElem"></div>
                                </div>
                                <div class="hourlyContent">
                                    <div class="hourlyContentFirstElem">
                                        Forecast
                                    </div>
                                    <div id="hourlyForecast" class="hourlyContentSecondElem"></div>
                                </div>
                                <div class="hourlyContent">
                                    <div class="hourlyContentFirstElem">
                                        Temp (℃)
                                    </div>
                                    <div id="hourlyTemp" class="hourlyContentSecondElem"></div>
                                </div>
                                <div class="hourlyContent">
                                    <div class="hourlyContentFirstElem">
                                        RealFeel
                                    </div>
                                    <div id="hourlyRealFeel" class="hourlyContentSecondElem"></div>
                                </div>
                                <div class="hourlyContent">
                                    <div class="hourlyContentFirstElem">
                                        Wind (km/h)
                                    </div>
                                    <div id="hourlyWind" class="hourlyContentSecondElem"></div>
                                </div>`
                
                $('#hourlyWeatherHtml').html(htmlHourly)
                
                
                for(let i = 0; i < 6; i++){                    
                    $('#hourlyToday').append(`<div class="hourlyElem">${getHoursAmPm(response.hourly[i].dt)}</div>`)
                    $('<img>', {
                        'src': `http://openweathermap.org/img/wn/${response.hourly[i].weather[0].icon}@2x.png`,
                        'width': '60px'
                    }).wrap('<div class="hourlyElem"/>').appendTo('#hourlyIcon')
                    $('#hourlyForecast').append(`<div class="hourlyElem">${response.hourly[i].weather[0].main}</div>`)                
                    $('#hourlyTemp').append(`<div class="hourlyElem">${Math.round(response.hourly[i].temp)}<sup>o</sup></div>`)
                    $('#hourlyRealFeel').append(`<div class="hourlyElem">${Math.round(response.hourly[i].feels_like)}<sup>o</sup></div>`)
                    $('#hourlyWind').append(`<div class="hourlyElem">${Math.round(response.hourly[i].wind_speed)} ${getWindDirection(response.hourly[i].wind_deg)}</div>`)
                } 
                
                //-------5 day forecast-------//
                let htmlfiveDays = ""
                $('#fiveDaysSecondBlock').html('')

                for(let i = 0; i < 5; i++){ 
                    htmlfiveDays +=`<div class="fiveDaysFirstBlockElem" id="elem${i}">
                                        <div class="fiveDaysWeekDay">${getDateDay(response.daily[i].dt).short}</div> 
                                        <div class="fiveDaysMonthDay">${getDateMonthDay(response.daily[i].dt)}</div>
                                        <div><img src="http://openweathermap.org/img/wn/${response.daily[i].weather[0].icon}@2x.png" width="80px"></div>
                                        <div class="temperature">${Math.round(response.daily[i].temp.day)}<sup>o</sup>C</div>
                                        <div>${response.daily[i].weather[0].main}</div>
                                    </div>` 
                                    
                    

                    $(`<div class="hourlyWeather" id="elem${i}Second">
                            <div class="hourlyText">Hourly</div>
                            <div class="hourlyContent">
                                <div class="hourlyContentFirstElem upperText">
                                    ${getDateDay(response.daily[i].dt).full}
                                </div>
                                <div id="hourlyToday${i}" class="hourlyContentSecondElem"></div>
                            </div>
                            <div class="hourlyContent">
                                <div class="hourlyContentFirstElem">
            
                                </div>
                                <div id="hourlyIcon${i}" class="hourlyContentSecondElem"></div>
                            </div>
                            <div class="hourlyContent">
                                <div class="hourlyContentFirstElem">
                                    Forecast
                                </div>
                                <div id="hourlyForecast${i}" class="hourlyContentSecondElem"></div>
                            </div>
                            <div class="hourlyContent">
                                <div class="hourlyContentFirstElem">
                                    Temp (℃)
                                </div>
                                <div id="hourlyTemp${i}" class="hourlyContentSecondElem"></div>
                            </div>
                            <div class="hourlyContent">
                                <div class="hourlyContentFirstElem">
                                    RealFeel
                                </div>
                                <div id="hourlyRealFeel${i}" class="hourlyContentSecondElem"></div>
                            </div>
                            <div class="hourlyContent">
                                <div class="hourlyContentFirstElem">
                                    Wind (km/h)
                                </div>
                                <div id="hourlyWind${i}" class="hourlyContentSecondElem"></div>
                            </div>                                            
                        </div>`).appendTo('#fiveDaysSecondBlock')
                
                        for(let j = 0; j < 18; ){                    
                            $(`#hourlyToday${i}`).append(`<div class="hourlyElem">${getHoursAmPm(response.hourly[j].dt)}</div>`)
                            $('<img>', {
                                'src': `http://openweathermap.org/img/wn/${response.hourly[j * (i%2)].weather[0].icon}@2x.png`,
                                'width': '60px'
                            }).wrap('<div class="hourlyElem"/>').appendTo(`#hourlyIcon${i}`)
                            $(`#hourlyForecast${i}`).append(`<div class="hourlyElem">${response.hourly[j * (i%2)].weather[0].main}</div>`)                
                            $(`#hourlyTemp${i}`).append(`<div class="hourlyElem">${Math.round(response.hourly[j * (i%2)].temp)}<sup>o</sup></div>`)
                            $(`#hourlyRealFeel${i}`).append(`<div class="hourlyElem">${Math.round(response.hourly[j * (i%2)].feels_like)}<sup>o</sup></div>`)
                            $(`#hourlyWind${i}`).append(`<div class="hourlyElem">${Math.round(response.hourly[j * (i%2)].wind_speed)} ${getWindDirection(response.hourly[j * (i%2)].wind_deg)}</div>`)
                            j+=3
                        } 
                
                }
                $('#fiveDaysFirstBlock').html(htmlfiveDays)

                $('#fiveDaysSecondBlock .hourlyWeather').css({"display" : "none"})
                $('#fiveDaysSecondBlock .hourlyWeather').first().css({"display" : "block"})
                $('.fiveDaysFirstBlockElem').first().addClass('selectedFirstBlockElem')
            
                $('.fiveDaysFirstBlockElem').click(function(e){
                    $('.fiveDaysFirstBlockElem').removeClass('selectedFirstBlockElem')
                    $(this).addClass('selectedFirstBlockElem')
                    $('#fiveDaysSecondBlock .hourlyWeather').css("display","none")                    
                    let current_id = $(this).attr("id")
                    $(`#${current_id}Second`).css("display","block")
                })

                $('#inputCity').bind("enterKey",function(e){
                    searchCity()
                 })

                 $('#inputCity').keyup(function(e){
                    if(e.keyCode == 13)
                    {
                        $(this).trigger("enterKey");
                    }
                })

                $('#searchImg').click(function(){
                    searchCity()         
                })


                function searchCity(){
                    let cityName = $('#inputCity').val().replace(/\s/g,'+')
                    let urlCityName = `http://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${apiKey}`
                    
                    $.ajax({
                        url: `${urlCityName}`,   
                        dataType: 'json',
                        success: function(response) {
                             lat = response.coord.lat
                             lon = response.coord.lon  
                             loadContent()
                             loadingCurentWeather() 
                             loadingHourlyWeather() 
                             loadingNearByPlacesWeather()
                         },
                         error: function (errormessage) {
                             $('.tabContent').html('')                            
                             $(`.tabContent`).append(`<img src="images/error.png" width="600px"/>`)
                         }
                     }) 
                }

            }
        })
    }

    

    function loadingNearByPlacesWeather(){
        let url = `http://api.openweathermap.org/data/2.5/find?lat=${lat}&lon=${lon}&cnt=10&units=metric&appid=${apiKey}`
        $.ajax({
            url: `${url}`,        
            dataType: 'json',
            success: function(response) {
                $('.nearByPlacesText').text('NearBy Places')             
                let htmlNearByPlaces = ""
                for(let i = 0; i < response.list.length; i++){                    
                    htmlNearByPlaces +=`<div class="nearByPlacesContentElem">
                                            <div class="nearByPlacesFirst">
                                                <div>${response.list[i].name}</div>
                                            </div>
                                            <div class="nearByPlacesSecond">
                                                <div><img src="http://openweathermap.org/img/wn/${response.list[i].weather[0].icon}@2x.png" width="30px" height="30px"></div>
                                                <div>${Math.round(response.list[i].main.temp)}<sup>o</sup>C</div>
                                            </div>   
                                        </div>`
                }   
                
                $('.nearByPlacesContent').html(htmlNearByPlaces)
            }
        })
    }

})


function dateUnixLocal(unix_timestamp){
    let date = new Date(unix_timestamp * 1000)
    let hours = date.getHours() % 12
    let minutes = "0" + date.getMinutes()
    let formattedTime = hours + ':' + minutes.substr(-2)
    return formattedTime
}

function getHoursAmPm(unix_timestamp){
    let date = new Date(unix_timestamp * 1000)
    let hours = date.getHours()
    let hhAmPm
    if(hours == 0){
        hhAmPm = `12am`
    }
    else if(hours == 12){
        hhAmPm = `12pm`
    }
    else if(hours > 0 && hours < 12 ){
        hhAmPm = `${hours}am`
    }
    else if(hours > 12 && hours <= 23 ){
        hhAmPm = `${hours % 12}pm`
    }    
    return hhAmPm
}

function getWindDirection(wind_deg){
    let direct
    if((wind_deg >= 0 && wind_deg <= 11.25) ||(wind_deg > 348.45 && wind_deg <= 360)){
        direct = 'N'
    }
    else if(wind_deg > 11.25 && wind_deg <= 33.75)
    {
        direct = 'NNE'
    }
    else if(wind_deg > 33.75 && wind_deg <= 56.25)
    {
        direct = 'NE'
    }
    else if(wind_deg > 56.25 && wind_deg <= 78.75)
    {
        direct = 'ENE'
    }
    else if(wind_deg > 78.75 && wind_deg <= 101.25)
    {
        direct = 'E'
    }
    else if(wind_deg > 101.25 && wind_deg <= 123.75)
    {
        direct = 'ESE'
    }
    else if(wind_deg > 123.75 && wind_deg <= 146.25)
    {
        direct = 'SE'
    }
    else if(wind_deg > 146.25 && wind_deg <= 168.75)
    {
        direct = 'SSE'
    }
    else if(wind_deg > 168.75 && wind_deg <= 191.25)
    {
        direct = 'S'
    }
    else if(wind_deg > 191.25 && wind_deg <= 213.75)
    {
        direct = 'SSW'
    }
    else if(wind_deg > 213.75 && wind_deg <= 236.25)
    {
        direct = 'SW'
    }
    else if(wind_deg > 236.25 && wind_deg <= 258.75)
    {
        direct = 'WSW'
    }
    else if(wind_deg > 258.75 && wind_deg <= 281.25)
    {
        direct = 'W'
    }
    else if(wind_deg > 281.25 && wind_deg <= 303.75)
    {
        direct = 'WNW'
    }
    else if(wind_deg > 303.75 && wind_deg <= 326.25)
    {
        direct = 'NW'
    }
    else if(wind_deg > 326.25 && wind_deg <= 348.75)
    {
        direct = 'NNW'
    }
    return direct
}

function getDateDay(UNIX_timestamp){
    let a = new Date(UNIX_timestamp * 1000)
    let days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
    let daysFull = ['Sunday','Mondey','Tuesday','Wednesday','Thursday','Friday','Saturday']
    
    let date = days[a.getDay()]
    let dateFull = daysFull[a.getDay()]
    
    if(a.toLocaleDateString() == new Date().toLocaleDateString()){
        return {short:'Tonight', full: 'Tonight'}
    }
    else{
        return {short: `${date}`, full: `${dateFull}`}
    }
}

function getDateMonthDay(UNIX_timestamp){
    let a = new Date(UNIX_timestamp * 1000)
    let months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    let month = months[a.getMonth()]
    let date = a.getDate()
    let time = month + '-' + date
    return time
}