const net = require("net");
const socket = net.Socket;

socket.destroy("error", () => {
  console.log("This connection has been destroyed");
});
// Half open connection so one side is able to send data and the other can only receive
let server = net.createServer({ allowHalfOpen: true });
