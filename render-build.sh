#!/usr/bin/env bash
# exit on error
set -o errexit

npm install
npx prisma generate
npm run build

# Install Puppeteer dependencies for Render
# Note: Render Node.js environment usually needs this to run headless Chrome
# Sometimes Render installs these automatically, but we ensure it here.
# Actually, Render Native Environment does not support apt-get directly.
# Let's just rely on Puppeteer's internal Chrome download which usually works on Render if we use the right tricks.
