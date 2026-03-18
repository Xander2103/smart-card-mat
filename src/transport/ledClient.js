let ledCharacteristic = null;

export function setLedCharacteristic(characteristic) {
  ledCharacteristic = characteristic;
}

export function clearLedCharacteristic() {
  ledCharacteristic = null;
}

async function sendLedCommand(command) {
  if (!ledCharacteristic) {
    console.warn("LED: no characteristic available");
    return;
  }

  const encoder = new TextEncoder();
  await ledCharacteristic.writeValue(encoder.encode(`${command}\n`));
  console.log("LED OUT:", command);
}

export const leds = {
  off() {
    return sendLedCommand("LED|BASE|OFF");
  },

  setup() {
    return sendLedCommand("LED|BASE|SETUP");
  },

  turn(seatIndex) {
    if (seatIndex == null || seatIndex < 0) return;
    return sendLedCommand(`LED|BASE|TURN|${seatIndex + 1}`);
  },

  expect(seatIndex) {
    if (seatIndex == null || seatIndex < 0) return;
    return sendLedCommand(`LED|BASE|EXPECT|${seatIndex + 1}`);
  },

  centerExpect(seatIndex) {
    if (seatIndex == null || seatIndex < 0) return;
    return sendLedCommand(`LED|BASE|CENTER_EXPECT|${seatIndex + 1}`);
  },

  winner(seatIndex) {
    if (seatIndex == null || seatIndex < 0) return;
    return sendLedCommand(`LED|BASE|WINNER|${seatIndex + 1}`);
  },

  connected() {
    return sendLedCommand("LED|FX|CONNECTED");
  },

  intro() {
    return sendLedCommand("LED|FX|INTRO");
  },

  scanOk(seatIndex) {
    if (seatIndex == null || seatIndex < 0) return;
    return sendLedCommand(`LED|FX|SCAN_OK|${seatIndex + 1}`);
  },

  error(seatIndex) {
    if (seatIndex == null || seatIndex < 0) return;
    return sendLedCommand(`LED|FX|ERROR|${seatIndex + 1}`);
  },

  trickWin(seatIndex) {
    if (seatIndex == null || seatIndex < 0) return;
    return sendLedCommand(`LED|FX|TRICK_WIN|${seatIndex + 1}`);
  },
};