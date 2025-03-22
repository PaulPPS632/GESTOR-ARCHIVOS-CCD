import { Router } from "express";
import { GestorController } from "../controllers/GestorController";
import { upload } from "../middlewares/upload";
import { SharedAuth } from "../middlewares/SharedAuthorization";
import { Authorization } from "../middlewares/Authorization";

const GestorRouter = Router();
const gestorController = new GestorController();

//GestorRouter.get("/listObjects", gestorController.listObjects);
GestorRouter.get("",[Authorization,SharedAuth], gestorController.listObjectsv2);
GestorRouter.get("/shared", [Authorization,SharedAuth], gestorController.listObjectsShared);
GestorRouter.get("/shared/:id", Authorization, gestorController.sharedbyId);
GestorRouter.get("/search", gestorController.search);
GestorRouter.post("/historial", Authorization,gestorController.historials);
GestorRouter.post("/sharedfolder", Authorization, gestorController.sharedFolderById);
GestorRouter.post("/editaccesssharedfolder", Authorization, gestorController.editaccesssharedfolder);
GestorRouter.post("/upload", upload.array("files"), gestorController.upload);
GestorRouter.post("/rename", Authorization, gestorController.rename);
GestorRouter.delete("",gestorController.delete);
GestorRouter.delete("/shared/:id",gestorController.deleteshared);
GestorRouter.put("", gestorController.update);


export default GestorRouter;