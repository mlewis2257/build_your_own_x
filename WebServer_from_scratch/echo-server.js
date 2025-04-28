const net = require("net");
const socket = net.Socket;

// Accepts new connections and listens on port
const newConn = () => {
  console.log("New Connection", socket.remoteAddress, socket.remotePort);

  // Read and Write data
  socket.on("end", () => {
    // FIN Received, connection will be closed
    console.log("EOF.");
  });
  // Closes the connection
  server.on("data", (data) => {
    console.log("data", data);
    socket.write(data); // echos back the data

    //actively close the connection if data contains 'q'
    if (data.includes("q")) {
      console.log("closing.");
      socket.end();
    }
  });
};

let server = net.createServer();
server.on("error", (err) => {
  console.log(err);
});
server.on("connection", newConn);
server.listen({
  host: "127.0.0.1",
  port: "8080",
});
