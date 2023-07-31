// Llamamos los modelos necesarios.
const { avatar } = require('../db/db');
const fs = require('fs');
const path = require('path');
const express = require('express');
// Funciones que necesito
module.exports = {
    // Validamos que el número este dispoinble.
    async getAvatar(req, res){
        try{
            const { img } = req.params;
            res.sendFile(path.join(__dirname,`../image/avatars/${img}.webp`));
        }catch(err){ 
            console.log(err);
            res.send('No encontramos estos');   
        }
    },
    async getAvatars(req, res){
        try {
            // Buscamos todos los avatars disponibles en la base de datos.
            const searchAvatars = await avatar.findAll({
                where: {
                    state:'active'
                }
            }).catch(err => null);

            if(!searchAvatars || !searchAvatars.length) return res.status(404).json({msg: 'No hay avatars para mostrar'});

            // Caso contrario...
            // Enviamos todos los avatars.
            res.status(200).json({avatars: searchAvatars});
        }catch(err){
            // Enviamos errores
            console.log(err);// Pasamos el error por la consola.
            res.status(500).json({msg: 'Ha ocurrido un error en la principal'})
        }
    },
    async codePosts(req, res){
        try {
            const { name } = req.body;

            const addAvatar = await avatar.create({
                name,
                url: `./../../assets/img/avatars/${name}.webp`,
                code: name,
                state: 'active'
            }).catch(err => null);
            if(!addAvatar) return res.status(502).json({msg: 'Sorry.'});
            res.status(201).json(addAvatar);
        }catch(err){
            res.status(500).json({msg: 'Ha ocurrido un error'});
        }
    },
    
} 