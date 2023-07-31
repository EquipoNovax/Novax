// MODELO PARA LLEVAR  UN REGISTRO DE TODO EL DINERO QUE CADA CUENTA HA ENTREGADO A LE EMPRESA.

const { DataTypes, INTEGER } = require('sequelize');

module.exports = sequelize => {
    sequelize.define('money', { 
        // Valor de la entrega,
        valor: {
            type: DataTypes.STRING
        },
        // Día de la entrega
        dia: {
            type: DataTypes.STRING
        },
        // Mes de la entrega
        mes: {
            type: DataTypes.STRING
        },
        // Año de la entrega
        year: {
            type: DataTypes.STRING
        },
        // Metódo bajo el cual se entrego el dinero.
        metodo: {
            type: DataTypes.STRING
        },
        // Entrega nro:
        nro: {
            type: DataTypes.STRING
        }
    

    })
}