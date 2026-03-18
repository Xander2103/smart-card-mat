import { leds } from "../../transport/ledClient";

export async function triggerInvalidActionLed(seatIndex) {
  await leds.error(seatIndex);
}

export async function triggerTrickWinnerLed(seatIndex) {
  await leds.trickWin(seatIndex);
}

export async function triggerScanOkLed(seatIndex) {
  await leds.scanOk(seatIndex);
}