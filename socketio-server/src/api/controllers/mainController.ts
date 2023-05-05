import {
  ConnectedSocket,
  OnConnect,
  SocketController,
  SocketIO,
} from "socket-controllers";
import { Socket, Server } from "socket.io";


// Import necessary decorators and classes
@SocketController()
export class MainController {

  // Handle connection event
  @OnConnect()
  public onConnection(
    @ConnectedSocket() socket: Socket, // Get the connected socket object
    @SocketIO() io: Server // Get the socket.io server object
  ) {
    console.log("New Socket connected: ", socket.id); // Log the socket ID to the console

    // Listen for a custom event on this socket
    socket.on("custom_event", (data: any) => {
      console.log("Data: ", data); // Log the received data to the console
    });
  }
}

