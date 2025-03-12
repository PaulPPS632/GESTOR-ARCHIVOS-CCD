import { Sequelize } from "sequelize-typescript";
import { Dialect } from "sequelize";
import { models } from "../models/models";

class Database {
  private connection: Sequelize | null;
  
  constructor() {
    this.connection = null;
    this.init();
  }

  init() {
    try {
      const name = process.env.DB_NAME || 'bots_db'
      
      const user = process.env.DB_USER || 'root'
      const password = process.env.DB_PASSWORD || ''
      const host = process.env.DB_HOST || 'localhost'
      const dialect = (process.env.DB_DIALECT as Dialect) || 'mysql'
      const port = parseInt(process.env.DB_PORT || '3306')
      console.log("Detalles de la conexión:", {
        database: name,
        user: user,
        host: host,
        dialect: dialect,
        port: port,
        password: password
      })
      this.connection = new Sequelize(
        name,
        user,
        password,
        {
          host,
          dialect,
          port,
          retry: { max: 3 },
          models,
          timezone: '-05:00',
          //logging: false,
        }
      );
    } catch (error) {
      console.error("Error al conectar a la base de datos:", error);
    }
  }
  async sync() {
    try {
      // Autenticar la conexión
      await this.connection?.authenticate();
      console.log("Conexión a la base de datos establecida correctamente.");
      const alter = process.env.ALTER === 'true';
      // Sincronizar los modelos con la base de datos
      await this.connection?.sync({ alter: alter });
      console.log("Base de datos sincronizada correctamente.");

    } catch (err) {
      console.error("Error al conectar o sincronizar con la base de datos:", err);
      console.error("Detalles de la conexión:", {
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT,
        port: process.env.DB_PORT,
      });
    }
  }
  public getConnection(){
    return this.connection
  }
}

export default new Database();