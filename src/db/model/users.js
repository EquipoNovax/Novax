const { DataTypes } = require('sequelize');

module.exports = sequelize => {
    sequelize.define('user', { 
        // Nombre
        nick: {
            type: DataTypes.STRING
        },
        // Imagen de perfil
        email:{
            type: DataTypes.STRING
        },
        // Correo eléctronico
        password: {
            type: DataTypes.STRING
        },
        range: {
            type: DataTypes.STRING
        },
        // Estado... Activo o innactivo
        state: {
            type: DataTypes.STRING
        }

    })
}