@Library('jenkins-pipeline-library') _

standardDevOpsv2(
  appName:       'sawit',
  folderName:    '069-sawit',
  imageRepository: 'docker.io/devopsnaratel/sawit',
  appRepository: 'https://github.com/DevopsNaratel/sawit',
  scaffolderUrl: 'http://naraops-backend.naraops.svc.cluster.local'
)




// pipeline {

//   agent none

//   options {
//     disableConcurrentBuilds()
//     skipDefaultCheckout(true)
//     timeout(time: 60, unit: 'MINUTES')
//     buildDiscarder(logRotator(numToKeepStr: '20'))
//   }

//   triggers {
//     githubPush()
//   }

//   environment {
//     APP_NAME       = 'sawit'
//     FOLDER_NAME    = '069-sawit'
//     IMAGE_REPO     = 'docker.io/devopsnaratel/sawit'
//     APP_REPO       = 'https://github.com/DevopsNaratel/sawit'
//     SCAFFOLDER_URL = 'http://naraops-backend.naraops.svc.cluster.local'
//   }

//   stages {

//     stage('Checkout') {

//       agent {
//         kubernetes {
//           yaml """
// apiVersion: v1
// kind: Pod
// spec:
//   containers:
//   - name: git
//     image: alpine/git:latest
//     command: ['sleep']
//     args: ['99d']
// """
//           defaultContainer 'git'
//         }
//       }

//       steps {

//         checkout([
//           $class: 'GitSCM',
//           branches: [[name: '*/main']],
//           userRemoteConfigs: [[url: "${APP_REPO}"]]
//         ])

//         sh 'git config --global --add safe.directory $WORKSPACE'

//         script {

//           env.GIT_SHA = sh(
//             script: 'git rev-parse --short HEAD',
//             returnStdout: true
//           ).trim()

//           env.IMAGE_SHA    = "${IMAGE_REPO}:${env.GIT_SHA}"
//           env.IMAGE_PROD   = "${IMAGE_REPO}:prod-${env.GIT_SHA}"
//           env.IMAGE_LATEST = "${IMAGE_REPO}:latest"

//           currentBuild.displayName = "#${BUILD_NUMBER} ${env.GIT_SHA}"

//         }

//         stash name: 'source', includes: '**/*'

//       }
//     }

//     stage('Build & Push Image') {

//       agent {
//         kubernetes {
//           yaml """
// apiVersion: v1
// kind: Pod
// spec:
//   containers:
//   - name: buildah
//     image: quay.io/buildah/stable:latest
//     command: ['sleep']
//     args: ['99d']
//     securityContext:
//       privileged: true
//     volumeMounts:
//     - name: containers
//       mountPath: /var/lib/containers
//   volumes:
//   - name: containers
//     emptyDir: {}
// """
//           defaultContainer 'buildah'
//         }
//       }

//       steps {

//         unstash 'source'

//         withCredentials([usernamePassword(
//           credentialsId: 'docker-cred',
//           usernameVariable: 'REG_USER',
//           passwordVariable: 'REG_PASS'
//         )]) {

//           sh '''
// buildah login -u $REG_USER -p $REG_PASS docker.io
// '''

//         }

//         sh """
// buildah bud --pull --layers -t ${IMAGE_SHA} .
// buildah push ${IMAGE_SHA}
// """

//         echo "Image pushed: ${IMAGE_SHA}"

//       }
//     }

//     stage('Deploy Test') {

//       agent {
//         kubernetes {
//           yaml """
// apiVersion: v1
// kind: Pod
// spec:
//   containers:
//   - name: curl
//     image: alpine:3.20
//     command: ['sleep']
//     args: ['99d']
// """
//           defaultContainer 'curl'
//         }
//       }

//       steps {

//         sh 'apk add --no-cache curl jq'

//         retry(3) {

//           sh """
// curl --fail --connect-timeout 5 --max-time 30 \
//   -X POST ${SCAFFOLDER_URL}/apps/${FOLDER_NAME}/test/deploy \
//   -H "Content-Type: application/json" \
//   -d '{"imageTag":"${GIT_SHA}"}' \
//   -o response.json
// """

//         }

//         script {

//           env.TEST_DOMAIN = sh(
//             script: "jq -r '.domain' response.json",
//             returnStdout: true
//           ).trim()

//           if (!env.TEST_DOMAIN || env.TEST_DOMAIN == "null") {
//             error("Invalid deploy response")
//           }

//         }

//         echo "Test URL: https://${env.TEST_DOMAIN}"

//       }
//     }

//     stage('Manual Approval') {

//       agent none

//       steps {

//         timeout(time: 12, unit: 'HOURS') {

//           input(
//             message: """
// Promote to production?

// App      : ${APP_NAME}
// Commit   : ${GIT_SHA}
// Test URL : https://${TEST_DOMAIN}
// """,
//             ok: 'Deploy Production',
//             submitterParameter: 'APPROVED_BY'
//           )

//         }

//       }
//     }

//     stage('Promote Image') {

//       agent {
//         kubernetes {
//           yaml """
// apiVersion: v1
// kind: Pod
// spec:
//   containers:
//   - name: buildah
//     image: quay.io/buildah/stable:latest
//     command: ['sleep']
//     args: ['99d']
//     securityContext:
//       privileged: true
// """
//           defaultContainer 'buildah'
//         }
//       }

//       steps {

//         withCredentials([usernamePassword(
//           credentialsId: 'docker-cred',
//           usernameVariable: 'REG_USER',
//           passwordVariable: 'REG_PASS'
//         )]) {

//           sh '''
// buildah login -u $REG_USER -p $REG_PASS docker.io
// '''

//         }

//         sh """
// buildah pull ${IMAGE_SHA}
// buildah tag ${IMAGE_SHA} ${IMAGE_PROD}
// buildah tag ${IMAGE_SHA} ${IMAGE_LATEST}

// buildah push ${IMAGE_PROD}
// buildah push ${IMAGE_LATEST}
// """

//         echo "Image promoted to production tag"

//       }
//     }

//     stage('Deploy Production') {

//       agent {
//         kubernetes {
//           yaml """
// apiVersion: v1
// kind: Pod
// spec:
//   containers:
//   - name: curl
//     image: alpine:3.20
//     command: ['sleep']
//     args: ['99d']
// """
//           defaultContainer 'curl'
//         }
//       }

//       steps {

//         sh 'apk add --no-cache curl'

//         retry(3) {

//           sh """
// curl --fail --connect-timeout 5 --max-time 30 \
//   -X POST ${SCAFFOLDER_URL}/apps/${FOLDER_NAME}/promote \
//   -H "Content-Type: application/json" \
//   -d '{
//     "imageTag": "prod-${GIT_SHA}",
//     "approvedBy": "${APPROVED_BY}"
//   }'
// """

//         }

//         echo "Production deployment triggered"

//       }
//     }

//   }

//   post {

//     success {
//       echo "SUCCESS: ${APP_NAME} prod-${GIT_SHA} deployed"
//     }

//     failure {
//       echo "FAILED: pipeline failed for ${APP_NAME}"
//     }

//   }

// }