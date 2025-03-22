import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { Authorization } from "../middlewares/Authorization";

const AuthRoter = Router();
const authController = new AuthController();

AuthRoter.get("", Authorization,authController.listar)
AuthRoter.get("/:id", Authorization,authController.getById)
AuthRoter.post("/search", authController.search)
AuthRoter.post("/login", authController.login);
AuthRoter.post("/register", authController.register);
AuthRoter.post("/validate", authController.validate);

export default AuthRoter;