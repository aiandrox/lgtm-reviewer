import * as core from "@actions/core";
import { context, getOctokit } from "@actions/github";

const run = async () => {
  try {
    if (context.eventName !== "pull_request") {
      // eslint-disable-next-line no-console
      console.warn(`event name is not 'pull_request': ${context.eventName}`);
      return;
    }

    approve();
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  }
};

const approve = () => {
  const github_token = core.getInput("GITHUB_TOKEN");
  const octokit = getOctokit(github_token);
  const pull_number = context.payload.pull_request!.number;
  const message = "LGTM";

  octokit.rest.issues.createComment({
    ...context.repo,
    issue_number: pull_number,
    body: message,
  });
  // デバッグに差し支えるのでコメントアウト
  // octokit.rest.pulls.merge({
  //   ...context.repo,
  //   pull_number,
  // });
};

run();
