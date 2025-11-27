// routes/legal.js
import express from 'express';

const router = express.Router();

// Ruta para Términos de Uso
router.get('/terminos', (req, res) => {
    res.render('legal/terminos', {
        title: 'Términos de Uso'
    });
});

// Ruta para Política de Privacidad
router.get('/privacidad', (req, res) => {
    res.render('legal/privacidad', {
        title: 'Política de Privacidad'
    });
});

// Ruta para Disclaimer
router.get('/disclaimer', (req, res) => {
    res.render('legal/disclaimer', {
        title: 'Disclaimer Legal'
    });
});

export default router;