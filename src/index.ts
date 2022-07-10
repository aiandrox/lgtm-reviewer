import * as core from "@actions/core";
import { context, getOctokit } from "@actions/github";

const github_token = core.getInput("GITHUB_TOKEN");
const octokit = getOctokit(github_token);

const run = async () => {
  try {
    if (context.eventName !== "pull_request") {
      console.warn(`event name is not 'pull_request': ${context.eventName}`);
      return;
    }

    const pull_number = context.payload.pull_request!.number;
    const commits = await octokit.rest.pulls.listCommits({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: pull_number,
    });

    if (context.payload.action == "opened") {
      const chunk = Array.from(
        new Set(commits.data.map((data) => data.commit.message))
      );

      const randomCommitMessage =
        chunk[Math.floor(Math.random() * chunk.length)];
      await octokit.rest.issues.createComment({
        ...context.repo,
        issue_number: pull_number,
        body: `${randomCommitMessage} がいいね！`,
      });
    }

    if (false) approve(pull_number, "LGTM!!"); // 今は実行しない
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  }
};

const approve = (pull_number: number, message: string) => {
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
