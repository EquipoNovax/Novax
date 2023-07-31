const { DataTypes, INTEGER } = require('sequelize');

module.exports = sequelize => {
    sequelize.define('lottery', { 
        // Nombre
        name: {
            type: DataTypes.STRING
        },
        // IMAGES PRINCIPAL
        img: {
            type: DataTypes.STRING
        },
        // Segundo nombre
        description: {
            type: DataTypes.STRING
        },
        nivel: {
            type: DataTypes.INTEGER
        },
        // Price 
        price: {
            type: DataTypes.STRING
        },
        // Comisión
        comision: {
            type: DataTypes.STRING,
            defaultValue:'700'
        },
        playWith: {
            type: DataTypes.STRING,
            defaultValue: 'Chontico noche'
        },
        // Imagen de perfil
        start:{
            type: DataTypes.STRING
        },
        // Correo eléctronico
        finish: {
            type: DataTypes.STRING
        },
        // Telefono móvil
        howMany: {
            type: DataTypes.STRING
        },
        info: {
            type: DataTypes.STRING,
        },
        // Dirección del vendedor
        winner: {
            type: DataTypes.STRING
        },
        // Estado... Activo o innactivo
        state: {
            type: DataTypes.STRING
        }

    })
}