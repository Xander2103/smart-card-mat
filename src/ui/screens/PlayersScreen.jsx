import { useEffect, useMemo, useState } from "react";
import { storageService } from "../../core/storage/services/storageService";
import { useViewport } from "../play/useViewport";
import { PlayersHeader } from "../players/PlayersHeader";
import { CreatePlayerForm } from "../players/CreatePlayerForm";
import { SelectedPlayersSection } from "../players/SelectedPlayersSection";
import { ProfilesSection } from "../players/ProfilesSection";
import { QuickOptionsSection } from "../players/QuickOptionsSection";
import { normalizeSelection, getNextGuestNumber, moveItem, isDevProfileName } from "../players/playersHelpers";
import { panelStyle, actionButtonStyle } from "../players/playersTheme";

export function PlayersScreen({ appState, dispatchAction, locked = false, onGoPlay }) {
  const { isMobile, isLandscape } = useViewport();
  const compactMobile = isMobile;
  const [profiles, setProfiles] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [profileSearch, setProfileSearch] = useState("");
  const [error, setError] = useState("");

  const selectedPlayers = useMemo(
    () => normalizeSelection(appState?.players),
    [appState?.players]
  );

  function refreshProfiles() {
    setProfiles(storageService.getPlayers());
  }

  useEffect(() => {
    refreshProfiles();
  }, []);

  useEffect(() => {
    function handleDataChanged() {
      refreshProfiles();
    }

    window.addEventListener("smartcardmat:data-changed", handleDataChanged);

    return () => {
      window.removeEventListener("smartcardmat:data-changed", handleDataChanged);
    };
  }, []);

  function failWhenLocked() {
    if (!locked) return false;
    setError("Spelers zijn vergrendeld terwijl een match bezig is.");
    return true;
  }

  function handleCreatePlayer(event) {
    event.preventDefault();

    if (failWhenLocked()) return;

    try {
      setError("");
      storageService.createPlayer(newPlayerName);
      setNewPlayerName("");
      refreshProfiles();
    } catch (err) {
      setError(err?.message ?? "Kon speler niet aanmaken.");
    }
  }

  function handleTogglePlayer(profile) {
    if (failWhenLocked()) return;

    const exists = selectedPlayers.some((player) => player.id === profile.id);

    if (exists) {
      const nextPlayers = selectedPlayers.filter(
        (player) => player.id !== profile.id
      );
      dispatchAction({ type: "set_players", players: nextPlayers });
      return;
    }

    if (selectedPlayers.length >= 4) {
      setError("Je kan maximaal 4 spelers selecteren.");
      return;
    }

    const nextPlayers = [
      ...selectedPlayers,
      { id: profile.id, name: profile.name },
    ];

    setError("");
    dispatchAction({ type: "set_players", players: nextPlayers });
  }

  function handleAddGuest() {
    if (failWhenLocked()) return;

    if (selectedPlayers.length >= 4) {
      setError("Je kan maximaal 4 spelers selecteren.");
      return;
    }

    const nextGuestNumber = getNextGuestNumber(selectedPlayers);
    const guestPlayer = {
      id: `guest_${Date.now()}_${nextGuestNumber}`,
      name: `Gast ${nextGuestNumber}`,
      isGuest: true,
    };

    const nextPlayers = [...selectedPlayers, guestPlayer];

    setError("");
    dispatchAction({ type: "set_players", players: nextPlayers });
  }

  function handleClearSelection() {
    if (failWhenLocked()) return;
    dispatchAction({ type: "set_players", players: [] });
  }

  function handleMovePlayerLeft(index) {
    if (failWhenLocked()) return;
    if (index <= 0) return;

    const nextPlayers = moveItem(selectedPlayers, index, index - 1);
    dispatchAction({ type: "set_players", players: nextPlayers });
  }

  function handleMovePlayerRight(index) {
    if (failWhenLocked()) return;
    if (index >= selectedPlayers.length - 1) return;

    const nextPlayers = moveItem(selectedPlayers, index, index + 1);
    dispatchAction({ type: "set_players", players: nextPlayers });
  }

  function handleRemoveSeatPlayer(playerId) {
    if (failWhenLocked()) return;
    const nextPlayers = selectedPlayers.filter((p) => p.id !== playerId);
    dispatchAction({ type: "set_players", players: nextPlayers });
  }

  function handleDeleteProfile(profile) {
    if (failWhenLocked()) return;

    const ok = window.confirm(
      `Ben je zeker dat je het profiel "${profile.name}" wilt verwijderen?`
    );
    if (!ok) return;

    if (typeof storageService.deletePlayer === "function") {
      storageService.deletePlayer(profile.id);
    }

    const nextPlayers = selectedPlayers.filter((p) => p.id !== profile.id);
    dispatchAction({ type: "set_players", players: nextPlayers });

    refreshProfiles();
  }

  function handleDeleteDevData() {
    if (failWhenLocked()) return;

    const ok = window.confirm(
      "Delete all DEV accounts and clear simulated matches? This cannot be undone."
    );
    if (!ok) return;

    const devProfiles = profiles.filter((profile) => isDevProfileName(profile.name));
    const devProfileIds = new Set(devProfiles.map((profile) => profile.id));

    const nextPlayers = selectedPlayers.filter(
      (player) => !devProfileIds.has(player.id) && !isDevProfileName(player.name)
    );

    dispatchAction({ type: "set_players", players: nextPlayers });

    storageService.clearSimulatedMatches();

    for (const profile of devProfiles) {
      if (typeof storageService.deletePlayer === "function") {
        storageService.deletePlayer(profile.id);
      }
    }

    setError("");
    refreshProfiles();
  }

  const filteredProfiles = profiles.filter((profile) =>
    String(profile?.name ?? "").toLowerCase().includes(profileSearch.trim().toLowerCase())
  );

  const profileStats = filteredProfiles.map((profile) => ({
    profile,
    stats: storageService.getPlayerStats(profile.id),
  }));

  const hasDevProfiles = profiles.some((profile) => isDevProfileName(profile.name));

  return (
    <div style={{ display: "grid", gap: compactMobile ? 12 : 16 }}>
      <div style={{ ...panelStyle, padding: compactMobile ? 14 : 20 }}>
        <PlayersHeader
          compactMobile={compactMobile}
          appState={appState}
          hasDevProfiles={hasDevProfiles}
          locked={locked}
          onDeleteDevData={handleDeleteDevData}
          onClearSelection={handleClearSelection}
        />

        <CreatePlayerForm
          compactMobile={compactMobile}
          locked={locked}
          newPlayerName={newPlayerName}
          setNewPlayerName={setNewPlayerName}
          onSubmit={handleCreatePlayer}
        />

        {error ? (
          <div
            style={{
              marginBottom: 14,
              borderRadius: 14,
              padding: "10px 12px",
              background: "rgba(127, 29, 29, 0.55)",
              border: "1px solid rgba(248, 113, 113, 0.35)",
              color: "#fee2e2",
              fontWeight: 700,
            }}
          >
            {error}
          </div>
        ) : null}

        <SelectedPlayersSection
          selectedPlayers={selectedPlayers}
          compactMobile={compactMobile}
          isLandscape={isLandscape}
          locked={locked}
          onRemoveSeatPlayer={handleRemoveSeatPlayer}
          onMovePlayerLeft={handleMovePlayerLeft}
          onMovePlayerRight={handleMovePlayerRight}
          onGoPlay={onGoPlay}
          actionButtonStyle={actionButtonStyle}
        />

        <ProfilesSection
          compactMobile={compactMobile}
          profileSearch={profileSearch}
          setProfileSearch={setProfileSearch}
          profileStats={profileStats}
          selectedPlayers={selectedPlayers}
          locked={locked}
          onTogglePlayer={handleTogglePlayer}
          onDeleteProfile={handleDeleteProfile}
        />

        <QuickOptionsSection
          locked={locked}
          selectedPlayersLength={selectedPlayers.length}
          onAddGuest={handleAddGuest}
        />
      </div>
    </div>
  );
}
