module.exports = ({ env }) => ({
  defaultConnection: 'default',
  connections: {
    default: {
      connector: 'bookshelf',
      settings: {
        client: 'mysql',
	host: env('DATABASE_HOST', 'localhost'),
	port: env('DATABASE_PORT', 3306),
	database : env('DATABASE_NAME', 'delivery_devq'),
	username : env('DATABASE_USERNAME', 'delivery_devq'),
	password: env('DATABASE_PASSWORD','Pass19//??'),
	ssl: env.bool('DATABASE_SSL', false),
      },
      options: {
        useNullAsDefault: true,
        charset: "utf8mb4_unicode_ci"
      },
    },
  },
});
