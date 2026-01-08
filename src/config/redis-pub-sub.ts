import { createClient } from "redis";
import { redis } from "./redis";
import env from "./env";

export const pubClient = createClient({
	username: env.REDIS_USERNAME,
	password: env.REDIS_PASSWORD,
	socket: {
		host: env.REDIS_HOST,
		port: env.REDIS_PORT,
	},
});
export const subClient = redis.duplicate();

export async function connectPubSub() {
	if (!pubClient.isOpen || !subClient.isOpen) {
		await pubClient.connect();
		await subClient.connect();
		console.log("Reids Pub/Sub connected");
	}
}

export const CHANNELS = {
	MESSAGE: "chat:message",
	STATUS: "chat:status",
	SEEN: "chat:seen",
};
