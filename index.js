const express = require('express');
const path = require('path');
const routes = require('./backend/routes/routes');
const app = express();


app.set('view engine', 'ejs'); 
app.set('views', path.join(__dirname, 'frontend/views'));
app.use('/frontend/statics', express.static(path.join(__dirname, 'frontend', 'statics')));
app.use(express.urlencoded({ extended: true }));
app.use('/', routes); 


const PORT = 9998;
app.listen(PORT, () => {
    console.log(`El servidor está corriendo en: http://localhost:${PORT}`);
});
