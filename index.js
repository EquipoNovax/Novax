const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const {db, Op } = require('./src/db/db');
const { signUp, allTeam } = require('./src/controllers/user');
const { createLoterry, updateStateLottery, addImages, getGames, getGameById, createGift, getHistoryGame, getLotteryWinner, Sorteo } = require('./src/controllers/lottery');
const { validatePhone, newUser, signInApp, getAllGames, changePassword, suscribeToGame } = require('./src/controllers/salesperson');
const { getAvatars, codePosts, getAvatar } = require('./src/controllers/avatars');


const { salesperson } = require('./src/db/db');


const app = express();
app.use(express.json());

app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // update to match the domain you will make the request from
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  next();
});
app.use(cookieParser()); 

const isAuthenticated = require('./src/controllers/autentication');
const { newTicket, addTicket, getTicket } = require('./src/controllers/ticket');
const { registerLessMoney, getAllMoneyByUser, defineNewTime } = require('./src/controllers/money');


app.get('/', (req, res) => {
    res.send('Welcomen to the server');
}); 

//  DATOS GENERALES DESDE EL PANEL ADMIN.

//  User - Equipo de administración y producción.







// Usuarios - vendedores.
app.get('/app/signIn/', isAuthenticated, async (req, res) => {
    try {
        console.log(req.user);
        res.status(200).json({user: req.user});
    }catch(err){
      console.log(err);
      res.status(500).json({msg: 'error en la principal'});
    }
})

app.post('/user/post/signIn/novax', signInApp); // Login.
app.post('/user/post/novaX', signUp); // Registro el usuario
app.get('/user/get/all/novaX', allTeam); // Muestro todos los usuarios.
app.put('/user/put/password', changePassword); // Cambiando la contraseña. ¡ REVISAR !



 
// Crear Sorteo.
app.post('/lottery/post/new/', createLoterry);
app.put('/loterry/put/state', updateStateLottery);
app.post('/app/lottery/post/img', addImages);
app.post('/app/lottery/post/gift', createGift);


// LOTTERY APP
// AVATARS
app.get('/app/avatars/read/profile/:img', getAvatar);
app.get('/app/avatars/', getAvatars); 
app.post('/app/avatars/post', codePosts); 
app.get('/app/validate/phone/:phone', validatePhone);
app.post('/app/post/newSalesperson', newUser);

// Usuario y SORTEOS
app.get('/app/game/:gameId/:salesId', getGameById); // Obtenemos la información de un juego en especifico.
app.get('/app/games/:salespersonId', getGames); // Buscamos  todos los juegos que esten disponible en ese momento.
app.get('/app/game/sorteo/:gameId', Sorteo); // Obtenemos el sorteo desde la id
app.get('/app/salesperson/:salespersonId', getAllGames); // Buscamos  todos los juegos que el vendedor esta vendiendo.
app.get('/app/games/salesperson/history/:id', getHistoryGame);  // Buscamos el historial de juegos de una cuenta.
app.get('/app/games/winner/:salespersonId/:lotteryId', getLotteryWinner);

// Suscribir al sorteo
app.post('/app/game/suscribe/', suscribeToGame);

// TIQUETES Y NUMEROS AGREGAR
app.post('/app/lottery/ticket/new', addTicket);
app.get('/app/lottery/ticket/get/:ticketId', getTicket)


// Dinero y entrega del dinero a NOVAX
app.post('/app/money/post/salesperson/', registerLessMoney);
app.get('/app/money/get/:salespersonId', getAllMoneyByUser);
// Definimos una fecha para recoger el dinero.
app.post('/app/money/receive/post/date', defineNewTime);
const server = app.listen(3000, () => {
    db.sync();
    console.log(`Server running on port ${3000}`);
})