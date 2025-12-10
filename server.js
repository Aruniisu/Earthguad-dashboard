require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const passport = require('passport');
const cookieSession = require('cookie-session');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');

require('./config/passport'); // passport strategy

const app = express();
const PORT = process.env.PORT || 4000;

// FIXED MONGOOSE CONNECTION — NO OPTIONS!
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error', err));

app.use(helmet());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());

app.use(cookieSession({
  name: 'earthguard_session',
  keys: [process.env.SESSION_SECRET || 'secret'],
  maxAge: 24 * 60 * 60 * 1000
}));

app.use(passport.initialize());
app.use(passport.session());

// routes
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'EarthGuard backend running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// GET all saved data
app.get('/api/data', async (req, res) => {
  try {
    const allData = await Data.find(); // get all entries from MongoDB
    res.status(200).json(allData);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching data' });
  }
});