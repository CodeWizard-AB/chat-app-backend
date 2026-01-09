import type { Request, Response } from "express";
import { Message } from "./message.model";
import { Chat } from "./chat.model";

const getChatMessages = async (req: Request, res: Response) => {
	const { chatId } = req.params;
	const page = Number(req.query.page) || 1;
	const limit = Number(req.query.limit) || 20;

	const message = await Message.find({ chatId })
		.sort({ createdAt: -1 })
		.skip((page - 1) * limit)
		.limit(limit);

	res.json({
		status: "success",
		data: { page, limit, message: message.reverse() },
	});
};

const createChat = async (req: Request, res: Response) => {
	const { participants = [], isGroup = false } = req.body;

	if (!participants.length) {
		return res.status(400).json({ message: "Participants are required" });
	}

	if (!participants.length || participants.length < 2) {
		return res.status(400).json({
			message: "At least 2 participants are required to create a chat",
		});
	}

	if (!isGroup && participants.length === 2) {
		const existingChat = await Chat.findOne({
			isGroup: false,
			participants: { $all: participants },
		});

		if (existingChat) {
			return res.json({
				status: "success",
				data: existingChat,
			});
		}
	}

	const chat = await Chat.create({ participants, isGroup });
	res.status(201).json({ status: "success", data: chat });
};

const getMyChats = async (
	req: Request & { user: { id: string } },
	res: Response
) => {
	const userId = req.user.id;

	const chats = await Chat.find({
		participants: userId,
	})
		.populate("participants", "name phone")
		.sort({ updatedAt: -1 });

	res.status(200).json({ status: "success", data: chats });
};

const addUserToChat = async (req: Request, res: Response) => {
	const { chatId } = req.params;
	const { userId } = req.body;

	const chat = await Chat.findByIdAndUpdate(
		chatId,
		{ $addToSet: { participants: userId } },
		{ new: true }
	);

	res.status(201).json({ status: "success", data: chat });
};

const deleteUserFromChat = async (req: Request, res: Response) => {
	const { chatId } = req.params;
	const { userId } = req.body;

	const chat = await Chat.findByIdAndUpdate(
		chatId,
		{ $pull: { participants: userId } },
		{ new: true }
	);

	res.status(201).json({ status: "success", data: chat });
};

export default {
	createChat,
	getChatMessages,
	getMyChats,
	addUserToChat,
	deleteUserFromChat,
};
