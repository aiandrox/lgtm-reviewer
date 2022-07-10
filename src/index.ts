import fetch from 'node-fetch';
import * as core from '@actions/core';
import { context, getOctokit } from '@actions/github';

const github_token = core.getInput('GITHUB_TOKEN');
const octokit = getOctokit(github_token);
const APPROVABLE_CHANGED_FILES = core.getInput('');

const REACTIONS = ['+1', 'laugh', 'heart', 'hooray', 'rocket'] as const;
type Reaction = typeof REACTIONS[number];

const run = async () => {
  try {
    if (context.eventName !== 'pull_request') {
      console.warn(`event name is not 'pull_request': ${context.eventName}`);
      return;
    }

    console.log(`ファイル差分${core.getInput('GIT_DIFF_FILTERED').length}`);
    console.log(typeof core.getInput('GIT_DIFF_FILTERED').length);

    const pull_number = context.payload.pull_request!.number;
    core.setOutput('pull_number', pull_number);
    const commits = await octokit.rest.pulls.listCommits({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: pull_number,
    });

    if (context.payload.action == 'opened') {
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
    if (context.payload.pull_request!.changed_files > APPROVABLE_CHANGED_FILES)
      createLgtmComment(pull_number);
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
    event: 'APPROVE',
  });
};

const createLgtmComment = (pull_number: number) => {
  fetch('https://lgtmoon.herokuapp.com/api/images/random')
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      const url: string = data.images[0].url;
      octokit.rest.issues.createComment({
        ...context.repo,
        issue_number: pull_number,
        body: `![](${url})`,
      });
    });
};

// TODO: ↓どこかで呼び出す
const mergePullRequest = (pull_number: number) => {
  if (context.payload.pull_request!.mergeable)
    octokit.rest.pulls.merge({
      ...context.repo,
      pull_number,
    });
};

run();
