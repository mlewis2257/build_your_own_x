const { Buffer } = require("buffer");

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

// Because in node.js Buffer is a fixed length concat new data to the end of the buffer becomes O(n^2)
// because you have to copy the old data and add the newData each time through which grows exponentially
// Dynamic buffers grow to add more space then needed each time,
// so you only copy the old buffer occasionally
