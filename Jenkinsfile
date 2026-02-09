import groovy.json.JsonOutput

def isTagBuild() {
  return env.GIT_BRANCH?.startsWith('refs/tags/')
}

def appVersion() {
  if (isTagBuild()) {
    return env.GIT_BRANCH.replace('refs/tags/', '')
  }
  return "${env.BRANCH_NAME}-${env.BUILD_NUMBER}"
}

pipeline {
  agent {
    kubernetes {
      label 'jenkins-light'
      yaml """
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: jnlp
    image: jenkins/inbound-agent:latest
  - name: tools
    image: alpine:3.19
    command: ['cat']
    tty: true
"""
    }
  }

  environment {
    APP_NAME        = 'sawit'
    DOCKER_REGISTRY = 'docker.io'
    DOCKER_REPO     = 'naratel/sawit'
    WEBUI_ENDPOINT  = 'https://webui.example.com/webhook'
  }

  stages {

    stage('Init') {
      steps {
        container('tools') {
          script {
            env.APP_VERSION = appVersion()
            echo "Build type : ${isTagBuild() ? 'RELEASE (TAG)' : 'SNAPSHOT (BRANCH)'}"
            echo "App version: ${env.APP_VERSION}"
          }
        }
      }
    }

    stage('Approval (Release Only)') {
      when {
        expression { isTagBuild() }
      }
      steps {
        input message: "Approve release ${env.APP_VERSION} ?"
      }
    }

    stage('Build & Push Docker Image') {
      agent {
        kubernetes {
          label 'jenkins-docker'
          yaml """
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: docker
    image: docker:27
    command: ['cat']
    tty: true
    securityContext:
      privileged: true
    volumeMounts:
    - name: dockersock
      mountPath: /var/run/docker.sock
  volumes:
  - name: dockersock
    hostPath:
      path: /var/run/docker.sock
"""
        }
      }
      steps {
        container('docker') {
          withCredentials([usernamePassword(
            credentialsId: 'dockerhub-cred',
            usernameVariable: 'DOCKER_USER',
            passwordVariable: 'DOCKER_PASS'
          )]) {
            sh """
              echo "\$DOCKER_PASS" | docker login -u "\$DOCKER_USER" --password-stdin
              docker build -t ${DOCKER_REPO}:${APP_VERSION} .
              docker push ${DOCKER_REPO}:${APP_VERSION}
            """
          }
        }
      }
    }

    stage('Notify WebUI') {
      steps {
        container('tools') {
          script {
            def payload = JsonOutput.toJson([
              app     : env.APP_NAME,
              version : env.APP_VERSION,
              type    : isTagBuild() ? 'release' : 'snapshot',
              source  : env.GIT_BRANCH
            ])

            sh """
              apk add --no-cache curl
              curl -X POST ${WEBUI_ENDPOINT} \\
                -H 'Content-Type: application/json' \\
                -d '${payload}'
            """
          }
        }
      }
    }
  }

  post {
    success {
      echo 'Pipeline finished successfully'
    }
    failure {
      echo 'Pipeline failed'
    }
  }
}
