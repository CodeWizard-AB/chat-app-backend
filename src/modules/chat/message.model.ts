import { model, Schema, Types } from "mongoose";

enum Status {
	SENT = "sent",
	DELIVERED = "delivered",
	READ = "read",
}

const messageSchema = new Schema(
	{
		chatId: {
			type: Types.ObjectId,
			ref: "Chat",
			required: true,
		},
		senderId: {
			type: Types.ObjectId,
			ref: "User",
			required: true,
		},
		receiverId: {
			type: Types.ObjectId,
			ref: "User",
			required: true,
		},
		message: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			enum: Object.values(Status),
			default: Status.SENT,
		},
	},
	{
		timestamps: true,
	}
);

export const Message = model("Message", messageSchema);
