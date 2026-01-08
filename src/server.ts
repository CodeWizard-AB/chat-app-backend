import http from "http";
import app from "./app";
import { initSocket } from "./socket";
import { connectDB } from "./config/db";
import { connectRedis } from "./config/redis";
import { connectPubSub } from "./config/redis-pub-sub";
import env from "./config/env";

async function bootstrap() {
	await connectDB();
	await connectRedis();
	await connectPubSub();

	const server = http.createServer(app);
	initSocket(server);

	server.listen(env.PORT, () => {
		console.log(`Server is running on port ${env.PORT}`);
	});
}

bootstrap();
