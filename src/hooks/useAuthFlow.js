import { useState } from "react";
import {
  forgotPassword,
  requestLoginOtp,
  resetPassword,
  sendVerification,
  signIn,
  signUp,
  verifyEmail,
  verifyLoginOtp,
  verifyOtp,
  verifyResetToken,
} from "../services/authService";

const EMPTY_AUTH_FORM = {
  first_name: "",
  last_name: "",
  username: "",
  email: "",
  mobile_number: "",
  password: "",
};

export default function useAuthFlow({ notify, openCheckout }) {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("signin");
  const [authStage, setAuthStage] = useState("form");
  const [authLoading, setAuthLoading] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [authFlow, setAuthFlow] = useState("signin");
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [resetPasswordForm, setResetPasswordForm] = useState({ password: "", confirm_password: "" });
  const [verificationMethod, setVerificationMethod] = useState("email");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationData, setVerificationData] = useState(null);
  const [user, setUser] = useState(null);
  const [authForm, setAuthForm] = useState(EMPTY_AUTH_FORM);

  function resetAuthForm() {
    setAuthForm(EMPTY_AUTH_FORM);
    setVerificationCode("");
    setVerificationData(null);
    setAuthMessage("");
  }

  function handleAuthSubmit(event) {
    event.preventDefault();
    setAuthLoading(true);
    setAuthMessage("");

    const payload = authMode === "signup"
      ? {
          first_name: authForm.first_name,
          last_name: authForm.last_name,
          username: authForm.username,
          email: authForm.email,
          mobile_number: authForm.mobile_number,
          password: authForm.password,
        }
      : { username: authForm.username, password: authForm.password };

    const request = authMode === "signup" ? signUp(payload) : signIn(payload);
    request
      .then(data => {
        if (authMode === "signup") {
          setVerificationData({
            email: authForm.email,
            token: "",
            link: "",
            otp: "",
            user: data.user || null,
          });
          setVerificationMethod("email");
          setVerificationCode("");
          setAuthStage("verification");
          setAuthMessage(data.message || "Your account was created. Check your email for the verification link and code.");
          setAuthForm(previous => ({ ...previous, password: "" }));
          return;
        }

        localStorage.setItem("pinkbakes_token", data.token);
        setUser(data.user);
        setAuthOpen(false);
        resetAuthForm();
        notify("Welcome back!");
        if (pendingCheckout) {
          setPendingCheckout(false);
          openCheckout(data.user);
        }
      })
      .catch(error => setAuthMessage(error.message || "Something went wrong."))
      .finally(() => setAuthLoading(false));
  }

  function handleOtpLoginRequest(event) {
    event.preventDefault();
    const mobile = authForm.mobile_number.trim();
    if (!mobile) {
      setAuthMessage("Please enter your registered mobile number.");
      return;
    }

    setAuthLoading(true);
    setAuthMessage("");
    requestLoginOtp({ mobile })
      .then(data => {
        setAuthMessage(data.message || "OTP sent successfully.");
        setVerificationCode("");
        setAuthMode("otp");
      })
      .catch(error => setAuthMessage(error.message || "Unable to send OTP right now."))
      .finally(() => setAuthLoading(false));
  }

  function handleOtpLoginSubmit(event) {
    event.preventDefault();
    const mobile = authForm.mobile_number.trim();
    if (!mobile) {
      setAuthMessage("Please enter your registered mobile number.");
      return;
    }
    if (!verificationCode.trim()) {
      setAuthMessage("Please enter the OTP sent to your mobile number.");
      return;
    }

    setAuthLoading(true);
    setAuthMessage("");
    verifyLoginOtp({ mobile, otp: verificationCode })
      .then(data => {
        localStorage.setItem("pinkbakes_token", data.token);
        setUser(data.user);
        setAuthOpen(false);
        resetAuthForm();
        notify("Logged in with OTP!");
        if (pendingCheckout) {
          setPendingCheckout(false);
          openCheckout(data.user);
        }
      })
      .catch(error => setAuthMessage(error.message || "OTP login failed."))
      .finally(() => setAuthLoading(false));
  }

  function handleForgotPassword(event) {
    event.preventDefault();
    setAuthLoading(true);
    setAuthMessage("");
    forgotPassword({ email: forgotEmail })
      .then(data => {
        setAuthMessage(data.message || "If an account exists with this email address, a password reset link has been sent.");
        setForgotEmail("");
      })
      .catch(error => setAuthMessage(error.message || "Unable to send a password reset link right now."))
      .finally(() => setAuthLoading(false));
  }

  function handleVerifyResetToken(tokenValue) {
    return verifyResetToken({ token: tokenValue })
      .then(() => true)
      .catch(() => false);
  }

  function handleResetPasswordSubmit(event) {
    event.preventDefault();
    setAuthLoading(true);
    setAuthMessage("");

    if (!resetToken.trim()) {
      setAuthMessage("This password reset link is invalid or has expired.");
      setAuthLoading(false);
      return;
    }
    if (resetPasswordForm.password.length < 8) {
      setAuthMessage("Password must be at least 8 characters long.");
      setAuthLoading(false);
      return;
    }
    if (resetPasswordForm.password !== resetPasswordForm.confirm_password) {
      setAuthMessage("Passwords do not match.");
      setAuthLoading(false);
      return;
    }

    resetPassword({
      token: resetToken,
      password: resetPasswordForm.password,
      confirm_password: resetPasswordForm.confirm_password,
    })
      .then(data => {
        setAuthMessage(data.message || "Your password has been reset successfully.");
        setResetPasswordForm({ password: "", confirm_password: "" });
        setAuthFlow("success");
      })
      .catch(error => setAuthMessage(error.message || "Unable to reset your password."))
      .finally(() => setAuthLoading(false));
  }

  function handleVerificationAction(action) {
    if (!verificationData?.email) {
      setAuthMessage("Please complete signup again to generate a verification request.");
      return;
    }

    if (action === "send") {
      setAuthLoading(true);
      sendVerification({ email: verificationData.email, method: verificationMethod })
        .then(data => {
          setVerificationData({
            email: verificationData.email,
            token: "",
            link: "",
            otp: "",
            user: verificationData.user,
          });
          setVerificationCode("");
          setAuthMessage(data.message || `A new ${verificationMethod === "email" ? "email link" : "OTP"} has been sent. Check your inbox.`);
        })
        .catch(error => setAuthMessage(error.message || "Verification request failed."))
        .finally(() => setAuthLoading(false));
      return;
    }

    if (verificationMethod === "email") {
      const token = (verificationCode || verificationData.token || "").trim();
      if (!token) {
        setAuthMessage("Paste the verification token from your email link, or open the link from your inbox.");
        return;
      }
      setAuthLoading(true);
      verifyEmail({ token })
        .then(() => {
          setAuthMessage("Email verified successfully. You can now sign in.");
          setAuthStage("form");
          setAuthMode("signin");
          setAuthForm(previous => ({ ...previous, username: verificationData.user?.username || previous.username, email: verificationData.email }));
          setVerificationData(null);
        })
        .catch(error => setAuthMessage(error.message || "Email verification failed."))
        .finally(() => setAuthLoading(false));
      return;
    }

    if (!verificationCode.trim()) {
      setAuthMessage("Enter the OTP sent to your mobile number.");
      return;
    }
    setAuthLoading(true);
    verifyOtp({ email: verificationData.email, otp: verificationCode })
      .then(() => {
        setAuthMessage("Mobile verification successful. You can now sign in.");
        setAuthStage("form");
        setAuthMode("signin");
        setAuthForm(previous => ({ ...previous, username: verificationData.user?.username || previous.username, email: verificationData.email }));
        setVerificationData(null);
      })
      .catch(error => setAuthMessage(error.message || "OTP verification failed."))
      .finally(() => setAuthLoading(false));
  }

  return {
    authOpen, setAuthOpen,
    authMode, setAuthMode,
    authStage, setAuthStage,
    authLoading,
    pendingCheckout, setPendingCheckout,
    authMessage, setAuthMessage,
    authFlow, setAuthFlow,
    forgotEmail, setForgotEmail,
    resetToken, setResetToken,
    resetPasswordForm, setResetPasswordForm,
    verificationMethod, setVerificationMethod,
    verificationCode, setVerificationCode,
    verificationData, setVerificationData,
    user, setUser,
    authForm, setAuthForm,
    handleAuthSubmit,
    handleOtpLoginRequest,
    handleOtpLoginSubmit,
    handleForgotPassword,
    handleVerifyResetToken,
    handleResetPasswordSubmit,
    handleVerificationAction,
  };
}
