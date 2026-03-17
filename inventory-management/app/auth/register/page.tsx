"use client";

import { useState } from "react";
import { Link } from "@heroui/link";
import { Input } from "@heroui/input";
import { motion } from "framer-motion";
import { Button } from "@heroui/button";
import { FcGoogle } from "react-icons/fc";
import { Divider } from "@heroui/divider";
import { useRouter } from "next/navigation";
import { FaFacebook } from "react-icons/fa";
import { useUser } from "@/context/UserContext";
import { Mail, Lock, User } from "lucide-react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { useLanguage } from "../../../context/LanguageContext";
import { authService } from "../../../services/auth.service";
import { getErrorMessage } from "@/utils/errorParser";

export default function RegisterPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { refreshSession } = useUser();

  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState<"google" | "facebook" | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // ------------------------------------------------
  //                  Email-Password
  // ------------------------------------------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await authService.register({ name, email, password });

      await refreshSession("email-password");

      router.push("/");
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ------------------------------------------------
  //                  Social
  // ------------------------------------------------

  const handleGoogleLogin = async () => {
    setIsSocialLoading("google");
    setError("");
    try {
      await authService.googleLogin();
    } catch {
      setError("Failed to start Google sign‑up. Please try again.");
      setIsSocialLoading(null);
    }
  };

  const handleFacebookLogin = async () => {
    setIsSocialLoading("facebook");
    setError("");
    try {
      await authService.facebookLogin();
    } catch {
      setError("Failed to start Facebook sign‑up. Please try again.");
      setIsSocialLoading(null);
    }
  };

  return (
    <div className="relative flex w-full flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm z-10"
      >
        <Card className="bg-background/60 dark:bg-default-100/50 backdrop-blur-md border border-white/10 shadow-2xl">
          <CardHeader className="flex flex-col gap-1 text-center pt-8 pb-4">
            <h1 className="text-3xl font-bold bg-linear-to-r from-secondary to-primary bg-clip-text text-transparent">
              {t("auth.register")}
            </h1>
            <p className="text-default-500 text-sm">{t("auth.register.subtitle")}</p>
          </CardHeader>
          <CardBody className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <p className="text-danger text-sm text-center bg-danger/10 p-2 rounded-md">
                  {error}
                </p>
              )}
              <Input
                label="Full Name"
                variant="bordered"
                placeholder="Enter your name"
                startContent={<User size={18} className="text-default-400" />}
                value={name}
                onChange={(e) => setName(e.target.value)}
                isRequired
              />
              <Input
                label="Email"
                type="email"
                variant="bordered"
                placeholder="Enter your email"
                startContent={<Mail size={18} className="text-default-400" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                isRequired
              />
              <Input
                label="Password"
                type="password"
                variant="bordered"
                placeholder="Create a password"
                startContent={<Lock size={18} className="text-default-400" />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                isRequired
              />
              <Button
                color="secondary"
                type="submit"
                isLoading={isLoading}
                className="mt-4 font-semibold shadow-lg shadow-secondary/30"
              >
                {t("auth.register")}
              </Button>
            </form>

            <div className="flex items-center gap-4 py-6">
              <Divider className="flex-1" />
              <p className="text-default-500 text-sm">OR sign up via</p>
              <Divider className="flex-1" />
            </div>

            <div className="flex gap-3">
              <Button
                variant="flat"
                className="bg-default-100/50 hover:bg-default-200/50 flex-1"
                isLoading={isSocialLoading === "google"}
                isDisabled={isSocialLoading !== null}
                onPress={handleGoogleLogin}
              >
                {isSocialLoading !== "google" && <FcGoogle size={18} />}
              </Button>
              <Button
                variant="flat"
                className="bg-default-100/50 hover:bg-default-200/50 flex-1"
                isLoading={isSocialLoading === "facebook"}
                isDisabled={isSocialLoading !== null}
                onPress={handleFacebookLogin}
              >
                {isSocialLoading !== "facebook" && (
                  <FaFacebook size={18} className="text-blue-600" />
                )}
              </Button>
            </div>

            <p className="text-center text-sm text-default-500 mt-6">
              {t("auth.already_have_account")}{" "}
              <Link href="/auth/login" size="sm" color="secondary" className="font-semibold">
                {t("auth.login")}
              </Link>
            </p>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
}
