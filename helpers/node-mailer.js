
var nodemailer = require('nodemailer');

 

 transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'asimasm61@gmail.com',
    pass: 'gkzpmytwxyqcvnjy'
  }
});

 mailOptions = {
  from: 'asimasm61@gmail.com',
  to: 'asimsalim749@gmail.com',
  subject: 'email sample',
  text:`sample`
};
 
// transporter.sendMail(mailOptions, function(error, info){
//   if (error) {
//     console.log(error);
//   } else {
//     console.log('Email sent: ' + info.response);
//   }
// });
 
 