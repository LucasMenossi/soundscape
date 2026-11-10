import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { config as loadDotEnv, parse } from "dotenv";

const root = process.cwd();
const e2eEnvPath = resolve(root, ".env.e2e");

if (!existsSync(e2eEnvPath)) {
  console.error(
    "Missing .env.e2e. Copy .env.e2e.example, configure a dedicated Neon test branch, and try again.",
  );
  process.exit(1);
}

loadDotEnv({ path: e2eEnvPath, override: true, quiet: true });

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    console.error(`Missing ${name} in .env.e2e.`);
    process.exit(1);
  }
  return value;
}

function normalizedNeonHost(value: string, variableName: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    console.error(`${variableName} must be a valid PostgreSQL URL.`);
    process.exit(1);
  }
  if (url.protocol !== "postgres:" && url.protocol !== "postgresql:") {
    console.error(`${variableName} must use the PostgreSQL protocol.`);
    process.exit(1);
  }
  if (!url.hostname.includes(".neon.tech")) {
    console.error(`${variableName} must point to a Neon endpoint.`);
    process.exit(1);
  }
  return url.hostname.replace("-pooler.", ".");
}

const pooledUrl = required("E2E_DATABASE_URL");
const directUrl = required("E2E_DIRECT_URL");
const pooled = new URL(pooledUrl);
const direct = new URL(directUrl);

if (!pooled.hostname.includes("-pooler.")) {
  console.error("E2E_DATABASE_URL must use the Neon pooled endpoint (-pooler).");
  process.exit(1);
}
if (direct.hostname.includes("-pooler.")) {
  console.error("E2E_DIRECT_URL must use the direct Neon endpoint (without -pooler).");
  process.exit(1);
}
if (
  normalizedNeonHost(pooledUrl, "E2E_DATABASE_URL") !==
  normalizedNeonHost(directUrl, "E2E_DIRECT_URL")
) {
  console.error("The pooled and direct E2E URLs must target the same Neon branch.");
  process.exit(1);
}
if (pooled.pathname !== direct.pathname) {
  console.error("The pooled and direct E2E URLs must target the same database.");
  process.exit(1);
}
if (process.env.E2E_DATABASE_ISOLATED !== "true") {
  console.error(
    'Set E2E_DATABASE_ISOLATED="true" only after confirming these URLs target a dedicated Neon test branch.',
  );
  process.exit(1);
}

const e2eBranchHost = normalizedNeonHost(pooledUrl, "E2E_DATABASE_URL");
for (const localEnvName of [".env.local", ".env"]) {
  const localEnvPath = resolve(root, localEnvName);
  if (!existsSync(localEnvPath)) continue;
  const localEnv = parse(readFileSync(localEnvPath));
  const localDatabaseUrl = localEnv.DATABASE_URL;
  if (!localDatabaseUrl) continue;

  try {
    const localUrl = new URL(localDatabaseUrl);
    // Local PostgreSQL URLs are not Neon branch identifiers, so only compare Neon endpoints.
    if (localUrl.hostname.includes(".neon.tech")) {
      const localHost = localUrl.hostname.replace("-pooler.", ".");
      if (localHost === e2eBranchHost) {
        console.error(
          `The E2E Neon branch matches DATABASE_URL in ${localEnvName}. Create a separate Neon branch before running E2E tests.`,
        );
        process.exit(1);
      }
    }
  } catch {
    console.error(`Could not parse DATABASE_URL in ${localEnvName}.`);
    process.exit(1);
  }
}

const authSecret = required("E2E_AUTH_SECRET");
if (authSecret.length < 32) {
  console.error("E2E_AUTH_SECRET must contain at least 32 characters.");
  process.exit(1);
}

const baseURL = "http://127.0.0.1:3100";
process.env.DATABASE_URL = pooledUrl;
process.env.DIRECT_URL = directUrl;
process.env.AUTH_SECRET = authSecret;
process.env.APP_URL = baseURL;
process.env.AUTH_TRUSTED_ORIGINS = baseURL;
process.env.NEXT_PUBLIC_APP_URL = baseURL;
process.env.NEXT_TELEMETRY_DISABLED = "1";

function run(command: string, args: string[]): void {
  console.log(`\n> ${command} ${args.join(" ")}`);
  const result = spawnSync(command, args, {
    cwd: root,
    env: process.env,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

try {
  // Generate the client and apply existing migrations only to the dedicated E2E branch.
  run("npm", ["run", "db:generate"]);
  run("npm", ["run", "db:deploy"]);
  run("npx", ["playwright", "test"]);
} catch (error) {
  console.error("\nE2E test runner failed:", error);
  process.exit(1);
}
