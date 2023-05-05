import { io, Socket } from "socket.io-client";
import { DefaultEventsMap } from '@socket.io/component-emitter';

// Manage different socket connections, disconnections
// will use SocketService for any commication between front and back end


class SocketService {
  // A property to hold the socket object, initially set to null
  public socket: Socket | null = null;

  // A method to establish a connection to the server and return a socket object
  public connect(
    url: string
  ): Promise<Socket<DefaultEventsMap, DefaultEventsMap>> {
    // Return a promise to handle the async connection process
    return new Promise((rs, rj) => {
      // Create a socket object using the io() function and the provided URL
      this.socket = io(url);

      // If the socket object couldn't be created, reject the promise and exit
      if (!this.socket) return rj();

      // When the socket is connected to the server, resolve the promise and return the socket object
      this.socket.on("connect", () => {
        rs(this.socket as Socket);
      });

      // If there's a connection error, log the error message and reject the promise
      this.socket.on("connect_error", (err) => {
        console.log("Connection error: ", err);
        rj(err);
      });
    });
  }
}



export default new SocketService();