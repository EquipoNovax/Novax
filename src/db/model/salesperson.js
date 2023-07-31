const { DataTypes } = require('sequelize');

module.exports = sequelize => {
    sequelize.define('salesperson', { 
        // Persona o negocio
        type: {
            type: DataTypes.STRING
        },
        // Nombre
        name: {
            type: DataTypes.STRING
        },
        // Segundo nombre
        lastName: {
            type: DataTypes.STRING
        },
        // Imagen de perfil
        imgProfile:{
            type: DataTypes.STRING
        },
        nivel: {
            type: DataTypes.INTEGER
        },
        puntos: {
            type: DataTypes.STRING
        },
        comisiones: {
            type: DataTypes.STRING
        },
        dinero: {
            type: DataTypes.STRING
        },
        // Correo eléctronico
        email: {
            type: DataTypes.STRING
        },
        // Telefono móvil
        movil: {
            type: DataTypes.STRING
        },
        password: {
            type: DataTypes.STRING,
        }, 
        // Dirección del vendedor
        direccion: {
            type: DataTypes.STRING
        }, 
        // Estado... Activo o innactivo
        state: {
            type: DataTypes.STRING
        }

    })
}