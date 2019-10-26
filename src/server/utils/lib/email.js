const nodemailer = require('nodemailer')

// Fake account from https://ethereal.email
const fakeAccountTrasporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'noble74@ethereal.email',
    pass: 'gVh9g7PkvXnuSzhzkJ'
  }
})

const sendVerificationEmail = async (userName, emailAddress, verificationToken) => {  
  try {

    const response = await fakeAccountTrasporter.sendMail({
      from: '"Mister X" <misterX@sc.com>',
      to: `"${userName}" <${emailAddress}>`,
      subject: "Please confirm your Email account",
      html: `Hello ${userName},<br>
        One last step before accessing this fantastic Chat.<br>
        <a href="http://localhost:5001/verify?token=${verificationToken}">Click here to verify your email</a><br>`
    })
    if(!response) throw new Error('Cannot send account verification email')
    return Promise.resolve(response)

  } catch (err) {
    throw err
  }
}

const sendPasswordRecoveryEmail = async (userName, emailAddress, tmpPassword) => {
  try {

    const response = await fakeAccountTrasporter.sendMail({
      from: '"Mister X" <misterX@sc.com>',
      to: `"${userName}" <${emailAddress}>`,
      subject: "Password recovery",
      html: `Hello ${userName},<br>
        Your password has been reset. The reset password is<br>
        <b>${tmpPassword}</b><br>
        Please change it on first access.<br>`
    })
    if(!response) throw new Error('Cannot send password recovery email')
    return Promise.resolve(response)
    
  } catch (err) {
    throw err
  }
}

module.exports = { sendVerificationEmail, sendPasswordRecoveryEmail }
