import { useState } from "react";
import { searchUsers } from "../../core/api/userApi";

const sectionStyle = {
  borderRadius: 18,
  padding: 14,
  marginBottom: 18,
  border: "1px solid rgba(251, 191, 36, 0.16)",
  background: "rgba(255,255,255,0.025)",
};

const inputStyle = {
  width: "100%",
  minHeight: 42,
  borderRadius: 12,
  padding: "10px 12px",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.04)",
  color: "#f5efe6",
  outline: "none",
  boxSizing: "border-box",
};

const buttonStyle = {
  borderRadius: 12,
  padding: "9px 12px",
  fontWeight: 900,
  cursor: "pointer",
  border: "1px solid rgba(251, 191, 36, 0.22)",
  background:
    "linear-gradient(180deg, rgba(251,191,36,0.20) 0%, rgba(217,119,6,0.16) 100%)",
  color: "#fde68a",
};

function createPlayerFromUser(user) {
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

export function AccountSearchSection({
  compactMobile,
  locked,
  selectedPlayers,
  onAddAccountPlayer,
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSearch(event) {
    event.preventDefault();

    const cleanQuery = query.trim();

    if (cleanQuery.length < 2) {
      setResults([]);
      setStatus("Typ minstens 2 tekens om accounts te zoeken.");
      return;
    }

    try {
      setBusy(true);
      setStatus("Accounts zoeken...");

      const users = await searchUsers(cleanQuery);

      setResults(users);
      setStatus(users.length === 0 ? "Geen accounts gevonden." : "");
    } catch (error) {
      setResults([]);
      setStatus(error?.message ?? "Kon accounts niet zoeken.");
    } finally {
      setBusy(false);
    }
  }

  function isUserSelected(user) {
    return selectedPlayers.some(
      (player) => player.source === "user" && Number(player.userId) === Number(user.id)
    );
  }

  return (
    <div style={sectionStyle}>
      <div
        style={{
          display: "grid",
          gap: 4,
          marginBottom: 10,
        }}
      >
        <div style={{ fontWeight: 900 }}>Account zoeken</div>
        <div style={{ color: "#c8b6a1", fontSize: 13, lineHeight: 1.4 }}>
          Zoek een echte Smart Card Mat user via username of naam. Deze speler kan
          later eigen stats krijgen op zijn account.
        </div>
      </div>

      <form
        onSubmit={handleSearch}
        style={{
          display: "grid",
          gridTemplateColumns: compactMobile ? "1fr" : "1fr auto",
          gap: 10,
          marginBottom: 12,
        }}
      >
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          disabled={locked}
          placeholder="Zoek bv. xander_vm"
          style={{
            ...inputStyle,
            opacity: locked ? 0.6 : 1,
          }}
        />

        <button
          type="submit"
          disabled={locked || busy}
          style={{
            ...buttonStyle,
            opacity: locked || busy ? 0.6 : 1,
            cursor: locked || busy ? "not-allowed" : "pointer",
          }}
        >
          {busy ? "Zoeken..." : "Zoek account"}
        </button>
      </form>

      {status ? (
        <div
          style={{
            color: status.includes("gevonden") || status.includes("minstens")
              ? "#c8b6a1"
              : "#fecaca",
            fontSize: 13,
            fontWeight: 800,
            marginBottom: 10,
          }}
        >
          {status}
        </div>
      ) : null}

      {results.length > 0 ? (
        <div style={{ display: "grid", gap: 10 }}>
          {results.map((user) => {
            const selected = isUserSelected(user);
            const canAdd = !locked && !selected && selectedPlayers.length < 4;

            return (
              <div
                key={user.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: compactMobile ? "1fr" : "1fr auto",
                  gap: 10,
                  alignItems: "center",
                  borderRadius: 14,
                  padding: 12,
                  border: selected
                    ? "1px solid rgba(34,197,94,0.35)"
                    : "1px solid rgba(255,255,255,0.08)",
                  background: selected
                    ? "rgba(34,197,94,0.10)"
                    : "rgba(255,255,255,0.035)",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 900, color: "#f5efe6" }}>
                    {user.name}
                  </div>

                  <div
                    style={{
                      marginTop: 4,
                      color: "#fde68a",
                      fontSize: 13,
                      fontWeight: 800,
                    }}
                  >
                    @{user.username}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!canAdd}
                  onClick={() => onAddAccountPlayer(createPlayerFromUser(user))}
                  style={{
                    ...buttonStyle,
                    opacity: canAdd ? 1 : 0.55,
                    cursor: canAdd ? "pointer" : "not-allowed",
                  }}
                >
                  {selected
                    ? "Geselecteerd"
                    : selectedPlayers.length >= 4
                      ? "Vol"
                      : "Add"}
                </button>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}