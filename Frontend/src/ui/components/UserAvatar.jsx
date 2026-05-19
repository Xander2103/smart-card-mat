function getInitials(name = "") {
  const parts = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return "?";

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function getAvatarColorKey(value = "") {
  const text = String(value || "default");

  let hash = 0;

  for (let i = 0; i < text.length; i += 1) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }

  return Math.abs(hash) % 6;
}

const avatarThemes = [
  {
    background: "linear-gradient(180deg, rgba(251,191,36,0.35), rgba(217,119,6,0.22))",
    border: "1px solid rgba(251,191,36,0.42)",
    color: "#fde68a",
  },
  {
    background: "linear-gradient(180deg, rgba(34,197,94,0.28), rgba(21,128,61,0.18))",
    border: "1px solid rgba(34,197,94,0.36)",
    color: "#bbf7d0",
  },
  {
    background: "linear-gradient(180deg, rgba(59,130,246,0.28), rgba(30,64,175,0.18))",
    border: "1px solid rgba(96,165,250,0.36)",
    color: "#bfdbfe",
  },
  {
    background: "linear-gradient(180deg, rgba(168,85,247,0.28), rgba(107,33,168,0.18))",
    border: "1px solid rgba(192,132,252,0.36)",
    color: "#e9d5ff",
  },
  {
    background: "linear-gradient(180deg, rgba(244,63,94,0.26), rgba(136,19,55,0.18))",
    border: "1px solid rgba(251,113,133,0.34)",
    color: "#fecdd3",
  },
  {
    background: "linear-gradient(180deg, rgba(148,163,184,0.22), rgba(71,85,105,0.16))",
    border: "1px solid rgba(203,213,225,0.26)",
    color: "#e2e8f0",
  },
];

export function UserAvatar({
  name,
  username,
  imageUrl = null,
  size = 42,
  fontSize = 14,
  title,
}) {
  const colorKey = getAvatarColorKey(username || name);
  const theme = avatarThemes[colorKey];

  return (
    <div
      title={title ?? username ?? name}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        borderRadius: 999,
        overflow: "hidden",
        display: "grid",
        placeItems: "center",
        fontWeight: 1000,
        fontSize,
        userSelect: "none",
        ...theme,
      }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name ?? "Avatar"}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      ) : (
        getInitials(name)
      )}
    </div>
  );
}