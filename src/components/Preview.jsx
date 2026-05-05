
/* eslint-disable react/prop-types */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthUser } from "../lib/auth";


export default function Preview({
  children,
  title = "Sign up to get started",
  message = "Create an account to unlock this feature and track your progress.",
  signupLabel = "Sign up",
  loginLabel = "Log in",
  bannerText = "You are viewing a preview. Sign up to unlock this feature.",
  lockInteractions = false,
  blurAmount = 2,
  redirectTo = "/signup",
}) {
  const user = useAuthUser();
  const navigate = useNavigate();
  const [showOverlay, setShowOverlay] = useState(true);

  // if user logged in render page as normal if not do the overlay
  if (user) {
    return children;
  }

  // sends to sign
  function handlePrimaryAction() {
    navigate(redirectTo);
  }

  return (
    <div className="preview-shell">
      {showOverlay && (
        <div className="preview-overlay" role="dialog" aria-modal="true">
          <div className="preview-card">
            <button
              type="button"
              className=" preview-close"
              aria-label="Close preview message"
              onClick={() => setShowOverlay(false)}
            >
              ×
            </button>

            <h3 className="preview-title">{title}</h3>
            <p className="preview-message muted">{message}</p>

            <div className="preview-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handlePrimaryAction}
              >
                {signupLabel}
              </button>

              <Link to="/login" className="btn">
                {loginLabel}
              </Link>
            </div>
          </div>
        </div>
      )}

      {!showOverlay && (
        <div className="preview-banner">
          <p className="preview-banner-text">{bannerText}</p>

          <div className="preview-banner-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handlePrimaryAction}
            >
              {signupLabel}
            </button>

            <Link to="/login" className="btn">
              {loginLabel}
            </Link>
          </div>
        </div>
      )}

      <div
        className={[
          "preview-content",
          lockInteractions ? "preview-content-locked" : "",
          !showOverlay ? "preview-content-explorable" : "", //overlay open or close
        ]
          .filter(Boolean)
          .join(" ")}
        style={
          showOverlay
            ? { filter: `blur(${blurAmount}px)` }
            : undefined
        }
        aria-hidden={showOverlay ? "true" : "false"}
      >
        {children}
      </div>
    </div>
  );
}