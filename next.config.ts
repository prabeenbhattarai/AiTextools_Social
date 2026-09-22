import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // firebase-admin (via jwks-rsa -> jose, which is ESM-only) must be loaded by
  // Node at runtime, not bundled. Keeping it external avoids the
  // ERR_REQUIRE_ESM failure in the serverless runtime.
  serverExternalPackages: ["firebase-admin"],
};

export default nextConfig;
