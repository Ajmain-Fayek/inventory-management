"use client";

import { useLanguage } from "../../../context/LanguageContext";
import { authService } from "../../../services/auth.service";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { useUser } from "@/context/UserContext";
import { FaFacebook } from "react-icons/fa";
import { Mail, Lock } from "lucide-react";
import { Divider } from "@heroui/divider";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@heroui/button";
import { motion } from "framer-motion";
import { Input } from "@heroui/input";
import { Link } from "@heroui/link";
import { Suspense, useState } from "react";
import { getErrorMessage } from "@/utils/errorParser";

export default function LoginPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPage />
    </Suspense>
  );
}

function LoginPage() {
  const { refreshSession } = useUser();
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState<"google" | "facebook" | null>(null);
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
      await authService.login({ email, password });

      await refreshSession("email-password");

      const redirect = searchParams.get("redirect") || "/";
      router.push(redirect);
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
      setError("Failed to start Google login. Please try again.");
      setIsSocialLoading(null);
    }
  };

  const handleFacebookLogin = async () => {
    setIsSocialLoading("facebook");
    setError("");
    try {
      await authService.facebookLogin();
    } catch {
      setError("Failed to start Facebook login. Please try again.");
      setIsSocialLoading(null);
    }
  };

  return (
    <div className="relative flex w-full flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm z-10"
      >
        <Card className="bg-background/60 dark:bg-default-100/50 backdrop-blur-md border border-white/10 shadow-2xl">
          <CardHeader className="flex flex-col gap-1 text-center pt-8 pb-4">
            <h1 className="text-3xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
              {t("auth.login")}
            </h1>
            <p className="text-default-500 text-sm">{t("auth.login.subtitle")}</p>
          </CardHeader>
          <CardBody className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <p className="text-danger text-sm text-center bg-danger/10 p-2 rounded-md">
                  {error}
                </p>
              )}
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
                placeholder="Enter your password"
                startContent={<Lock size={18} className="text-default-400" />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                isRequired
              />
              <div className="flex justify-between items-center text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded text-primary focus:ring-primary bg-transparent border-default-300"
                  />
                  <span className="text-default-600">Remember me</span>
                </label>
                <Link href="#" size="sm" color="primary">
                  Forgot password?
                </Link>
              </div>
              <Button
                color="primary"
                type="submit"
                isLoading={isLoading}
                className="mt-2 font-semibold shadow-lg shadow-primary/30"
              >
                {t("auth.login")}
              </Button>
            </form>

            <div className="flex items-center gap-4 py-6">
              <Divider className="flex-1" />
              <p className="text-default-500 text-sm">OR</p>
              <Divider className="flex-1" />
            </div>

            <div className="flex flex-col gap-3">
              <Button
                variant="flat"
                className="bg-default-100/50 hover:bg-default-200/50"
                isLoading={isSocialLoading === "google"}
                isDisabled={isSocialLoading !== null}
                onPress={handleGoogleLogin}
                startContent={isSocialLoading !== "google" && <FcGoogle size={18} />}
              >
                {t("auth.continue_with_google")}
              </Button>
              <Button
                variant="flat"
                className="bg-default-100/50 hover:bg-default-200/50"
                isLoading={isSocialLoading === "facebook"}
                isDisabled={isSocialLoading !== null}
                onPress={handleFacebookLogin}
                startContent={
                  isSocialLoading !== "facebook" && (
                    <FaFacebook size={18} className="text-blue-600" />
                  )
                }
              >
                {t("auth.continue_with_facebook")}
              </Button>
            </div>

            <p className="text-center text-sm text-default-500 mt-6">
              {t("auth.dont_have_account")}{" "}
              <Link href="/auth/register" size="sm" className="font-semibold">
                {t("auth.register")}
              </Link>
            </p>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
}
