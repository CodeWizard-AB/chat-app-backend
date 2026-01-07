import { createClient } from "redis";

export const redis = createClient({
	username: process.env.REDIS_USERNAME as string,
	password: process.env.REDIS_PASSWORD as string,
	socket: {
		host: process.env.REDIS_HOST as string,
		port: process.env.REDIS_PORT as unknown as number,
	},
});

redis.on("connect", () => {
	console.log("Redis connected");
});

redis.on("ready", () => {
	console.log("Redis connected");
});

redis.on("error", (err) => {
	console.error("Redis error", err);
});
