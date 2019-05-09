workflow "Lint, build and test" {
  on = "push"
  resolves = [
    "Build project",
    "Lint project",
    "Test project"
  ]
}

action "Don't skip CI" {
  uses = "./.github/actions/last_commit"
  args = "!/\\[ci skip|skip ci\\]/"
}

action "Install dependencies" {
  uses = "docker://node:10-alpine"
  needs = "Don't skip CI"
  runs = "yarn"
}

action "Lint project" {
  uses = "docker://node:10-alpine"
  needs = "Install dependencies"
  runs = "yarn"
  args = "lint"
}

action "Build project" {
  uses = "docker://node:10-alpine"
  needs = "Install dependencies"
  runs = "yarn"
  args = "dist"
}

action "Test project" {
  uses = "docker://node:10-alpine"
  needs = "Install dependencies"
  runs = "yarn"
  args = "test"
}
