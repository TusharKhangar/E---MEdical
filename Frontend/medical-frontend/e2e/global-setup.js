import fs from 'fs';

// Each run starts with an empty app log, so links found in it belong to this run.
export default function globalSetup() {
  try {
    fs.rmSync('e2e/.app.log', { force: true });
  } catch {
    // The server may already hold the file open on Windows; links are matched by e-mail anyway
  }
}
