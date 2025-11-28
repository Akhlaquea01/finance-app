
import connectDB from "./db/index.js";
import { app } from './app.js';
import { setupWebSocketServer } from "./utils/websocket.js";

connectDB()
    .then(() => {
        // Setup WebSocket server
        const { server, io } = setupWebSocketServer(app);

        const port = process.env.PORT || 8000;
        server.listen(port, () => {
            console.log(`⚙️ Server is running at port : ${port}`);
        });
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err);
    })