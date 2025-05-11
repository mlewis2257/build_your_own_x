const { Buffer } = require("buffer");
const net = require("net");

function soInit(socket) {
  const conn = {
    socket: socket,
    reader: null,
  };
  socket.on("data", (data) => {
    console.assert(conn.reader);
    socket.pause(); //Pause receiving more data until we're ready
    conn.reader.resolve(data); //give the data to waiting promise
    conn.reader = null;
  });

  return conn;
}

// Reads one chunk of data as a promise
function soRead(conn) {
  console.assert(!conn.reader);
  return new Promise((resolve, reject) => {
    conn.reader = { resolve, reject };
    conn.socket.resume(); //start data flow
  });
}
// Dynamic sized buffer
function createDynamicBuffer(initialCapacity = 32) {
  return {
    data: Buffer.alloc(initialCapacity),
    length: 0,
  };
}

// append data to dynamic buffer
function bufPush(buf, data) {
  const newLength = buf.length + data.length;

  // Resize logic is to grow if needed powers of 2
  if (buf.data.length < newLength) {
    let cap = Math.max(buf.data.length, 32);
    while (cap < newLength) {
      cap *= 2;
    }
    const grown = Buffer.alloc(cap); // Allocate larger buffer
    buf.data.copy(grown, 0, 0); // copy old data into new buffer
    buf.data = grown;
  }
  //   copy new data into buffer at the end
  data.copy(buf.data, buf.length, 0);
  buf.length = newLength;
}

// Attempts to extract full message from buffer (ending with '\n')
function cutMessage(buf) {
  const idx = buf.data.subarray(0, buf.length).indexOf("\n");
  if (idx < 0) return null;
  const msg = Buffer.from(buf.data.subarray(0, idx + 1));
  bufPop(buf, idx + 1);
  return msg;
}

// Removes the used portion of the buffer and shifts the rest to the front
function bufPop(buf, len) {
  buf.data.copyWithin(0, len, buf.length);
  buf.length -= len;
}
// Handles a single TCP client
async function serverClient(socket) {
  const conn = soInit(socket);
  const buf = createDynamicBuffer();

  while (true) {
    const msg = cutMessage(buf);
    if (!msg) {
      const data = await soRead(conn);
      bufPush(buf, data);
      if (data.length === 0) {
        console.log("Client Disconnected");
        return;
      }
      continue;
    }
    if (msg.equals(Buffer.from("quit\n"))) {
      await soWrite(conn, Buffer.from("Bye.\n"));
      socket.destroy();
      return;
    } else {
      const reply = Buffer.concat([Buffer.from("Echo: "), msg]);
      await soWrite(conn, reply);
    }
  }
}

// Because in node.js Buffer is a fixed length concat new data to the end of the buffer becomes O(n^2)
// because you have to copy the old data and add the newData each time through which grows exponentially
// Dynamic buffers grow to add more space then needed each time,
// so you only copy the old buffer occasionally

// The cutMessage() function tells if the message is complete.
// It returns null if not.
// Otherwise, it removes the message and returns it.

function cutMessage(dyn = createDynamicBuffer) {
  // Message are separated by '\n'
  const idx = buf.data.subarray(0);
}
