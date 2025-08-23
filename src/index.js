// server-express.js
import express from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, readFileSync, writeFileSync } from 'fs';

import { ALIJIASEARCHMAINCONTENT }  from './mainFunctions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

app.get('/', (req, res) => {

    //...ENTRADA... res.send('HELLO');

        //...EXIST...
    const ipath = join(__dirname, 'DB/document_a.json');
    if (!existsSync(ipath)) {
            throw new Error(`data base Key no encontrado: ${ipath}`);
        }

        //...WRITE...
    const content =`
        {
            "ole": "COWA",
            "lisa": "I"
        }`;

    writeFileSync(ipath, content, {
        encoding: "utf8", // utf8 es el valor por defecto
        //mode: "0o666", // son los permisos, este valor puede variar dependiendo si te encuentras en Linux o Windows,
        flag: "w", // w indica que el archivo se debe crear si no existe o su contenido se debe reemplazar si existiera
    });
        //...READ...
    const st = JSON.parse(readFileSync(ipath, 'utf8'));
    let pd = st.ole;
    res.send(pd);
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});   
