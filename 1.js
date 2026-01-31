"use client";

import { useState } from "react";
import emailjs from "emailjs-com";

export default function VerifyPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);

  const [certificateId, setCertificateId] = useState("");
  const [dob, setDob] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [certInfo, setCertInfo] = useState(null);

  const [message, setMessage] = useState("");

  // ---------------- OTP Functions ----------------
  const generateOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    return code;
  };

  const sendOtp = async () => {
    if (!email) {
      setMessage("⚠️ Please enter your email");
      return;
    }

    const otpCode = generateOtp();

    try {
      const result = await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
        { to_email: email, otp_code: otpCode },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
      );

      console.log("EmailJS Success:", result.text);
      setMessage(`✅ OTP sent to ${email}`);
      setOtpSent(true);
    } catch (err) {
      console.error("EmailJS Error:", err);
      setMessage("❌ Failed to send OTP. Check console.");
    }
  };

  const handleOtpVerify = () => {
    if (!otp) {
      setMessage("⚠️ Enter the OTP received in email");
      return;
    }
    if (otp === generatedOtp) {
      setMessage("✅ OTP verified! Enter certificate details.");
      setVerified(true);
    } else {
      setMessage("❌ Invalid OTP");
    }
  };

  // ---------------- Certificate Verification ----------------
  const handleCertificateVerify = async () => {
    if (!certificateId || !dob || !aadhaar) {
      setMessage("⚠️ Enter all certificate details");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/verify-certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ certificateId, adharNumber: aadhaar }),
      });

      const data = await res.json();
      console.table(data)

      if (data.verified) {
        setMessage("✅ Certificate Verified Successfully");
        setCertInfo(data);
        console.table(certInfo);
      } else {
        setMessage("❌ Certificate Invalid");
        setCertInfo(null);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Verification failed. Check console.");
      setCertInfo(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-6">
      <div className="w-full max-w-lg bg-white shadow-2xl rounded-2xl p-8 border border-purple-200">
        <h1 className="text-3xl font-extrabold text-center mb-6 bg-gradient-to-r from-purple-600 to-pink-500 text-transparent bg-clip-text">
          Certificate Verification
        </h1>

        {message && (
          <div className="mb-4 p-3 text-center rounded-lg shadow-sm bg-gradient-to-r from-indigo-50 to-purple-50 text-gray-800">
            {message}
          </div>
        )}

        {!verified && (
          <>
            <input
              type="email"
              placeholder="Enter your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-300 p-3 text-black w-full mb-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <button
              onClick={sendOtp}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:opacity-70 transition"
            >
              Send OTP
            </button>

            {otpSent && (
              <>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="border border-gray-300 text-black p-3 w-full mt-4 mb-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                <button
                  onClick={handleOtpVerify}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition"
                >
                  Verify OTP
                </button>
              </>
            )}
          </>
        )}

        {verified && (
          <>
            <input
              type="file"
              placeholder="Certificate ID"
              value={certificateId}
              onChange={(e) => setCertificateId(e.target.value)}
              className="border border-gray-300 text-black p-3 w-full mb-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <button
              onClick={handleCertificateVerify}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:opacity-70 transition mb-4"
            >
              Verify Certificate
            </button>

            {certInfo && (
              <div className="p-4 rounded-xl shadow-inner bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300">
                <h2 className="font-bold text-lg text-green-700 mb-2">
                  Certificate Details
                </h2>
                <p className="text-black">
                  <strong className="text-black">Student Name:</strong>{" "}
                  {certInfo.studentName}
                </p>
                <p className="text-black">
                  <strong className="text-black">Course:</strong>{" "}
                  {certInfo.course}
                </p>
                <p className="text-black">
                  <strong className="text-black">College:</strong>{" "}
                  {certInfo.collegeName}
                </p>
                <img className="h-[100px]" src={certInfo.link}></img>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
