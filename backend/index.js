import express from 'express';
import cors from 'cors';
import mainRouter from './api/main.routes.js';
import { db } from './db/config.db.js';
import {errorHandler} from './middleware/error-handler.js';
import path from 'node:path';
import { fileURLToPath } from 'url';
import fs from 'node:fs';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
const __filename = fileURLToPath(import.meta.url);
// console.log("FILENAME===========",__filename)
const __dirname = path.dirname(__filename);
// console.log("DIRNAME==========",__dirname)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api',mainRouter);
app.use(errorHandler);
// Start server
const startServer = async () => {
  try {
    // Test database connection
    const connection = await db.getConnection();

    console.log('Database connection established successfully.');
    connection.release();

    app.listen(port, err => {
      if (err) {
        console.error('Failed to start the server:', err.message);
        process.exit(1);
      }
      console.log(`Server running on port http://localhost:${port}`);
    });
  } catch (error) {
    console.error(
      'Failed to connect to the database. Server not started.',
      error.message,
    );
    process.exit(1);
  }
};

startServer();

