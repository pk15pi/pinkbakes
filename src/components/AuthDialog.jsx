import { CakeSlice, X } from "lucide-react";

function AuthDialog({
  brandName,
  authStage,
  authFlow,
  authMode,
  setAuthMode,
  setAuthOpen,
  authMessage,
  authLoading,
  handleForgotPassword,
  forgotEmail,
  setForgotEmail,
  setAuthFlow,
  resetPasswordForm,
  setResetPasswordForm,
  handleResetPasswordSubmit,
  setAuthMessage,
  setResetToken,
  verificationMethod,
  setVerificationMethod,
  verificationData,
  verificationCode,
  setVerificationCode,
  handleVerificationAction,
  setAuthStage,
  setPendingCheckout,
  notify,
  authForm,
  setAuthForm,
  handleOtpLoginSubmit,
  handleOtpLoginRequest,
  handleAuthSubmit,
  user,
  handleSignOut,
}) {
  return (
    <div className="auth-page-shell" onClick={() => setAuthOpen(false)}>
      <div className="auth-page-card" role="dialog" aria-modal="true" aria-labelledby="auth-dialog-title" onClick={e => e.stopPropagation()}>
        <div className="auth-visual-panel">
          <div className="auth-brand-row">
            <div className="brand-mark"><CakeSlice size={20}/></div>
            <div>
              <strong>{brandName}</strong>
              <small>CAKES FOR EVERY MOMENT</small>
            </div>
          </div>

          <div className="auth-visual-copy">
            <span className="eyebrow">FRESHLY BAKED</span>
            <h2>Celebrate every moment with a sweeter story.</h2>
            <p>Order custom cakes, seasonal favorites, and handcrafted keepsakes made just for your occasion.</p>
          </div>

          <div className="auth-feature-pills">
            <span>Fresh</span>
            <span>Custom</span>
            <span>Delivered</span>
          </div>
        </div>

        <div className="auth-form-panel">
          <button type="button" className="auth-close" onClick={() => setAuthOpen(false)} aria-label="Close auth form">
            <X size={18}/>
          </button>

          <div className="auth-header">
            <span className="eyebrow">ACCOUNT</span>
            <h3 id="auth-dialog-title">
              {authStage === "verification" ? "Verify your account"
                : authFlow === "forgot" ? "Forgot Password"
                : authFlow === "reset" ? "Reset Your Password"
                : authMode === "signup" ? "Create your account" : "Welcome back"}
            </h3>
          </div>

          {authStage !== "verification" && authFlow === "signin" && (
            <div className="auth-toggle">
              <button type="button" className={authMode === "signin" ? "active" : ""} onClick={() => setAuthMode("signin")}>Sign In</button>
              <button type="button" className={authMode === "signup" ? "active" : ""} onClick={() => setAuthMode("signup")}>Sign Up</button>
              <button type="button" className={authMode === "otp" ? "active" : ""} onClick={() => setAuthMode("otp")}>OTP</button>
            </div>
          )}

          {authFlow === "forgot" ? (
            <form className="auth-form" onSubmit={handleForgotPassword}>
              <label>
                Email Address
                <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="you@example.com" required />
              </label>
              {authMessage && <div className="auth-error">{authMessage}</div>}
              <button type="submit" className="btn primary full" disabled={authLoading}>
                {authLoading ? "Sending..." : "Send Reset Link"}
              </button>
              <button type="button" className="btn secondary full" onClick={() => { setAuthFlow("signin"); setAuthMessage(""); setForgotEmail(""); }}>
                Back to Login
              </button>
            </form>
          ) : authFlow === "reset" ? (
            <form className="auth-form" onSubmit={handleResetPasswordSubmit}>
              <label>
                New Password
                <input type="password" value={resetPasswordForm.password} onChange={e => setResetPasswordForm(prev => ({ ...prev, password: e.target.value }))} placeholder="********" required />
              </label>
              <label>
                Confirm New Password
                <input type="password" value={resetPasswordForm.confirm_password} onChange={e => setResetPasswordForm(prev => ({ ...prev, confirm_password: e.target.value }))} placeholder="********" required />
              </label>
              {authMessage && <div className="auth-error">{authMessage}</div>}
              <button type="submit" className="btn primary full" disabled={authLoading}>
                {authLoading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          ) : authFlow === "success" ? (
            <div className="auth-form">
              <div className="auth-note">
                Your password has been reset successfully. You can now sign in with your new password.
              </div>
              {authMessage && <div className="auth-error">{authMessage}</div>}
              <button type="button" className="btn primary full" onClick={() => { setAuthOpen(false); setAuthFlow("signin"); setAuthMode("signin"); setAuthMessage(""); setResetToken(""); setResetPasswordForm({ password: "", confirm_password: "" }); }}>
                Login
              </button>
            </div>
          ) : authStage === "verification" ? (
            <div className="auth-form">
              <div className="auth-toggle" style={{ marginBottom: 18 }}>
                <button type="button" className={verificationMethod === "email" ? "active" : ""} onClick={() => setVerificationMethod("email")}>Email Link</button>
                <button type="button" className={verificationMethod === "otp" ? "active" : ""} onClick={() => setVerificationMethod("otp")}>Mobile OTP</button>
              </div>

              <div className="auth-note">
                {verificationMethod === "email"
                  ? "We've created a secure verification link for your email. You can also manually verify by using the generated token or request a fresh link."
                  : "Enter the OTP sent to your mobile number to complete verification."}
              </div>

              {verificationMethod === "email" && verificationData?.link && (
                <a className="btn secondary full" href={verificationData.link} target="_blank" rel="noreferrer" style={{ textAlign: "center", textDecoration: "none" }}>
                  Open verification link
                </a>
              )}

              <label>
                {verificationMethod === "email" ? "Verification token from email" : "OTP code"}
                <input
                  value={verificationCode}
                  onChange={e => setVerificationCode(e.target.value)}
                  placeholder={verificationMethod === "email" ? "Paste token from email link" : "Code from email/SMS"}
                />
              </label>
              <div className="auth-note">
                {verificationMethod === "email"
                  ? "Open the verification link in your email, or paste the token from that link here."
                  : "Enter the one-time code sent to your email/SMS. Codes are never shown in the app."}
              </div>

              {authMessage && <div className="auth-error">{authMessage}</div>}

              <button type="button" className="btn primary full" onClick={() => handleVerificationAction("verify")} disabled={authLoading}>
                {authLoading ? "Checking..." : verificationMethod === "email" ? "Verify email" : "Verify OTP"}
              </button>

              <button type="button" className="btn secondary full" onClick={() => handleVerificationAction("send")} disabled={authLoading}>
                {authLoading ? "Please wait..." : "Send a new code"}
              </button>

              <button type="button" className="btn secondary full" onClick={() => {
                setAuthOpen(false);
                setAuthStage("form");
                setAuthMode("signin");
                setAuthMessage("");
                setPendingCheckout(false);
                notify("Sign in is required to place an order.");
              }}>
                Continue as guest
              </button>
            </div>
          ) : authMode === "otp" ? (
            <form className="auth-form" onSubmit={verificationCode ? handleOtpLoginSubmit : handleOtpLoginRequest}>
              <label>
                Registered mobile number
                <input value={authForm.mobile_number} onChange={e => setAuthForm(prev => ({ ...prev, mobile_number: e.target.value }))} placeholder="9876543210" required />
              </label>

              {authMessage && <div className="auth-error">{authMessage}</div>}

              {verificationCode || authMessage?.toLowerCase().includes("otp") ? (
                <label>
                  OTP code
                  <input value={verificationCode} onChange={e => setVerificationCode(e.target.value)} placeholder="123456" required />
                </label>
              ) : null}

              <button type="submit" className="btn primary full" disabled={authLoading}>
                {authLoading ? "Please wait..." : verificationCode ? "Verify & Sign In" : "Send OTP"}
              </button>

              <button type="button" className="btn secondary full" onClick={() => {
                setAuthOpen(false);
                setAuthStage("form");
                setAuthMessage("");
                setVerificationCode("");
                setAuthMode("signin");
                setPendingCheckout(false);
                notify("Sign in is required to place an order.");
              }}>
                Continue as guest
              </button>

              <div className="auth-footer-link">
                Need a password login?
                <button type="button" onClick={() => setAuthMode("signin")}>
                  Sign in instead
                </button>
              </div>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleAuthSubmit}>
              {authMode === "signup" && (
                <div className="auth-row">
                  <label>
                    First name
                    <input value={authForm.first_name} onChange={e => setAuthForm(prev => ({ ...prev, first_name: e.target.value }))} placeholder="Aisha" />
                  </label>
                  <label>
                    Last name
                    <input value={authForm.last_name} onChange={e => setAuthForm(prev => ({ ...prev, last_name: e.target.value }))} placeholder="Patel" />
                  </label>
                </div>
              )}

              <label>
                Username
                <input value={authForm.username} onChange={e => setAuthForm(prev => ({ ...prev, username: e.target.value }))} placeholder="aishapatel" required />
              </label>

              {authMode === "signup" && (
                <>
                  <label>
                    Email
                    <input type="email" value={authForm.email} onChange={e => setAuthForm(prev => ({ ...prev, email: e.target.value }))} placeholder="you@example.com" required />
                  </label>

                  <label>
                    Mobile number
                    <input value={authForm.mobile_number} onChange={e => setAuthForm(prev => ({ ...prev, mobile_number: e.target.value }))} placeholder="9876543210" required />
                  </label>
                </>
              )}

              <label>
                Password
                <input type="password" value={authForm.password} onChange={e => setAuthForm(prev => ({ ...prev, password: e.target.value }))} placeholder="********" required />
              </label>

              {authMessage && <div className="auth-error">{authMessage}</div>}

              <button type="submit" className="btn primary full" disabled={authLoading}>
                {authLoading ? "Please wait..." : authMode === "signup" ? "Create Account" : "Sign In"}
              </button>

              <button type="button" className="btn secondary full" onClick={() => {
                setAuthOpen(false);
                setAuthStage("form");
                setAuthMessage("");
                setPendingCheckout(false);
                notify("Sign in is required to place an order.");
              }}>
                Continue as guest
              </button>

              {authMode === "signin" && (
                <div className="auth-footer-link" style={{ justifyContent: "space-between" }}>
                  <button type="button" onClick={() => { setAuthFlow("forgot"); setAuthMessage(""); }}>
                    Forgot Password?
                  </button>
                </div>
              )}

              <div className="auth-footer-link">
                {authMode === "signin" ? "New here?" : "Already have an account?"}
                <button type="button" onClick={() => setAuthMode(authMode === "signin" ? "signup" : "signin")}>
                  {authMode === "signin" ? "Create account" : "Sign in"}
                </button>
              </div>

              {user && (
                <button type="button" className="btn secondary full" onClick={handleSignOut}>
                  Sign out
                </button>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthDialog;
