// Llamamos los modelos necesarios.
const { salesperson, lottery, imageToLottery, gift, number, ticket } = require('../db/db');
// Funciones que necesito

module.exports = {
    // Obtener el sorteo dessde la web
    async Sorteo(req, res){
        try {
            const { gameId }  = req.params;
            // Validamos que los parámetros sean validos.
            if(!gameId) return res.status(501).json({msg: 'Los parámetros no son validos.'});
            // Continuamos...
            
            // Buscamos el juego
            const searchGame = await lottery.findOne({
                where: {
                    id:gameId,
                    state:'active'
                },
                include: [ {
                    model: imageToLottery,
                    as: 'imagenes'
                }],
                attributes: ['id', 'name', 'img', 'description', 'nivel', 'price','comision', 'playWith', 'start', 'finish', 'state']
            }).catch(err => null);

            if(!searchGame) return res.status(404).json({msg: 'No hemos encontrado este juego.'});
            
            // caso contrario...
            res.status(200).json({game: searchGame})
        }catch(err){
            console.log(err);
            res.status(500).json({msg: 'Ha ocurrido un error'});
        }
    },
    // See Game for gamer 
    async getLotteryWinner(req, res){
        try{
            // recibimos los datos por parámetros
            const { salespersonId, lotteryId } = req.params;
            
            // Validamos que los parámetros sean correctos.
            if(!salespersonId || !lotteryId) return res.status(501).json({msg: 'Los parámetros no son validos.'});

            // Caso contrario...
            // Buscamos el usuario
            const searchUser = await salesperson.findByPk(salespersonId, {
                include: [{
                    model: lottery,
                    through: { attributes: [] },
                    where: { id: lotteryId},
                    attributes: { exclude: ['createdAt', 'updatedAt']},
                    include: [{
                        model: imageToLottery,
                        as: 'imagenes',
                        attributes: {exclude: ['createdAt', 'updatedAt', 'lotteryId']}

                    }, {
                        model: ticket,
                        as: 'vendidos',
                        attributes: {exclude: ['createdAt', 'updatedAt']}
                    }, {
                        model:number,
                        as: 'numeros',
                        attributes: ['numero', 'salespersonId'],
                        where: {
                            salespersonId: salespersonId
                        },
                        require: false
                    }],
                order: [{model: ticket, as: 'vendidos'}, 'createdAt', 'DESC'],
                }],
                attributes: {exclude: ['password', 'direccion', 'createdAt', 'updatedAt', 'img', 'email']}    
            }).catch(err => {
                console.log(err);
                return null
            });
            if(!searchUser) return res.status(404).json({msg: 'No hemos podido mostrar este sorteo'});
            res.status(200).json(searchUser);
        }catch(err){
            console.log(err);
            res.status(500).json({msg: 'Ha ocurrido un error'});
        }
    },
    // Obtenemos una función para mostrar todos los juegos del usuario.
    async getHistoryGame(req, res){
        try{
            // Recibimos los datos por parámetros.
            const { id } = req.params;
            // Validamos que los parámetros sean validos.
            if(!id) return res.status(501).json({msg: 'Los parámetros no son validos.'})
            // Buscamos el vendedor
            const Ssalesperson = await salesperson.findByPk(id,{
                include: [{
                    model: lottery,
                    through: { attributes: [] }, 
                    attributes: ['id', 'name', 'img', 'nivel', 'price','finish', 'winner', 'state'],
                    include: {
                        model: number,
                        as: 'numeros',
                        where: {
                            salespersonId: id
                        },
                        attributes: { exclude: ['createdAt', 'updatedAt', 'lotteryId', 'salespersonId'] },
                    }
                }],
                attributes: {exclude: ['createdAt', 'updatedAt', 'password', 'email', 'direccion']}
            }).catch(err => {
                console.log(err);
                return null;
            });
            
            if(!Ssalesperson) return res.status(404).json({msg: 'NO hemos encontrado registros'});
            res.status(200).json(Ssalesperson);
        }catch(err){
            console.log(err);
            res.status(500).json({msg: 'Ha ocurrido un error en la principal'});
        }
    },
    // Llamamos un juego por id
    async getGameById(req, res){
        try {
            const { gameId, salesId }  = req.params;
            // Validamos que los parámetros sean validos.
            if(!gameId || !salesId) return res.status(501).json({msg: 'Los parámetros no son validos.'});
            // Continuamos...

            const searchSalesPerson = await salesperson.findByPk(salesId).catch(err => null);
            if(!searchSalesPerson) return res.status(404).json({msg: 'No hemos encontrado este vendedor.'});
            // Continuamos...
            
            // Buscamos el juego
            const searchGame = await lottery.findOne({
                where: {
                    id:gameId,
                    state:'active'
                },
                include: [{
                    model: gift,
                    attributes: ['primero','segundo', 'tercero', 'nroGanador']
                }, {
                    model: imageToLottery,
                    as: 'imagenes'
                }],
                attributes: ['id', 'name', 'img', 'description', 'nivel', 'price','comision', 'playWith', 'start', 'finish', 'state']
            }).catch(err => null);

            if(!searchGame) return res.status(404).json({msg: 'No hemos encontrado este juego.'});
            
            // caso contrario...
            res.status(200).json({game: searchGame})
        }catch(err){
            console.log(err);
            res.status(500).json({msg: 'Ha ocurrido un error'});
        }
    },
    // Llamamos todos los sorteos que esten disponibles en el momemento. Para la sección de ver los sorteos.
    async getGames(req, res){
        try {
            const { salespersonId } = req.params;

            const searchUser = await salesperson.findOne({
                where:{
                    id:salespersonId,
                    state: 'active'
                },
                
            }).catch(err => null);
            
            if(!searchUser) {
                console.log('este es el error');
                return res.status(404).json({msg: 'No hemos encontrado este usuario.'});
            }

            // caso contrario continuamos con la busqueda de los registros.
            // Buscamos los resultados.
            const searchGames = await lottery.findAll({
                where: {
                    state: 'active',
                    winner: null
                },
                include: [{
                    model: gift,
                    attributes: ['primero','segundo', 'tercero', 'nroGanador']
                }],
                attributes: ['id', 'name', 'img', 'description', 'nivel', 'price','comision', 'playWith', 'start', 'finish', 'state']
            }).catch(err => null);

            // Validamos que existan registros.
            if(!searchGames || !searchGames.length) return res.status(404).json({msg: 'No hay sorteos disponibles'});
            // Caso contrario...
            res.status(200).json({games: searchGames});
        }catch(err){
            console.log(err);
            res.status(500).json({msg: 'Ha ocurrido un error en la principal'});
        }
    },
    // Definimos el premio para los vendedores
    async createGift(req, res){
        try{
            // Recibimos los datos por body.
            const { primer, segundo, tercero, winner, lotteryId} = req.body;
            // Validamos que los datos sean correctos.
            if(!primer || !segundo || !tercero || !winner || !lotteryId) return res.status(501).json({msg: 'Los parámetros no son validos'});
            // caso contrario.

            // Procedemos a buscar que la lotería realmente exista.
            const searchLottery = await lottery.findByPk(lotteryId).catch(err => null);
            // Revisamos que exista el registro.
            if(!searchLottery) return res.status(404).json({msg: 'No hemos encontrado este juego.'});
            // Caso contrario...

            const addWinner = await gift.create({
                primero:primer,
                segundo:segundo,
                tercero: tercero,
                nroGanador: winner,
                lotteryId
            }).catch(err => null);

            if(!addWinner) return res.status(502).json({msg: 'Ha ocurrido un error al momento de registrar.'})

            res.status(201).json({msg: 'Premios registrados con exito.'});

        }catch(err){
            console.log(err); // Mostramos el error por la consola.
            res.status(500).json({msg: 'Ha ocurrido un error en la principal'}); // Enviamos el error con una respuesta de estado 500.
        }
    },
    // Creamos el sorteo
    async createLoterry(req, res) {
        try {
            // Recogemos los datos por body.
            const { name, img, description, nivel, price, comision, start, finish, howMany, info } = req.body;
            // Revisamos que sean validos.
            if(!name || !description || !price || !start || !finish || !howMany || !info ) return res.status(501).json({msg: 'Los parámetros no son validos.'});
            
            // Creamos el sorteo.
            const create = await lottery.create({
                name,
                img,
                description,
                nivel,
                price,
                comision: comision ? comision : null,
                start,
                finish,
                howMany,
                info,
                winner: null,
                state: 'active' 
            }).catch(err => {
                console.log(err);
                return null
            });
            // Validamos el exito del registro
            if(!create) return res.status(502).json({msg: 'No hemos podido crear este sorteo.'});
            // caso contrario...
            res.status(201).json(create);
            
        }catch(err){
            console.log(err);
            res.status(500).json({msg: 'Ha ocurrido un error en la principal.'});
        }
    },
    // Agregar imagenes a cada lottery
    async addImages(req, res){
        try {
            // Recogemos los datos por body
            const { img, lotteryId} = req.body;

            // Validamos que los parámetros entren.
            if(!img || !lotteryId) return res.status(501).json({msg: 'Los parámetros no son validos.'});

            // Caso contrario...
            // Validamos que exista una lottery con ese identificador
            const searchLot = await lottery.findByPk(lotteryId).catch(err => null);

            if(!searchLot) return res.status(404).json({msg: 'Sorteo no encontrado.'});

            // Caso contrario.
            const addImg = await imageToLottery.create({
                img: img,
                lotteryId,
                state: 'active'
            }).catch(err => null);
            // Si no hay registro, enviamos error.
            if(!addImg) return res.status(502).json({msg: 'No hemos podido agregar esta imagen.'});
            //  Caso contrario.
            res.status(200).json({img: addImg});
        }catch(err){
            console.log(err);
            res.status(500).json({msg: 'Ha ocurrido un error en la principal.'});
        }
    },
    async updateStateLottery(req, res){
        try {
            const { lotteryId, state } = req.body;
            if(!lotteryId || !state) return res.status(501).json({msg: 'Los parámetros no son validos.'});

            const updateLottery = await lottery.update({
                state: state
            }, {
                where: {
                    id: lotteryId
                }
            })
            .then(res => true)
            .catch(err => null);
            if(!updateLottery) return res.status(502).json({msg:'No hemos podido actualizar.'});
            // Caso contrario...
            // Enviamos respuesta con estado 200. ¡Exito!
            res.status(200).json({msg: '¡Cambiado con exito!'});

        }catch(err){ 
            console.log(err);
            res.status(500).json({msg: 'Ha ocurrido un error en la principal.'}); 
        }
    }
} 