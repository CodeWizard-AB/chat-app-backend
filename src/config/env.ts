const env = {
	PORT: process.env.PORT || 3000,
	MONGODB_URI: process.env.MONGODB_URI as string,
	REDIS_HOST: process.env.REDIS_HOST as string,
	REDIS_PORT: process.env.REDIS_PORT as unknown as number,
	REDIS_USERNAME: process.env.REDIS_USERNAME as string,
	REDIS_PASSWORD: process.env.REDIS_PASSWORD as string,
};

export default env;
