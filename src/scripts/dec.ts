import * as aesjs from '../utils/aesjs';

if (process.argv[2]) {
    const str = process.argv[2];
    const strDec = aesjs.decryptPK(str);
    console.log(strDec + ' --> output decrypted string');
} else {
    console.log('Missing string argv to decrypt');
}