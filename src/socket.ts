import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import { Message } from "./modules/chat/message.model";
import { redis } from "./config/redis";
import { CHANNELS, pubClient, subClient } from "./config/redis-pub-sub";
import { Chat } from "./modules/chat/chat.model";

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

	subClient.subscribe(CHANNELS.MESSAGE, async (data) => {
		const { receiverId, message } = JSON.parse(data);

		const socketId = await isUserOnline(receiverId);
		if (!socketId) return;

		io.to(socketId).emit("receive_message", message);

		await Message.findByIdAndUpdate(message._id, {
			status: "delivered",
		});
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

		socket.on("join_chat", async (chatId: string) => {
			const chat = await Chat.findById(chatId);
			if (!chat) return;

			const isParticipant = chat.participants.some(
				(id) => id.toString() === userId
			);
			if (!isParticipant) return;

			socket.join(chatId);
		});

		socket.on("typing", ({ chatId, userId }) => {
			socket.to(chatId).emit("typing", userId);
		});

		socket.on("send_message", async (data) => {
			// * get data
			const senderId = socket.data.userId;
			const { chatId, receiverId, text } = data;

			// * check if chat exists
			const chat = await Chat.findById(chatId);
			if (!chat) return;

			// * save message
			const message = await Message.create({
				chatId,
				senderId,
				receiverId,
				message: text,
				status: "sent",
			});

			// * emit to sender immediately
			socket.emit("message_sent", text);

			// * find receiver
			const receivers = chat.participants.filter(
				(id) => id.toString() !== senderId
			);
			if (!receivers.length) return;

			for (const receiverId of receivers) {
				await pubClient.publish(
					CHANNELS.MESSAGE,
					JSON.stringify({
						receiverId: receiverId.toString(),
						message,
					})
				);
			}

			// * emit to sender
			socket.emit("message_status", {
				messageId: "message_id",
				status: "sent",
			});
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

			// * notify unseen messages
			for (const msg of unseenMessages) {
				await pubClient.publish(
					CHANNELS.SEEN,
					JSON.stringify({
						senderId: msg.senderId.toString(),
						messageId: msg._id,
					})
				);
			}
		});

		socket.on("disconnect", async () => {
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
