const core = require("@actions/core");
import { context, GitHub } from "@actions/github";

try {
  if (context.eventName !== "pull_request") {
    // eslint-disable-next-line no-console
    console.warn(`event name is not 'pull_request': ${context.eventName}`);
    return;
  }
  // `who-to-greet` input defined in action metadata file
  const nameToGreet = core.getInput("who-to-greet");
  console.log(`Hello ${nameToGreet}!`);
  const time = new Date().toTimeString();
  core.setOutput("time", time);
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(context.payload, undefined, 2);
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}
