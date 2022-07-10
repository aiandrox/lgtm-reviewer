import * as core from "@actions/core";
import { context, getOctokit } from "@actions/github";

const github_token = core.getInput("GITHUB_TOKEN");
const octokit = getOctokit(github_token);

const REACTIONS = ["+1", "laugh", "heart", "hooray", "rocket"] as const;
type Reaction = typeof REACTIONS[number];

const run = async () => {
  try {
    if (context.eventName !== "pull_request") {
      console.warn(`event name is not 'pull_request': ${context.eventName}`);
      return;
    }

    const pull_number = context.payload.pull_request!.number;
    core.setOutput("pull_number", pull_number);
    const commits = await octokit.rest.pulls.listCommits({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: pull_number,
    });

    if (context.payload.action == "opened") {
      addReactions(context.payload.comment!.id);

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

    createApprovalReview(pull_number);
    if (context.payload.pull_request!.changed_files > 1)
      approve(pull_number, "LGTM!!");
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  }
};

const createApprovalReview = (pull_number: number) => {
  octokit.rest.pulls.createReview({
    owner: context.repo.owner,
    repo: context.repo.repo,
    pull_number: pull_number,
    event: "APPROVE",
  });
};

const addReactions = async (comment_id: number) => {
  await Promise.allSettled(
    REACTIONS.map(async (content) => {
      await octokit.rest.reactions.createForIssueComment({
        ...context.repo,
        comment_id,
        content,
      });
    })
  );
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
