import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logInUser } from "../lib/auth";

function getFriendlyError(code) {
  if (!code) return "Unable to log in right now.";

  if (code.includes("invalid-credential")) {
    return "Incorrect email or password.";
  }

  if (code.includes("user-not-found")) {
    return "No account was found for that email address.";
  }

  if (code.includes("wrong-password")) {
    return "Incorrect email or password.";
  }

  if (code.includes("invalid-email")) {
    return "Please enter a valid email address.";
  }

  if (code.includes("too-many-requests")) {
    return "Too many login attempts. Please try again later.";
  }

  return "Login failed. Check your email and password.";
}

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); //clear previous errors

    const trimmedEmail = email.trim();

    // following two stops unnesscary FB calls
    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);
      await logInUser({ email: trimmedEmail, password });
      navigate("/"); // to books list page
    } catch (err) {
      setError(getFriendlyError(err.code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-final">
        <header className="auth-header">
        <span className="auth-brand-ar">مساعد</span>

          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle muted">
            Log in to continue your Arabic revision and review your progress.
          </p>
        </header>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          <button
            className="btn btn-primary auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="auth-switch muted">
          Don&apos;t have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}