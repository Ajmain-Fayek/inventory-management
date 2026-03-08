interface EnvConfig {
  FRONTEND_BASE_URL: string;
  BACKEND_BASE_URL: string;
}

const requiredEnvVars = ["NEXT_PUBLIC_FRONTEND_BASE_URL", "NEXT_PUBLIC_BACKEND_BASE_URL"];

function getEnvConfig(): EnvConfig {
  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    console.log(`Missing required environment variables: ${missingVars.join(", ")}`);
  }

  return {
    FRONTEND_BASE_URL: process.env.NEXT_PUBLIC_FRONTEND_BASE_URL!,
    BACKEND_BASE_URL: process.env.NEXT_PUBLIC_BACKEND_BASE_URL!,
  };
}

export const envConfig: EnvConfig = getEnvConfig();
