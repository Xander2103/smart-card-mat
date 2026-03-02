// src/transport/serialTransport.js
export async function connectSerial({ baudRate = 115200, onLine, onStatus } = {}) {
  if (!("serial" in navigator)) {
    throw new Error("Web Serial not supported in this browser (use Chrome/Edge).");
  }

  onStatus?.("requesting_port");
  const port = await navigator.serial.requestPort();

  onStatus?.("opening");
  await port.open({ baudRate });

  onStatus?.("connected");

  const textDecoder = new TextDecoderStream();
  const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
  const reader = textDecoder.readable.getReader();

  let buffer = "";

  let cancelled = false;

  async function readLoop() {
    try {
      while (!cancelled) {
        const { value, done } = await reader.read();
        if (done) break;
        if (!value) continue;

        buffer += value;
        let idx;

        while ((idx = buffer.indexOf("\n")) >= 0) {
          const line = buffer.slice(0, idx).trim();
          buffer = buffer.slice(idx + 1);

          if (line.length > 0) onLine?.(line);
        }
      }
    } finally {
      try { reader.releaseLock(); } catch {}
    }
  }

  readLoop();

  async function disconnect() {
    cancelled = true;
    onStatus?.("closing");

    try { await reader.cancel(); } catch {}
    try { await readableStreamClosed; } catch {}
    try { await port.close(); } catch {}

    onStatus?.("disconnected");
  }

  return { port, disconnect };
}