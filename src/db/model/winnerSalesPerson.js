const { DataTypes, INTEGER } = require('sequelize');

module.exports = sequelize => {
    sequelize.define('gift', { 
        // Premio máximo vendedor
        primero: {
            type: DataTypes.STRING
        },
        // Premio segundo máximo vendedor
        segundo: {
            type: DataTypes.STRING
        },
        // Premio, tercer lugar
        tercero: {
            type: DataTypes.STRING
        },
        // Premio al vendedor que venda el número ganador
        nroGanador: {
            type: DataTypes.INTEGER
        },

    })
}