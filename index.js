import { createServer } from "http";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3006",
    methods: ["GET", "POST"],
  },
});

io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  if (!username) {
    return next(new Error("Invalied username"));
  }
  socket.username = username;
  socket.useId = uuidv4();
  next();
});
io.on("connection", async (socket) => {
  //socket event
  const users = [];
  for (let [id, socket] of io.of("/").sockets) {
    users.push({
      userId: socket.useId,
      username: socket.username,
    });
  }
  socket.emit("users", users);
  socket.emit("session", { userId: socket.useId, username: socket.username });
  socket.broadcast.emit("user connected", {
    userId: socket.useId,
    username: socket.username,
  });
  socket.on("new message",(message)=>{
    socket.broadcast.emit("new message",{
      userId: socket.userId,
      username: socket.username,
      message,
    })
  })
});
console.log("Listening to port....");
httpServer.listen(process.env.PORT || 4000);
