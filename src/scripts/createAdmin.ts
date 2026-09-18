import bcrypt from "bcrypt";

async function main() {
  const [password] = process.argv.slice(2);
  if (!password) {
    console.error('Usage: pnpm create-admin "yourpassword"');
    process.exit(1);
  }
  const hash = await bcrypt.hash(password, 10);
  console.log("Paste this into .env as ADMIN_PASSWORD_HASH:");
  console.log(hash);
}

main();
