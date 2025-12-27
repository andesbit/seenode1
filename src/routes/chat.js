import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
    /*
    res.render('chat/index', {
        title: 'Página del Chat',
        headerData: {
            showBanner: true,
            bannerText: '¡Chat especial!'
        }
    });
    */

    res.render('chat/index', {
        title: 'Chat Persistente',
        headerData: {
            showBanner: true,
            bannerText: '¡Los mensajes se guardan!'
        }
    });
});
export default router