import { useEffect, useMemo, useState } from "react";
import { useAuthUser } from "../lib/auth";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  verifyBeforeUpdateEmail,
} from "firebase/auth";

export default function Account() {
  const user = useAuthUser();

  const [newEmail, setNewEmail] = useState("");
  const [emailCurrentPassword, setEmailCurrentPassword] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  //success/error messsages for changes
  const [emailMessage, setEmailMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  const [emailSaving, setEmailSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

 //when user loads makes email input prefilled with their emial
  useEffect(() => {
    if (user) {
      setNewEmail(user.email || "");
    }
  }, [user]);

  

  const createdDate = useMemo(() => {
    if (!user?.metadata?.creationTime) return "Not available";

    return new Date(user.metadata.creationTime).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, [user]);

  // reenter password before any chnages
  async function reauthenticateUser(password) {
    if (!user || !user.email) {
      throw new Error("No authenticated email/password user found.");
    }

    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
  }

  async function handleEmailUpdate(e) {
    e.preventDefault(); //stops page from refreshing
    setEmailMessage("");

    if (!user) return;

    const trimmedEmail = newEmail.trim();
    const trimmedPassword = emailCurrentPassword.trim();

    if (!trimmedEmail) {
      setEmailMessage("Please enter a new email address.");
      return;
    }

    if (trimmedEmail === user.email) {
      setEmailMessage("This is already your current email.");
      return;
    }

    if (!trimmedPassword) {
      setEmailMessage("Please enter your current password.");
      return;
    }

    try {
      setEmailSaving(true);

      await reauthenticateUser(trimmedPassword);
      await verifyBeforeUpdateEmail(user, trimmedEmail);

      setEmailMessage(
        "Verification email sent. Please check your email to complete the update."
      );
      setEmailCurrentPassword("");
    } catch (error) {
      console.error("Email update error:", error);

      if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        setEmailMessage("Your current password is incorrect.");
      } else if (error.code === "auth/invalid-email") {
        setEmailMessage("Please enter a valid email address.");
      } else if (error.code === "auth/email-already-in-use") {
        setEmailMessage("That email address is already in use.");
      } else if (error.code === "auth/requires-recent-login") {
        setEmailMessage("Please sign in again and then try updating your email.");
      } else {
        setEmailMessage("Unable to update email right now.");
      }
    } finally {
      setEmailSaving(false);
    }
  }

  async function handlePasswordUpdate(e) {
    e.preventDefault();
    setPasswordMessage("");

    if (!user) return;

    const trimmedCurrentPassword = currentPassword.trim();
    const trimmedNewPassword = newPassword.trim();

    if (!trimmedCurrentPassword) {
      setPasswordMessage("Please enter your current password.");
      return;
    }

    if (!trimmedNewPassword) {
      setPasswordMessage("Please enter a new password.");
      return;
    }

    if (trimmedNewPassword.length < 6) {
      setPasswordMessage("Password must be at least 6 characters long.");
      return;
    }

    try {
      setPasswordSaving(true);

      await reauthenticateUser(trimmedCurrentPassword);
      await updatePassword(user, trimmedNewPassword);

      setPasswordMessage("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      console.error("Password update error:", error);

      if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        setPasswordMessage("Your current password is incorrect.");
      } else if (error.code === "auth/weak-password") {
        setPasswordMessage("Please choose a stronger password.");
      } else if (error.code === "auth/requires-recent-login") {
        setPasswordMessage("Please sign in again and then try updating your password.");
      } else {
        setPasswordMessage("Unable to update password right now.");
      }
    } finally {
      setPasswordSaving(false);
    }
  }

  if (user === undefined) {
    return (
      <div className="page account-page">
        <p className="muted">Loading account...</p>
      </div>
    );
  }

// just in case but non auth user shouldn't access account page
  if (!user) {
    return (
      <div className="page account-page">
        <header className="page-header account-header">
          <h1 className="page-title">Account</h1>
          <p className="muted">You are not currently logged in.</p>
        </header>
      </div>
    );
  }

  return (
    <div className="page account-page">
      <header className="page-header account-header">
        <h1 className="page-title">Account Settings</h1>
        <p className="muted">Manage your email, password, and account details.</p>
      </header>

      <section className="card account-section">
        <h2 className="section-title">Account Information</h2>

        <div className="account-info-list">
          <div className="account-info-row">
            <span className="account-label">Name</span>
            <span className="account-value">{user.displayName || "Not set"}</span>
          </div>

          <div className="account-info-row">
            <span className="account-label">Current email</span>
            <span className="account-value">{user.email || "Not available"}</span>
          </div>

          <div className="account-info-row">
            <span className="account-label">Account created</span>
            <span className="account-value">{createdDate}</span>
          </div>
        </div>
      </section>

      <section className="card account-section">
        <h2 className="section-title">Change Email</h2>

        <form onSubmit={handleEmailUpdate} className="account-form">
          <label className="form-label" htmlFor="new-email">
            New email address
          </label>
          <input
            id="new-email"
            type="email"
            className="input account-input"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Enter your new email address"
          />

          <label className="form-label" htmlFor="email-current-password">
            Current password
          </label>
          <input
            id="email-current-password"
            type="password"
            className="input account-input"
            value={emailCurrentPassword}
            onChange={(e) => setEmailCurrentPassword(e.target.value)}
            placeholder="Enter your current password"
          />

          {emailMessage && <p className="form-message">{emailMessage}</p>}

          <button
            className="btn btn-primary account-save-btn"
            type="submit"
            disabled={emailSaving}
          >
            {emailSaving ? "Updating..." : "Update Email"}
          </button>
        </form>
      </section>

      <section className="card account-section">
        <h2 className="section-title">Change Password</h2>

        <form onSubmit={handlePasswordUpdate} className="account-form">
          <label className="form-label" htmlFor="current-password">
            Current password
          </label>
          <input
            id="current-password"
            type="password"
            className="input account-input"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter your current password"
          />

          <label className="form-label" htmlFor="new-password">
            New password
          </label>
          <input
            id="new-password"
            type="password"
            className="input account-input"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter a new password"
          />

          {passwordMessage && <p className="form-message">{passwordMessage}</p>}

          <button
            className="btn btn-primary account-save-btn"
            type="submit"
            disabled={passwordSaving}
          >
            {passwordSaving ? "Updating..." : "Update Password"}
          </button>
        </form>
      </section>
    </div>
  );
}