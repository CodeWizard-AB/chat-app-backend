import type { Request, Response } from "express";
import { Message } from "./message.model";
import { Chat } from "./chat.model";

export const getChatMessages = async (req: Request, res: Response) => {
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

export const createChat = async (req: Request, res: Response) => {
	const { participants, isGroup } = req.body;

	if (!participants || participants.length < 2) {
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
