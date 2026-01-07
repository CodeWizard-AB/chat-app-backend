import http from "http";
import app from "./app";
import { initSocket } from "./socket";
import { connectDB } from "./config/db";

// * http server
const server = http.createServer(app);

// * database
connectDB();

// * socket
initSocket(server);

// * server listening
server.listen(3000, () =>
	console.log("Chat server is running on http://localhost:3000")
);
