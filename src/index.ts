import { config } from "dotenv";
config();
import database from "./config/database";
import { createServer } from "http";
import app from "./app";

async function main(): Promise<void> {
  try {
    //sincronizacion con db
    await database.sync();

    // Inicialización del servidor
    const httpServer = createServer(app);

    //escucha del servidor en puerto 8000
    httpServer.listen(3000, '0.0.0.0', () => {
      console.log(`Server is running on http://localhost:3000`);
    });
    
  } catch (error) {
    console.error("Error during application initialization:", error);
    process.exit(1); // Salir del proceso si ocurre un error crítico
  }
}
main();
