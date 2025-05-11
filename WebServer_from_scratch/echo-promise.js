const net = require("net");
const { buffer } = require("stream/consumers");
// const socket = net.Socket()

const soInit = (socket) => {
  const conn = {
    socket: socket,
    reader: null,
    ended: Boolean,
    err: Error,
  };

  socket.on("data", (data) => {
    console.assert(conn.reader);
    socket.pause(); //Pause recieving more data until we're ready
    conn.reader.resolve(data); // Resolves the pending promise
    conn.reader = null;
  });

  socket.on("end", () => {
    conn.ended = true;
    if (conn.reader) {
      conn.reader.resolve(buffer.from(""));
      conn.reader = null;
    }
  });

  socket.on("error", (error) => {
    conn.err = error;
    if (conn.reader) {
      conn.reader.reject(err);
      conn.reader = null;
    }
  });

  return conn;
};

const soRead = (conn) => {
  console.assert(!conn.reader); //Ensure no other read is in progress
  return new Promise((resolve, reject) => {
    // If the connection is not readable, complete new promise
    if (conn.err) {
      reject(conn.err);
      return;
    }
    if (conn.ended) {
      resolve(buffer.from("")); //EOF
      return;
    }
    conn.reader = { resolve, reject };
    conn.socket.resume();
  });
};

const soWrite = (conn, data) => {
  console.assert(data.length > 0);
  return new Promise((resolve, reject) => {
    if (conn.err) {
      reject(conn.err);
      return;
    }
    conn.socket.write(data, (err) => {
      if (err) {
        reject();
      } else {
        resolve();
      }
    });
  });
};
const serveClient = async (socket) => {
  socket = net.Socket;
  const conn = soInit(socket);
  while (true) {
    const data = await soRead(conn);
    if (data.length === 0) {
      console.log("ended connection");
      return;
    }
    console.log("data", data);
    soWrite(conn, data);
  }
};
// Async/await way
const newConn = async (socket) => {
  socket = net.Socket;
  console.log("new connection", socket.remoteAddress, socket.remotePort);
  try {
    await serveClient(socket);
  } catch (exc) {
    console.error("exc", exc);
  } finally {
    socket.destroy();
  }
};

const server = net.createConnection({
  pauseOnConnect: true,
});

// The code to use the socket now becomes straightforward. There are no callbacks to interrupt the application logic.

// Note that the newConn async function is not awaited anywhere. It is simply invoked as a callback of the listening socket. This means that multiple connections are handled concurrently.

// Exercise for the reader: convert the “accept” primitive to promise-based.

const TCPListener = {
  socket: net.Socket,
  // ...
};

function soListen() {}
function soAccept(listener) {
  try {
  } catch (error) {}
}

// Backpressure in TCP: Flow Control
// Backpressure in TCP is known as flow control.

// The consumer’s TCP stack stores incoming data in a receive buffer for the application to consume.
// The amount of data the producer’s TCP stack can send is bounded by a window known to the producer’s TCP stack, and it will pause sending data when the window is full.
// The consumer’s TCP stack manages the window; when the app drains from the receive buffer, it moves the window forward and notifies the producer’s TCP stack to resume sending.
// The effect of flow control: TCP can pause and resume transmission so that the consumer’s receive buffer is bounded.

// This is why it's so important in Node.js when creating a TCP.
// Using callbacks it can be hard to track the order of code execution,
// so promises help eliminate this
