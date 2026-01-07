import { model, Schema, Types } from "mongoose";

const chatSchema = new Schema(
	{
		participants: [{ type: Types.ObjectId, ref: "User" }],
		isGroup: { type: Boolean, default: false },
		lastMessage: { type: Types.ObjectId, ref: "Message" },
	},
	{
		timestamps: true,
	}
);

export const Chat = model("Chat", chatSchema);
