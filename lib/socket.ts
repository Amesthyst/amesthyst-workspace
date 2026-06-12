import { Server } from "socket.io";

export function initSocket(server: any) {
  if (!server.io) {
    const io = new Server(server, {
      path: "/api/socket",
    });

    server.io = io;

    io.on("connection", (socket) => {
      console.log("User connected:", socket.id);

      socket.on("join-project", (projectId) => {
        socket.join(projectId);
      });

      socket.on("task-updated", (projectId) => {
        io.to(projectId).emit("refresh-project");
      });
    });
  }
}