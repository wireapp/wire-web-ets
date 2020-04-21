// Enable the option "This project is parameterized" and add following parameters:
// BRANCH as String parameter
// NODE as String parameter
// JENKINSBOT_SECRET as Credentials parameter with type "Secret text"

node("$NODE") {

  def jenkinsbot_secret = ''
  withCredentials([string(credentialsId: "${params.JENKINSBOT_SECRET}", variable: 'JENKINSBOT_SECRET')]) {
    jenkinsbot_secret = env.JENKINSBOT_SECRET
  }

  def runningStatus = sh returnStatus: true, script: 'test -r "${HOME}/.pm2/dump.pm2"'

  def commit_hash = ""
  stage('Checkout & Clean') {
    def scmVars = git branch: "$BRANCH", url: 'https://github.com/wireapp/wire-web-ets.git'
    commit_hash = scmVars.GIT_COMMIT
  }

  def commit_msg = ""
  stage('Build') {
    commit_msg = sh returnStdout: true, script: 'git log -n 1 --pretty=format:"%ar - %an: %s"'
    try {
      def NODE = tool name: 'node-v12.13.0', type: 'nodejs'
      withEnv(["PATH+NODE=${NODE}/bin"]) {
        sh 'npm install -g yarn pm2'
        sh 'yarn install --no-progress'
        sh 'yarn dist'
        sh 'git rev-parse HEAD > ./dist/commit'
        if (runningStatus == 1) {
          sh 'pm2 kill'
          sh 'pm2 install pm2-logrotate'
          sh 'pm2 set pm2-logrotate:retain 20'
          sh 'pm2 set pm2-logrotate:compress true'
        }
      }
    } catch(e) {
      currentBuild.result = 'FAILED'
      wireSend secret: "${jenkinsbot_secret}", message: "❌ 🐛 **${JOB_NAME} ${BRANCH} on ${NODE} build failed**\n${commit_msg}\nSee: ${JOB_URL}"
      throw e
    }
  }

  stage('Install') {
    try {
      def NODE = tool name: 'node-v12.13.0', type: 'nodejs'
      sh "mkdir -p ${HOME}/.config/systemd/user/"

      sh """printf \\
'[Unit]
Description=wire-web-ets
After=network.target

[Service]
LimitNOFILE=infinity
LimitNPROC=infinity
LimitCORE=infinity
TimeoutStartSec=8
WorkingDirectory=${WORKSPACE}
Environment="PATH=/usr/bin:/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:${NODE}/bin"
Environment="PM2_HOME=${HOME}/.pm2"
PIDFile=${HOME}/.pm2/pm2.pid
ExecStart=${NODE}/bin/pm2 start
ExecReload=${NODE}/bin/pm2 reload all --update-env
ExecStop=${NODE}/bin/pm2 kill
Restart=always
RestartSec=8

[Install]
WantedBy=default.target
' \\
> ${HOME}/.config/systemd/user/wire-web-ets.service"""

      sh 'systemctl --user enable wire-web-ets'
    } catch(e) {
      currentBuild.result = 'FAILED'
      wireSend secret: "${jenkinsbot_secret}", message: "❌ 🐛 **${JOB_NAME} ${BRANCH} on ${NODE} install failed**\n${commit_msg}\nSee: ${JOB_URL}"
      throw e
    }
  }

  stage('Restart server') {
    try {
      sh 'systemctl --user daemon-reload'

      if (runningStatus == 0) {
        sh 'systemctl --user restart wire-web-ets'
      } else {
        def NODE = tool name: 'node-v12.13.0', type: 'nodejs'
        withEnv(["PATH+NODE=${NODE}/bin"]) {
          sh 'cd ${WORKSPACE}'
          sh 'yarn start'
          sh 'pm2 save'
          sh 'systemctl --user restart wire-web-ets'
        }
      }
    } catch(e) {
      currentBuild.result = 'FAILED'
      wireSend secret: "${jenkinsbot_secret}", message: "❌ 🐛 **Restarting ETS ${BRANCH} on ${NODE} failed**\n${commit_msg}\nSee: ${JOB_URL}"
      throw e
    }
  }

  wireSend secret: "${jenkinsbot_secret}", message: "🐛 **New ETS ${BRANCH} on ${NODE} is up and running**\n${commit_msg}"

  if("$BRANCH" == "dev") {
    stage('Test') {
       build job: 'wire-web-ets_Smoke_Tests', wait: false
    }
  }
}
