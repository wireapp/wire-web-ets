// Enable the option "This project is parameterized" and add following parameters:
// BRANCH as String parameter
// NODE as String parameter
// JENKINSBOT_SECRET as Credentials parameter with type "Secret text"

node("$NODE") {

  def jenkinsbot_secret = ''
  withCredentials([string(credentialsId: "${params.JENKINSBOT_SECRET}", variable: 'JENKINSBOT_SECRET')]) {
    jenkinsbot_secret = env.JENKINSBOT_SECRET
  }

  stage('Checkout & Clean') {
    git branch: "$BRANCH", url: 'https://github.com/wireapp/wire-web-ets.git'
  }

  stage('Build') {
    try {
      def NODE = tool name: 'node-v10.8.0', type: 'nodejs'
      withEnv(["PATH+NODE=${NODE}/bin"]) {
        sh 'npm install -g yarn pm2'
        sh 'yarn install --no-progress'
        sh 'yarn dist'
        sh 'pm2 install pm2-logrotate'
        sh 'pm2 set pm2-logrotate:retain 20'
        sh 'pm2 set pm2-logrotate:compress true'
      }
    } catch(e) {
      currentBuild.result = 'FAILED'
      wireSend secret: "${jenkinsbot_secret}", message: "🐛 **${JOB_NAME} ${BRANCH} on ${NODE} build failed** see: ${JOB_URL}"
      throw e
    }
  }

  stage('Install') {
    try {
      def NODE = tool name: 'node-v10.8.0', type: 'nodejs'
      sh "mkdir -p ${HOME}/.config/systemd/user/"

      sh """printf \\
'[Unit]
Description=wire-web-ets
After=network.target

[Service]
Type=forking
LimitNOFILE=infinity
LimitNPROC=infinity
LimitCORE=infinity
Environment=PATH=\${PATH}:${NODE}/bin
Environment=LOG_OUTPUT=${HOME}/.pm2/logs/Wire-Web-ETS-out.log
Environment=LOG_ERROR=${HOME}/.pm2/logs/Wire-Web-ETS-error.log
Environment=NODE_DEBUG=@wireapp/*
Environment=PM2_HOME=${HOME}/.pm2
PIDFile=${HOME}/.pm2/pm2.pid
ExecStart=${NODE}/bin/pm2 resurrect
ExecReload=${NODE}/bin/pm2 reload all
ExecStop=${NODE}/bin/pm2 kill

[Install]
WantedBy=default.target
' \\
> ${HOME}/.config/systemd/user/wire-web-ets.service"""

      sh 'systemctl --user enable wire-web-ets'
    } catch(e) {
      currentBuild.result = 'FAILED'
      wireSend secret: "${jenkinsbot_secret}", message: "🐛 **${JOB_NAME} ${BRANCH} on ${NODE} install failed** see: ${JOB_URL}"
      throw e
    }
  }

  stage('Restart server') {
    try {
      sh 'systemctl --user daemon-reload'
      sh 'systemctl --user restart wire-web-ets'
    } catch(e) {
      currentBuild.result = 'FAILED'
      wireSend secret: "${jenkinsbot_secret}", message: "🐛 **Restarting ETS ${BRANCH} on ${NODE} failed** see: ${JOB_URL}"
      throw e
    }
  }

  wireSend secret: "${jenkinsbot_secret}", message: "🐛 **ETS ${BRANCH} on ${NODE} is up and running**"

  if("$BRANCH" == "dev") {
    stage('Test') {
       build job: 'wire-web-ets_Smoke_Tests', wait: false
    }
  }
}
