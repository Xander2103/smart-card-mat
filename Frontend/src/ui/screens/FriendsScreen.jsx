import { useEffect, useMemo, useState } from "react";
import { searchUsers } from "../../core/api/userApi";
import {
  acceptFriendRequest,
  deleteFriendship,
  getFriendsOverview,
  rejectFriendRequest,
  sendFriendRequest,
} from "../../core/api/friendApi";
import { PlayerIdentity } from "../components/PlayerIdentity";

const panelStyle = {
  border: "1px solid rgba(251, 191, 36, 0.18)",
  background: "rgba(39, 27, 21, 0.84)",
  backdropFilter: "blur(18px)",
  borderRadius: 22,
  boxShadow: "0 18px 50px rgba(2, 6, 23, 0.34)",
  color: "#f5efe6",
  padding: 20,
};

const cardStyle = {
  borderRadius: 18,
  padding: 14,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.035)",
};

const inputStyle = {
  width: "100%",
  minHeight: 44,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.05)",
  color: "#f5efe6",
  padding: "0 12px",
  fontSize: 16,
  outline: "none",
  boxSizing: "border-box",
};

const buttonStyle = {
  borderRadius: 14,
  padding: "10px 14px",
  fontWeight: 900,
  cursor: "pointer",
  border: "1px solid rgba(255,255,255,0.08)",
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)",
  color: "#f5efe6",
};

const primaryButtonStyle = {
  ...buttonStyle,
  background:
    "linear-gradient(180deg, rgba(251,191,36,0.95) 0%, rgba(217,119,6,0.92) 100%)",
  color: "#1f1307",
};

const dangerButtonStyle = {
  ...buttonStyle,
  background:
    "linear-gradient(180deg, rgba(127,29,29,0.72) 0%, rgba(80,20,20,0.72) 100%)",
  border: "1px solid rgba(248,113,113,0.35)",
  color: "#fee2e2",
};

const successBadgeStyle = {
  borderRadius: 999,
  padding: "7px 11px",
  background: "rgba(34,197,94,0.12)",
  border: "1px solid rgba(34,197,94,0.28)",
  color: "#bbf7d0",
  fontWeight: 900,
  fontSize: 13,
};

function getOtherUserFromRequest(request, currentUserId) {
  if (!request) return null;

  if (Number(request.requester_id) === Number(currentUserId)) {
    return request.receiver;
  }

  return request.requester;
}

function UserIdentity({ user }) {
  if (!user) return null;

  return (
    <PlayerIdentity
      player={user}
      name={user.name}
      username={user.username}
      imageUrl={user.avatar_url ?? null}
      avatarSize={42}
      avatarFontSize={13}
      nameFontSize={17}
      subtitle={user.username ? `@${user.username}` : null}
    />
  );
}

