import fetch from "node-fetch";
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

  fetch("https://lgtmoon.herokuapp.com/api/images/random")
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      const url:string = data.image[0].url;
      octokit.rest.issues.createComment({
        ...context.repo,
        issue_number: pull_number,
        body: `![](${url})`,
      });
    })
  // デバッグに差し支えるのでコメントアウト
  // octokit.rest.pulls.merge({
  //   ...context.repo,
  //   pull_number,
  // });
};

run();
