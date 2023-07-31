// Llamamos los modelos necesarios.
const { salesperson, lottery, salesperson_active, imageToLottery, gift, money, commission, receive} = require('../db/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const authConfig = require('../config/auth');


// Funciones que necesito

module.exports = {  
    // Definir nueva fecha de recolección del dinero
    async defineNewTime(req,res){
        try {
            const { desde, hasta } = req.body;
            if(!desde || !hasta)  return res.status(501).json({msg: 'Los parámetros no son validos.'});

            const searchTime = await receive.findOne({where: { state: 'active'}}).catch(err => null);
        
            if(!searchTime){
                const newDate = await receive.create({
                    desde,
                    hasta,
                    state:'active'
                }).catch(err => null);
                if(!newDate) return res.status(401).json({msg: 'No hemos podido registrar esta nueva fecha de recolección.'});
                // Caso contrario...
                res.status(201).json({msg: 'Fecha asignada con exito.'});
            }else{
                // Definimos una variable para modificiar la fecha ya existente.
                const updateTime = await receive.update({
                    state: 'finish'
                }, {where: {state: 'active'}}).catch(res => null);
                if(!updateTime) return res.status(401).json({msg: 'No hemos podido registrar esta nueva fecha de recolección'});
                // Caso contrario, continuamos...
                const newDate = await receive.create({
                    desde,
                    hasta,
                    state:'active'
                }).catch(err => null);
                if(!newDate) return res.status(401).json({msg: 'No hemos podido registrar esta nueva fecha de recolección.'});
                // Caso contrario...
                res.status(201).json({msg: 'Fecha asignada con exito.'});
            }
        }catch(err){
            console.log(err);
            res.status(500).json({msg: 'Ha ocurrido un error en la principal.'});
        }
    },
    // Obtener las entregas del usuario
    async getAllMoneyByUser(req, res){
        try{
            // Recibimos los datos por parámetros
            const { salespersonId } = req.params;
            // Validamos que entren correctamente los parámetros
            if(!salespersonId) return res.status(501).json({msg: 'Los parámetros no son validos.'});
            // Caso contrario, continuamos...

            // Buscamos que exista un usuario con esos datos.
            const searchUser = await salesperson.findByPk(salespersonId, {
                include: [{
                    model: money,
                    as: 'entregas',
                    attributes: { exclude: ['createdAt', 'updatedAt', 'salespersonId']},
                    required: false
                }, {
                    model: commission,
                    as: 'retiros',
                    attributes: { exclude: ['createdAt', 'updatedAt', 'salespersonId']},
                    required: false
                }],
                attributes: ['id', 'name', 'dinero', 'comisiones', 'nivel', 'puntos']
            }).catch(err => {
                console.log(err);
                return null
            });

            // Si no encuentra registro, enviamos una respuesta con código 404. ¡Usuario no encontrado!
            if(!searchUser) return res.status(404).json({msg: 'No hemos encontrado este usuario'});

            const searchReceive = await receive.findOne({
                where: {
                    state: 'active'
                },
                attributes: { exclude: ['createdAt', 'updatedAt']}
            }).catch(err => null);
            //  Caso contrario, continuamos...
            // Enviamos una respuesta con código 200. ¡Exito!
            res.status(200).json({res: searchUser, receive: searchReceive});

        }catch(err){
            console.log(err);
            res.status(500).json({msg: 'Ha ocurrido un error en la principal'});
        }
    },
    // Función para registrar la entrega de dinero.
    async registerLessMoney(req, res){
        try{
            // Recibimos los datos por body.
            const { valor, dia, mes, year, spersonId, metodo } = req.body;
            // const { spersonId } = req.params;
            // Validamos que los datos entren correctamente.
            if(!dia || !mes || !year || !spersonId || !metodo) return res.status(501).json({msg: 'Los parámetros no son validos.'});
            // Procedemos a buscar el vendedor
            const searchSalesperson = await salesperson.findByPk(spersonId, {
                attributes: ['id', 'name', 'puntos', 'comisiones', 'dinero'],

                include: [{
                    model: money,
                    as: 'entregas',
                    where: {
                        salespersonId: spersonId
                    },
                    required:false
                }]
            }).catch(err => null);
            // Si no existe, enviamos una respuesta con código 404. ¡Usuario no encontrado!
            if(!searchSalesperson) return res.status(404).json({msg: 'No hemos encontrado este usuario.'});
            // Caso contrario, Avanzamos... 

            const addEntrega = await money.create({
                valor: valor ? valor : searchSalesperson.dinero,
                dia: dia,
                mes: mes,
                year: year,
                metodo: metodo,
                nro: searchSalesperson.entregas.length + 1,
                salespersonId: spersonId
            }).catch(err =>{
                console.log(err);
                return null;
            });
            // Si no crea la cuenta, enviamos error 401. ¡Eror!
            if(!addEntrega) return res.status(401).json({msg: 'No hemos podido crear cuenta.'});
            
            // Caso contrario, actualizamos el dinero del usuario.
            const updateUser = await salesperson.update({
                dinero: valor ? Number(searchSalesperson.dinero) - Number(valor) : 0
            }, {
                where: {
                    id: spersonId
                }
            }).catch(err => null);

            if(!updateUser) return res.status(400).json({msg: 'No hemos podido actualizar la información de este usuario.'});

            res.status(201).json(addEntrega);

        }catch(err){
            console.log(err);
            res.status(500).json({msg: 'Ha ocurrido un error en la principal'});
        }
    } 
    
} 