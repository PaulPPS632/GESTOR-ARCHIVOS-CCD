import express, { Application } from "express";
import cors from "cors";
import GestorRouter from "./routes/GestorRouter.routes";
//import { Authorization } from "./middlewares/Authorization";
class App {
    private server: Application;
    constructor() {
      this.server = express();
      this.middlewares();
      this.routes();
    }
    private middlewares(): void {
      this.server.use(
        cors()
      );
      this.server.use(express.json());
      //this.server.use("/documentation", swaggerUi.serve, swaggerUi.setup(swaggerSetup))
    }
    private routes(): void {
      //this.server.use("/api", UserRoutes);
      this.server.use("/api/gestor", GestorRouter);
    }
    public getServer(): Application {
      return this.server;
    }
  }
  
  export default new App().getServer();