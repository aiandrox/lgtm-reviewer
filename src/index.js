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

  const github_token = core.getInput("GITHUB_TOKEN");
  const octokit = github.getOctokit(github_token);
  const pull_number = context.payload.pull_request.number;
  const message = "LGTM";

  const { comment } = await octokit.rest.issues.createComment({
    ...context.repo,
    issue_number: pull_number,
    body: message,
  });
  console.log({ comment });
} catch (error) {
  core.setFailed(error.message);
}
