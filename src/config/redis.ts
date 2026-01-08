import { createClient } from "redis";
import env from "./env";

export const redis = createClient({
	username: env.REDIS_USERNAME,
	password: env.REDIS_PASSWORD,
	socket: {
		host: env.REDIS_HOST,
		port: env.REDIS_PORT,
	},
});

export async function connectRedis() {
	if (!redis.isOpen) {
		await redis.connect();
		console.log(`Redis (normal) connected`);
	}
}