export function FriendsScreen({ authUser, onOpenAuth }) {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [friends, setFriends] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const currentUserId = authUser?.id ?? null;

  const knownUserIds = useMemo(() => {
    const ids = new Set();

    if (currentUserId) {
      ids.add(Number(currentUserId));
    }

    for (const friend of friends) {
      ids.add(Number(friend.id));
    }

    for (const request of incomingRequests) {
      if (request.requester_id) ids.add(Number(request.requester_id));
      if (request.receiver_id) ids.add(Number(request.receiver_id));
    }

    for (const request of outgoingRequests) {
      if (request.requester_id) ids.add(Number(request.requester_id));
      if (request.receiver_id) ids.add(Number(request.receiver_id));
    }

    return ids;
  }, [currentUserId, friends, incomingRequests, outgoingRequests]);

  async function refreshFriends() {
    if (!authUser) {
      setFriends([]);
      setIncomingRequests([]);
      setOutgoingRequests([]);
      return;
    }

    try {
      setBusy(true);

      const data = await getFriendsOverview();

      setFriends(data?.friends ?? []);
      setIncomingRequests(data?.incomingRequests ?? []);
      setOutgoingRequests(data?.outgoingRequests ?? []);

      window.dispatchEvent(new Event("smartcardmat:friends-changed"));
    } catch (error) {
      setStatus(error?.message ?? "Kon friends niet ophalen.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    refreshFriends();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.id]);

  async function handleSearch(event) {
    event.preventDefault();

    if (!authUser) {
      setStatus("Login eerst om users te zoeken.");
      return;
    }

    const cleanQuery = query.trim();

    if (cleanQuery.length < 2) {
      setSearchResults([]);
      setStatus("Typ minstens 2 tekens.");
      return;
    }

    try {
      setBusy(true);
      setStatus("Users zoeken...");

      const users = await searchUsers(cleanQuery);

      setSearchResults(users);
      setStatus(users.length === 0 ? "Geen users gevonden." : "");
    } catch (error) {
      setSearchResults([]);
      setStatus(error?.message ?? "Kon users niet zoeken.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSendRequest(userId) {
    try {
      setBusy(true);
      setStatus("Vriendschapsverzoek versturen...");

      const result = await sendFriendRequest(userId);

      setStatus(result?.message ?? "Vriendschapsverzoek verstuurd.");
      await refreshFriends();
    } catch (error) {
      setStatus(error?.message ?? "Kon vriendschapsverzoek niet versturen.");
    } finally {
      setBusy(false);
    }
  }

  async function handleAccept(friendshipId) {
    try {
      setBusy(true);
      setStatus("Request accepteren...");

      const result = await acceptFriendRequest(friendshipId);

      setStatus(result?.message ?? "Vriendschapsverzoek geaccepteerd.");
      await refreshFriends();
    } catch (error) {
      setStatus(error?.message ?? "Kon request niet accepteren.");
    } finally {
      setBusy(false);
    }
  }

  async function handleReject(friendshipId) {
    try {
      setBusy(true);
      setStatus("Request weigeren...");

      const result = await rejectFriendRequest(friendshipId);

      setStatus(result?.message ?? "Vriendschapsverzoek geweigerd.");
      await refreshFriends();
    } catch (error) {
      setStatus(error?.message ?? "Kon request niet weigeren.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(friendshipId, label = "deze friendship") {
    const ok = window.confirm(
      `Ben je zeker dat je ${label} wilt verwijderen?`
    );

    if (!ok) return;

    try {
      setBusy(true);
      setStatus("Friendship verwijderen...");

      const result = await deleteFriendship(friendshipId);

      setStatus(result?.message ?? "Friendship verwijderd.");
      await refreshFriends();
    } catch (error) {
      setStatus(error?.message ?? "Kon friendship niet verwijderen.");
    } finally {
      setBusy(false);
    }
  }

  if (!authUser) {
    return (
      <div style={panelStyle}>
        <h2 style={{ margin: 0 }}>Friends</h2>
        <p style={{ color: "#c8b6a1", lineHeight: 1.5 }}>
          Login om vrienden toe te voegen en later vrienden als speler te kiezen.
        </p>

        <button type="button" onClick={onOpenAuth} style={primaryButtonStyle}>
          Login / Register
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={panelStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "flex-start",
            flexWrap: "wrap",
            marginBottom: 18,
          }}
        >
          <div style={{ display: "grid", gap: 6 }}>
            <h2 style={{ margin: 0 }}>Friends</h2>
            <div style={{ color: "#c8b6a1", lineHeight: 1.45 }}>
              Zoek users, stuur vriendschapsverzoeken en beheer je vriendenlijst.
              Later kan je deze vrienden rechtstreeks selecteren in de Players tab.
            </div>
          </div>

          <button
            type="button"
            onClick={refreshFriends}
            disabled={busy}
            style={{
              ...buttonStyle,
              opacity: busy ? 0.6 : 1,
              cursor: busy ? "not-allowed" : "pointer",
            }}
          >
            {busy ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <form
          onSubmit={handleSearch}
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) auto",
            gap: 10,
            marginBottom: 14,
          }}
        >
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Zoek username of naam, bv. robbe"
            style={inputStyle}
          />

          <button type="submit" disabled={busy} style={primaryButtonStyle}>
            {busy ? "Bezig..." : "Zoek user"}
          </button>
        </form>

        {status ? (
          <div
            style={{
              marginBottom: 14,
              borderRadius: 14,
              padding: "10px 12px",
              background: "rgba(255,255,255,0.045)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#f5efe6",
              fontWeight: 800,
            }}
          >
            {status}
          </div>
        ) : null}

        {searchResults.length > 0 ? (
          <div style={{ display: "grid", gap: 10, marginBottom: 22 }}>
            <div style={{ fontWeight: 900 }}>Zoekresultaten</div>

            {searchResults.map((user) => {
              const blocked = knownUserIds.has(Number(user.id));

              return (
                <div
                  key={user.id}
                  style={{
                    ...cardStyle,
                    display: "grid",
                    gridTemplateColumns: "minmax(0, 1fr) auto",
                    gap: 10,
                    alignItems: "center",
                  }}
                >
                  <UserIdentity user={user} />

                  <button
                    type="button"
                    disabled={busy || blocked}
                    onClick={() => handleSendRequest(user.id)}
                    style={{
                      ...primaryButtonStyle,
                      opacity: busy || blocked ? 0.55 : 1,
                      cursor: busy || blocked ? "not-allowed" : "pointer",
                    }}
                  >
                    {blocked ? "Niet beschikbaar" : "Add friend"}
                  </button>
                </div>
              );
            })}
          </div>
        ) : null}

        <div style={{ display: "grid", gap: 18 }}>
          <section>
            <h3 style={{ margin: "0 0 10px" }}>Incoming requests</h3>

            {incomingRequests.length === 0 ? (
              <div style={{ color: "#c8b6a1" }}>Geen inkomende verzoeken.</div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {incomingRequests.map((request) => (
                  <div
                    key={request.id}
                    style={{
                      ...cardStyle,
                      display: "grid",
                      gridTemplateColumns: "minmax(0, 1fr) auto auto",
                      gap: 10,
                      alignItems: "center",
                    }}
                  >
                    <UserIdentity user={request.requester} />

                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleAccept(request.id)}
                      style={primaryButtonStyle}
                    >
                      Accept
                    </button>

                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleReject(request.id)}
                      style={dangerButtonStyle}
                    >
                      Reject
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h3 style={{ margin: "0 0 10px" }}>Outgoing requests</h3>

            {outgoingRequests.length === 0 ? (
              <div style={{ color: "#c8b6a1" }}>Geen uitgaande verzoeken.</div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {outgoingRequests.map((request) => {
                  const otherUser = getOtherUserFromRequest(request, currentUserId);

                  return (
                    <div
                      key={request.id}
                      style={{
                        ...cardStyle,
                        display: "grid",
                        gridTemplateColumns: "minmax(0, 1fr) auto",
                        gap: 10,
                        alignItems: "center",
                      }}
                    >
                      <UserIdentity user={otherUser} />

                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          handleDelete(
                            request.id,
                            `het verzoek naar ${otherUser?.name ?? "deze user"}`
                          )
                        }
                        style={dangerButtonStyle}
                      >
                        Cancel request
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section>
            <h3 style={{ margin: "0 0 10px" }}>Mijn vrienden</h3>

            {friends.length === 0 ? (
              <div style={{ color: "#c8b6a1" }}>Nog geen vrienden.</div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {friends.map((friend) => (
                  <div
                    key={friend.id}
                    style={{
                      ...cardStyle,
                      display: "grid",
                      gridTemplateColumns: "minmax(0, 1fr) auto auto",
                      gap: 10,
                      alignItems: "center",
                    }}
                  >
                    <UserIdentity user={friend} />

                    <div style={successBadgeStyle}>Friend</div>

                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        handleDelete(
                          friend.friendship_id,
                          `${friend.name} als vriend`
                        )
                      }
                      style={{
                        ...dangerButtonStyle,
                        opacity: busy ? 0.6 : 1,
                        cursor: busy ? "not-allowed" : "pointer",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}