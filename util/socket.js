let io;

module.exports = {
  init: (server) => {
    io = require("socket.io")(server, {
      cors: {
        origin: ["http://localhost:3000","http://localhost:3001"],
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
