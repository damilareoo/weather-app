const API_KEY = '5ec30b4f207ed2f4870f77d57aa76544'; 
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

// Updated weather background images with high-quality Unsplash photos
const weatherBackgrounds = {
    Clear: 'https://images.unsplash.com/photo-1598717123623-994ab159f4c8?auto=format&fit=crop&q=80',
    Clouds: 'https://images.unsplash.com/photo-1611928482473-7b27d24eab80?auto=format&fit=crop&q=80',
    Rain: 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&q=80',
    Snow: 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?auto=format&fit=crop&q=80',
    Thunderstorm: 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?auto=format&fit=crop&q=80',
    Drizzle: 'https://images.unsplash.com/photo-1541919329513-35f7af297129?auto=format&fit=crop&q=80',
    Mist: 'https://images.unsplash.com/photo-1485236715568-ddc5ee6ca227?auto=format&fit=crop&q=80',
    Haze: 'https://images.unsplash.com/photo-1533757704860-384affeed946?auto=format&fit=crop&q=80',
    Fog: 'https://images.unsplash.com/photo-1487621167305-5d248087c724?auto=format&fit=crop&q=80',
    default: 'https://images.unsplash.com/photo-1601297183305-6df142704ea2?auto=format&fit=crop&q=80'
};

// DOM Elements
const form = document.getElementById('weather-form');
const cityInput = document.getElementById('city-input');
const weatherInfo = document.getElementById('weather-info');
const errorMessage = document.getElementById('error-message');
const cityName = document.getElementById('city-name');
const temp = document.getElementById('temp');
const weatherIcon = document.getElementById('weather-icon');
const description = document.getElementById('description');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const pressure = document.getElementById('pressure');

function setWeatherBackground(weatherCondition) {
    console.log('Setting background for weather:', weatherCondition);
    const backgroundUrl = weatherBackgrounds[weatherCondition] || weatherBackgrounds.default;
    
    const img = new Image();
    img.src = backgroundUrl;
    
    img.onload = () => {
        document.body.style.backgroundImage = `
            linear-gradient(
                rgba(0, 0, 0, 0.3),
                rgba(0, 0, 0, 0.3)
            ),
            url('${backgroundUrl}')
        `;
    };
}

function showLoader() {
    document.querySelector('.loader').style.display = 'block';
    if (weatherInfo.classList.contains('hidden')) {
        weatherInfo.style.opacity = '0.5';
    }
}

function hideLoader() {
    document.querySelector('.loader').style.display = 'none';
    weatherInfo.style.opacity = '1';
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 3000);
}

function formatDate(timezoneOffset) {
    // Get current UTC time
    const now = new Date();
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    
    // Convert to city's local time
    const cityTime = new Date(utcTime + (timezoneOffset * 1000));
    
    const options = { 
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    };

    return cityTime.toLocaleString('en-US', options);
}

async function getWeatherData(city) {
    try {
        showLoader();
        const response = await fetch(
            `${API_URL}?q=${city}&units=metric&appid=${API_KEY}`
        );
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'City not found. Please check the spelling and try again.');
        }

        const data = await response.json();
        console.log('Weather data:', data); // Debug log
        displayWeather(data);
        setWeatherBackground(data.weather[0].main);
    } catch (error) {
        console.error('Error:', error);
        showError(error.message);
        weatherInfo.classList.add('hidden');
    } finally {
        hideLoader();
    }
}

function displayWeather(data) {
    const currentDate = document.getElementById('current-date');
    
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    currentDate.textContent = formatDate(data.timezone);
    temp.textContent = Math.round(data.main.temp);
    weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    description.textContent = data.weather[0].description;
    humidity.textContent = `${data.main.humidity}%`;
    windSpeed.textContent = `${data.wind.speed} m/s`;
    pressure.textContent = `${data.main.pressure} hPa`;

    weatherInfo.classList.remove('hidden');
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const city = cityInput.value.trim();
    
    if (city) {
        getWeatherData(city);
    }
});

// Optional: Get weather for user's current location
function getLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                showLoader();
                const { latitude, longitude } = position.coords;
                const response = await fetch(
                    `${API_URL}?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
                );
                
                if (!response.ok) {
                    throw new Error('Unable to fetch weather data');
                }

                const data = await response.json();
                displayWeather(data);
            } catch (error) {
                showError(error.message);
            } finally {
                hideLoader();
            }
        }, () => {
            showError('Unable to get location');
        });
    }
}

// Uncomment to get weather for current location on page load
// getLocationWeather();