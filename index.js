const express = require('express');
const path = require('path');
require('dotenv').config();
const cors = require('cors');
const connectDB = require('./db/db.js')
const routerProduct = require('./routes/product_Router.js')
const routerBodega = require('./routes/bodega_Router.js')
const routerPais = require('./routes/pais_Router.js');
const routerProvincia = require('./routes/provincia_Router.js');
const routerLocalidad = require('./routes/localidad_Router.js');
const routerBarrio = require('./routes/barrio_Router.js');
const routerCalle = require('./routes/calle_Router.js');

const app = express();

connectDB(app);

app.use(express.json());
app.use(cors());
    
app.use(`${process.env.ROUTE}/products`, routerProduct);
app.use(`${process.env.ROUTE}/gestion/bodega` , routerBodega);
app.use(`${process.env.ROUTE}/gestion/pais` , routerPais);
app.use(`${process.env.ROUTE}/gestion/provincia` , routerProvincia);
app.use(`${process.env.ROUTE}/gestion/localidad` , routerLocalidad);
app.use(`${process.env.ROUTE}/gestion/barrio` , routerBarrio);
app.use(`${process.env.ROUTE}/gestion/calle` , routerCalle);