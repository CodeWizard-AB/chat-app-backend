import express from "express";
import cors from "cors";

// * express app
const app = express();

// * middlewares
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
	res.send("Chat server is running 🚀");
});

export default app;
