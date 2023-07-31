const { DataTypes, INTEGER } = require('sequelize');

module.exports = sequelize => {
    sequelize.define('receive', { 
        // IMAGES PRINCIPAL
        desde: {
            type: DataTypes.STRING
        },
        // Estado... Activo o innactivo
        hasta: {
            type: DataTypes.STRING
        },
        state: {
            type: DataTypes.STRING
        }

    })
}