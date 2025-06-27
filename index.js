const express = require('express');
const path = require('path');
require('dotenv').config();
const cors = require('cors');
const connectDB = require('./db/db.js')
const routerProduct = require('./routes/product_Router.js')

const app = express();

connectDB(app);

app.use(express.json());
app.use(cors());
    
app.use('/api/v1/products' , routerProduct);