const { Sequelize, Op} = require('sequelize');

// Importe.
const modelUser = require('./model/users'); // Usuarios - Equipo de trabajo NovaX
const modelAvatar = require('./model/avatars'); // Avatars
const modelSalesPerson = require('./model/salesperson'); // Vendedor
const modelLottery = require('./model/lottery'); // Lotería
const modelSalesPerson_Lottery = require('./model/salesperson_sorteo'); // Modelo para conectar vendedor - sorteo
const modelImageToLottery = require('./model/imgLottery'); // Model Imagenes para la loteria.
const modelGift = require('./model/winnerSalesPerson'); // Premios para vendedores.
const modelTicket = require('./model/ticket'); // Tiquete.
const modelNumber = require('./model/numberSell'); // Números registrados.
const modelReceive = require('./model/entregas');   // Próxima recogida del dinero
// Modelos sobre las finanzas.
const modelMoney = require('./model/money');    // Modelo de dinero
const modelComission = require('./model/comisiones');   // Modelo de comisiones
// Configuración de la conexión
const sequelize = new Sequelize('postgres:postgres:123@localhost:5432/novax', {
    logging: false,
    native: false,
});

// Modelos
modelUser(sequelize);           // Usuarios
modelAvatar(sequelize);         // Avatar
modelSalesPerson(sequelize);    // Vendedores
modelLottery(sequelize);        // Lottery
modelImageToLottery(sequelize); // Imagenes para cada lottery.
modelSalesPerson_Lottery(sequelize); // Conexion entre vendedores y sorteos.
modelGift(sequelize);           // Premios para vendedores.
modelTicket(sequelize);         // Tiquete
modelNumber(sequelize);         // Módelo de números jugando.
modelMoney(sequelize);          // Módelos para registrar las entregas de dinero a Novax por parte de los vendedores.
modelComission(sequelize);      // Comissions retiradas por el usuario.
modelReceive(sequelize);        // Módelo de próxima recogida de dinero.

const { salesperson, lottery, imageToLottery, gift, salesperson_active, ticket , number, money, commission, receive} = sequelize.models;

// Relación sorteo con vendedor
salesperson.belongsToMany(lottery, { through: "salesperson_active" }); // Esto crea una nueva tabla en la base de datos.
lottery.belongsToMany(salesperson, { through: "salesperson_active" }); 


// Lottery conexión con sus imagenes
lottery.hasMany(imageToLottery, {as: "imagenes"}); 
imageToLottery.belongsTo(lottery, {as: "lottery"});

// Vendedor y el tiquete.
salesperson.hasMany(ticket, {as: "vendidos" });
ticket.belongsTo(salesperson, {as: "salesperson" });

// Vendedor y el tiquete.
lottery.hasMany(ticket, {as: "vendidos" });
ticket.belongsTo(lottery, {as: "lottery" });
 

// Sorteo y números 
lottery.hasMany(number, {as: "numeros"});
number.belongsTo(lottery, {as: "lottery"});


// Tiquete y números 
ticket.hasMany(number, {as: "numeros"});
number.belongsTo(ticket, {as: "ticket"});

// vendedor y números 
salesperson.hasMany(number, {as: "numeros"});
number.belongsTo(salesperson, {as: "salesperson"});


// Relación uno a uno || Premio  Vendedores - Sorteo
lottery.hasOne(gift);
gift.belongsTo(lottery); 


// Vendedor y entregas de dinero
salesperson.hasMany(money, { as: "entregas"});
money.belongsTo(salesperson, { as: "salesperson"});

salesperson.hasMany(commission, { as: "retiros"});
commission.belongsTo(salesperson, { as: "salesperson"});


// Exportamos.
module.exports = {
    ...sequelize.models,
    db: sequelize,
    Op
}