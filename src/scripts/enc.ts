import * as aesjs from '../utils/aesjs';

if (process.argv[2]) {
    const str = process.argv[2];
    const strDec = aesjs.encryptPK(str);
    console.log(strDec + ' --> output encrypted string');
} else {
    console.log('Missing string argv to encrypt');
}
