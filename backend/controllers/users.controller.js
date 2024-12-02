const { render } = require('ejs');
const userModel = require('../models/users.models');

exports.listUsers = async (req, res) => {
    try {
        const users = await userModel.find();
        const correoElectronico = req.query.correoElectronico || '';
        res.render('users', { users, correoElectronico });
    } catch (error) {
        console.error(error);
        res.status(500).json({ "mensaje": "Se presentó un error" });
    }
};

exports.createUsers = async (req, res) => {
    try {
        let {
            primerApellido,
            segundoApellido,
            primerNombre,
            otrosNombres,
            paisEmpleo,
            tipoIdentificacion,
            numeroIdentificacion,
            fechaIngreso,
            area,
            estado,
        } = req.body;

        const nombreRegex = /^[A-Z]+$/;
        const nombreEspaciosRegex = /^[A-Z ]+$/;
        const idRegex = /^[A-Z0-9-]+$/;

        if (!primerApellido || !nombreRegex.test(primerApellido) || primerApellido.length > 20) {
            return res.status(400).json({ message: 'El primer apellido es requerido y solo puede contener letras mayúsculas (máximo 20 caracteres).' });
        }

        if (!segundoApellido || !nombreRegex.test(segundoApellido) || segundoApellido.length > 20) {
            return res.status(400).json({ message: 'El segundo apellido es requerido y solo puede contener letras mayúsculas (máximo 20 caracteres).' });
        }

        if (!primerNombre || !nombreRegex.test(primerNombre) || primerNombre.length > 20) {
            return res.status(400).json({ message: 'El primer nombre es requerido y solo puede contener letras mayúsculas (máximo 20 caracteres).' });
        }

        if (otrosNombres && (!nombreEspaciosRegex.test(otrosNombres) || otrosNombres.length > 50)) {
            return res.status(400).json({ message: 'Otros nombres solo puede contener letras mayúsculas y espacios (máximo 50 caracteres).' });
        }

        if (!numeroIdentificacion || !idRegex.test(numeroIdentificacion) || numeroIdentificacion.length > 20) {
            return res.status(400).json({ message: 'El número de identificación debe ser alfanumérico y permitir los caracteres (a-z, A-Z, 0-9, -) con una longitud máxima de 20 caracteres.' });
        }

        const existingUser = await userModel.findOne({ tipoIdentificacion, numeroIdentificacion });
        if (existingUser) {
            return res.status(400).json({ message: 'Ya existe un usuario con el mismo número de identificación y tipo de identificación.' });
        }

        const domain = paisEmpleo === 'Colombia' ? 'cidenet.com.co' : 'cidenet.com.us';
        let email = `${primerNombre.toLowerCase()}.${primerApellido.toLowerCase()}@${domain}`;

        let emailExists = await userModel.findOne({ correoElectronico: email });
        let counter = 1;
        while (emailExists) {
            email = `${primerNombre.toLowerCase()}.${primerApellido.toLowerCase()}.${counter}@${domain}`;
            emailExists = await userModel.findOne({ correoElectronico: email });
            counter++;
        }

        if (email.length > 300) {
            return res.status(400).json({ message: 'El correo electrónico no puede tener más de 300 caracteres.' });
        }

        const today = new Date();
        const maxDate = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
        const ingresoDate = new Date(fechaIngreso);

        if (ingresoDate > today) {
            return res.status(400).json({ message: 'La fecha de ingreso no puede ser mayor a la fecha actual.' });
        }

        if (ingresoDate < maxDate) {
            return res.status(400).json({ message: 'La fecha de ingreso no puede ser más antigua de un mes.' });
        }

        const currentDate = new Date();
        const fechaHoraRegistro = `${("0" + currentDate.getDate()).slice(-2)}/${("0" + (currentDate.getMonth() + 1)).slice(-2)}/${currentDate.getFullYear()} ${("0" + currentDate.getHours()).slice(-2)}:${("0" + currentDate.getMinutes()).slice(-2)}:${("0" + currentDate.getSeconds()).slice(-2)}`;

        const newUser = new userModel({
            primerApellido,
            segundoApellido,
            primerNombre,
            otrosNombres,
            paisEmpleo,
            tipoIdentificacion,
            numeroIdentificacion,
            correoElectronico: email,
            fechaIngreso,
            area,
            estado: 'Activo',
            fechaHoraRegistro
        });

        await newUser.save();
        res.redirect('/users');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear el usuario', error: error.message });
    }
};

exports.viewUserInfo = async (req, res) => {
    try {
        const userId = req.params.id; 
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).render('users', {
                mensaje: "Usuario no encontrado",
            });
        }


        res.render('userInfoModal', { user });
    } catch (error) {
        console.error(error);
        res.status(500).render('users', {
            mensaje: "Se presentó un error al obtener la información",
        });
    }
};


exports.formEdit = async (req, res) => {
    try {
        const user = await userModel.findById(req.params.id);
        if (!user) return res.status(404).send("Usuario no encontrado");
        res.render('/users', { user });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al mostrar el formulario de edición");
    }
};

exports.editUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const { primerApellido, segundoApellido, primerNombre, otrosNombres, paisEmpleo, tipoIdentificacion, numeroIdentificacion, area, correo } = req.body;

        const idRegex = /^[a-zA-Z0-9-]+$/; 
        if (!numeroIdentificacion || !idRegex.test(numeroIdentificacion) || numeroIdentificacion.length > 20) {
            return res.status(400).json({ message: 'El número de identificación debe ser alfanumérico y permitir los caracteres (a-z, A-Z, 0-9, -) con una longitud máxima de 20 caracteres.' });
        }

        const existingUser = await userModel.findOne({ tipoIdentificacion, numeroIdentificacion });
        if (existingUser && existingUser._id.toString() !== userId) { 
            return res.status(400).json({ message: 'Ya existe un usuario con el mismo número de identificación y tipo de identificación.' });
        }

        let email = correo; 
        if (primerNombre || primerApellido) {
            const domain = paisEmpleo === 'Colombia' ? 'cidenet.com.co' : 'cidenet.com.us';
            email = `${primerNombre.toLowerCase()}.${primerApellido.toLowerCase()}@${domain}`;

            let emailExists = await userModel.findOne({ correoElectronico: email });
            let counter = 1;

            while (emailExists) {
                email = `${primerNombre.toLowerCase()}.${primerApellido.toLowerCase()}.${counter}@${domain}`;
                emailExists = await userModel.findOne({ correoElectronico: email });
                counter++;
            }
            console.log('Correo electrónico generado: ', email);
            if (email.length > 300) {
                return res.status(400).json({ message: 'El correo electrónico no puede tener más de 300 caracteres.' });
            }
        }

        const resultado = await userModel.findByIdAndUpdate(
            userId,
            {
                primerApellido,
                segundoApellido,
                primerNombre,
                otrosNombres,
                paisEmpleo,
                tipoIdentificacion,
                numeroIdentificacion,
                area,
                correoElectronico: email, 
            },
            { new: true }
        );

        if (!resultado) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        const users = await userModel.find();
        return res.render('users', {
            users,
            mensaje: "Usuario actualizado exitosamente"
        });
    } catch (error) {
        console.error(error);
        const users = await userModel.find();
        return res.status(500).render('users', {
            users,
            mensaje: "Se presentó un error al actualizar el usuario"
        });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        await userModel.findByIdAndDelete(userId);
        res.redirect('/users');
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al eliminar el usuario");
    }

};



