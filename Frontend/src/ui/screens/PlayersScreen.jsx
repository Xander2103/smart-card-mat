import { useEffect, useMemo, useState } from "react";
import { getFriendsOverview } from "../../core/api/friendApi";
import { storageService } from "../../core/storage/services/storageService";
import { useViewport } from "../play/useViewport";
import { PlayersHeader } from "../players/PlayersHeader";
import { SelectedPlayersSection } from "../players/SelectedPlayersSection";
import {
  getNextGuestNumber,
  moveItem,
  isDevProfileName,
} from "../players/playersHelpers";
import { panelStyle, actionButtonStyle } from "../players/playersTheme";
import { PlayerIdentity } from "../components/PlayerIdentity";
import { ConfirmModal } from "../components/ConfirmModal";

function normalizeSelectedPlayer(player) {
  const id = player?.id ?? player?.playerId ?? `player_${Date.now()}`;
  const name = String(player?.name ?? "").trim();

  return {
    id,
    name,
    username: player?.username ?? null,
    source: player?.source ?? "guest",
    userId: player?.userId ?? null,
    isGuest: player?.isGuest ?? false,
    isLocalProfile: player?.isLocalProfile ?? !player?.isGuest,
  };
}

function normalizeSelectedPlayers(players) {
  if (!Array.isArray(players)) {
    return [];
  }

  return players
    .map(normalizeSelectedPlayer)
    .filter((player) => player.id && player.name)
    .slice(0, 4);
}

function createSelectedPlayerFromAuthUser(user) {
  return {
    id: `user_${user.id}`,
    name: user.name,
    username: user.username,
    source: "user",
    userId: user.id,
    isGuest: false,
    isLocalProfile: false,
  };
}

function createSelectedPlayerFromFriend(friend) {
  return {
    id: `user_${friend.id}`,
    name: friend.name,
    username: friend.username,
    source: "user",
    userId: friend.id,
    isGuest: false,
    isLocalProfile: false,
  };
}

function createSelectedPlayerFromProfile(profile) {
  return {
    id: profile.id,
    name: profile.name,
    source: profile.source ?? "local",
    userId: profile.userId ?? null,
    isGuest: profile.isGuest ?? false,
    isLocalProfile: profile.isLocalProfile ?? true,
  };
}

function createGuestPlayer(selectedPlayers) {
  const nextGuestNumber = getNextGuestNumber(selectedPlayers);

  return {
    id: `guest_${Date.now()}_${nextGuestNumber}`,
    name: `Gast ${nextGuestNumber}`,
    source: "guest",
    userId: null,
    isGuest: true,
    isLocalProfile: false,
  };
}

function isSameAccountPlayer(player, userId) {
  if (!userId) return false;

  const expectedPlayerId = `user_${userId}`;

  const sameUserId =
    player.userId != null && Number(player.userId) === Number(userId);

  const samePlayerId = player.id === expectedPlayerId;

  return sameUserId || samePlayerId;
}

