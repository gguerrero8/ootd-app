function WeatherBanner({ weather }) {
  const { cityName, temperature, description } = weather || {}

  return (
    <section className="weather-banner">
      <div className="weather-inner">
        <div className="weather-main">
          <div className="weather-icon" aria-hidden="true">
            ☀️
          </div>
          <div>
            <p className="weather-city">{cityName || 'Your city'}</p>
            <p className="weather-temp">
              {typeof temperature === 'number' ? `${temperature}°F` : '--°F'}
              <span className="weather-desc"> · {description || 'Clear skies'}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default WeatherBanner
