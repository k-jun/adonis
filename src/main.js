import { serve } from "https://deno.land/std@0.166.0/http/server.ts";
import { Server } from "https://deno.land/x/socket_io@0.2.0/mod.ts";
import { Application } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { Room } from "./room.js";

const app = new Application();
const room = new Room();
room.GameStart();

app.use(async (context, next) => {
  try {
    await context.send({
      root: `${Deno.cwd()}/static`,
      index: "index.html",
    });
  } catch {
    await next();
  }
});

const io = new Server();

io.on("connection", (socket) => {
  room.join(socket);
  room.refresh();

  socket.on("disconnect", () => {
    room.leave(socket);
  });

  socket.on("rename", (name) => {
    room.rename(socket, name);
    room.refresh();
  });

  socket.on("switch", () => {
    room.switch(socket);
    room.refresh();
  });

  socket.on("reset", async () => {
    await room.GameStart();
    room.refresh();
  });

  socket.on("level", (level) => {
    room.setLevel(level);
    room.refresh();
  });

  socket.on("flip", (cardId) => {
    room.flip(cardId);
    room.refresh();
  });
});

const handler = io.handler(async (req) => {
  return (await app.handle(req)) || new Response(null, { status: 404 });
});

await serve(handler, {
  port: 8080,
});
