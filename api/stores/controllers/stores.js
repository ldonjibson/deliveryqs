'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const { sanitizeEntity } = require('strapi-utils');
const formatError = error => [
  { messages: [{ id: error.id, message: error.message, field: error.field }] },
];


module.exports = {
  forgot: async ctx => {

    const params = ctx.request.body;
        
    // The identifier is required.
    if (!params.email) {
      return ctx.badRequest(
        null,
        formatError({
          id: 'Auth.form.error.email.provide',
          message: 'Please provide your e-mail.',
        })
      );
    }
    
    const user = await strapi.query('user', 'users-permissions').findOne({email: params.email});
    //console.log("user",user);
    //user doesnt exist
    if(!user){
        return ctx.badRequest(
        null,
        formatError({
          id: 'Auth.form.error.email.provide',
          message: 'Please provide a valid e-mail.',
        })
      );
    }
        
    var digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 4; i++ ) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    let otp = OTP; 
    //console.log("otp",otp);
    await strapi.query('user', 'users-permissions').update({ id: user.id }, { session_token: `${otp}` });
    
    let body = `
    <h3>Reset your Password</h3>
    <hr>
    <p>Hello ${user.firstname || friend},</p>
    <p>A request has been received to change your password.</p>
    <p>Use this token to reset your password.</p>
    <hr>
    <h1><strong>${otp}</strong></h1>
    <hr>
    <p>If you did not initiate this request, please contact us immediately at <a href="mail:support@deliveryqs.com">support@deliveryqs.com</a></p>
    <br/>
    <p>Thank you,</p>
    <p>The Deliveryqs Team</p>
    

    `;
    
    //send the email
    await strapi.plugins["email"].services.email.send({
      to: user.email,
      from: "jack@deliveryqs.com",
      subject: "Password Reset Token",
      html: body,
    });
        
    await ctx.send({
      res: "OTP sent to your email"
    });
  },
  
  
  reset: async (ctx) => {
    const params = ctx.request.body;
        
    // The identifier is required.
    if (!params.email || !params.password || !params.confirm || !params.token) {
      return ctx.badRequest(
        null,
        formatError({
          id: 'Auth.form.error.email.provide',
          message: 'Please provide token, email, password and confirm values.',
        })
      );
    }
    
     if (
      params.password &&
      params.confirm &&
      params.password !== params.confirm
    ) {
      return ctx.badRequest(
        null,
        formatError({
          id: 'Auth.form.error.password.matching',
          message: 'New Passwords do not match.',
        })
      );
    } else if (
      params.password &&
      params.confirm &&
      params.password === params.confirm
    ) {
        const user = await strapi.query('user', 'users-permissions').findOne({email: params.email, session_token: params.token});
        //user doesnt exist
        if(!user){
            return ctx.badRequest(
            null,
            formatError({
              id: 'Auth.form.error.email.provide',
              message: 'Invalid email or token!',
            })
          );
        }
        
        
        // Generate new hash password
        const password = await strapi.plugins['users-permissions'].services.user.hashPassword({ password: params.password});

        // Update user password
        await strapi.query('user', 'users-permissions').update({ id: user.id }, { resetPasswordToken: null, password });
          
        await ctx.send({
          res: "Password reset successful!"
        });
    }
    
   
   
    
  }
};

