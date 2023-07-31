const { DataTypes, INTEGER } = require('sequelize');

module.exports = sequelize => {
    sequelize.define('imageToLottery', { 
        // IMAGES PRINCIPAL
        img: {
            type: DataTypes.STRING
        },
        // Estado... Activo o innactivo
        state: {
            type: DataTypes.STRING
        }

    })
}