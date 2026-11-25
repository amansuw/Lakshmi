#!/usr/bin/env node
const base = process.env.LAKSHMI_URL || "http://localhost:3000";

const res = await fetch(`${base}/api/poll`, { method: "POST" });
const body = await res.json();
if (!res.ok) {
  console.error(body);
  process.exit(1);
}
console.log(JSON.stringify(body, null, 2));
