// Web Serial transport: leest lijnen van een serial device (ESP32/Arduino)
// en roept onLine(line) op per complete regel.

export async function connectSerial({ onLine, baudRate = 115200 } = {}) {
  if (!("serial" in navigator)) {
    throw new Error("Web Serial is not supported in this browser. Use Chrome/Edge.");
  }

  const port = await navigator.serial.requestPort();
  await port.open({ baudRate });

  const decoder = new TextDecoderStream();
  const readableStreamClosed = port.readable.pipeTo(decoder.writable);
  const reader = decoder.readable.getReader();

  let buffer = "";

  async function readLoop() {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += value;

      let idx;
      while ((idx = buffer.indexOf("\n")) >= 0) {
        const line = buffer.slice(0, idx).replace("\r", "");
        buffer = buffer.slice(idx + 1);
        if (line.trim()) onLine?.(line.trim());
      }
    }
  }

  readLoop();

  return {
    async disconnect() {
      try {
        reader.releaseLock();
      } catch {}
      try {
        await readableStreamClosed;
      } catch {}
      try {
        await port.close();
      } catch {}
    },
  };
}