import {
  CopyObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { BUCKET_NAME, s3 } from "../config/s3Config";
import mime from "mime-types";
import path from "path";
import { SharedFolders } from "../models/SharedFolders";
import { Historial } from "../models/historial";
import { User } from "../models/User";
export class GestorController {
  listObjects = async (_req: any, res: any) => {
    // ListObjectsV2Command
    const data = await s3.send(
      new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: "vimeo_videos/ADGP/GRUPO 2/",
        Delimiter: "/",
      })
    );
    console.log("Success", data.CommonPrefixes);
    return res.status(200).json(data);
  };
  listObjectsv2 = async (req: any, res: any) => {
    try {
      let currentDirectory = (req.query.path as string) || "/"; // Obtener el directorio desde la query
      const {access} = req.body
      const sanitizedpath = currentDirectory.replace(/^\//, "");
      const command = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: sanitizedpath === "" ? sanitizedpath : `${sanitizedpath}/`, // Elimina la barra inicial
        Delimiter: "/",
      });

      const response = await s3.send(command);
      // Mapear carpetas
      const folders = (response.CommonPrefixes || []).map((prefix) => {
        const folderName =
          prefix.Prefix!.split("/").filter(Boolean).pop() || "Unnamed Folder";
        const path = prefix.Prefix!.replace(/^\/+|\/+$/g, "");
        return {
          id: currentDirectory + `${folderName}/`,
          name: folderName,
          parentId: currentDirectory === "/" ? null : currentDirectory,
          path,
          updatedAt: new Date(),
          createdAt: new Date(),
          owner: { id: 1, email: "", name: "" },
          isStarred: false,
          isShared: false,
        };
      });

      let count = 0;
      // Mapear archivos
      const files = (response.Contents || []).map((content) => {
        const fileName = content.Key!.split("/").pop() || "Unnamed File";
        const fileExtension = path.extname(fileName);

        const contentType =
          mime.lookup(fileExtension) || "application/octet-stream";
        
        return {
          id: count++,
          name: fileName,
          mimetype: contentType,
          size: content.Size || 0,
          url: `https://pub-9d2abfa175714e64aed33b90722a9fd5.r2.dev/${content.Key}`,
          thumbnailUrl: contentType.includes("image")
            ? `https://pub-9d2abfa175714e64aed33b90722a9fd5.r2.dev/${content.Key}`
            : null,
          path: `${sanitizedpath}/${fileName}`,
          uploadDate: content.LastModified || new Date(),
          modifiedDate: content.LastModified || new Date(),
          folderId: currentDirectory === "/" ? null : currentDirectory,
          owner: { id: 1, email: "", name: "" },
          isStarred: false,
          isShared: false,
        };
      });

      return res.status(200).json({
        success: true,
        data: {
          currentDirectory,
          folders,
          files,
          access
        },
      });
    } catch (error) {
      console.error("Error al listar los directorios:", error);
      return res
        .status(500)
        .json({ message: "No se pudo cargar los directorios", error });
    }
  };
  listObjectsShared = async (req: any, res: any) => {
    try {
      let currentDirectory = (req.query.path as string) || "/"; // Obtener el directorio desde la query
      const { access } = req.body;
      const sanitizedpath = currentDirectory.replace(/^\/+|\/+$/g, "") + '/';

      console.log('NO SANITIZER:', currentDirectory);
      console.log('SANITIZADO:', sanitizedpath);

      const command = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: sanitizedpath, // Elimina la barra inicial
        Delimiter: "/",
      });

      const response = await s3.send(command);
      // Mapear carpetas
      const folders = (response.CommonPrefixes || []).map((prefix) => {
        const folderName =
          prefix.Prefix!.split("/").filter(Boolean).pop() || "Unnamed Folder";
        const path = prefix.Prefix!.replace(/^\/+|\/+$/g, "");
        return {
          id: currentDirectory + `${folderName}/`,
          name: folderName,
          parentId: currentDirectory === "/" ? null : currentDirectory,
          path,
          updatedAt: new Date(),
          createdAt: new Date(),
          owner: { id: 1, email: "", name: "" },
          isStarred: false,
          isShared: false,
        };
      });
      console.log(response.CommonPrefixes)
      let count = 0;
      // Mapear archivos
      const files = (response.Contents || []).map((content) => {
        const fileName = content.Key!.split("/").pop() || "Unnamed File";
        const fileExtension = path.extname(fileName);

        const contentType =
          mime.lookup(fileExtension) || "application/octet-stream";
        
        return {
          id: count++,
          name: fileName,
          mimetype: contentType,
          size: content.Size || 0,
          url: `https://pub-9d2abfa175714e64aed33b90722a9fd5.r2.dev/${content.Key}`,
          thumbnailUrl: contentType.includes("image")
            ? `https://pub-9d2abfa175714e64aed33b90722a9fd5.r2.dev/${content.Key}`
            : null,
          path: `${sanitizedpath}${fileName}`,
          uploadDate: content.LastModified || new Date(),
          modifiedDate: content.LastModified || new Date(),
          folderId: currentDirectory === "/" ? null : currentDirectory,
          owner: { id: 1, email: "", name: "" },
          isStarred: false,
          isShared: false,
        };
      });

      return res.status(200).json({
        success: true,
        data: {
          currentDirectory,
          folders,
          files,
          access: access
        },
      });
    } catch (error) {
      console.error("Error al listar los directorios:", error);
      return res
        .status(500)
        .json({ message: "No se pudo cargar los directorios", error });
    }
  }
  upload = async (req: any, res: any) => {
    try {
      let path = req.body.path as string;
      const newfolder = req.body.newfolder == 'true';
      const userId = req.body.userId;
      console.log(userId);
      //const token = req.body.token as string;
      if (!req.files) {
        return res
          .status(400)
          .json({ success: false, message: "No files uploaded" });
      }
      const uploadedFiles = Array.isArray(req.files) ? req.files : [req.files];
      path = path.replace(/^\/+|\/+$/g, "")
      const foldername = path.split("/").filter(Boolean).pop() || "Unnamed Folder";
      const uploadedResults = await Promise.all(
        uploadedFiles.map(async (file: any) => {
          const fileBuffer = file.buffer; // Obtener el buffer del archivo
          const slash = newfolder ? '/': '/';
          const uniqueFileName =  `${path}${slash}${
            file.originalname
          }` ;
          const contentType = mime.lookup(file.originalname) || "application/octet-stream";
          // Subir a Cloudflare R2
          console.log(slash);
          console.log(path);
          console.log(file.originalname);
          console.log(uniqueFileName);
          await s3.send(
            new PutObjectCommand({
              Bucket: BUCKET_NAME,
              Key: uniqueFileName,
              Body: fileBuffer,
              ContentType: contentType,
            })
          );
          await Historial.create({
            userId,
            accion: "upload",
            path,
            foldername,
            nombrearchivo: file.originalname,
          })
          return {
            id: req.body.folderId + file.originalname,
            name: file.originalname,
            mimetype: contentType,
            size: file.size,
            url: `https://pub-9d2abfa175714e64aed33b90722a9fd5.r2.dev/${path}${slash}${file.originalname.replace(
              /\s+/g,
              "%20"
            )}`,
            thumbnailUrl: contentType.includes("image")
              ? `https://pub-9d2abfa175714e64aed33b90722a9fd5.r2.dev/${path}${slash}${file.originalname.replace(
                  /\s+/g,
                  "%20"
                )}`
              : null,
            uploadDate: new Date(),
            modifiedDate: new Date(),
            folderId: req.body.folderId || null,
            owner: req.user?.id || "anonymous",
            isStarred: false,
            isShared: false,
          };
        })
      );
      const folderName =
          path.split("/").filter(Boolean).pop() || "Unnamed Folder";
      const response = { 
        success: true, 
        data:{
          files: !newfolder? uploadedResults : null,
          folder: newfolder ? {
            id: folderName,
            name: folderName,
            parentId: folderName,
            path,
            updatedAt: new Date(),
            createdAt: new Date(),
            owner: { id: 1, email: "", name: "" },
            isStarred: false,
            isShared: false,
          }: null
        }
      }
      res.status(201).json(response);
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ success: false, message: "Error uploading file" });
    }
  };
  delete = async (req: any, res: any) => {
    try {
      const { paths, userId } = req.body; // Lista de archivos a eliminar
      
      console.log(paths);
      if (!paths || !Array.isArray(paths) || paths.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "No files specified for deletion" });
      }

      // Eliminar archivos en paralelo

      await Promise.all(
        paths.map(async (key: string): Promise<void> => {
          try {
            
            const path = key.replace(/^\/|\/$/g, "");
            const folderarray = path.split("/").filter(Boolean);
            // El último elemento del array es el archivo
            const fileName = folderarray.pop();  // Extrae el archivo
            const folderPath = folderarray.join("/"); 
            await s3.send(
              new DeleteObjectCommand({
                Bucket: BUCKET_NAME,
                Key: path,
              })
            );
            await Historial.create({
              userId,
              accion: "delete",
              path: folderPath,
              foldername: folderarray[folderarray.length - 1],
              nombrearchivo: fileName,
            })
          } catch (error: any) {
            console.error(`Error deleting ${key}:`, error);
          }
        })
      );

      res.status(200).json({ success: true, data: { deletedIds: paths } });
    } catch (error) {
      console.error("Delete error:", error);
      res.status(500).json({ success: false, message: "Error deleting files" });
    }
  };
  deleteshared = async (req: any, res: any) => {
    try {
      const { id } = req.params;
      console.log("========= ELIMINANDO SHARED =========")
      const shared = await SharedFolders.findByPk(id);
      if(!shared) return res.status(404).json({ message: "No se encontro la carpeta compartida" });
      await shared.destroy() 
      return res.status(200).json({ message: "Carpeta compartida eliminada" });
    } catch (error) {
      return res.status(500).json({ message: "error interno del servidor" })
    }
  }
  update = async (req: any, res: any) => {
    try {
      const { name, oldkey } = req.body;

      if (!name) {
        return res
          .status(400)
          .json({ message: "El nuevo nombre es obligatorio." });
      }
      const OldKey = oldkey.replace(/^\/|\/$/g, ""); // Eliminar barras al inicio y fin
      const dirPath = path.posix.dirname(OldKey); // Extrae el directorio sin el archivo
      const fileExtension = path.extname(OldKey); // Obtiene la extensión (ej: .jpeg)
      const newKey = path.posix.join(dirPath, `${name}${fileExtension}`); // Une la nueva ruta

      // Copiar el archivo con el nuevo nombre
      await s3.send(
        new CopyObjectCommand({
          Bucket: BUCKET_NAME,
          CopySource: `${BUCKET_NAME}/${OldKey}`,
          Key: newKey,
        })
      );

      // Eliminar el archivo original
      await s3.send(
        new DeleteObjectCommand({
          Bucket: BUCKET_NAME,
          Key: OldKey,
        })
      );

      return res.json({
        success: true,
        data: {
          newname: `${name}${fileExtension}`,
        },
      });
    } catch (error) {
      console.error("Error al renombrar el archivo:", error);
      res.status(500).json({ message: "Error interno del servidor." });
    }
  };
  search = async (req: any, res: any) => {
    const searchTerm = req.query.search?.toLowerCase() || "";
    console.log(searchTerm);
    
    try {
      const command = new ListObjectsV2Command({ Bucket: BUCKET_NAME });
      const data = await s3.send(command);

      // Filtrar archivos que coincidan con el término de búsqueda
      const filteredFiles =
        data.Contents?.filter((file: any) => file.Key.split('/').pop().toLowerCase().includes(searchTerm))
        .map((content: any) => {
            const fileName = content.Key!.split("/").pop() || "Unnamed File";
            const fileExtension = path.extname(fileName);
    
            const contentType =
              mime.lookup(fileExtension) || "application/octet-stream";
            return {
              id: content.key,
              name: fileName,
              mimetype: contentType,
              size: content.Size || 0,
              url: `https://pub-9d2abfa175714e64aed33b90722a9fd5.r2.dev/${content.Key}`,
              thumbnailUrl: contentType.includes("image")
                ? `https://pub-9d2abfa175714e64aed33b90722a9fd5.r2.dev/${content.Key}`
                : null,
              uploadDate: content.LastModified || new Date(),
              modifiedDate: content.LastModified || new Date(),
              folderId: null,
              owner: { id: 1, email: "", name: "" },
              isStarred: false,
              isShared: false,
            };}) || [];

      res.json(filteredFiles);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al buscar archivos en el bucket" });
    }
  };
  sharedbyId = async (req: any, res: any)=> {
    try {
      const { id }= req.params;
      const folders = await SharedFolders.findAll({
        where: {
          userId: id,
        }
      });
      const mappedfolders = folders.map((folder) => {
        const folderName =
          folder.path.split("/").filter(Boolean).pop() || "Principal";
        const path = folder.path.replace(/^\//, "");
        return {
          id: folder.id,
          name: folderName,
          path,
          accessType: folder.accessType,
          owner: { id: 1, email: "", name: "" },
          isStarred: false,
          isShared: false,
        };
      });
      return res.status(200).json({folders: mappedfolders});
    } catch (error) {
      return res.status(500).json({ message: "error interno del servidor" })
    }
  }
  sharedFolderById = async (req: any, res: any)=> {
    try {
      const { name, userId, path, accessType }= req.body;
      await SharedFolders.create({
        userId,
        name: name !== '' ? name : 'root',
        path,
        accessType
      });
      return res.status(200).json({message: 'compartido correctamente'});
    } catch (error: any) {
      return res.status(500).json({ message: "error interno del servidor", error: error.message })
    }
  }
  editaccesssharedfolder = async (req: any, res: any) => {
    try {
      const { id, accessType } = req.body;
      const shared = await SharedFolders.findByPk(id);
      if(!shared) return res.status(404).json({ message: "No se encontro la carpeta compartida" });
      shared.accessType = accessType;
      await shared.save();
      return res.status(200).json({ message: "Carpeta compartida actualizada" });
    } catch (error) {
      return res.status(500).json({ message: "error interno del servidor" })
    }
  
  }
  rename = async (req: any, res: any) => {
    try {
      const { oldkey, newname, userId } = req.body;
      console.log("OLD KEY", oldkey);
      const oldKey = oldkey.replace(/^\/+|\/+$/g, ""); // Eliminar barras al inicio y fin
      const dirPath = path.posix.dirname(oldKey); // Extrae el directorio sin el archivo
      const fileExtension = path.extname(oldKey); // Obtiene la extensión (ej: .jpeg)
      const newKey = path.posix.join(dirPath, `${newname}${fileExtension}`); // Une la nueva ruta

      // Copiar el archivo con el nuevo nombre
      await s3.send(
        new CopyObjectCommand({
          Bucket: BUCKET_NAME,
          CopySource: `${BUCKET_NAME}/${oldKey}`,
          Key: newKey,
        })
      );

      // Eliminar el archivo original
      await s3.send(
        new DeleteObjectCommand({
          Bucket: BUCKET_NAME,
          Key: oldKey,
        })
      );
      await Historial.create({
        userId,
        accion: "rename",
        path: dirPath,
        foldername: dirPath.split("/").pop(),
        nombrearchivo: `${newname}${fileExtension}`,
        oldname: oldKey.split("/").pop(),
      });
      return res.json({
        success: true,
        data: {
          newname: `${newname}${fileExtension}`,
        },
      });
    } catch (error) {
      console.error("Error al renombrar el archivo:", error);
      res.status(500).json({ message: "Error interno del servidor." });
    }
  
  }
  historials = async (req: any, res: any) => {
    try {
      const { path } = req.body;
      const historial = await Historial.findAll({
        where: {
          path,
        },
        include:[
          {
            model: User,
            attributes: ['id', 'name', 'email']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: 20,
      });
      return res.status(200).json({ historial });
    } catch (error) {
      return res.status(500).json({ message: "error interno del servidor" })
    }
  }
}
