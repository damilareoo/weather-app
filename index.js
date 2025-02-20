const form = document.getElementById('weather-form');
const cityInput = document.getElementById('city-input');
const weatherInfo = document.getElementById('weather-info');
const cityName = document.getElementById('city-name');
const dateElement = document.getElementById('date');
const temperature = document.getElementById('temperature');
const description = document.getElementById('description');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const loader = document.getElementById('loader');

const apiKey = 'bfdcee77151366cc62b686e34439c4eb';
const apiUrl = 'https://api.openweathermap.org/data/2.5/weather';


form.addEventListener('submit', (e) => {
    e.preventDefault();
    const city = cityInput.value.trim();
    if (city) {
        getWeather(city);
    }
});

function getWeather(city) {
    if (!city) {
        showError('Please enter a city name');
        return;
    }

    showLoader();
    
    fetch(`${apiUrl}?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            hideLoader();
            displayWeather(data);
        })
        .catch(error => {
            hideLoader();
            console.error('Error fetching weather data:', error);
            let errorMessage = 'Failed to fetch weather data. Please try again.';
            
            if (error.message.includes('status: 404')) {
                errorMessage = 'City not found. Please check the spelling and try again.';
            } else if (error.message.includes('status: 401')) {
                errorMessage = 'API key error. Please check your API key.';
            } else if (!navigator.onLine) {
                errorMessage = 'No internet connection. Please check your connection and try again.';
            }
            
            showError(errorMessage);
        });
}

function displayWeather(data) {
    cityName.textContent = data.name;
    dateElement.textContent = getCurrentDate();
    temperature.textContent = `${Math.round(data.main.temp)}°C`;
    description.textContent = data.weather[0].description;
    humidity.textContent = `Humidity: ${data.main.humidity}%`;
    windSpeed.textContent = `Wind: ${data.wind.speed} m/s`;

    weatherInfo.classList.remove('hidden');
    setTimeout(() => {
        weatherInfo.classList.add('visible');
    }, 10);
    setBackgroundColor(data.weather[0].main);
}

function getCurrentDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return now.toLocaleDateString('en-US', options);
}

function setBackgroundColor(weatherCondition) {
    const colors = {
        Clear: '#87CEEB',
        Clouds: '#B0C4DE',
        Rain: '#4682B4',
        Snow: '#F0F8FF',
        Thunderstorm: '#4B0082',
        Drizzle: '#87CEFA',
        Mist: '#D3D3D3'
    };

    document.body.style.backgroundColor = colors[weatherCondition] || '#f0f0f0';
}

function showLoader() {
    const loader = document.querySelector('.loader');
    const weatherCard = document.querySelector('.weather-card');
    if (loader && weatherCard) {
        loader.style.display = 'block';
        weatherCard.style.opacity = '0.5';
    }
}

function hideLoader() {
    const loader = document.querySelector('.loader');
    const weatherCard = document.querySelector('.weather-card');
    if (loader && weatherCard) {
        loader.style.display = 'none';
        weatherCard.style.opacity = '1';
    }
}

function showError(message) {
    const errorDiv = document.querySelector('.error-message');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 3000);
    }
}

// Weather calculation functions
function calculateComfortScore(temp, humidity, windSpeed) {
    let score = 100;
    
    // Temperature factors (ideal range: 20-25°C)
    if (temp < 20) score -= (20 - temp) * 2;
    if (temp > 25) score -= (temp - 25) * 2;
    
    // Humidity factors (ideal range: 30-60%)
    if (humidity < 30) score -= (30 - humidity);
    if (humidity > 60) score -= (humidity - 60);
    
    // Wind speed factors (ideal range: 0-20 km/h)
    if (windSpeed > 20) score -= (windSpeed - 20);
    
    return Math.max(0, Math.min(100, Math.round(score)));
}

function getActivitySuggestions(weather, temp) {
    const suggestions = [];
    
    if (weather.includes('clear')) {
        if (temp > 20) {
            suggestions.push('Perfect for outdoor activities!');
            suggestions.push('Consider going for a picnic');
            suggestions.push('Great time for hiking or cycling');
        } else {
            suggestions.push('Good for a brisk walk');
            suggestions.push('Ideal for outdoor photography');
        }
    } else if (weather.includes('rain')) {
        suggestions.push('Indoor activities recommended');
        suggestions.push('Visit a museum or gallery');
        suggestions.push('Perfect for reading or movies');
    } else if (weather.includes('snow')) {
        suggestions.push('Build a snowman');
        suggestions.push('Go skiing or snowboarding');
        suggestions.push('Enjoy hot chocolate indoors');
    } else if (weather.includes('clouds')) {
        suggestions.push('Good conditions for running');
        suggestions.push('Visit a park or garden');
        suggestions.push('Perfect for sightseeing');
    }
    
    return suggestions;
}

// Display functions
function displayWeather(data) {
    try {
        // Update basic weather info
        const elements = {
            'city-name': data.name,
            'temp': Math.round(data.main.temp),
            'description': data.weather[0].description,
            'humidity': `${data.main.humidity}%`,
            'wind-speed': `${Math.round(data.wind.speed * 3.6)} km/h`,
            'feels-like': `${Math.round(data.main.feels_like)}°C`,
            'pressure': `${data.main.pressure} hPa`
        };

        // Update each element if it exists
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });

        // Update weather icon
        const weatherIcon = document.getElementById('weather-icon');
        if (weatherIcon) {
            const iconCode = data.weather[0].icon;
            weatherIcon.src = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
        }

        // Calculate and display comfort score
        const comfortScore = calculateComfortScore(
            data.main.temp,
            data.main.humidity,
            data.wind.speed * 3.6
        );
        
        const scoreElement = document.getElementById('comfort-score');
        if (scoreElement) scoreElement.textContent = comfortScore;

        // Set score description
        let scoreDescription = '';
        if (comfortScore >= 80) scoreDescription = 'Excellent weather conditions!';
        else if (comfortScore >= 60) scoreDescription = 'Good weather conditions';
        else if (comfortScore >= 40) scoreDescription = 'Moderate weather conditions';
        else scoreDescription = 'Poor weather conditions';

        const scoreDescElement = document.getElementById('score-description');
        if (scoreDescElement) scoreDescElement.textContent = scoreDescription;

        // Display activity suggestions
        const suggestions = getActivitySuggestions(data.weather[0].main.toLowerCase(), data.main.temp);
        const activitiesList = document.getElementById('activities-list');
        if (activitiesList) {
            activitiesList.innerHTML = suggestions.map(suggestion => `<li>${suggestion}</li>`).join('');
        }

        // Update weather effects
        updateWeatherEffects(data.weather[0].main.toLowerCase());
    } catch (error) {
        console.error('Error in displayWeather:', error);
        showError('Error displaying weather data');
    }
}

function updateWeatherEffects(weatherType) {
    try {
        // Remove all existing weather effects
        document.body.className = '';
        
        // Add new weather effect class
        document.body.classList.add(weatherType.toLowerCase());
        
        // Update background gradient based on weather
        let gradient;
        switch(weatherType) {
            case 'clear':
                gradient = 'linear-gradient(135deg, #6DD5FA, #2196F3)';
                break;
            case 'rain':
                gradient = 'linear-gradient(135deg, #757F9A, #D7DDE8)';
                break;
            case 'snow':
                gradient = 'linear-gradient(135deg, #E0EAFC, #CFDEF3)';
                break;
            case 'clouds':
                gradient = 'linear-gradient(135deg, #bdc3c7, #2c3e50)';
                break;
            default:
                gradient = 'linear-gradient(135deg, #6DD5FA, #2196F3)';
        }
        document.body.style.background = gradient;
    } catch (error) {
        console.error('Error in updateWeatherEffects:', error);
    }
}

// Initialize event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('search-btn');
    const cityInput = document.getElementById('city-input');

    if (searchBtn && cityInput) {
        // Search button click handler
        searchBtn.addEventListener('click', () => {
            const city = cityInput.value.trim();
            if (city) {
                getWeather(city);
            } else {
                showError('Please enter a city name');
            }
        });

        // Enter key handler
        cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const city = cityInput.value.trim();
                if (city) {
                    getWeather(city);
                } else {
                    showError('Please enter a city name');
                }
            }
        });
    }
});