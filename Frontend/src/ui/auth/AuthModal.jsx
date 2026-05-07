import { useState } from "react";
import { loginUser, logoutUser, registerUser } from "../../core/api/authApi";

export function AuthModal({ open, onClose, user, onAuthChange, theme }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("Xander");
  const [email, setEmail] = useState("xander@test.be");
  const [password, setPassword] = useState("password123");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  async function handleLogin(event) {
    event.preventDefault();

    try {
      setBusy(true);
      setStatus("Inloggen...");

      const result = await loginUser({ email, password });

      onAuthChange(result.user);
      setStatus(`Ingelogd als ${result.user.name}`);
      onClose();
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleRegister(event) {
    event.preventDefault();

    try {
      setBusy(true);
      setStatus("Account maken...");

      const result = await registerUser({ name, email, password });

      onAuthChange(result.user);
      setStatus(`Account gemaakt voor ${result.user.name}`);
      onClose();
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    try {
      setBusy(true);
      setStatus("Uitloggen...");

      await logoutUser();

      onAuthChange(null);
      setStatus("Uitgelogd");
      onClose();
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.62)",
        display: "grid",
        placeItems: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "min(420px, 100%)",
          borderRadius: 24,
          padding: 20,
          background:
            "linear-gradient(180deg, rgba(39,27,21,0.98) 0%, rgba(19,13,10,0.98) 100%)",
          border: "1px solid rgba(251,191,36,0.2)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
          color: "#f5efe6",
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "flex-start",
            marginBottom: 16,
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 24 }}>Account</h2>
            <p style={{ margin: "6px 0 0", color: "#c8b6a1", lineHeight: 1.4 }}>
              Sync je matches en stats met je Smart Card Mat account.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              ...theme.button,
              width: 40,
              height: 40,
              borderRadius: 999,
              padding: 0,
            }}
          >
            ×
          </button>
        </div>

        {user ? (
          <div style={{ display: "grid", gap: 14 }}>
            <div
              style={{
                borderRadius: 18,
                padding: 14,
                background: "rgba(34,197,94,0.1)",
                border: "1px solid rgba(34,197,94,0.25)",
              }}
            >
              <div style={{ fontWeight: 900, fontSize: 18 }}>{user.name}</div>
              <div style={{ marginTop: 4, color: "#bbf7d0", fontSize: 14 }}>
                {user.email}
              </div>
              <div style={{ marginTop: 8, color: "#c8b6a1", fontSize: 13 }}>
                Matches worden automatisch online opgeslagen wanneer je ingelogd bent.
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={busy}
              style={{
                ...theme.button,
                minHeight: 46,
                borderRadius: 16,
                opacity: busy ? 0.6 : 1,
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <form
            onSubmit={mode === "login" ? handleLogin : handleRegister}
            style={{ display: "grid", gap: 12 }}
          >
            {mode === "register" && (
              <label style={{ display: "grid", gap: 6, fontWeight: 800 }}>
                Naam
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  style={inputStyle}
                  autoComplete="name"
                />
              </label>
            )}

            <label style={{ display: "grid", gap: 6, fontWeight: 800 }}>
              Email
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                style={inputStyle}
                type="email"
                autoComplete="email"
              />
            </label>

            <label style={{ display: "grid", gap: 6, fontWeight: 800 }}>
              Password
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                style={inputStyle}
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </label>

            <button
              type="submit"
              disabled={busy}
              style={{
                ...theme.button,
                minHeight: 48,
                borderRadius: 16,
                fontWeight: 900,
                opacity: busy ? 0.6 : 1,
                background:
                  "linear-gradient(180deg, rgba(251,191,36,0.95) 0%, rgba(217,119,6,0.95) 100%)",
                color: "#1f1307",
              }}
            >
              {mode === "login" ? "Login" : "Create account"}
            </button>

            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              style={{
                ...theme.button,
                minHeight: 42,
                borderRadius: 14,
              }}
            >
              {mode === "login"
                ? "Nog geen account? Registreer"
                : "Al een account? Login"}
            </button>
          </form>
        )}

        {status ? (
          <div
            style={{
              marginTop: 14,
              color: "#c8b6a1",
              fontSize: 13,
              lineHeight: 1.4,
            }}
          >
            {status}
          </div>
        ) : null}
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  minHeight: 44,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.06)",
  color: "#f5efe6",
  padding: "0 12px",
  fontSize: 16,
  outline: "none",
  boxSizing: "border-box",
};