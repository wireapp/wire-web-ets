node('Linux_Node') {

  def jenkinsbot_secret = ''
  withCredentials([string(credentialsId: "${params.JENKINSBOT_SECRET}", variable: 'JENKINSBOT_SECRET')]) {
    jenkinsbot_secret = env.JENKINSBOT_SECRET
  }

  stage('Checkout & Clean') {
    git branch: "master", url: 'https://github.com/wireapp/wire-web-ets.git'
  }

  stage('Build') {
    try {
      def NODE = tool name: 'node-v9.9.0', type: 'nodejs'
      withEnv(["PATH+NODE=${NODE}/bin"]) {
        sh 'npm install -g yarn'
        sh 'yarn'
        sh 'yarn dist'
      }
    } catch(e) {
      currentBuild.result = 'FAILED'
      wireSend secret: "${jenkinsbot_secret}", message: "🐛 **${JOB_NAME} ${VERSION} build failed** see: ${JOB_URL}"
      throw e
    }
  }

  stage('Kill server') {
    sh returnStatus: true, script: 'killall node'
  }

  stage('Start server') {
    try {
      def NODE = tool name: 'node-v9.9.0', type: 'nodejs'
      withEnv(["PATH+NODE=${NODE}/bin", "JENKINS_NODE_COOKIE=do_not_kill"]) {
        sh 'yarn start &'
      }
    } catch(e) {
      currentBuild.result = 'FAILED'
      wireSend secret: "${jenkinsbot_secret}", message: "🐛 **Starting ETS ${VERSION} failed** see: ${JOB_URL}"
      throw e
    }
  }

  wireSend secret: "${jenkinsbot_secret}", message: "🐛 **ETS ${VERSION} is up and running**"
}
