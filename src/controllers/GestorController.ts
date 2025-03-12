import {  DeleteObjectCommand, ListObjectsV2Command, PutObjectCommand } from "@aws-sdk/client-s3"
import { BUCKET_NAME, s3 } from "../config/s3Config"
import { Folder } from "../models/Folder";
import { v4 as uuidv4 } from "uuid";
import mime from "mime-types";
import path from 'path'
export class GestorController {
    listObjects = async (_req: any, res: any) => {
        // ListObjectsV2Command
        const data = await s3.send(new ListObjectsV2Command({Bucket: BUCKET_NAME, Prefix:'vimeo_videos/ADGP/GRUPO 2/', Delimiter:'/'}))
        console.log("Success", data.CommonPrefixes);
        return res.status(200).json(data);
    }
    listObjectsv2 = async (req: any, res: any) => {
        try {
            let currentDirectory = req.query.folderId as string || "/"; // Obtener el directorio desde la query
            const command = new ListObjectsV2Command({
                Bucket: BUCKET_NAME,
                Prefix: currentDirectory.replace(/^\//, ""), // Elimina la barra inicial
                Delimiter: "/",
            });
            
            const response = await s3.send(command);
            // Mapear carpetas
            const folders = (response.CommonPrefixes || []).map(prefix => {
                const folderName = prefix.Prefix!.split("/").filter(Boolean).pop() || "Unnamed Folder";
                return {
                    id: currentDirectory + `${folderName}/`,
                    name: folderName,
                    parentId: currentDirectory === "/" ? null : currentDirectory,
                    path: currentDirectory.split("/").filter(Boolean),
                    updatedAt: new Date(),
                    createdAt: new Date(),
                    owner: {id:1,email:'',name:''},
                    isStarred: false,
                    isShared: false,
                };
            });

            // Mapear archivos
            const files = (response.Contents || []).map(content => {
                const fileName = content.Key!.split("/").pop() || "Unnamed File";
                return {
                    id: currentDirectory+ `${fileName}/`,
                    name: fileName,
                    type: fileName.split(".").pop() || "unknown",
                    size: content.Size || 0,
                    url: `https://${BUCKET_NAME}.s3.amazonaws.com/${content.Key}`,
                    uploadDate: content.LastModified || new Date(),
                    modifiedDate: content.LastModified || new Date(),
                    folderId: currentDirectory === "/" ? null : currentDirectory,
                    owner: {id:1,email:'',name:''},
                    isStarred: false,
                    isShared: false,
                };
            });

            return res.status(200).json({
                currentDirectory,
                folders,
                files
            });
        } catch (error) {
            console.error("Error al listar los directorios:", error);
            return res.status(500).json({ message: "No se pudo cargar los directorios", error });
        }
    }
    listObjectsv3 = async (req: any, res: any) => {
        try {
            const currentDirectory = req.query.path as string || "/";
            const userId = req.query.userId as string; // El usuario autenticado

            // Consulta S3
            const command = new ListObjectsV2Command({
                Bucket: BUCKET_NAME,
                Prefix: currentDirectory.replace(/^\//, ""),
                Delimiter: "/",
            });

            const response = await s3.send(command);

            // Mapear carpetas y guardarlas en la DB
            const folders = await Promise.all(
                (response.CommonPrefixes || []).map(async (prefix) => {
                    const folderName = prefix.Prefix!.split("/").filter(Boolean).pop() || "Unnamed Folder";

                    // Verificar si la carpeta ya existe en la base de datos
                    let existingFolder = await Folder.findOne({
                        where: { name: folderName, parentId: currentDirectory === "/" ? null : currentDirectory },
                    });

                    if (!existingFolder) {
                        // Crear la carpeta en la base de datos
                        existingFolder = await Folder.create({
                            id: uuidv4(),
                            name: folderName,
                            parentId: currentDirectory === "/" ? null : currentDirectory,
                            path: currentDirectory.split("/").filter(Boolean).join("/"),
                            userId, // Relacionar con el usuario autenticado
                            isStarred: false,
                            isShared: false,
                        });
                    }

                    return existingFolder;
                })
            );

            return res.status(200).json({ currentDirectory, folders });
        } catch (error) {
            console.error("Error al listar directorios:", error);
            return res.status(500).json({ message: "No se pudo cargar los directorios", error });
        }
    }
    upload = async (req: any, res: any) =>{
        try {
            console.log(req.files);
            const path = req.body.folderId as string;
            console.log(path);
            if (!req.files ) {
              return res.status(400).json({ success: false, message: "No files uploaded" });
            }
        
            const uploadedFiles = Array.isArray(req.files) ? req.files : [req.files];
            
            const uploadedResults = await Promise.all(
              uploadedFiles.map(async (file: any) => {
                const fileBuffer = file.buffer; // Obtener el buffer del archivo
                const uniqueFileName = `${path.replace(/^\//, "")}${file.originalname}`;
                const contentType = mime.lookup(file.name) || "application/octet-stream";
                console.log(uniqueFileName);
                // Subir a Cloudflare R2
                await s3.send(
                  new PutObjectCommand({
                    Bucket: BUCKET_NAME,
                    Key: uniqueFileName,
                    Body: fileBuffer,
                    ContentType: contentType,
                  })
                );
        
                return {
                  id: req.body.folderId + file.name,
                  name: file.name,
                  type: contentType,
                  size: file.size,
                  url: `https://${process.env.ENDPOINT_URL}/${uniqueFileName}`,
                  uploadDate: new Date(),
                  modifiedDate: new Date(),
                  folderId: req.body.folderId || null,
                  owner: req.user?.id || "anonymous",
                  isStarred: false,
                  isShared: false,
                };
              })
            );
        
            res.status(201).json({ success: true, data: uploadedResults });
          } catch (error) {
            console.error("Upload error:", error);
            res.status(500).json({ success: false, message: "Error uploading file" });
          }
    }
    delete = async (req: any, res: any) =>{
        try {
            const { ids } = req.body; // Lista de archivos a eliminar
            console.log(ids);
            if (!ids || !Array.isArray(ids) || ids.length === 0) {
              return res.status(400).json({ success: false, message: "No files specified for deletion" });
            }
        
            // Eliminar archivos en paralelo
            
            await Promise.all(
              ids.map(async (key: string): Promise<void> => {
                try {
                    console.log(key.replace(/^\/|\/$/g, ""));
                  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: key.replace(/^\/|\/$/g, "") }));
                } catch (error: any) {
                  console.error(`Error deleting ${key}:`, error);
                }
              })
            );
        
            res.status(200).json({ success: true, data: ids });
          } catch (error) {
            console.error("Delete error:", error);
            res.status(500).json({ success: false, message: "Error deleting files" });
          }
    }
    update = async (req: any, res: any) => {
        try {
            const { name, oldkey } = req.body;
    
            if (!name) {
                return res.status(400).json({ message: "El nuevo nombre es obligatorio." });
            }
            const OldKey = oldkey.replace(/^\/|\/$/g, ""); // Eliminar barras al inicio y fin
            const dirPath = path.posix.dirname(OldKey); // Extrae el directorio sin el archivo
            const fileExtension = path.extname(OldKey); // Obtiene la extensión (ej: .jpeg)
            const newKey = path.posix.join(dirPath, `${name}${fileExtension}`); // Une la nueva ruta

            console.log('newkey: ',newKey);
            console.log('OldKey: ',OldKey);
            /*
            // Copiar el archivo con el nuevo nombre
            await s3.send(new CopyObjectCommand({
                Bucket: BUCKET_NAME,
                CopySource: OldKey,
                Key: newKey
            }));
    
            // Eliminar el archivo original
            await s3.send(new DeleteObjectCommand({
                Bucket: BUCKET_NAME,
                Key: OldKey
            }));
            */
    
            return res.json({
                success: true,
                data:{
                    newname: `${name}${fileExtension}`
                }
            });
    
        } catch (error) {
            console.error("Error al renombrar el archivo:", error);
            res.status(500).json({ message: "Error interno del servidor." });
        }
    }
}