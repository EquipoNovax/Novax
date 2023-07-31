const { DataTypes, INTEGER } = require('sequelize');

module.exports = sequelize => {
    sequelize.define('ticket', { 
        // Nombre
        nameUser: {
            type: DataTypes.STRING
        },
        phoneUser:{
            type: DataTypes.STRING
        },
        dia: {
            type: DataTypes.STRING
        },
        mes: {
            type: DataTypes.STRING
        },
        year: {
            type: DataTypes.STRING
        },
        valor: {
            type: DataTypes.STRING
        },
        nros: {
            type: DataTypes.STRING
        },
        reference: {
            type: DataTypes.STRING
        }

        // IMAGES PRINCIPAL
    

    })
}