const { DataTypes } = require('sequelize');

module.exports = sequelize => {
    sequelize.define('salesperson_active', { 
        // Persona o negocio
        salespersonId: {
            type: DataTypes.INTEGER
        },
        // Lottery ID
        lotteryId: {
            type: DataTypes.INTEGER
        },
    
    })
}