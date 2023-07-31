const { DataTypes } = require('sequelize');

module.exports = sequelize => {
    sequelize.define('avatar', { 
        // Persona o negocio
        // Nombre
        name: {
            type: DataTypes.STRING
        },
        // Segundo nombre
        url: {
            type: DataTypes.STRING
        },
        // Imagen de perfil
        code:{
            type: DataTypes.STRING
        },
        // Estado... Activo o innactivo
        state: {
            type: DataTypes.STRING
        }

    })
}