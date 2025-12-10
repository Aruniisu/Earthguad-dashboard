import React, { useState } from 'react';
import axios from 'axios';
import { postRecord } from '../services/api';

const OPENWEATHER_KEY = process.env.REACT_APP_OPENWEATHERMAP_KEY;
const OPENWEATHER_BASE = 'https://api.openweathermap.org/data/2.5';
const OPENAQ_BASE = 'https://api.openaq.org/v2/latest';
const RESTCOUNTRIES_BASE = 'https://restcountries.com/v3.1';

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [aggregated, setAggregated] = useState(null);
  const [message, setMessage] = useState('');
  const [city, setCity] = useState('');

  async function fetchAndAggregate(city) {
    try {
      setLoading(true);
      setMessage('Fetching weather...');
      
      const wRes = await axios.get(`${OPENWEATHER_BASE}/weather`, {
        params: { q: city, appid: OPENWEATHER_KEY, units: 'metric' }
      });
      const { coord, sys, name } = wRes.data;

      setMessage('Fetching alerts & air quality...');
      const onecallRes = await axios.get(`${OPENWEATHER_BASE}/onecall`, {
        params: { lat: coord.lat, lon: coord.lon, appid: OPENWEATHER_KEY, units: 'metric', exclude: 'minutely,hourly' }
      });

      const aqRes = await axios.get(OPENAQ_BASE, {
        params: { coordinates: `${coord.lat},${coord.lon}`, radius: 50000, limit: 1 }
      });

      const countryCode = sys.country;
      let country = null;
      try {
        const cRes = await axios.get(`${RESTCOUNTRIES_BASE}/alpha/${countryCode}`);
        country = cRes.data;
      } catch (err) {
        country = null;
      }

      const payload = {
        location: {
          name,
          lat: coord.lat,
          lon: coord.lon,
          country: countryCode,
          countryInfo: country ? { name: country.name?.common, population: country.population } : null
        },
        weather: {
          current: onecallRes.data.current,
          daily: onecallRes.data.daily,
          basicWeather: wRes.data
        },
        alerts: onecallRes.data.alerts || [],
        airQuality: aqRes.data.results?.[0] || {},
        sourceApis: ['openweathermap', 'openaq', 'restcountries'],
        aggregatedAt: new Date().toISOString()
      };

      setAggregated(payload);
      setMessage('Posting aggregated record to backend...');
      const postRes = await postRecord(payload);
      setMessage(`Saved record: ${postRes.id}`);
    } catch (err) {
      console.error(err);
      setMessage('Error fetching data. Check console.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🌍 EarthGuard Dashboard</h1>
      <p style={styles.subtitle}>
        Enter a city to fetch weather, alerts, and air quality, then save it.
      </p>

      <div style={styles.inputContainer}>
        <input
          style={styles.input}
          placeholder="City name e.g., Colombo"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button
          style={styles.button}
          onClick={() => city && fetchAndAggregate(city)}
          disabled={loading}
        >
          {loading ? 'Fetching...' : 'Fetch & Save'}
        </button>
      </div>

      {message && <p style={styles.message}>{message}</p>}

      {aggregated && (
        <div style={styles.cardsContainer}>
          {/* Location Card */}
          <div style={styles.card}>
            <h3>📍 Location</h3>
            <p><strong>City:</strong> {aggregated.location.name}</p>
            <p><strong>Country:</strong> {aggregated.location.countryInfo?.name || aggregated.location.country}</p>
            <p><strong>Population:</strong> {aggregated.location.countryInfo?.population || 'N/A'}</p>
            <p><strong>Coordinates:</strong> {aggregated.location.lat}, {aggregated.location.lon}</p>
          </div>

          {/* Weather Card */}
          <div style={styles.card}>
            <h3>☀️ Current Weather</h3>
            <p><strong>Temperature:</strong> {aggregated.weather.current.temp} °C</p>
            <p><strong>Humidity:</strong> {aggregated.weather.current.humidity}%</p>
            <p><strong>Conditions:</strong> {aggregated.weather.current.weather[0].description}</p>
            <p><strong>Alerts:</strong> {aggregated.alerts.length || 'None'}</p>
          </div>

          {/* Air Quality Card */}
          <div style={styles.card}>
            <h3>💨 Air Quality</h3>
            {aggregated.airQuality.measurements ? (
              aggregated.airQuality.measurements.map((m, idx) => (
                <p key={idx}><strong>{m.parameter}:</strong> {m.value} {m.unit}</p>
              ))
            ) : (
              <p>No data available</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    padding: 20,
    maxWidth: 900,
    margin: '0 auto',
    backgroundColor: '#f5f7fa',
    borderRadius: 12,
  },
  title: {
    textAlign: 'center',
    color: '#1a73e8',
    marginBottom: 5
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#555'
  },
  inputContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 10
  },
  input: {
    padding: '10px 15px',
    borderRadius: 8,
    border: '1px solid #ccc',
    width: 250,
    fontSize: 16
  },
  button: {
    padding: '10px 20px',
    borderRadius: 8,
    border: 'none',
    backgroundColor: '#1a73e8',
    color: '#fff',
    fontSize: 16,
    cursor: 'pointer',
    transition: '0.3s'
  },
  message: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#333'
  },
  cardsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 20,
    justifyContent: 'center'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    minWidth: 250,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  }
};
