import {
  ConnectedSocket,
  OnConnect,
  SocketController,
  SocketIO,
} from "socket-controllers";
import { Socket, Server } from "socket.io";

// Class for any new socket connection 
// onConnect method to handle any new connections to the server.
@SocketController()
export class MainController {
  @OnConnect()
  public onConnection(
    @ConnectedSocket() socket: Socket,
    @SocketIO() io: Server
  ) {
    console.log("New Socket connected: ", socket.id);

    socket.on("custom_event", (data: any) => {
      console.log("Data: ", data);
    });
  }
}
