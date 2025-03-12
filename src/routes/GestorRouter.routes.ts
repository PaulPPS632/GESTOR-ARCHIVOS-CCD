import { Router } from "express";
import { GestorController } from "../controllers/GestorController";
import { upload } from "../middlewares/upload";

const GestorRouter = Router();
const gestorController = new GestorController();

GestorRouter.get("/listObjects", gestorController.listObjects);
GestorRouter.get("/listObjectsv2", gestorController.listObjectsv2);
GestorRouter.post("/upload", upload.array("files"), gestorController.upload);
GestorRouter.delete("",gestorController.delete);
GestorRouter.put("", gestorController.update);
export default GestorRouter;