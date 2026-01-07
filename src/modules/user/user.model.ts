import { model, Schema } from "mongoose";

enum Status {
	ACTIVE = "active",
	INACTIVE = "inactive",
}

const userSchema = new Schema(
	{
		name: { type: String, required: true },
		phone: { type: String, required: true },
		status: {
			type: String,
			enum: Object.values(Status),
			default: Status.ACTIVE,
		},
	},
	{ timestamps: true }
);

export const User = model("User", userSchema);
