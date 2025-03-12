import multer from "multer";


const storage = multer.memoryStorage(); // Guardar en memoria en vez de en disco

export const upload = multer({ storage });