require('dotenv').config();
const connectDB = require('./db/db.js');
const app = require('./app.js');

connectDB(app);
