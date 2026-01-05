import http from "http";
import app from "./app";
import { initSocket } from "./socket";

// * http server
const server = http.createServer(app);

// * socket
initSocket(server);

// * server listening
server.listen(3000, () =>
	console.log("Chat server is running on http://localhost:3000")
);
