import { clearLedCharacteristic, setLedCharacteristic, leds } from "./ledClient";

const DEVICE_NAME_PREFIX = "SmartCardMat";
const SERVICE_UUID = "12345678-1234-1234-1234-1234567890ab";
const CHARACTERISTIC_UUID = "abcd1234-1234-1234-1234-1234567890ab";

export async function connectBluetooth({ onLine, onDisconnected } = {}) {
  if (!navigator.bluetooth) {
    throw new Error("Web Bluetooth is not available in this browser.");
  }

  const device = await navigator.bluetooth.requestDevice({
    filters: [{ namePrefix: DEVICE_NAME_PREFIX }],
    optionalServices: [SERVICE_UUID],
  });

  const handleDisconnected = () => {
    clearLedCharacteristic();

    if (onDisconnected) {
      onDisconnected();
    }
  };

  device.addEventListener("gattserverdisconnected", handleDisconnected);

  const server = await device.gatt.connect();
  const service = await server.getPrimaryService(SERVICE_UUID);
  const characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);

  await characteristic.startNotifications();

  const handleValueChanged = (event) => {
    const dataView = event.target.value;
    const text = new TextDecoder().decode(dataView.buffer).trim();

    if (!text) return;

    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    for (const line of lines) {
      if (onLine) {
        onLine(line);
      }
    }
  };

  characteristic.addEventListener(
    "characteristicvaluechanged",
    handleValueChanged
  );

  setLedCharacteristic(characteristic);

  await leds.connected();
  await leds.intro();
  await leds.setup();

  return {
    device,
    server,
    service,
    characteristic,

    async disconnect() {
      characteristic.removeEventListener(
        "characteristicvaluechanged",
        handleValueChanged
      );

      device.removeEventListener(
        "gattserverdisconnected",
        handleDisconnected
      );

      clearLedCharacteristic();

      if (device.gatt?.connected) {
        device.gatt.disconnect();
      }
    },
  };
}