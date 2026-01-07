import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import { Message } from "./modules/chat/message.model";
import { Chat } from "./modules/chat/chat.model";
import { redis } from "./config/redis";

export const initSocket = (server: HttpServer) => {
	const io = new Server(server, { cors: { origin: "*" } });

	io.on("connection", (socket) => {
		console.log("Socket connected", socket.id);

		socket.on("user_online", async (userId) => {
			socket.data.userId = userId;
			await redis.hSet("online_users", userId, socket.id);

			socket.broadcast.emit("user_status", {
				userId,
				status: "online",
			});
		});

		socket.on("typing", ({chatId, userId}) => {
			socket.to(chatId).emit("typing", userId);
		});

		socket.on("send_message", async (data) => {
			const { chatId, senderId, text } = data;

			const message = await Message.create({
				chatId,
				senderId,
				message: text,
			});

			await Chat.findByIdAndUpdate(chatId, {
				lastMessage: message._id,
			});

			io.to(chatId).emit("receive_message", data);
		});

		socket.on("join_chat", (chatId) => {
			socket.join(chatId);
			console.log("Socket joined chat", socket.id, chatId);
		});

		socket.on("disconnect", async () => {
			console.log("Socket disconnected", socket.id);

			const userId = socket.data.userId;

			if (userId) {
				await redis.hDel("online_users", userId);

				socket.broadcast.emit("user_status", {
					userId,
					status: "offline",
				});
			}
		});
	});

	return io;
};
