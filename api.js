import axios from 'axios';

const backend = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000';
const APP_API_KEY = process.env.REACT_APP_APP_API_KEY;

export async function postRecord(payload) {
  const res = await axios.post(`${backend}/api/records`, payload, {
    headers: {
      'x-api-key': APP_API_KEY,
      'Content-Type': 'application/json'
    }
  });
  return res.data;
}
