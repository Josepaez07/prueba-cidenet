const mongoose2 = require('mongoose');
require('dotenv').config();

const uri = `mongodb+srv://${process.env.USERBD}:${process.env.PASSWORDBD}@clusteradso2669734.kgcnjnc.mongodb.net/${process.env.BD}?retryWrites=true&w=majority`;

mongoose2.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Conexión exitosa');
    })
    .catch((error) => {
        console.error('Error al conectar a la base:', error);
    });

module.exports = mongoose2;
