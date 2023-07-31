// Llamamos los modelos necesarios.
const { user, salesperson, lottery } = require('../db/db');
// Funciones que necesito

module.exports = {
    // Creamos la función para obtener todos los sorteos disponibles.
    async signUp(req, res){
        try {
            // Recibimos los datos por body
            const { nick, email, password, range } = req.body;
            // Revisamos que sean validos.
            if(!nick || !email || !password || !range) return res.status(501).json({msg: 'Los parámetros no son validos.'});

            // Procedemos a buscar un usuario con el mismo correo.

            const searchEmail = await user.findOne({
                where: {
                    email:email
                }
            }).catch(err => null);
            // Si no hay registro, avanzamos...
            if(!searchEmail){
                const addUser = await user.create({
                    nick,
                    email,
                    password,
                    range,
                    state:'on'
                }).catch(err => null);
                // Validamos que se haya registrado.
                if(!addUser) return res.status(502).json({msg: 'No hemos podido crear este usuario'});
                // Caso contrario... ¡Exito!
                res.status(201).json(addUser);
            // Caso contrario, enviamos respuesta
            }else{
                res.status(200).json({msg:'Ya existe un miembro con este correo.'});
            }
        }catch(err){
            console.log(err);
            res.status(500).json({msg: 'Ha ocurrido un error en la principal.'});
        }
    },
    // Mostramos todo el equipo de trabajo de NovaX
    async allTeam(req, res){
        try {   
            const searchAllMembers = await user.findAll({
                where: {
                    state: 'on'
                }
            }).catch(err => null);
            if(!searchAllMembers || !searchAllMembers.length) return res.status(404).json({msg: 'No hay miembros.'});
            res.status(200).json({miembros: searchAllMembers});
        }catch(err){
            console.log(err);
            res.status(500).json({msg: 'Ha ocurrido un error en la principal'});
        }
    }
} 