if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
const nodemailer = require('nodemailer');
const mailGun = require('nodemailer-mailgun-transport');

const auth = {
    auth: {
        api_key: process.env.api_key,
        domain: process.env.domain
    }
};

const transporter = nodemailer.createTransport(mailGun(auth));

const sendMail = (email, subject, text, cb) => {
    const mailOptions = {
        from: email,
        to: 'smartbin2021senior@gmail.com',
        subject: subject,
        text: text
    };
    
    transporter.sendMail(mailOptions, (err, data) => {
        if(err){
            cb(err, null);
        }
        else{
            cb(null, data);
        }
    })
}

module.exports = sendMail;
