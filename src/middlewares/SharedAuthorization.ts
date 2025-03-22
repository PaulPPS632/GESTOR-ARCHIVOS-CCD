//import { NextFunction, Request, Response } from "express";

//import { Op } from "sequelize";
import { SharedFolders } from "../models/SharedFolders";

export const  SharedAuth =  async (req: any, res: any, next: any) => {
    console.log('body: ',req.body);
    console.log('query: ',req.query);
    console.log('params: ',req.params);
    //console.log('headers: ', req.headers);
    console.log('cookies: ', req.cookies);
    console.log('============================================');
    const path = req.query.path as string;
    //path.startsWith('Documentos/Imagen/Cursos')
    console.log('path: ', path);
    const pathsshared = await SharedFolders.findAll({
        where:{
            userId: req.data.id,
        }

    })
    //console.log('pathsshared: ', pathsshared);
    //console.log('encontrados',pathsshared)
    //const paths = pathsshared.map((shared) => shared.path);
    //console.log('paths: ',paths)
    const shared = pathsshared.some((pathshare) => {
        console.log('pathshare: ', pathshare.path);
        console.log('path: ', path);
        console.log('path.startsWith(pathshare.path): ', path.startsWith(pathshare.path));
        return path.startsWith(pathshare.path);
    });
    if(shared){
        req.body.access = true;
        next();
    }else{
        return res.status(401).json({message: 'No autorizado'});
    }
}