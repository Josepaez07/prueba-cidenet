const mongoose = require('../config/connection');

const userSchema = new mongoose.Schema({
    primerApellido: {
        type: String,
        required: true,
        maxlength: 20,
    },
    segundoApellido: {
        type: String,
        required: true,
        maxlength: 20,
    },
    primerNombre: {
        type: String,
        required: true,
        maxlength: 20,
    },
    otrosNombres: {
        type: String,
        required: false,
        maxlength: 50,
    },
    paisEmpleo: {
        type: String,
        required: true,
    },
    tipoIdentificacion: {
        type: String,
        required: true,
    },
    numeroIdentificacion: {
        type: String,
        required: true,
        unique: true, 
        maxlength: 20,
    },
    correoElectronico: {
        type: String,
        required: true,
    },
    fechaIngreso: {
        type: Date,
        required: true,
    },
    area: {
        type: String,
        required: true,
    },
    estado: {
        type: String,
        default: 'Activo', 
        immutable: true,
    },
    fechaHoraRegistro: {
        type: Date,
        default: Date.now, 
        immutable: true,
    },
});

const userModel = mongoose.model('usuarios', userSchema);

module.exports = userModel;
