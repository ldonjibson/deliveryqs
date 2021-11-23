module.exports = ({ env }) => ({
  // ...
  email: {
    provider: 'sendgrid',
    providerOptions: {
      apiKey: env('SENDGRID_API_KEY'),
    },
    settings: {
      defaultFrom: 'jack@deliveryqs.com',
      defaultReplyTo: 'jack@deliveryqs.com',
      testAddress: 'eopeyemi.tv@gmail.com',
    },
  },
  // ...
});