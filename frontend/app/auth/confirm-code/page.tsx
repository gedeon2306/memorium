"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Mail, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";
import { ROUTES } from "@/constants/routes";
import { useRouter } from "next/navigation";

export default function ConfirmCodePage() {
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const router = useRouter();

  // Handle input change
  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1); // Keep only last character
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const pastedCode = pastedData.split("").filter((char) => /^\d$/.test(char));

    if (pastedCode.length <= 6) {
      const newCode = [...code];
      pastedCode.forEach((char, index) => {
        if (index < 6) {
          newCode[index] = char;
        }
      });
      setCode(newCode);

      // Focus last input if all filled
      if (pastedCode.length === 6) {
        inputRefs.current[5]?.blur();
      } else if (pastedCode.length > 0) {
        inputRefs.current[pastedCode.length - 1]?.focus();
      }
    }
  };

  // Check if all fields are filled
  const isCodeComplete = code.every((digit) => digit !== "");

  // Handle submit
  const handleSubmit = async () => {
    if (!isCodeComplete) return;

    setLoading(true);
    const codeString = code.join("");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 3000));

      setLoading(false);
      toast.success("Code vérifié avec succès !");
      // Redirect to dashboard or next page
    //   router.push(ROUTES.DASHBOARD.ROOT);
    } catch (error) {
      setLoading(false);
      toast.error("Code invalide. Veuillez réessayer.");
    }
  };

  // Handle resend code
  const handleResend = () => {
    toast.success("Un nouveau code a été envoyé à votre email.");
  };

  return (
    <div className="flex justify-center items-center h-screen bg-linear-to-br from-neutral-950 via-neutral-900 to-slate-950 text-base-content overflow-hidden">
      {/* Background decorative elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-20 h-72 w-72 rounded-full bg-blue-950/30 blur-3xl" />
        <div className="absolute left-1/2 -top-30 h-80 w-80 -translate-x-1/2 rounded-full bg-amber-400/15 blur-3xl" />
        <div className="absolute -right-24 top-1/3 h-72 w-72 rounded-full bg-sky-800/20 blur-3xl" />
        <div className="absolute -bottom-35 right-10 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-10 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="flex justify-center"
        >
          {/* Form section */}
          <section className="flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: "easeOut", delay: 0.06 }}
              className="w-full max-w-md"
            >
              <div className="card glass border border-white/10 shadow-2xl">
                <div className="card-body">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="card-title text-xl">Authentification à 2 facteurs</h2>
                      <p className="mt-1 text-sm text-base-content/60">
                        Entrez le code à 6 chiffres reçu par email.
                      </p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                  </div>

                  {/* Code verification inputs */}
                  <div className="mt-6">
                    <label className="label">
                      <span className="label-text text-base-content/70">Code de vérification</span>
                    </label>
                    <div className="mt-2 flex justify-center gap-3">
                      {code.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => {
                            inputRefs.current[index] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          onPaste={handlePaste}
                          disabled={loading}
                          className={`input input-bordered h-14 w-12 text-center text-lg font-bold transition-all duration-200 ${
                            loading ? "opacity-50 cursor-not-allowed" : ""
                          } ${digit ? "input-primary" : ""}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Info message about sent email */}
                  <div className="mt-6 rounded-lg border border-info/30 bg-info/5 p-4">
                    <p className="text-sm text-base-content/80">
                      Un email de confirmation a été envoyé à votre adresse email. Veuillez
                      vérifier votre boîte de réception et votre dossier spam.
                    </p>
                  </div>

                  {/* Verification button */}
                  <button
                    onClick={handleSubmit}
                    disabled={!isCodeComplete || loading}
                    className="btn btn-primary btn-block mt-6"
                  >
                    {loading ? (
                      <span className="loading loading-spinner loading-sm text-primary"></span>
                    ) : (
                      "Vérifier le code"
                    )}
                  </button>

                  {/* Code resend button */}
                  <button
                    onClick={handleResend}
                    disabled={loading}
                    className="btn btn-ghost btn-block mt-3 gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Renvoyer le code
                  </button>

                  {/* Navigation back to login */}
                  <p className="mt-6 text-center text-sm text-base-content/60">
                    Vous avez un problème ?{" "}
                    <Link href={ROUTES.AUTH.LOGIN} className="link link-primary">
                      Retour à la connexion
                    </Link>
                  </p>
                </div>
              </div>
            </motion.div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
