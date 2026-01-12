import Input from "@/components/common/input";
import LockIcon from "@/components/icons/lock";
import SmsIcon from "@/components/icons/sms";
import { useRouter } from "next/router";
import { useState } from "react";
import { FaChevronLeft, FaCheck, FaX } from "react-icons/fa6";

// Common email domains
const COMMON_EMAIL_DOMAINS = [
  "gmail.com",
  "naver.com",
  "daum.net",
  "hanmail.net",
  "yahoo.com",
  "outlook.com",
  "icloud.com",
];

// Validation indicator component
function ValidationIcon({ isFilled }: { isFilled: boolean }) {
  if (isFilled) {
    return <FaCheck className="text-green-500" />;
  }
  return <FaX className="text-gray-500" />;
}

// Password strength indicator
function PasswordStrengthIndicator({ password }: { password: string }) {
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const isLengthValid = password.length >= 8 && password.length <= 30;

  return (
    <div className="mt-2 space-y-1 text-[12px] text-gray-400">
      <div className={hasLowercase ? "text-green-500" : "text-gray-400"}>
        ✓ Lowercase letters (a-z)
      </div>
      <div className={hasUppercase ? "text-green-500" : "text-gray-400"}>
        ✓ Uppercase letters (A-Z)
      </div>
      <div className={hasNumbers ? "text-green-500" : "text-gray-400"}>
        ✓ Numbers (0-9)
      </div>
      <div className={isLengthValid ? "text-green-500" : "text-gray-400"}>
        ✓ 8-30 characters
      </div>
    </div>
  );
}

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    userId: "",
    emailId: "",
    emailDomain: "gmail.com",
    emailCustom: "",
    password: "",
    confirmPassword: "",
    nickname: "",
    birthDate: "",
    bio: "",
    blogName: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] =
    useState(false);
  const [takenUserId, setTakenUserId] = useState<string | null>(null);
  const [takenEmail, setTakenEmail] = useState<string | null>(null);

  const handleBack = () => {
    window.history.back();
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
    // If userId changes, clear the takenUserId marker
    if (name === "userId") {
      setTakenUserId(null);
    }
    // If email-related fields change, clear the takenEmail marker
    if (
      name === "emailId" ||
      name === "emailDomain" ||
      name === "emailCustom"
    ) {
      setTakenEmail(null);
    }
  };

  // Validation rules
  const isUserIdValid = /^[a-z0-9]{8,}$/.test(formData.userId);
  const isUserIdAvailable = !takenUserId || formData.userId !== takenUserId;
  const getEmail = () => {
    const domain =
      formData.emailDomain === "custom"
        ? formData.emailCustom
        : formData.emailDomain;
    return `${formData.emailId}@${domain}`;
  };
  const isEmailIdValid = !!formData.emailId.trim();
  const isEmailDomainValid =
    formData.emailDomain !== "custom"
      ? true
      : /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.emailCustom);
  const isEmailValid = isEmailIdValid && isEmailDomainValid;
  const isEmailAvailable = !takenEmail || getEmail() !== takenEmail;
  const isPasswordValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,30}$/.test(
    formData.password,
  );
  const isConfirmPasswordValid =
    formData.confirmPassword === formData.password && isPasswordValid;
  const isNicknameValid =
    formData.nickname.length >= 5 &&
    !/[!@#$%^&*(),.?":{}|<>]/.test(formData.nickname);
  const isBirthDateValid = !!formData.birthDate;
  const isBlogNameValid =
    formData.blogName.length > 0 &&
    formData.blogName.length <= 50 &&
    !/[!@#$%^&*(),.?":{}|<>\\/]/.test(formData.blogName);

  const isFormValid =
    isUserIdValid &&
    isEmailValid &&
    isPasswordValid &&
    isConfirmPasswordValid &&
    isNicknameValid &&
    isBirthDateValid &&
    isBlogNameValid;

  const validateForm = (): boolean => {
    if (!isUserIdValid) {
      setError(
        "User ID must be at least 8 characters (lowercase letters and numbers only)",
      );
      return false;
    }
    if (!isEmailValid) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!isPasswordValid) {
      setError(
        "Password must be 8-30 characters with uppercase, lowercase, and numbers",
      );
      return false;
    }
    if (!isConfirmPasswordValid) {
      setError("Passwords do not match");
      return false;
    }
    if (!isNicknameValid) {
      setError(
        "Nickname must be at least 5 characters (no special characters)",
      );
      return false;
    }
    if (!isBirthDateValid) {
      setError("Birth date is required");
      return false;
    }
    if (!isBlogNameValid) {
      if (formData.blogName.length === 0) {
        setError("Blog name is required");
      } else if (formData.blogName.length > 50) {
        setError("Blog name must be under 50 bytes");
      } else {
        setError("Blog name cannot contain special characters");
      }
      return false;
    }
    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const birthYmd = formData.birthDate.replace(/-/g, "");
      const jsonObj = JSON.stringify({
        userId: formData.userId,
        pwd: formData.password,
        email: getEmail(),
        birthYmd: birthYmd || null,
        nickname: formData.nickname,
        blogName: formData.blogName,
        bio: formData.bio || null,
      });

      const response = await fetch(
        `/api/backend/users/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: formData.userId,
            pwd: formData.password,
            email: getEmail(),
            birthYmd: birthYmd || null,
            nickname: formData.nickname,
            blogName: formData.blogName,
            bio: formData.bio || null,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage =
          errorData.data?.message || errorData.message || "Sign up failed";

        // If it's a "user already exists" error, mark the userId as taken
        if (
          errorMessage.toLowerCase().includes("user") &&
          (errorMessage.toLowerCase().includes("already") ||
            errorMessage.toLowerCase().includes("exist"))
        ) {
          setTakenUserId(formData.userId);
        }

        // If it's an "email already exists" error, mark the email as taken
        if (
          errorMessage.toLowerCase().includes("email") &&
          (errorMessage.toLowerCase().includes("already") ||
            errorMessage.toLowerCase().includes("exist"))
        ) {
          setTakenEmail(getEmail());
        }

        // Show system alert
        alert("Sign Up Error: " + errorMessage);
        return;
      }

      // Show success alert
      alert("Account created successfully! Please log in.");
      // Don't auto-login, redirect to login page instead
      router.push("/login");
    } catch (err) {
      const errorMessage =
        "An error occurred during sign up. Please try again.";
      // Show system alert
      alert("Sign Up Error: " + errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    router.push("/login");
  };

  return (
    <div
      className="flex h-screen flex-col items-center gap-5 overflow-y-auto bg-black-primary text-white-primary"
      style={{ position: "relative" }}
    >
      <div className="relative flex w-full items-center justify-start px-5 pt-5">
        <div
          className="flex h-[40px] w-[40px] cursor-pointer items-center justify-center rounded-lg bg-[#262626] hover:bg-[#3a3a3a]"
          onClick={handleBack}
        >
          <FaChevronLeft />
        </div>
      </div>
      <div className="flex w-[90%] flex-col gap-5 pb-10">
        <div>
          <div className="relative flex items-center justify-center">
            <h1 className="text-[22px] font-bold">Create Account 🎉</h1>
          </div>
          <p className="text-center text-[15px] text-gray-400">
            Join us to start sharing your stories and ideas.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {/* User ID */}
          <div>
            <Input
              type="text"
              placeholder="User ID (8+ lowercase letters & numbers)"
              name="userId"
              value={formData.userId}
              onChange={handleInputChange}
              icon={
                takenUserId && formData.userId === takenUserId ? (
                  <FaX className="text-red-500" />
                ) : (
                  <ValidationIcon
                    isFilled={isUserIdValid && isUserIdAvailable}
                  />
                )
              }
            />
            {formData.userId && !isUserIdValid && (
              <p className="mt-1 text-[12px] text-red-500">
                Must be at least 8 characters (lowercase a-z and 0-9 only)
              </p>
            )}
            {takenUserId === formData.userId && (
              <p className="mt-1 text-[12px] text-red-500">
                This user ID is already taken
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Email ID"
                  name="emailId"
                  value={formData.emailId}
                  onChange={handleInputChange}
                  icon={<SmsIcon />}
                />
              </div>
              <span className="text-white-primary">@</span>
              <div className="flex-1">
                {formData.emailDomain === "custom" ? (
                  <Input
                    type="text"
                    placeholder="domain.com"
                    name="emailCustom"
                    value={formData.emailCustom}
                    onChange={handleInputChange}
                    icon={<ValidationIcon isFilled={isEmailDomainValid} />}
                  />
                ) : (
                  <select
                    name="emailDomain"
                    value={formData.emailDomain}
                    onChange={handleInputChange}
                    className="h-[56px] w-full rounded-lg bg-[#262626] px-4 text-white-primary focus:outline-none focus:ring-1 focus:ring-key-primary"
                  >
                    {COMMON_EMAIL_DOMAINS.map((domain) => (
                      <option
                        key={domain}
                        value={domain}
                        className="bg-[#262626]"
                      >
                        {domain}
                      </option>
                    ))}
                    <option value="custom" className="bg-[#262626]">
                      Custom
                    </option>
                  </select>
                )}
              </div>
            </div>
            {isEmailIdValid && isEmailDomainValid && (
              <p
                className={`mt-1 text-[12px] ${takenEmail === getEmail() ? "text-red-500" : "text-green-500"}`}
              >
                {takenEmail === getEmail()
                  ? "This email is already taken"
                  : `Email: ${getEmail()}`}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <Input
              icon={
                formData.password && isPasswordValid ? (
                  <FaCheck className="text-green-500" />
                ) : (
                  <LockIcon />
                )
              }
              type="password"
              placeholder="Password (8-30 chars, uppercase, lowercase, numbers)"
              name="password"
              value={formData.password}
              onChange={(e) => {
                handleInputChange(e);
                setShowPasswordRequirements(true);
              }}
              onBlur={() => setShowPasswordRequirements(false)}
            />
            {showPasswordRequirements && formData.password && (
              <PasswordStrengthIndicator password={formData.password} />
            )}
          </div>

          {/* Confirm Password */}
          <Input
            icon={
              formData.confirmPassword && isConfirmPasswordValid ? (
                <FaCheck className="text-green-500" />
              ) : (
                <LockIcon />
              )
            }
            type="password"
            placeholder="Confirm Password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
          />

          {/* Nickname */}
          <div>
            <Input
              type="text"
              placeholder="Nickname (5+ characters, no special characters)"
              name="nickname"
              value={formData.nickname}
              onChange={handleInputChange}
              icon={<ValidationIcon isFilled={isNicknameValid} />}
            />
            {formData.nickname && !isNicknameValid && (
              <p className="mt-1 text-[12px] text-red-500">
                {formData.nickname.length < 5
                  ? "Must be at least 5 characters"
                  : "No special characters allowed"}
              </p>
            )}
          </div>

          {/* Birth Date */}
          <div className="flex flex-col gap-1">
            <label className="text-[13px] text-gray-400">Birth Date</label>
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleInputChange}
              className="h-[48px] rounded-lg bg-[#262626] px-4 text-white-primary placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-key-primary"
            />
          </div>

          {/* Blog Name */}
          <div>
            <Input
              type="text"
              placeholder="Blog Name (no special characters, max 50 bytes)"
              name="blogName"
              value={formData.blogName}
              onChange={handleInputChange}
              icon={<ValidationIcon isFilled={isBlogNameValid} />}
            />
            {formData.blogName && !isBlogNameValid && (
              <p className="mt-1 text-[12px] text-red-500">
                {formData.blogName.length === 0
                  ? "Blog name is required"
                  : formData.blogName.length > 50
                    ? "Must be under 50 bytes"
                    : "No special characters allowed"}
              </p>
            )}
          </div>

          {/* Bio */}
          <div className="flex flex-col gap-1">
            <label className="text-[13px] text-gray-400">Bio (Optional)</label>
            <textarea
              name="bio"
              placeholder="Tell us about yourself..."
              value={formData.bio}
              onChange={handleInputChange}
              className="min-h-[100px] rounded-lg bg-[#262626] px-4 py-3 text-white-primary placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-key-primary"
              maxLength={500}
            />
            <p className="text-right text-[12px] text-gray-500">
              {formData.bio.length}/500
            </p>
          </div>

          <button
            className={`h-[48px] w-full rounded-lg py-2 font-bold text-[#0C0C0DB2] transition-opacity ${
              isFormValid && !loading
                ? "cursor-pointer bg-key-primary hover:opacity-90"
                : "cursor-not-allowed bg-[#5B578A] opacity-50"
            }`}
            disabled={!isFormValid || loading}
            onClick={handleSignUp}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>

          <p className="text-center text-[13px] text-gray-400">
            Already Have an Account?{" "}
            <span
              className="cursor-pointer text-key-primary hover:underline"
              onClick={handleLoginRedirect}
            >
              Log in
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
