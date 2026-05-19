import { useEffect, useState } from "react";
import {
  forgotPassword,
  loginUser,
  logoutUser,
  registerUser,
  resetPassword,
} from "../../core/api/authApi";

function getResetParamsFromUrl() {
  const params = new URLSearchParams(window.location.search);

  return {
    email: params.get("email") ?? "",
    token: params.get("token") ?? "",
    isResetUrl: window.location.pathname.includes("reset-password"),
  };
}

function cleanResetUrl() {
  if (!window.location.pathname.includes("reset-password")) return;

  window.history.replaceState({}, document.title, "/");
}

export function AuthModal({ open, onClose, user, onAuthChange, theme }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const resetParams = getResetParamsFromUrl();

    if (!resetParams.isResetUrl || !resetParams.email || !resetParams.token) {
      return;
    }

    setMode("reset");
    setEmail(resetParams.email);
    setResetToken(resetParams.token);
    setPassword("");
    setStatus("Choose a new password for your Smart Card Mat account.");
  }, [open]);

  if (!open) return null;

  const isLoginMode = mode === "login";
  const isRegisterMode = mode === "register";
  const isForgotMode = mode === "forgot";
  const isResetMode = mode === "reset";

  const title = user
    ? "Account"
    : isRegisterMode
      ? "Create account"
      : isForgotMode
        ? "Forgot password"
        : isResetMode
          ? "Reset password"
          : "Login";

  function validateLoginOrRegisterForm() {
    const cleanName = name.trim();
    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim();

    if (isRegisterMode && !cleanName) {
      return "Name is required!";
    }

    if (isRegisterMode && !cleanUsername) {
      return "Username is required!";
    }

    if (isRegisterMode && cleanUsername.length < 3) {
      return "Username must be at least 3 characters!";
    }

    if (isRegisterMode && !/^[a-z0-9_-]+$/.test(cleanUsername)) {
      return "Username can only use letters, numbers, _ and -.";
    }

    if (!cleanEmail) {
      return isLoginMode ? "Email or username is required!" : "Email is required!";
    }

    if (!password) {
      return "Password is required!";
    }

    if (isRegisterMode && password.length < 8) {
      return "Password must be at least 8 characters!";
    }

    return null;
  }

  function validateForgotForm() {
    if (!email.trim()) return "Email is required!";
    return null;
  }

  function validateResetForm() {
    if (!email.trim()) return "Email is required!";
    if (!resetToken.trim()) return "Reset token is missing!";
    if (!password) return "New password is required!";
    if (password.length < 8) return "Password must be at least 8 characters!";
    return null;
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setStatus("");
    setPassword("");

    if (nextMode !== "reset") {
      setResetToken("");
    }
  }

  async function handleLogin(event) {
    event.preventDefault();

    const validationError = validateLoginOrRegisterForm();

    if (validationError) {
      setStatus(validationError);
      return;
    }

    try {
      setBusy(true);
      setStatus("Logging in...");

      const result = await loginUser({
        login: email.trim(),
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

    const validationError = validateLoginOrRegisterForm();

    if (validationError) {
      setStatus(validationError);
      return;
    }

    try {
      setBusy(true);
      setStatus("Creating account...");

      const result = await registerUser({
        name: name.trim(),
        username: username.trim().toLowerCase(),
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

  async function handleForgotPassword(event) {
    event.preventDefault();

    const validationError = validateForgotForm();

    if (validationError) {
      setStatus(validationError);
      return;
    }

    try {
      setBusy(true);
      setStatus("Sending reset mail...");

      const result = await forgotPassword({
        email: email.trim(),
      });

      setStatus(result?.message ?? "If this email exists, a reset link was sent.");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleResetPassword(event) {
    event.preventDefault();

    const validationError = validateResetForm();

    if (validationError) {
      setStatus(validationError);
      return;
    }

    try {
      setBusy(true);
      setStatus("Resetting password...");

      const result = await resetPassword({
        email: email.trim(),
        token: resetToken.trim(),
        password,
      });

      cleanResetUrl();
      setPassword("");
      setResetToken("");
      setMode("login");
      setStatus(result?.message ?? "Password reset. You can login now.");
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

  function handleClose() {
    cleanResetUrl();
    onClose();
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
      onClick={handleClose}
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
          color: "#a16b19",
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
                : isForgotMode
                  ? "Enter your email and we will send you a password reset link."
                  : isResetMode
                    ? "Enter your new password to reset your account."
                    : "Login to sync your matches and stats with your Smart Card Mat account."}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
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

              {user.username ? (
                <div style={{ marginTop: 4, color: "#fde68a", fontSize: 14 }}>
                  @{user.username}
                </div>
              ) : null}

              <div style={{ marginTop: 4, color: "#bbf7d0", fontSize: 14 }}>
                {user.email}
              </div>

              <div style={{ marginTop: 8, color: "#c8b6a1", fontSize: 13 }}>
                Matches worden automatisch online opgeslagen zolang je ingelogd bent.
                Zonder login blijft alles lokaal bewaard.
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
          <>
            {(isLoginMode || isRegisterMode) && (
              <form
                onSubmit={isLoginMode ? handleLogin : handleRegister}
                style={{ display: "grid", gap: 12 }}
              >
                {isRegisterMode && (
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

                {isRegisterMode && (
                  <label style={{ display: "grid", gap: 6, fontWeight: 800 }}>
                    Username
                    <input
                      value={username}
                      onChange={(event) =>
                        setUsername(event.target.value.toLowerCase())
                      }
                      style={inputStyle}
                      autoComplete="username"
                      placeholder="xander_vm"
                    />
                    <span
                      style={{
                        color: "#c8b6a1",
                        fontSize: 12,
                        fontWeight: 700,
                        lineHeight: 1.3,
                      }}
                    >
                      Use 3-30 characters. Letters, numbers, _ and - only.
                    </span>
                  </label>
                )}

                <label style={{ display: "grid", gap: 6, fontWeight: 800 }}>
                  {isLoginMode ? "Email or username" : "Email"}
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    style={inputStyle}
                    type={isLoginMode ? "text" : "email"}
                    autoComplete={isLoginMode ? "username" : "email"}
                    placeholder={isLoginMode ? "email or username" : "yourEmail@email.be"}
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

                {isLoginMode ? (
                  <button
                    type="button"
                    onClick={() => switchMode("forgot")}
                    disabled={busy}
                    style={{
                      ...theme.button,
                      minHeight: 40,
                      borderRadius: 14,
                      opacity: busy ? 0.6 : 1,
                    }}
                  >
                    Forgot password?
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() => switchMode(isLoginMode ? "register" : "login")}
                  disabled={busy}
                  style={{
                    ...theme.button,
                    minHeight: 42,
                    borderRadius: 14,
                    opacity: busy ? 0.6 : 1,
                  }}
                >
                  {isLoginMode
                    ? "Not yet an account? Register"
                    : "Already have an account? Login"}
                </button>
              </form>
            )}

            {isForgotMode && (
              <form onSubmit={handleForgotPassword} style={{ display: "grid", gap: 12 }}>
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
                  {busy ? "Sending..." : "Send reset mail"}
                </button>

                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  disabled={busy}
                  style={{
                    ...theme.button,
                    minHeight: 42,
                    borderRadius: 14,
                    opacity: busy ? 0.6 : 1,
                  }}
                >
                  Back to login
                </button>
              </form>
            )}

            {isResetMode && (
              <form onSubmit={handleResetPassword} style={{ display: "grid", gap: 12 }}>
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
                  Reset token
                  <input
                    value={resetToken}
                    onChange={(event) => setResetToken(event.target.value)}
                    style={inputStyle}
                    placeholder="Reset token"
                  />
                </label>

                <label style={{ display: "grid", gap: 6, fontWeight: 800 }}>
                  New password
                  <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    style={inputStyle}
                    type="password"
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
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
                  {busy ? "Resetting..." : "Reset password"}
                </button>

                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  disabled={busy}
                  style={{
                    ...theme.button,
                    minHeight: 42,
                    borderRadius: 14,
                    opacity: busy ? 0.6 : 1,
                  }}
                >
                  Back to login
                </button>
              </form>
            )}
          </>
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