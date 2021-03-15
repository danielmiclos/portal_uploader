const express = require('express');
const morgan = require("morgan");
const routes = require('./routes');
const cors = require('cors');
const path = require('path');




const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(morgan('dev'));

app.use(routes);
app.use('/uploads', express.static(path.join('tmp', 'uploads')));

module.exports = {app};