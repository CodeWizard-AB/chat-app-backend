import express from "express";
import cors from "cors";
import chatRoutes from "./modules/chat/chat.route";

// * express app
const app = express();

// * middlewares
app.use(cors());
app.use(express.json());

// * routes
app.use("/api/chats", chatRoutes);

app.get("/", (req, res) => {
	res.send("Chat server is running 🚀");
});

export default app;
