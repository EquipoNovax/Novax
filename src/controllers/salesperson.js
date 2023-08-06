// Llamamos los modelos necesarios.
const { salesperson, lottery, salesperson_active, imageToLottery, gift, money} = require('../db/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const authConfig = require('../config/auth');


// Funciones que necesito

module.exports = {  
    
    // Llamamos los sorteos que esten relacionados con el usuario. 
    async getAllGames(req, res) {
        try { 
            // Obtenemos los datos por params.
            const { salespersonId } = req.params;
            // Validamos los parámetros.
            if(!salespersonId) return res.status(501).json({msg: 'Los parámetros no son validos.'});

            const vendedor = await salesperson.findByPk(salespersonId, {
                include: [
                    {
                        model: lottery,
                        through: { attributes: [] },  
                    }
                ],
                attributes: ['id', 'name', 'lastName', 'imgProfile', 'movil', 'nivel', 'puntos', 'comisiones', 'dinero', 'state']
            }).catch(err => null);

            
            // Si no existe registro...
            if(!vendedor) return res.status(404).json({msg: 'No hemoes encontrado este vendedor.'});
            // Caso contrario...
            const searchVendedorGames = await salesperson.findByPk(salespersonId,{
                include: [
                    {
                        model: lottery,
                        through: { attributes: [] },
                        required: false,
                        where: {
                            state:'active'
                        },
                        attributes: ['id', 'name', 'img', 'description', 'nivel', 'price','comision', 'playWith', 'start', 'finish', 'winner','state'],
                        include: [{
                            model: imageToLottery,
                            as: 'imagenes',
                            attributes: ['img', 'state'],
                            required:false

                        }, {
                            model:gift,
                            required: false
                        }],
                        
                    },
                    {
                        model: money,
                        as: 'entregas',
                        attributes: { exclude: ['createdAt', 'updatedAt']}
                    }
                ],
                attributes: ['id', 'name', 'lastName', 'imgProfile', 'movil', 'nivel', 'puntos', 'comisiones', 'dinero', 'state']
            }).catch(err => {
                console.log(err);
                return null;
            });

            if(!searchVendedorGames) return res.status(404).json(vendedor);

            res.status(200).json(searchVendedorGames);

        }catch(err){
            console.log(err);
            res.status(500).json({msg: 'Ha ocurrido un error en la principal.'});
        }
    },
    async suscribeToGame(req, res){
        try{
            // Obtenemos los datos por body
            const  { salespersonId, lotteryId} = req.body;
            // Validamos que los datos sean validos.
            if(!salespersonId || !lotteryId) return res.status(501).json({msg: 'Los parámetro no son validos.'});

            // Buscamos la cuenta del vendedor
            const searchVendedor = await salesperson.findByPk(salespersonId).catch(err => null);
            // Validamos que exista el vendedor. Si no existe, enviamos una respuesta con estado 404.
            if(!searchVendedor) return res.status(404).json({msg: 'No hemos encontrado este vendedor'});

            // Validemos que exista el sorteo
            const searchSorteo = await lottery.findOne({
                where: {
                    id:lotteryId,
                    state: 'active'
                } 
            }).catch(err => null);
            if(!searchSorteo) return res.status(404).json({msg: 'Lo sentimos , pero no hemos encontrado este sorteo.'});
            // Caso contrario...

            if(searchVendedor.nivel >= searchSorteo.nivel){
                    const add = await salesperson_active.create({
                        salespersonId: salespersonId,
                        lotteryId: lotteryId  
                    }).catch(err => {
                        console.log(err);
                        return null
                    });
        
                    if(!add) return res.status(502).json({msg: 'No hemos podido inscribir este sorteo'});
                    res.status(201).json({msg: 'Suscripto con exito.'});
            }
        }catch(err){
            console.log(err);
            res.status(500).json({msg: 'ha ocurrido un error en la principal'});
        }
    },
    // SIGN IN
    async signInApp(req, res){
        try{
            const { phone, password} = req.body;

            const usuario = await salesperson.findOne({
                where: {
                    movil:phone
                }
            }).catch(err => null);
            if(!usuario) {
                return res.status(404).json({msg: 'Usuario no encontrado'});
            }

            if(bcrypt.compareSync(password, usuario.password)){
                let token = jwt.sign({user: usuario}, authConfig.secret, {
                    expiresIn: authConfig.expires
                });
                res.status(200).header('auth_token').json({
                    error: null,
                    data: token
                })
            }else{
                // No autoriza el acceso.
                console.log('error aca');
                res.status(401).json({msg: 'La contraseña no es valida.'});
            }
        
        
        }catch(err){
            console.log(err);
            res.status(501).json(err);
        }
    },

    // Validamos que el número este dispoinble.

    async validatePhone(req, res){
        try {
            const { phone} = req.params;
            if(!phone) return res.status(501).json({msg:'Parámetro no encontrado.'});

            const searchPhone = await salesperson.findOne({
                where: {
                    movil:phone
                }
            }).catch(err => null);
            if(!searchPhone) {
                // No hay registros, el teléfono esta disponible!
                res.status(200).json({msg:'¡Disponible!'})
            }else{
                res.status(202).json({msg: 'Ya existe un registro con este número.'});
            }
        }catch(err){
            console.log(err);
            res.status(500).json({msg: 'Ha ocurrido un error en la principal.'});
        }
    },
    // Cambiamos la contraseña del usuario
    async changePassword(req, res){
        try {
            // Recibimos los datos por body.
            const { salespersonId, password } = req.body;
            // Validamos que los datos hayan sido ingresados correctamente.
            if(!salespersonId || !password) return res.status(501).json({msg: 'Los parámetros no son validos.'});

            // Caso contrario...
            // Buscamos que la cuenta realmente exista.
            const searchSales = await salesperson.findByPk(salespersonId).catch(err => null);
            // Validamos que exista realmente un registro.
            if(!searchSales) return res.status(404).json({msg: 'No hemos encontrado esta cuenta'});

            // Caso contrario...
            // Recogemos la contraseña y la encriptamos.
            let crypt = bcrypt.hashSync(password, Number.parseInt(authConfig.rounds));

            const newPassword = salesperson.update({
                password:crypt
            }, {
                where: {
                    id: salespersonId
                }
            }).catch(err => null);
            // Primeramente intentamos revisar si se cambio la contraseña correctamente
            if(!newPassword) return res.status(401).json({msg: 'Ha ocurrido un error al intentar cambiar la contraseña.'});
            // Caso contrario
            res.status(200).json({msg: 'Contraseña actualizada con exito.'});
        }catch(err){
            console.log(err);
            res.status(500).json({msg: 'Ha ocurrido un error en la principal'});
        }
    },
    // Creamos la función para crear usuario
    async newUser(req, res){
        try {
            // Recibimos los datos por body.
            const { type, name, lastName, phone, password, img} = req.body;
            // Validamos que los datos entre efectivamente
            if(!name || !lastName || !phone || !password || !img) return res.status(501).json({msg:'Los parámetros no son validos.'});
            // Creamos las contantes que nos generarán el tiempo
            // Buscamos que no exista otro vendedor con ese número de teléfono.
            const searchSalesPerson = await salesperson.findOne({
                where: {
                    movil: phone
                }
            }).catch(err => null);
            // Validamos la existencia...
            // Si no hay registros, avanzamos...

            let pass = bcrypt.hashSync(password, Number.parseInt(authConfig.rounds));
            if(!searchSalesPerson){
                // Comenzamos con la creación del salesPerson
                const createSalesPerson = await salesperson.create({
                    type: type ? type : 'persona',
                    name,
                    lastName,
                    imgProfile: img,
                    email: null,
                    nivel: 1,
                    puntos: 0, 
                    comisiones: 0,
                    dinero:0,
                    movil: phone,
                    password: pass,
                    direccion: null,
                    state: 'active'
                })
                .then(user => {
                    let token = jwt.sign({user: user}, authConfig.secret, {
                        expiresIn: authConfig.expires
                    });
                    const response = {
                        user:user,
                        token
                    }
                    return response
                })
                .catch(err => {
                    console.log(err);
                    return null
                });
 
                if(!createSalesPerson) return res.status(502).json({msg: 'Ha ocurrido un error al registrar vendedor'});
                return res.status(200).json({msg: "Bien hecho",data: createSalesPerson});
            // Caso contrario...
            }else{
                // Enviamos una respuesta con estado 200.
                res.status(200).json({msg: 'Ya hay un registro con este número teléfonico.'});
            }
        }catch(err){
            console.log(err);
            res.status(500).json({msg: 'Ha ocurrido un error en la principal.'});
        }
    },
    // Actualizar fotografía de perfil.
    async updateProfile(req, res){
        try{
            // Recibimos los datos por body
            const { url, salespersonId } = req.body;
            // Validamos que los datos ingresen correctamente
            if(!url || !salespersonId) return res.status(501).json({msg: 'Los parámetros no son validos.'});
            // Buscamos la existencia de un vendedor con ese Id
            const searchUser = await salesperson.findByPk(salespersonId).catch(err => null);
            // Si no existe, enviamos una respuesta con estado 404. ¡No encontrado!
            res.status(404).json({msg: 'No hemos encontrado este business'});
            // Caso contrario...
            const updateImg = await salesperson.update({
                imgProfile: url
            }, {
                where: {
                    id:salespersonId
                }
            })
            .then(res => true).catch(err => null);
            // Si no hay respuesta, enviamos una respuesta con estado 502. ¡Error!
            if(!updateImg) return res.status(502).json({msg: 'No hemos podido actualizar foto de perfil.'});
            // Caso contrario.
            res.status(200).json({msg: '¡Foto actulizada con exito.'});
            

        }catch(err){
            console.log(err);
            res.status(500).json({msg: 'Ha ocurrido un error en la principal'});
        }
    },
    // Actualizar todo.
    async updateAll(req, res){
        try{
            // Recibimos los datos por body
            const { email, direccion, salespersonId } = req.body;
            // Validamos que los datos ingresen correctamente
            if(!salespersonId) return res.status(501).json({msg: 'Los parámetros no son validos.'});
            // Buscamos la existencia de un vendedor con ese Id
            const searchUser = await salesperson.findByPk(salespersonId).catch(err => null);
            // Si no existe, enviamos una respuesta con estado 404. ¡No encontrado!
            res.status(404).json({msg: 'No hemos encontrado este vendedor'});
            // Caso contrario...
            const updateInfo = await salesperson.update({
                email: email ? email : searchUser.email,
                direccion: direccion ? direccion : searchUser.direccion

            }, {
                where: {
                    id:salespersonId
                }
            })
            .then(res => true).catch(err => null);
            // Si no hay respuesta, enviamos una respuesta con estado 502. ¡Error!
            if(!updateImg) return res.status(502).json({msg: 'No hemos podido actualizar foto de perfil.'});
            // Caso contrario.
            res.status(200).json({msg: '¡Foto actulizada con exito.'});

        }catch(err){
            console.log(err);
            res.status(500).json({msg: 'Ha ocurrido un error en la principal'});
        }
    }
} 