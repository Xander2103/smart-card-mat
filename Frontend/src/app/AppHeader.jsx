import { Tabs } from "../ui/tabs";
import { AuthButton } from "../ui/auth/AuthButton";

import { BluetoothIcon } from "./BluetoothIcon";
import { APP_TABS } from "./appTheme";

function HeaderMenuGrid({
  isLandscape,
  isCompact,
  tab,
  playersLocked,
  onSelectTab,
  buttonStyle,
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: isCompact
          ? isLandscape
            ? "repeat(3, minmax(0, 140px))"
            : "repeat(2, minmax(0, 140px))"
          : isLandscape
            ? "repeat(3, minmax(0, 1fr))"
            : "repeat(2, minmax(0, 1fr))",
        justifyContent: "center",
        gap: 12,
        paddingTop: isCompact ? 4 : 0,
      }}
    >
      {APP_TABS.map((item) => {
        const active = tab === item.value;
        const locked = item.value === "players" && playersLocked;

        return (
          <button
            key={item.value}
            onClick={() => onSelectTab(item.value)}
            style={{
              ...buttonStyle,
              minHeight: isCompact ? 58 : 60,
              padding: "12px 10px",
              borderRadius: isCompact ? 16 : 18,
              textAlign: "center",
              fontWeight: 900,
              fontSize: isCompact ? 13 : 14,
              border: active
                ? "1px solid rgba(251, 191, 36, 0.34)"
                : locked
                  ? "1px solid rgba(248,113,113,0.22)"
                  : "1px solid rgba(255,255,255,0.08)",
              background: active
                ? "linear-gradient(180deg, rgba(251, 191, 36, 0.18) 0%, rgba(217, 119, 6, 0.14) 100%)"
                : "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)",
              color: locked ? "#f87171" : active ? "#fde68a" : "#f5efe6",
              textDecoration: locked ? "line-through" : "none",
            }}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

export function AppHeader({
  theme,
  appState,
  authUser,
  onOpenAuth,
  isMobile,
  isLandscape,
  tab,
  setTab,
  playersLocked,
  hasEnoughPlayers,
  lockToast,
  setLockToast,
  bleStatus,
  showBlePanel,
  setShowBlePanel,
  connectBle,
  disconnectBle,
  statusColor,
  bleGlow,
  showMobileMenu,
  setShowMobileMenu,
  mobileCompactHeader,
  mobileTableOnlyMode,
  compactHeaderVisible,
  mobileHeaderExpanded,
  setMobileHeaderExpanded,
}) {
  const handleTabSelect = (nextTab) => {
    if (nextTab === "players" && playersLocked) {
      setLockToast(true);
      return;
    }

    setTab(nextTab);
    setShowMobileMenu(false);
  };

  if (mobileCompactHeader) {
    if (!compactHeaderVisible) {
      return mobileTableOnlyMode ? null : (
        <div style={{ display: "flex", justifyContent: "center", marginTop: -4 }}>
          <button
            onClick={() => setMobileHeaderExpanded(true)}
            style={{
              ...theme.button,
              padding: "7px 14px",
              borderRadius: 999,
              fontSize: 12,
            }}
          >
            Open header
          </button>
        </div>
      );
    }

    return (
      <div
        style={{
          ...theme.panel,
          padding: mobileTableOnlyMode ? 10 : 12,
          display: "grid",
          gap: 10,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr auto",
            alignItems: "center",
            gap: mobileTableOnlyMode ? 8 : 10,
          }}
        >
          <button
            onClick={() => {
              setShowMobileMenu((v) => !v);
              setShowBlePanel(false);
            }}
            style={{
              ...theme.button,
              padding: mobileTableOnlyMode ? "8px 10px" : "10px 12px",
              borderRadius: 16,
              fontSize: mobileTableOnlyMode ? 13 : 14,
            }}
          >
            ☰ Menu
          </button>

          <div style={{ textAlign: "center", minWidth: 0 }}>
            <div
              style={{
                fontWeight: 900,
                fontSize: mobileTableOnlyMode ? 15 : 17,
              }}
            >
              Dobbelkingen
            </div>
            <div
              style={{
                color: "#c8b6a1",
                fontSize: mobileTableOnlyMode ? 11 : 12,
                marginTop: 2,
              }}
            >
              {appState?.phase === "CHOOSING_CONTRACT"
                ? "Contract kiezen"
                : appState?.phase === "CHOOSING_TROEF"
                  ? "Troef kiezen"
                  : "Matchmodus actief"}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 8,
            }}
          >
            <AuthButton
              user={authUser}
              isMobile
              onClick={onOpenAuth}
              theme={theme}
            />

            <button
              onClick={() => {
                setShowBlePanel((v) => !v);
                setShowMobileMenu(false);
              }}
              aria-label={`Bluetooth ${bleStatus}`}
              title={`Bluetooth ${bleStatus}`}
              style={{
                ...theme.button,
                width: mobileTableOnlyMode ? 42 : 46,
                height: mobileTableOnlyMode ? 42 : 46,
                borderRadius: 999,
                padding: 0,
                border: `1px solid ${statusColor}66`,
                background: `${statusColor}14`,
                boxShadow: bleGlow,
                animation:
                  bleStatus !== "connected" ? "blePulseRed 1.8s infinite" : undefined,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <BluetoothIcon size={mobileTableOnlyMode ? 18 : 20} color={statusColor} />
            </button>
          </div>
        </div>

        {showBlePanel ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
            }}
          >
            <button
              onClick={connectBle}
              disabled={bleStatus === "connected" || bleStatus === "connecting..."}
              style={{
                ...theme.button,
                opacity:
                  bleStatus === "connected" || bleStatus === "connecting..." ? 0.55 : 1,
              }}
            >
              Connect BLE
            </button>

            <button
              onClick={disconnectBle}
              disabled={bleStatus !== "connected"}
              style={{
                ...theme.button,
                opacity: bleStatus !== "connected" ? 0.55 : 1,
              }}
            >
              Disconnect
            </button>
          </div>
        ) : null}

        {showMobileMenu ? (
          <HeaderMenuGrid
            isLandscape={isLandscape}
            isCompact
            tab={tab}
            playersLocked={playersLocked}
            onSelectTab={handleTabSelect}
            buttonStyle={theme.button}
          />
        ) : null}

        {lockToast ? (
          <div
            style={{
              borderRadius: 14,
              padding: "8px 10px",
              background: "rgba(127,29,29,0.35)",
              border: "1px solid rgba(248,113,113,0.25)",
              color: "#fee2e2",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            Players zijn vergrendeld terwijl een match bezig is.
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div
      style={{
        ...theme.panel,
        width: "100%",
        padding: isMobile ? 16 : 20,
        display: "grid",
        gap: 14,
        background:
          "linear-gradient(180deg, rgba(39, 27, 21, 0.94) 0%, rgba(28, 20, 16, 0.94) 100%)",
        border: "1px solid rgba(251, 191, 36, 0.18)",
      }}
    >
      <div style={{ display: "grid", gap: 14 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "auto 1fr auto" : "1fr auto",
            alignItems: "center",
            gap: 14,
          }}
        >
          {isMobile ? (
            <button
              onClick={() => {
                setShowMobileMenu((v) => !v);
                setShowBlePanel(false);
              }}
              style={{
                ...theme.button,
                padding: "10px 12px",
                borderRadius: 16,
                justifySelf: "start",
              }}
            >
              ☰ Menu
            </button>
          ) : (
            <div style={{ minWidth: 0 }}>
              <h1 style={{ margin: 0, fontSize: 34 }}>Smart Card Mat</h1>
              <div style={{ marginTop: 6, color: "#c8b6a1", maxWidth: "100%" }}>
                RFID kaartdetectie, spelmodi en live scoring in een donkere tavern
                card-table look.
              </div>
            </div>
          )}

          {isMobile ? (
            <div style={{ minWidth: 0, textAlign: "center" }}>
              <h1 style={{ margin: 0, fontSize: 24, lineHeight: 1.05 }}>
                Smart
                <br />
                Card Mat
              </h1>
            </div>
          ) : null}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 10,
              justifySelf: "end",
            }}
          >
            <AuthButton
              user={authUser}
              isMobile={isMobile}
              onClick={onOpenAuth}
              theme={theme}
            />

            <button
              onClick={() => {
                setShowBlePanel((v) => !v);
                if (isMobile) setShowMobileMenu(false);
              }}
              aria-label={`Bluetooth ${bleStatus}`}
              title={`Bluetooth ${bleStatus}`}
              style={{
                ...theme.button,
                width: isMobile ? 48 : "auto",
                minWidth: isMobile ? 48 : 150,
                height: isMobile ? 48 : 52,
                borderRadius: 999,
                padding: isMobile ? 0 : "0 16px",
                border: `1px solid ${statusColor}66`,
                background: `${statusColor}14`,
                boxShadow: bleGlow,
                animation:
                  bleStatus !== "connected" ? "blePulseRed 1.8s infinite" : undefined,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
            >
              <BluetoothIcon size={isMobile ? 20 : 22} color={statusColor} />
              {!isMobile ? <span style={{ fontWeight: 900 }}>Bluetooth</span> : null}
            </button>
          </div>
        </div>

        {showBlePanel ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr 1fr" : "auto auto auto",
              justifyContent: isMobile ? undefined : "start",
              gap: 10,
              alignItems: "center",
            }}
          >
            <div
              style={{
                borderRadius: 999,
                padding: "8px 12px",
                border: `1px solid ${statusColor}44`,
                background: `${statusColor}12`,
                boxShadow: bleGlow,
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                fontWeight: 800,
                justifyContent: "center",
              }}
            >
              <BluetoothIcon size={16} color={statusColor} />
              {bleStatus}
            </div>

            <button
              onClick={connectBle}
              disabled={bleStatus === "connected" || bleStatus === "connecting..."}
              style={{
                ...theme.button,
                opacity:
                  bleStatus === "connected" || bleStatus === "connecting..." ? 0.55 : 1,
              }}
            >
              Connect BLE
            </button>

            <button
              onClick={disconnectBle}
              disabled={bleStatus !== "connected"}
              style={{
                ...theme.button,
                opacity: bleStatus !== "connected" ? 0.55 : 1,
              }}
            >
              Disconnect
            </button>
          </div>
        ) : null}

        {isMobile ? (
          showMobileMenu ? (
            <HeaderMenuGrid
              isLandscape={isLandscape}
              tab={tab}
              playersLocked={playersLocked}
              onSelectTab={handleTabSelect}
              buttonStyle={theme.button}
            />
          ) : null
        ) : (
          <Tabs
            value={tab}
            onChange={handleTabSelect}
            items={APP_TABS.map((item) => ({
              value: item.value,
              label:
                item.value === "players" ? (
                  <span
                    style={
                      playersLocked
                        ? { color: "#f87171", textDecoration: "line-through" }
                        : undefined
                    }
                  >
                    {item.label}
                  </span>
                ) : (
                  item.label
                ),
            }))}
          />
        )}

        {!hasEnoughPlayers ? (
          <div
            style={{
              borderRadius: 16,
              padding: "10px 12px",
              background: "rgba(127, 29, 29, 0.35)",
              border: "1px solid rgba(248, 113, 113, 0.25)",
              color: "#fee2e2",
              fontWeight: 700,
            }}
          >
            Kies eerst exact 4 spelers in de Players tab voordat je een match start.
          </div>
        ) : null}

        {lockToast ? (
          <div
            style={{
              borderRadius: 16,
              padding: "10px 12px",
              background: "rgba(180, 83, 9, 0.18)",
              border: "1px solid rgba(251, 191, 36, 0.22)",
              color: "#fde68a",
              fontWeight: 700,
            }}
          >
            Players zijn vergrendeld terwijl een match bezig is.
          </div>
        ) : null}
      </div>
    </div>
  );
}