function SectionToggle({ title, subtitle, open, onToggle, rightContent }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        width: "100%",
        border: "1px solid rgba(255,255,255,0.08)",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.025) 100%)",
        color: "#f5efe6",
        borderRadius: 18,
        padding: 14,
        cursor: "pointer",
        display: "grid",
        gridTemplateColumns: "1fr auto",
        alignItems: "center",
        gap: 12,
        textAlign: "left",
      }}
    >
      <div>
        <div style={{ fontWeight: 1000, fontSize: 17 }}>
          {open ? "▾" : "▸"} {title}
        </div>

        {subtitle ? (
          <div
            style={{
              color: "#c8b6a1",
              fontSize: 13,
              marginTop: 4,
              lineHeight: 1.35,
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>

      {rightContent ? <div>{rightContent}</div> : null}
    </button>
  );
}

function AccountSection({
  compactMobile,
  authUser,
  locked,
  selectedPlayers,
  onAddCurrentUser,
}) {
  const selectedFull = selectedPlayers.length >= 4;

  const ownAccountSelected = authUser
    ? selectedPlayers.some((player) => isSameAccountPlayer(player, authUser.id))
    : false;

  return (
    <div
      style={{
        borderRadius: 18,
        padding: compactMobile ? 12 : 14,
        border: "1px solid rgba(251, 191, 36, 0.18)",
        background: "rgba(251, 191, 36, 0.07)",
        display: "grid",
        gap: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={{ minWidth: 0 }}>
          {authUser ? (
            <PlayerIdentity
              player={authUser}
              name={authUser.name}
              username={authUser.username}
              imageUrl={authUser.avatar_url ?? null}
              avatarSize={42}
              avatarFontSize={13}
              nameFontSize={16}
              subtitle="Telt mee voor online history en online stats."
            />
          ) : (
            <div>
              <div style={{ fontWeight: 900 }}>Eigen account</div>
              <div style={{ color: "#c8b6a1", fontSize: 13, lineHeight: 1.4 }}>
                Login om jezelf toe te voegen.
              </div>
            </div>
          )}
        </div>

        {ownAccountSelected ? (
          <div
            style={{
              borderRadius: 999,
              padding: "6px 10px",
              background: "rgba(34,197,94,0.14)",
              border: "1px solid rgba(34,197,94,0.28)",
              color: "#bbf7d0",
              fontWeight: 900,
              fontSize: 12,
            }}
          >
            Selected
          </div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onAddCurrentUser}
        disabled={locked || !authUser || selectedFull || ownAccountSelected}
        style={{
          ...actionButtonStyle,
          width: "100%",
          minHeight: 44,
          padding: "10px 12px",
          opacity:
            locked || !authUser || selectedFull || ownAccountSelected ? 0.55 : 1,
          cursor:
            locked || !authUser || selectedFull || ownAccountSelected
              ? "not-allowed"
              : "pointer",
          background:
            "linear-gradient(180deg, rgba(251,191,36,0.95) 0%, rgba(217,119,6,0.92) 100%)",
          color: "#1f1307",
        }}
      >
        {authUser
          ? ownAccountSelected
            ? compactMobile
              ? "✓ Me"
              : "Je account is geselecteerd"
            : compactMobile
              ? "+ Me"
              : `+ Add my account${authUser.username ? ` (@${authUser.username})` : ""}`
          : compactMobile
            ? "Login"
            : "Login to add your account"}
      </button>
    </div>
  );
}

function GuestSection({ compactMobile, locked, selectedPlayers, onAddGuest }) {
  const selectedFull = selectedPlayers.length >= 4;

  return (
    <div
      style={{
        borderRadius: 18,
        padding: compactMobile ? 12 : 14,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.035)",
        display: "grid",
        gap: 10,
      }}
    >
      <div style={{ fontWeight: 900 }}>Guest</div>

      <div style={{ color: "#c8b6a1", fontSize: 13, lineHeight: 1.4 }}>
        Tijdelijke speler voor deze match. Komt wel in history, maar niet in online
        stats.
      </div>

      <button
        type="button"
        onClick={onAddGuest}
        disabled={locked || selectedFull}
        style={{
          ...actionButtonStyle,
          width: "100%",
          minHeight: 44,
          padding: "10px 12px",
          opacity: locked || selectedFull ? 0.55 : 1,
          cursor: locked || selectedFull ? "not-allowed" : "pointer",
        }}
      >
        {selectedFull ? "Max 4 spelers" : compactMobile ? "+ Guest" : "+ Add guest"}
      </button>
    </div>
  );
}

function FriendsSection({
  compactMobile,
  open,
  onToggle,
  friends,
  selectedPlayers,
  locked,
  friendSearch,
  setFriendSearch,
  onAddFriendPlayer,
  onRefreshFriends,
}) {
  const filteredFriends = friends.filter((friend) => {
    const query = friendSearch.trim().toLowerCase();

    if (!query) return true;

    return (
      String(friend?.name ?? "").toLowerCase().includes(query) ||
      String(friend?.username ?? "").toLowerCase().includes(query)
    );
  });

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <SectionToggle
        title={`Friends (${friends.length})`}
        subtitle="Kies echte Smart Card Mat account-users. Deze tellen mee voor online history en stats."
        open={open}
        onToggle={onToggle}
        rightContent={
          <span style={{ color: "#bbf7d0", fontWeight: 900 }}>
            {open ? "Open" : "Closed"}
          </span>
        }
      />

      {open ? (
        <div
          style={{
            borderRadius: 18,
            padding: compactMobile ? 12 : 14,
            border: "1px solid rgba(34,197,94,0.18)",
            background: "rgba(34,197,94,0.055)",
            display: "grid",
            gap: 12,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: compactMobile ? "1fr" : "1fr auto",
              gap: 10,
            }}
          >
            <input
              value={friendSearch}
              onChange={(event) => setFriendSearch(event.target.value)}
              placeholder="Search friends..."
              style={{
                width: "100%",
                minHeight: 42,
                borderRadius: 12,
                padding: "10px 12px",
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.04)",
                color: "#f5efe6",
                outline: "none",
                boxSizing: "border-box",
              }}
            />

            <button
              type="button"
              onClick={onRefreshFriends}
              disabled={locked}
              style={{
                ...actionButtonStyle,
                minHeight: 42,
                padding: "8px 12px",
                opacity: locked ? 0.55 : 1,
                cursor: locked ? "not-allowed" : "pointer",
              }}
            >
              Refresh
            </button>
          </div>

          {friends.length === 0 ? (
            <div style={{ color: "#c8b6a1", fontSize: 13 }}>
              Nog geen vrienden. Voeg eerst vrienden toe via de Friends tab.
            </div>
          ) : filteredFriends.length === 0 ? (
            <div style={{ color: "#c8b6a1", fontSize: 13 }}>
              Geen vrienden gevonden met deze zoekterm.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: compactMobile
                  ? "repeat(2, minmax(0, 1fr))"
                  : "repeat(4, minmax(0, 1fr))",
                gap: 10,
              }}
            >
              {filteredFriends.map((friend) => {
                const selected = selectedPlayers.some((player) =>
                  isSameAccountPlayer(player, friend.id)
                );

                const disabled = locked || selected || selectedPlayers.length >= 4;

                return (
                  <div
                    key={friend.id}
                    style={{
                      borderRadius: 14,
                      padding: compactMobile ? 10 : 12,
                      border: selected
                        ? "1px solid rgba(34,197,94,0.38)"
                        : "1px solid rgba(255,255,255,0.08)",
                      background: selected
                        ? "rgba(34,197,94,0.10)"
                        : "rgba(255,255,255,0.035)",
                      display: "grid",
                      gap: 10,
                    }}
                  >
                    <PlayerIdentity
                      player={friend}
                      name={friend.name}
                      username={friend.username}
                      imageUrl={friend.avatar_url ?? null}
                      avatarSize={compactMobile ? 34 : 38}
                      avatarFontSize={compactMobile ? 11 : 12}
                      nameFontSize={compactMobile ? 14 : 16}
                      subtitle={friend.username ? `@${friend.username}` : "Account"}
                      compact
                    />
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => onAddFriendPlayer(friend)}
                      style={{
                        ...actionButtonStyle,
                        minHeight: 38,
                        padding: "8px 10px",
                        opacity: disabled ? 0.55 : 1,
                        cursor: disabled ? "not-allowed" : "pointer",
                        background: selected
                          ? "rgba(34,197,94,0.16)"
                          : "linear-gradient(180deg, rgba(34,197,94,0.28) 0%, rgba(21,128,61,0.18) 100%)",
                        border: "1px solid rgba(34,197,94,0.3)",
                        color: selected ? "#bbf7d0" : "#dcfce7",
                      }}
                    >
                      {selected
                        ? compactMobile
                          ? "✓"
                          : "Selected"
                        : selectedPlayers.length >= 4
                          ? "Full"
                          : compactMobile
                            ? "Add"
                            : "Add player"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function LocalProfilesSection({
  compactMobile,
  open,
  onToggle,
  profiles,
  profileStats,
  profileSearch,
  setProfileSearch,
  selectedPlayers,
  locked,
  newPlayerName,
  setNewPlayerName,
  onCreatePlayer,
  onTogglePlayer,
  onDeleteProfile,
}) {
  return (
    <div style={{ display: "grid", gap: 10 }}>
      <SectionToggle
        title={`Local profiles (${profiles.length})`}
        subtitle="Alleen opgeslagen op dit toestel. Niet gekoppeld aan online stats."
        open={open}
        onToggle={onToggle}
        rightContent={
          <span style={{ color: "#fde68a", fontWeight: 900 }}>
            {open ? "Open" : "Closed"}
          </span>
        }
      />

      {open ? (
        <div
          style={{
            borderRadius: 18,
            padding: compactMobile ? 12 : 14,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.025)",
            display: "grid",
            gap: 12,
          }}
        >
          <div
            style={{
              borderRadius: 16,
              padding: compactMobile ? 12 : 14,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.03)",
              display: "grid",
              gap: 10,
            }}
          >
            <div style={{ fontWeight: 900 }}>Create local profile</div>

            <div style={{ color: "#c8b6a1", fontSize: 13, lineHeight: 1.4 }}>
              Vaste naam op dit toestel. Geen online account en geen sync tussen
              apparaten.
            </div>

            <form
              onSubmit={onCreatePlayer}
              style={{
                display: "grid",
                gridTemplateColumns: compactMobile ? "1fr" : "minmax(0, 1fr) auto",
                gap: 10,
                alignItems: "center",
              }}
            >
              <input
                value={newPlayerName}
                onChange={(event) => setNewPlayerName(event.target.value)}
                disabled={locked}
                placeholder="Nieuwe spelernaam"
                style={{
                  width: "100%",
                  minWidth: 0,
                  minHeight: 46,
                  borderRadius: 14,
                  padding: "0 12px",
                  border: "1px solid rgba(255,255,255,0.10)",
                  background: "rgba(255,255,255,0.05)",
                  color: "#f5efe6",
                  fontSize: 15,
                  fontWeight: 700,
                  outline: "none",
                  boxSizing: "border-box",
                  opacity: locked ? 0.55 : 1,
                }}
              />

              <button
                type="submit"
                disabled={locked}
                style={{
                  ...actionButtonStyle,
                  minHeight: 46,
                  padding: compactMobile ? "10px 12px" : "10px 16px",
                  whiteSpace: "nowrap",
                  opacity: locked ? 0.55 : 1,
                  cursor: locked ? "not-allowed" : "pointer",
                }}
              >
                {compactMobile ? "Create" : "Create player"}
              </button>
            </form>
          </div>

          <input
            value={profileSearch}
            onChange={(event) => setProfileSearch(event.target.value)}
            placeholder="Search local profiles..."
            style={{
              width: "100%",
              minHeight: 42,
              borderRadius: 12,
              padding: "10px 12px",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.04)",
              color: "#f5efe6",
              outline: "none",
              boxSizing: "border-box",
            }}
          />

          {profileStats.length === 0 ? (
            <div style={{ color: "#c8b6a1", fontSize: 13 }}>
              Geen local profiles gevonden.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: compactMobile
                  ? "repeat(2, minmax(0, 1fr))"
                  : "repeat(4, minmax(0, 1fr))",
                gap: 10,
              }}
            >
              {profileStats.map(({ profile, stats }) => {
                const selected = selectedPlayers.some(
                  (player) => player.id === profile.id
                );

                const selectedFull = selectedPlayers.length >= 4;
                const disabled = locked || (!selected && selectedFull);

                return (
                  <div
                    key={profile.id}
                    style={{
                      borderRadius: 14,
                      padding: compactMobile ? 10 : 12,
                      border: selected
                        ? "1px solid rgba(251,191,36,0.38)"
                        : "1px solid rgba(255,255,255,0.08)",
                      background: selected
                        ? "rgba(251,191,36,0.10)"
                        : "rgba(255,255,255,0.035)",
                      display: "grid",
                      gap: 10,
                    }}
                  >
                    <div>
                      <PlayerIdentity
                        player={profile}
                        name={profile.name}
                        username={profile.id}
                        avatarSize={compactMobile ? 34 : 38}
                        avatarFontSize={compactMobile ? 11 : 12}
                        nameFontSize={compactMobile ? 14 : 16}
                        subtitle="Local device only"
                        compact
                      />
                      {stats ? (
                        <div
                          style={{
                            marginTop: 6,
                            color: "#fde68a",
                            fontSize: compactMobile ? 11 : 12,
                            fontWeight: 800,
                          }}
                        >
                          {stats.matchesPlayed ?? stats.matches ?? 0} local matches
                        </div>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => onTogglePlayer(profile)}
                      style={{
                        ...actionButtonStyle,
                        minHeight: 38,
                        padding: "8px 10px",
                        opacity: disabled ? 0.55 : 1,
                        cursor: disabled ? "not-allowed" : "pointer",
                      }}
                    >
                      {selected
                        ? compactMobile
                          ? "✓"
                          : "Selected"
                        : selectedFull
                          ? "Full"
                          : compactMobile
                            ? "Add"
                            : "Add player"}
                    </button>

                    <button
                      type="button"
                      disabled={locked}
                      onClick={() => onDeleteProfile(profile)}
                      style={{
                        ...actionButtonStyle,
                        minHeight: 34,
                        padding: "7px 10px",
                        opacity: locked ? 0.55 : 0.75,
                        cursor: locked ? "not-allowed" : "pointer",
                        background: "rgba(127,29,29,0.32)",
                        border: "1px solid rgba(248,113,113,0.22)",
                        color: "#fecaca",
                        fontSize: compactMobile ? 12 : 13,
                      }}
                    >
                      Delete
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export function PlayersScreen({
  appState,
  authUser,
  dispatchAction,
  locked = false,
  onGoPlay,
}) {
  const { isMobile, isLandscape } = useViewport();
  const compactMobile = isMobile;

  const [profiles, setProfiles] = useState([]);
  const [friends, setFriends] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [profileSearch, setProfileSearch] = useState("");
  const [friendSearch, setFriendSearch] = useState("");
  const [error, setError] = useState("");
  const [friendsOpen, setFriendsOpen] = useState(true);
  const [localProfilesOpen, setLocalProfilesOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const selectedPlayers = useMemo(
    () => normalizeSelectedPlayers(appState?.players),
    [appState?.players]
  );

  const tableDealerSeat =
    typeof appState?.tableDealerSeat === "number"
      ? appState.tableDealerSeat
      : selectedPlayers.length > 0
        ? selectedPlayers.length - 1
        : 0;

  function refreshProfiles() {
    setProfiles(storageService.getPlayers());
  }

  async function refreshFriends() {
    if (!authUser) {
      setFriends([]);
      return;
    }

    try {
      const data = await getFriendsOverview();
      setFriends(data?.friends ?? []);
      window.dispatchEvent(new Event("smartcardmat:friends-changed"));
    } catch (err) {
      setFriends([]);
      setError(err?.message ?? "Kon vrienden niet ophalen.");
    }
  }

  useEffect(() => {
    refreshProfiles();
  }, []);

  useEffect(() => {
    refreshFriends();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.id]);

  useEffect(() => {
    function handleDataChanged() {
      refreshProfiles();
    }

    window.addEventListener("smartcardmat:data-changed", handleDataChanged);

    return () => {
      window.removeEventListener("smartcardmat:data-changed", handleDataChanged);
    };
  }, []);

  useEffect(() => {
    function handleFriendsChanged() {
      refreshFriends();
    }

    window.addEventListener("smartcardmat:friends-changed", handleFriendsChanged);

    return () => {
      window.removeEventListener(
        "smartcardmat:friends-changed",
        handleFriendsChanged
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.id]);

  function closeConfirm() {
    setConfirmAction(null);
  }

  async function runConfirmAction() {
    if (!confirmAction?.onConfirm) return;

    await confirmAction.onConfirm();
    setConfirmAction(null);
  }

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
      setLocalProfilesOpen(true);
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
      createSelectedPlayerFromProfile(profile),
    ];

    setError("");
    dispatchAction({ type: "set_players", players: nextPlayers });
  }

  function handleAddFriendPlayer(friend) {
    if (failWhenLocked()) return;

    const exists = selectedPlayers.some((player) =>
      isSameAccountPlayer(player, friend.id)
    );

    if (exists) {
      setError("Deze vriend is al geselecteerd.");
      return;
    }

    if (selectedPlayers.length >= 4) {
      setError("Je kan maximaal 4 spelers selecteren.");
      return;
    }

    const nextPlayers = [
      ...selectedPlayers,
      createSelectedPlayerFromFriend(friend),
    ];

    setError("");
    dispatchAction({ type: "set_players", players: nextPlayers });
  }

  function handleAddCurrentUser() {
    if (failWhenLocked()) return;

    if (!authUser) {
      setError("Login eerst om je eigen account als speler toe te voegen.");
      return;
    }

    const exists = selectedPlayers.some((player) =>
      isSameAccountPlayer(player, authUser.id)
    );

    if (exists) {
      setError("Je eigen account is al geselecteerd.");
      return;
    }

    if (selectedPlayers.length >= 4) {
      setError("Je kan maximaal 4 spelers selecteren.");
      return;
    }

    const nextPlayers = [
      ...selectedPlayers,
      createSelectedPlayerFromAuthUser(authUser),
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

    const nextPlayers = [...selectedPlayers, createGuestPlayer(selectedPlayers)];

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

    const nextPlayers = selectedPlayers.filter((player) => player.id !== playerId);
    dispatchAction({ type: "set_players", players: nextPlayers });
  }

  function handleSetDealerSeat(index) {
    if (failWhenLocked()) return;
    if (selectedPlayers.length !== 4) return;

    dispatchAction({
      type: "set_table_dealer",
      dealerSeat: index,
    });
  }

  function handleDeleteProfile(profile) {
    if (failWhenLocked()) return;

    setConfirmAction({
      title: "Local profile verwijderen?",
      message: `Ben je zeker dat je het profiel "${profile.name}" wilt verwijderen? Dit profiel verdwijnt alleen van dit toestel.`,
      confirmLabel: "Delete profile",
      cancelLabel: "Annuleren",
      danger: true,
      onConfirm: async () => {
        if (typeof storageService.deletePlayer === "function") {
          storageService.deletePlayer(profile.id);
        }

        const nextPlayers = selectedPlayers.filter(
          (player) => player.id !== profile.id
        );

        dispatchAction({ type: "set_players", players: nextPlayers });
        refreshProfiles();
      },
    });
  }

  function handleDeleteDevData() {
    if (failWhenLocked()) return;

    setConfirmAction({
      title: "DEV data verwijderen?",
      message:
        "Delete all DEV accounts and clear simulated matches? This cannot be undone.",
      confirmLabel: "Delete DEV data",
      cancelLabel: "Annuleren",
      danger: true,
      onConfirm: async () => {
        const devProfiles = profiles.filter((profile) =>
          isDevProfileName(profile.name)
        );
        const devProfileIds = new Set(devProfiles.map((profile) => profile.id));

        const nextPlayers = selectedPlayers.filter(
          (player) =>
            !devProfileIds.has(player.id) && !isDevProfileName(player.name)
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
      },
    });
  }

  const filteredProfiles = profiles.filter((profile) =>
    String(profile?.name ?? "")
      .toLowerCase()
      .includes(profileSearch.trim().toLowerCase())
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

        <div
          style={{
            display: "grid",
            gridTemplateColumns: compactMobile
              ? "1fr"
              : "minmax(0, 1fr) minmax(0, 1fr)",
            gap: 12,
            marginBottom: 16,
            alignItems: "start",
          }}
        >
          <AccountSection
            compactMobile={compactMobile}
            authUser={authUser}
            locked={locked}
            selectedPlayers={selectedPlayers}
            onAddCurrentUser={handleAddCurrentUser}
          />

          <FriendsSection
            compactMobile={compactMobile}
            open={friendsOpen}
            onToggle={() => setFriendsOpen((value) => !value)}
            friends={friends}
            selectedPlayers={selectedPlayers}
            locked={locked}
            friendSearch={friendSearch}
            setFriendSearch={setFriendSearch}
            onAddFriendPlayer={handleAddFriendPlayer}
            onRefreshFriends={refreshFriends}
          />
        </div>

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
          tableDealerSeat={tableDealerSeat}
          onSetDealerSeat={handleSetDealerSeat}
          onRemoveSeatPlayer={handleRemoveSeatPlayer}
          onMovePlayerLeft={handleMovePlayerLeft}
          onMovePlayerRight={handleMovePlayerRight}
          onGoPlay={onGoPlay}
          actionButtonStyle={actionButtonStyle}
        />

        <div
          style={{
            display: "grid",
            gap: 12,
            marginTop: 16,
          }}
        >
          <div style={{ fontWeight: 1000, fontSize: 18 }}>Temporary players</div>

          <GuestSection
            compactMobile={compactMobile}
            locked={locked}
            selectedPlayers={selectedPlayers}
            onAddGuest={handleAddGuest}
          />

          <LocalProfilesSection
            compactMobile={compactMobile}
            open={localProfilesOpen}
            onToggle={() => setLocalProfilesOpen((value) => !value)}
            profiles={profiles}
            profileStats={profileStats}
            profileSearch={profileSearch}
            setProfileSearch={setProfileSearch}
            selectedPlayers={selectedPlayers}
            locked={locked}
            newPlayerName={newPlayerName}
            setNewPlayerName={setNewPlayerName}
            onCreatePlayer={handleCreatePlayer}
            onTogglePlayer={handleTogglePlayer}
            onDeleteProfile={handleDeleteProfile}
          />
        </div>
      </div>

      <ConfirmModal
        open={!!confirmAction}
        title={confirmAction?.title}
        message={confirmAction?.message}
        confirmLabel={confirmAction?.confirmLabel}
        cancelLabel={confirmAction?.cancelLabel}
        danger={confirmAction?.danger}
        onCancel={closeConfirm}
        onConfirm={runConfirmAction}
      />
    </div>
  );
}