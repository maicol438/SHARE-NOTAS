import { io } from "socket.io-client";
import useAuthStore from "../stores/useAuthStore.js";
import toast from "react-hot-toast";

let socket = null;

export const connectSocket = () => {
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  if (!token || socket?.connected) return;

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

  socket = io(backendUrl, {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {});

  socket.on("comment:new", (data) => {
    toast.success(`💬 ${data.by} comentó en "${data.noteTitle}"`, {
      duration: 4000,
    });
  });

  socket.on("note:shared", (data) => {
    toast.success(`📝 ${data.sharedBy} compartió "${data.noteTitle}" contigo`, {
      duration: 4000,
    });
  });

  socket.on("disconnect", () => {});

  socket.on("connect_error", (err) => {
    if (err.message === "Authentication required" || err.message === "Invalid token") {
      socket.disconnect();
      socket = null;
    }
  });
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
