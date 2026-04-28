//lib/bluetooth.js
const SERVICE_UUID = "1234";
const CHARACTERISTIC_UUID = "abcd"; // browser usually normalizes to lowercase

export async function connectToSmartCardMat({ onMessage, onDisconnected } = {}) {
  if (!navigator.bluetooth) {
    throw new Error("Web Bluetooth is not available in this browser.");
  }

  const device = await navigator.bluetooth.requestDevice({
    filters: [{ namePrefix: "SMART_CARD_MAT" }],
    optionalServices: [SERVICE_UUID],
  });

  device.addEventListener("gattserverdisconnected", () => {
    if (onDisconnected) onDisconnected();
  });

  const server = await device.gatt.connect();
  const service = await server.getPrimaryService(SERVICE_UUID);
  const characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);

  await characteristic.startNotifications();

  const handleValueChanged = (event) => {
    const value = event.target.value; // DataView
    const text = new TextDecoder().decode(value.buffer);
    if (onMessage) onMessage(text);
  };

  characteristic.addEventListener("characteristicvaluechanged", handleValueChanged);

  return {
    device,
    server,
    service,
    characteristic,
    disconnect() {
      characteristic.removeEventListener("characteristicvaluechanged", handleValueChanged);
      if (device.gatt?.connected) {
        device.gatt.disconnect();
      }
    },
  };
}