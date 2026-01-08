import type { Request, Response } from "express";
import { Message } from "./message.model";

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
