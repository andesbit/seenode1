import crypto from 'crypto';

let keys;

try {
  keys = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });
  console.log('Claves RSA generadas al iniciar el servidor');
} catch (err) {
  console.error('Error generando claves:', err);
}

// Exporta ambas claves
/*
export default {
  publicKey: keys.publicKey,
  privateKey: keys.privateKey
};   
*/

export const publicKey = keys.publicKey;
export const privateKey = keys.privateKey;