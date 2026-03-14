import { useCallback, useRef, useState } from "react";

import { connectBluetooth } from "../transport/bluetoothTransport";
import { playUiSound } from "../lib/uiSound";

export function useBluetoothConnection(handleLine) {
  const [bleStatus, setBleStatus] = useState("disconnected");
  const [bleConn, setBleConn] = useState(null);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);

  const hadBleConnectionRef = useRef(false);
  const manualBleDisconnectRef = useRef(false);

  const connectBle = useCallback(async () => {
    try {
      setBleStatus("connecting...");

      const conn = await connectBluetooth({
        onLine: handleLine,
        onDisconnected: () => {
          const wasManual = manualBleDisconnectRef.current;
          manualBleDisconnectRef.current = false;
          setBleConn(null);
          setBleStatus("disconnected");
          if (hadBleConnectionRef.current && !wasManual) {
            setShowDisconnectModal(true);
            playUiSound("disconnect");
          }
        },
      });

      manualBleDisconnectRef.current = false;
      hadBleConnectionRef.current = true;
      setBleConn(conn);
      setBleStatus("connected");
    } catch (error) {
      console.error(error);
      manualBleDisconnectRef.current = false;
      setBleStatus("error");
      alert(error?.message ?? "Failed to connect Bluetooth");
    }
  }, [handleLine]);

  const disconnectBle = useCallback(async () => {
    if (!bleConn) return;

    manualBleDisconnectRef.current = true;

    try {
      await bleConn.disconnect();
    } catch (error) {
      console.error(error);
    }

    setBleConn(null);
    setBleStatus("disconnected");
  }, [bleConn]);

  return {
    bleStatus,
    connectBle,
    disconnectBle,
    showDisconnectModal,
    setShowDisconnectModal,
  };
}
