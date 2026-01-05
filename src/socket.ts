import { Server } from "socket.io";
import type { Server as HttpServer } from "http";

export const initSocket = (server: HttpServer) => {
	const io = new Server(server, { cors: { origin: "*" } });

	io.on("connection", (socket) => {
		console.log("Socket connected", socket.id);

		socket.on("send_message", (data) => {
			console.log("message received: ", data);

			io.emit("receive_message", data);
		});

		socket.on("disconnect", () => {
			console.log("Socket disconnected", socket.id);
		});
	});

	return io;
};
