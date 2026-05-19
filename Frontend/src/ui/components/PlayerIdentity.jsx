import { UserAvatar } from "./UserAvatar";

export function PlayerIdentity({
  player,
  name,
  username,
  imageUrl = null,
  subtitle = null,
  avatarSize = 38,
  avatarFontSize = 12,
  nameFontSize = 16,
  compact = false,
}) {
  const displayName = name ?? player?.name ?? "-";
  const displayUsername = username ?? player?.username ?? null;
  const displayImageUrl = imageUrl ?? player?.avatar_url ?? null;

  const fallbackSubtitle =
    subtitle ??
    (displayUsername
      ? `@${displayUsername}`
      : player?.source === "user"
        ? "Account"
        : player?.isGuest
          ? "Guest"
          : player?.source ?? "");

  return (
    <div
      style={{
        display: "flex",
        gap: compact ? 8 : 10,
        alignItems: "center",
        minWidth: 0,
      }}
    >
      <UserAvatar
        name={displayName}
        username={displayUsername ?? player?.id ?? player?.playerId}
        imageUrl={displayImageUrl}
        size={avatarSize}
        fontSize={avatarFontSize}
      />

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontWeight: 900,
            fontSize: nameFontSize,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {displayName}
        </div>

        {fallbackSubtitle ? (
          <div
            style={{
              marginTop: 3,
              color: "#c8b6a1",
              fontSize: compact ? 12 : 13,
              fontWeight: displayUsername ? 800 : 600,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {fallbackSubtitle}
          </div>
        ) : null}
      </div>
    </div>
  );
}