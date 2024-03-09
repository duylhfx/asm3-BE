let io;

module.exports = {
  init: (server) => {
    io = require("socket.io")(server, {
      cors: {
        origin: [
          "https://shopping-website-377c0.web.app",
          "https://shopping-website-377c0.firebaseapp.com",
          "https://admin-page-5fc2b.web.app",
          "https://admin-page-5fc2b.firebaseapp.com",
          "http://localhost:3000",
          "http://localhost:3001",
        ],
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    return io;
  },
  getIo: () => {
    if (!io) {
      throw new Error("Socket Io not initialized");
    }
    return io;
  },
};
