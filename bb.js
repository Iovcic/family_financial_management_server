import crypto from "crypto";

const accessSecret = crypto.randomBytes(32).toString("hex");
const refreshSecret = crypto.randomBytes(32).toString("hex");

console.log("Access Secret:", accessSecret);
console.log("Refresh Secret:", refreshSecret);
