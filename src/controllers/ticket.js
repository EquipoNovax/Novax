// Llamamos los modelos necesarios.
const { salesperson, lottery, imageToLottery, gift, ticket, number } = require('../db/db');
// Funciones que necesito

module.exports = {
    // Obtenemos el tiquete
    async getTicket(req, res){
        try {
            // Obtenemos los datos por parámetros.
            const { ticketId } = req.params;
            // Buscamos que exista el tiquete.
            const searchTicket = await ticket.findByPk(ticketId, {
                include: [{
                    model: salesperson,
                    as: 'salesperson',
                    attributes: ['id', 'name', 'movil'],
                },{
                    model:number,
                    as: 'numeros',
                    attributes: {exclude: ['createdAt', 'updatedAt', 'ticketId', 'sorteoId']}
                }, {
                    model: lottery,
                    as: 'lottery'
                }],
                attributes: {exclude: ['createdAt', 'updatedAt']}
            }).catch(err => {
                console.log(err);
                return null
            });
            if(!searchTicket) return res.status(404).json({msg: 'No hemos encontrado este tiquete.'});

            res.status(200).json(searchTicket);
        }catch(err){
            console.log(err);
            res.status(500).json({msg: 'Ha ocurrido un error'});
        }
    },
    // Llamamos un juego por id
    async addTicket(req, res){
        try {
            // Recibimos los datos por body
            const { nameUser, phoneUser, nros, salespersonId, numeros, lotteryId }  = req.body;
            // Validamos que los datos entren correctamente.
            if(!nameUser || !phoneUser || !nros || !salespersonId || !numeros || !lotteryId) return res.status(501).json({msg: 'Los parámetros no son validos.'});
            
            // Primeramente buscamos el usuario.
            const searchUser = await salesperson.findByPk(salespersonId, {
                include: [{
                    model: lottery,
                    through: { attributes: [] }, 
                    required: true,
                    where: {
                        id: lotteryId,
                        state: 'active',
                    }
                }]
            }).catch(err => {
                console.log('paila');
                console.log(err);
                return null
            });

            if(!searchUser) return res.status(404).json({msg: 'No es posible hacer este registro'});
            // CÓDIGO DE REFERENCIA.
            const referenceUno = `${searchUser.lotteries[0].nivel}${searchUser.lotteries[0].id}${searchUser.id}${nameUser[0]}`
            const referenceDos = `_${phoneUser}`;
            const reference = `${referenceUno}${referenceDos}`; // CODE REFERENCE

            // DATOS HORARIOS.
            const date = new Date();            // Defector    
            let dia = date.getDate();           // Día
            let mes = date.getMonth() + 1;      // Mes
            let year = date.getFullYear();      // Year
            
            // TICKET DATES
            let valor = `${searchUser.lotteries[0].price * nros}`;

            // ARRAY CON TODOS LOS NÚMEROS
            let array = [];
            
            const createTicket = await ticket.create({
                nameUser: nameUser,
                phoneUser: phoneUser,
                dia,
                mes,
                year,
                valor: valor,
                nros,
                reference: reference,
                salespersonId,
                lotteryId
            })
            .catch(err => {
                console.log(err);
                return null
            });

            
            if(!createTicket) { 
                return res.status(401).json({msg: 'NO hemos creado el ticket.'})
                
            }else{
                for(let i = 0; i < numeros.length; i++){
                    array.push({
                        numero: numeros[i],
                        lotteryId: lotteryId,
                        salespersonId: salespersonId,
                        ticketId: createTicket.id
                    })
                    // console.log(i);
                    // console.log(searchUser.lotteries[0].id);
                    // console.log(numeros.length);
                }
                console.log(array);
                const addNumbers = await number.bulkCreate(array).catch(err => {
                    console.log(err);
                    return null
                })

                if(!addNumbers) return res.status(401).json({msg:'Números no correctos.'});
              
                // ACTUALIZACIÓN DEL USUARIO EN PAGOS, PUNTOS, NIVEL Y PUNTUACIÓN.
                let puntos = 500;
                let dinero = Number(searchUser.dinero) + Number(nros * searchUser.lotteries[0].price);
                let comision = Number(searchUser.comisiones) + Number(nros * searchUser.lotteries[0].comision);
                let puntuacion = Number(searchUser.puntos) + Number(nros * puntos);
                


                const updateUser = await salesperson.update({
                    dinero,
                    comisiones:comision,
                    puntos:puntuacion
                }, {
                    where: {
                        id: salespersonId
                    }
                }).catch(err => null);
                if(!updateUser) return res.status(401).json({msg: 'Ha ocurrido un error actualizando la información.'});
                // Respuesta
                let response = {
                    usuario: searchUser,
                    tiquete: createTicket,
                    numeros: addNumbers
                }
                console.log(response);
                res.status(201).json({msg: '¡Tiquete vendido!', response: response});

            
            }

        }catch(err){
            console.log(err);
            res.status(500).json({msg: 'Ha ocurrido un error'});
        }
    }
}