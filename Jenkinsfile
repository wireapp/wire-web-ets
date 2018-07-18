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
      def NODE = tool name: 'node-v9.11.2', type: 'nodejs'
      withEnv(["PATH+NODE=${NODE}/bin"]) {
        sh 'npm install -g yarn'
        sh 'yarn'
        sh 'yarn dist'
      }
    } catch(e) {
      currentBuild.result = 'FAILED'
      wireSend secret: "${jenkinsbot_secret}", message: "🐛 **${JOB_NAME} ${BRANCH} on ${NODE} build failed** see: ${JOB_URL}"
      throw e
    }
  }

  stage('Install') {
    try {
      def NODE = tool name: 'node-v9.11.2', type: 'nodejs'
      sh ([script: """
echo "#!/usr/bin/env sh
cd "\${0%/*}" || exit 1
export NODE_DEBUG=\"@wireapp/*\"
export PATH=\"\${PATH}:${NODE}/bin\"
yarn start "\$@" >> output.log 2>&1"
> debian/run.sh
      """])

      sh 'cat run.sh'

      sh 'chmod +x run.sh'

      sh "mkdir -p ${HOME}/.config/systemd/user/"

      sh ([script: """
echo "[Unit]
Description=wire-web-ets
After=network.target

[Service]
ExecStart=${WORKSPACE}/run.sh
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=wire-web-ets

[Install]
WantedBy=default.target"
>> ${HOME}/.config/systemd/user/wire-web-ets.service"
      """])

      sh "cat ${HOME}/.config/systemd/user/wire-web-ets.service"

      sh 'systemctl --user enable wire-web-ets'
    } catch(e) {
      currentBuild.result = 'FAILED'
      wireSend secret: "${jenkinsbot_secret}", message: "🐛 **${JOB_NAME} ${BRANCH} on ${NODE} install failed** see: ${JOB_URL}"
      throw e
    }
  }

  stage('Restart server') {
    try {
      sh 'systemctl --user restart wire-web-ets'
    } catch(e) {
      currentBuild.result = 'FAILED'
      wireSend secret: "${jenkinsbot_secret}", message: "🐛 **Restarting ETS ${BRANCH} on ${NODE} failed** see: ${JOB_URL}"
      throw e
    }
  }

  wireSend secret: "${jenkinsbot_secret}", message: "🐛 **ETS ${BRANCH} on ${NODE} is up and running**"
}
