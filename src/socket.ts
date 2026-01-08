import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import { Message } from "./modules/chat/message.model";
import { redis } from "./config/redis";
import { CHANNELS, pubClient, subClient } from "./config/redis-pub-sub";

export const isUserOnline = async (userId: string) => {
	const socketId = await redis.hGet("online_users", userId);
	return socketId || null;
};

export const initSocket = (server: HttpServer) => {
	const io = new Server(server, { cors: { origin: "*" } });

	io.use((socket, next) => {
		const userId = socket.handshake.headers.userid;

		if (!userId) {
			return next(new Error("Authentication error"));
		}

		socket.data.userId = userId;
		next();
	});

	io.on("connection", async (socket) => {
		const userId = socket.data.userId;
		const socketId = socket.id;

		await redis.hSet("online_users", userId, socketId);

		socket.broadcast.emit("user_status", {
			userId,
			status: "online",
		});

		// * finding pending messages
		const pendingMessages = await Message.find({
			receiverId: userId,
			status: "sent",
		});

		for (const message of pendingMessages) {
			socket.emit("receive_message", message);

			await Message.findByIdAndUpdate(message._id, {
				status: "delivered",
			});
		}

		socket.on("typing", ({ chatId, userId }) => {
			socket.to(chatId).emit("typing", userId);
		});

		socket.on("send_message", async (data) => {
			const senderId = socket.data.userId;
			const { chatId, receiverId, text } = data;

			// * save message
			// const message = await Message.create({
			// 	chatId,
			// 	senderId,
			// 	message: text,
			// 	status: "sent",
			// });

			// * emit to sender immediately
			socket.emit("message_sent", text);

			// * emit to receiver
			const receiverSocketId = await isUserOnline(receiverId);

			if (receiverSocketId) {
				// io.to(receiverSocketId).emit("receive_message", text);
				await pubClient.publish(CHANNELS.MESSAGE, JSON.stringify(data));

				// await Message.findByIdAndUpdate(message._id, {
				// 	status: "delivered",
				// });
			}

			// * emit to sender
			socket.emit("message_status", {
				messageId: "message_id",
				status: "sent",
			});
		});

		socket.on("join_chat", (chatId) => {
			socket.join(chatId);
			console.log("Socket joined chat", socket.id, chatId);
		});

		socket.on("chat_opened", async ({ chatId }) => {
			const userId = socket.data.userId;

			// * find unseen message send to the user
			const unseenMessages = await Message.find({
				chatId,
				senderId: { $ne: userId },
				status: { $ne: "read" },
			});

			if (!unseenMessages.length) return;

			// * update message status
			await Message.updateMany(
				{ chatId, senderId: { $ne: userId }, status: { $ne: "read" } },
				{ status: "read" }
			);

			// * notify senders
			unseenMessages.forEach(async (message) => {
				const senderSocketId = await isUserOnline(message.senderId.toString());

				if (senderSocketId) {
					io.to(senderSocketId).emit("message_seen", {
						messageId: message._id,
						chatId,
					});
				}
			});
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
