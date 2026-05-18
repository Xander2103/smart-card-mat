import { useState } from "react";
import { loginUser, logoutUser, registerUser } from "../../core/api/authApi";

export function AuthModal({ open, onClose, user, onAuthChange, theme }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const isLoginMode = mode === "login";
  const title = user ? "Account" : isLoginMode ? "Login" : "Create account";

  function validateForm() {
    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!isLoginMode && !cleanName) {
      return "Name is required!";
    }

    if (!cleanEmail) {
      return "Email is required!";
    }

    if (!password) {
      return "Password is required!";
    }

    if (!isLoginMode && password.length < 8) {
      return "Password must be at least 8 characters!";
    }

    return null;
  }

  function switchMode() {
    setMode((currentMode) => (currentMode === "login" ? "register" : "login"));
    setStatus("");
  }

  async function handleLogin(event) {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setStatus(validationError);
      return;
    }

    try {
      setBusy(true);
      setStatus("Logging in...");

      const result = await loginUser({
        email: email.trim(),
        password,
      });

      onAuthChange(result.user);
      setStatus("");
      onClose();
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleRegister(event) {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setStatus(validationError);
      return;
    }

    try {
      setBusy(true);
      setStatus("Creating account...");

      const result = await registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      onAuthChange(result.user);
      setStatus("");
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
      setStatus("Logging out...");

      await logoutUser();

      onAuthChange(null);
      setStatus("");
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
            <h2 style={{ margin: 0, fontSize: 24 }}>{title}</h2>
            <p style={{ margin: "6px 0 0", color: "#c8b6a1", lineHeight: 1.4 }}>
              {user
                ? "Your matches are automatically saved online."
                : "Login to sync your matches and stats with your Smart Card Mat account."}
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
                Your matches are automatically saved online while you are logged in.
                Without login, everything remains stored locally.
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
              {busy ? "Logging out..." : "Logout"}
            </button>
          </div>
        ) : (
          <form
            onSubmit={isLoginMode ? handleLogin : handleRegister}
            style={{ display: "grid", gap: 12 }}
          >
            {!isLoginMode && (
              <label style={{ display: "grid", gap: 6, fontWeight: 800 }}>
                Name
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  style={inputStyle}
                  autoComplete="name"
                  placeholder="Your name"
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
                placeholder="yourEmail@email.be"
              />
            </label>

            <label style={{ display: "grid", gap: 6, fontWeight: 800 }}>
              Password
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                style={inputStyle}
                type="password"
                autoComplete={isLoginMode ? "current-password" : "new-password"}
                placeholder={isLoginMode ? "Your password" : "At least 8 characters"}
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
              {busy
                ? isLoginMode
                  ? "Logging in..."
                  : "Creating account..."
                : isLoginMode
                  ? "Login"
                  : "Create account"}
            </button>

            <button
              type="button"
              onClick={switchMode}
              disabled={busy}
              style={{
                ...theme.button,
                minHeight: 42,
                borderRadius: 14,
                opacity: busy ? 0.6 : 1,
              }}
            >
              {isLoginMode
                ? "Nog yet an account? Register"
                : "Already have an account? Login"}
            </button>
          </form>
        )}

        {status ? (
          <div
            style={{
              marginTop: 14,
              padding: "10px 12px",
              borderRadius: 14,
              background: "rgba(134, 0, 0, 0.38)",
              border: "3px solid rgb(51, 1, 1)",
              color: "#ad9292",
              fontSize: 16,
              fontWeight: 1000,
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