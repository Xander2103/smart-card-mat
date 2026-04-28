function ProfileCard({
  profile,
  stats,
  isSelected,
  compactMobile,
  locked,
  onTogglePlayer,
  onDeleteProfile,
}) {
  return (
    <div
      onClick={() => {
        if (locked) return;
        onTogglePlayer(profile);
      }}
      style={{
        borderRadius: 16,
        padding: compactMobile ? "12px" : "10px 14px",
        cursor: locked ? "not-allowed" : "pointer",
        border: isSelected
          ? "1px solid rgba(251, 191, 36, 0.42)"
          : "1px solid rgba(255,255,255,0.08)",
        background: isSelected
          ? "rgba(217, 119, 6, 0.16)"
          : "rgba(255,255,255,0.03)",
        color: "#f5efe6",
        opacity: locked ? 0.65 : 1,
        position: "relative",
        transition:
          "transform 0.16s ease, border-color 0.16s ease, background 0.16s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: compactMobile ? "flex-start" : "center",
          justifyContent: "space-between",
          gap: 10,
          marginBottom: 10,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontWeight: 900,
              fontSize: compactMobile ? 17 : 18,
              lineHeight: 1.1,
            }}
          >
            {profile.name}
          </div>
          <div
            style={{
              color: "#c8b6a1",
              fontSize: compactMobile ? 12 : 13,
              marginTop: 4,
            }}
          >
            {isSelected ? "Geselecteerd" : "Klik om te selecteren"}
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteProfile(profile);
          }}
          disabled={locked}
          onMouseEnter={(e) => {
            if (locked) return;
            e.currentTarget.style.background = "rgba(127, 29, 29, 0.55)";
            e.currentTarget.style.borderColor = "rgba(248, 113, 113, 0.35)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.06)";
            e.currentTarget.style.borderColor = "rgba(251, 191, 36, 0.18)";
          }}
          style={{
            height: compactMobile ? 28 : 30,
            borderRadius: 999,
            border: "1px solid rgba(251, 191, 36, 0.18)",
            background: "rgba(255,255,255,0.06)",
            color: "#f5efe6",
            fontWeight: 800,
            fontSize: compactMobile ? 11 : 12,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: locked ? "not-allowed" : "pointer",
            opacity: locked ? 0.5 : 1,
            padding: compactMobile ? "0 10px" : "0 12px",
            lineHeight: 1,
            textAlign: "center",
            transition: "background 0.15s ease, border-color 0.15s ease",
            flexShrink: 0,
          }}
          title="Account verwijderen"
          aria-label="Account verwijderen"
        >
          Verwijder
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gap: compactMobile ? 10 : 14,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: compactMobile
              ? "repeat(2, minmax(0, 1fr))"
              : "repeat(4, minmax(0, 1fr))",
            gap: 10,
            color: "#e8d9c9",
            fontSize: compactMobile ? 14 : 16,
          }}
        >
          {[
            ["Matches", stats.matchesPlayed],
            ["Wins", stats.wins],
            ["Winrate", `${stats.winRate.toFixed(1)}%`],
            ["Score", stats.totalScore],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                borderRadius: 12,
                background: "rgba(255,255,255,0.03)",
                padding: compactMobile ? "10px 8px" : "12px 10px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: compactMobile ? 11 : 12,
                  color: "#c8b6a1",
                  fontWeight: 700,
                }}
              >
                {label}
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontWeight: 900,
                  fontSize: compactMobile ? 18 : 20,
                }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProfilesSection({
  compactMobile,
  profileSearch,
  setProfileSearch,
  profileStats,
  selectedPlayers,
  locked,
  onTogglePlayer,
  onDeleteProfile,
}) {
  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: compactMobile ? "stretch" : "center",
          flexDirection: compactMobile ? "column" : "row",
          gap: 10,
          marginBottom: 10,
        }}
      >
        <div style={{ fontWeight: 900 }}>Beschikbare profielen</div>
        <input
          value={profileSearch}
          onChange={(e) => setProfileSearch(e.target.value)}
          placeholder="Zoek profiel"
          style={{
            width: compactMobile ? "100%" : 240,
            minWidth: 0,
            borderRadius: 12,
            padding: "10px 12px",
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.04)",
            color: "#f5efe6",
            outline: "none",
          }}
        />
      </div>

      {profileStats.length === 0 ? (
        <div style={{ color: "#c8b6a1", marginBottom: 12 }}>
          Nog geen spelers opgeslagen. Maak eerst een speler aan.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: compactMobile ? "1fr" : undefined,
            gap: compactMobile ? 12 : 10,
            marginBottom: 14,
          }}
        >
          {profileStats.map(({ profile, stats }) => {
            const isSelected = selectedPlayers.some(
              (player) => player.id === profile.id
            );

            return (
              <ProfileCard
                key={profile.id}
                profile={profile}
                stats={stats}
                isSelected={isSelected}
                compactMobile={compactMobile}
                locked={locked}
                onTogglePlayer={onTogglePlayer}
                onDeleteProfile={onDeleteProfile}
              />
            );
          })}
        </div>
      )}
    </>
  );
}
