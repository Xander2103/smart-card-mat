export function getLedStateForGame(gameState) {
  if (!gameState) {
    return { base: "OFF" };
  }

  const mode = gameState.gameType;
  if (!mode) {
    return { base: "OFF" };
  }

  if (mode === "dobbelkingen") {
    return mapDobbelkingenLedState(gameState);
  }

  if (mode === "kleurenwiezen") {
    return mapKleurenwiezenLedState(gameState);
  }

  return { base: "OFF" };
}

function mapDobbelkingenLedState(state) {
  if (!state.matchStarted) {
    return { base: "SETUP" };
  }

  if (state.matchWinnerSeatIndex != null) {
    return {
      base: "WINNER",
      seatIndex: state.matchWinnerSeatIndex,
    };
  }

  if (state.phase === "awaiting_choice" && state.currentTurnSeat != null) {
    return {
      base: "EXPECT",
      seatIndex: state.currentTurnSeat,
    };
  }

  if (state.phase === "playing" && state.currentTurnSeat != null) {
    return {
      base: "TURN",
      seatIndex: state.currentTurnSeat,
    };
  }

  return { base: "SETUP" };
}

function mapKleurenwiezenLedState(state) {
  if (!state.matchStarted) {
    return { base: "SETUP" };
  }

  if (state.matchWinnerSeatIndex != null) {
    return {
      base: "WINNER",
      seatIndex: state.matchWinnerSeatIndex,
    };
  }

  if (
    (state.phase === "choose_contract" ||
      state.phase === "choose_trump" ||
      state.phase === "play_card") &&
    state.currentTurnSeat != null
  ) {
    return {
      base: "EXPECT",
      seatIndex: state.currentTurnSeat,
    };
  }

  if (state.currentTurnSeat != null) {
    return {
      base: "TURN",
      seatIndex: state.currentTurnSeat,
    };
  }

  return { base: "SETUP" };
}