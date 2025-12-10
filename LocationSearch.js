import React, { useState } from 'react';

export default function LocationSearch({ onSearch }) {
  const [city, setCity] = useState('');
  const submit = (e) => {
    e.preventDefault();
    if (!city) return;
    onSearch(city);
  };
  return (
    <form onSubmit={submit} style={{marginBottom: 12}}>
      <input value={city} onChange={e => setCity(e.target.value)} placeholder="Enter city name (e.g., London)" />
      <button type="submit">Search</button>
    </form>
  );
}
