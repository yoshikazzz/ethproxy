
import mailgun from 'mailgun-js';

const api_key = 'key-90e346b922fa8ded8b350a7b90e40d17';
const domain = 'smerp.io';

const mail = mailgun({ apiKey: api_key, domain: domain });

export const sendMail = (to: string, subject: string, text: string) => {
    const data = {
        from: 'VM <no-reply@alt.ai>',
        to: to,
        subject: subject,
        text: text
    };

    mail.messages().send(data, function (error, body) {

    });

};