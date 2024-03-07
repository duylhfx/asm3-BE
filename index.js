const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const { PORT, URI, SECRET_KEY } = process.env;
const http = require("http").createServer(app);
const compression = require("compression");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

// router module
const mainRouter = require("./router/mainRouter");
const productRouter = require("./router/productsRouter");
const orderRouter = require("./router/ordersRouter");
const adminRouter = require("./router/adminRouter");

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ["POST", "PUT", "GET", "DELETE"],
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: false }));
app.use("/images", express.static("images"));
app.use(express.json());
app.use(cookieParser());
app.use(compression());
app.use(helmet());

// middleware to auth user has token
function authToken(req, res, next) {
  // auth user by token jwt
  const token = req.cookies.jwt;
  if (token) {
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      req.user = decoded;
    } catch (err) {
      console.log(err);
    }
  }
  next();
}
// router associate
app.use(authToken);
app.use(mainRouter);
app.use("/products", productRouter);
app.use("/orders", orderRouter);
app.use("/admin", adminRouter);

// connect to server
mongoose
  .connect(URI)
  .then(() => {
    http.listen(PORT || 5000, () => console.log(`PORT ${PORT} connected!`));
    const io = require("./util/socket").init(http);

    io.on("connection", (socket) => {
      //joining a room
      socket.on("joinRoom", ({ chatId }) => {
        const data = {
          room: chatId,
          user: socket.id,
        };

        socket.join(data.room);
        // console.log(`User creating a room ${data.room}`);
        // notice user join room
        io.emit("userJoined", data);
      });

      // send a new msg
      socket.on("chatMsg", (data) => {
        console.log(`User ${data.chatId} send a msg ${data.messages}`);
        // Update chat log
        io.to(data.roomId).emit("newMsg", data);
      });

      // user left room
      socket.on("leftRoom", ({ room, chatId }) => {
        socket.leave(room);
        console.log(`User ${chatId} in room ${room} has left`);
        // notice user join room
        io.emit("userLeft", { room, chatId });
      });

      socket.on("disconnect", () => {
        console.log("A user disconnected");
      });
    });
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
