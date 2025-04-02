const form = document.querySelector('#search-form');
const input = document.querySelector('#search-term');
const msg = document.querySelector('.form-msg');
const list = document.querySelector('.cities');

const apiKey = 'b698d077dfe276fb8d7636665ca5f0fa';

form.addEventListener('submit', async (e) => {
	e.preventDefault();
	clearMessage();

	const inputValue = input.value.trim();
	if (!inputValue) {
		showMessage('Please enter a city name.');
		return;
	}

	if (isDuplicate(inputValue)) {
		showMessage(`You already have weather data for ${inputValue}. Try being more specific.`);
		form.reset();
		input.focus();
		return;
	}

	try {
		const weatherData = await fetchWeather(inputValue);
		if (weatherData) {
			renderCity(weatherData);
			form.reset();
			input.focus();
		}
	} catch {
		showMessage('City not found. Please try again.');
	}
});

function isDuplicate(query) {
	const [city, country] = query.toLowerCase().split(',').map(part => part.trim());
	const items = list.querySelectorAll('li');

	return Array.from(items).some(item => {
		const name = item.querySelector('.city_name').textContent.toLowerCase();
		const code = item.querySelector('.city_country').textContent.toLowerCase();

		if (country && country.length <= 2) {
			return name === city && code === country;
		}
		return name === city;
	});
}

async function fetchWeather(query) {
	const url = `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${apiKey}&units=metric`;
	const response = await fetch(url);
	const data = await response.json();

	if (data.cod !== 200) throw new Error(data.message);
	return data;
}

function renderCity(data) {
	const { name, sys, main, weather } = data;
	const iconUrl = `img/weather/${weather[0].icon}.svg`;

	const li = document.createElement('li');
	li.innerHTML = `
		<figure>
			<img src="${iconUrl}" alt="${weather[0].description}">
		</figure>
		<div>
			<h2>${Math.round(main.temp)}<sup>°C</sup></h2>
			<p class="city_conditions">${weather[0].description.toUpperCase()}</p>
			<h3>
				<span class="city_name">${name}</span>
				<span class="city_country">${sys.country}</span>
			</h3>
		</div>
	`;

	list.appendChild(li);
}

function showMessage(text) {
	msg.textContent = text;
	msg.classList.add('visible');
}

function clearMessage() {
	msg.textContent = '';
	msg.classList.remove('visible');
}
