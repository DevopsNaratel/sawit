import groovy.json.JsonOutput

// =====================================================
// FINAL PRODUCTION JENKINSFILE
// Agent per stage + Kubernetes pods (k3s safe)
// =====================================================

def sendWebhook(status, progress, stageName) {
    if (!env.WEBUI_API?.trim()) return

    def payload = JsonOutput.toJson([
        jobName    : env.JOB_NAME,
        buildNumber: env.BUILD_NUMBER,
        status     : status,
        progress   : progress,
        stage      : stageName
    ])

    writeFile file: 'webui_payload.json', text: payload
    sh """
        curl -s -X POST '${env.WEBUI_API}/api/webhooks/jenkins' \
        -H 'Content-Type: application/json' \
        --data @webui_payload.json \
        --max-time 10 || true
    """
}

pipeline {
    agent none

    environment {
        APP_NAME      = 'sawit'
        DOCKER_IMAGE  = 'devopsnaratel/sawit'
        WEBUI_API     = 'https://nonfortifiable-mandie-uncontradictablely.ngrok-free.dev'
        SYNC_JOB_TOKEN = 'sync-token'
    }

    options {
        disableConcurrentBuilds()
        timeout(time: 1, unit: 'HOURS')
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {

        // ===============================
        // STAGE 1: CHECKOUT & VERSIONING
        // ===============================
        stage('Checkout & Versioning') {
            agent { label 'jenkins-light' }
            steps {
                script {
                    sendWebhook('STARTED', 5, 'Checkout')

                    checkout scm
                    sh 'git fetch --tags --force'

                    String version = null

                    if (env.TAG_NAME?.trim()) {
                        version = env.TAG_NAME
                    } else {
                        def tag = sh(
                            script: "git describe --tags --exact-match HEAD 2>/dev/null || echo NOTAG",
                            returnStdout: true
                        ).trim()

                        if (tag.startsWith('v')) {
                            version = tag
                        }
                    }

                    env.APP_VERSION = version ?: "dev-${env.BUILD_NUMBER}"
                    echo "APP_VERSION = ${env.APP_VERSION}"

                    sendWebhook('IN_PROGRESS', 10, 'Checkout')
                }
            }
        }

        // ===============================
        // STAGE 2: BUILD & PUSH DOCKER
        // ===============================
        stage('Build & Push Docker') {
            agent { label 'jenkins-docker' }

            environment {
                DOCKER_CREDS = credentials('docker-hub')
            }

            steps {
                checkout scm

                container('docker') {
                    sh '''
                        docker version

                        echo "$DOCKER_CREDS_PSW" | docker login \
                          -u "$DOCKER_CREDS_USR" --password-stdin

                        docker build -t devopsnaratel/sawit:${APP_VERSION} .
                        docker push devopsnaratel/sawit:${APP_VERSION}

                        if echo "${APP_VERSION}" | grep -Eq '^v[0-9]+\\.[0-9]+\\.[0-9]+$'; then
                          docker tag devopsnaratel/sawit:${APP_VERSION} devopsnaratel/sawit:latest
                          docker push devopsnaratel/sawit:latest
                        fi
                    '''
                }
            }
        }

        // ===============================
        // STAGE 3: APPROVAL (TEST)
        // ===============================
        stage('Approval Testing') {
            agent { label 'jenkins-light' }
            steps {
                script {
                    sendWebhook('IN_PROGRESS', 50, 'Approval')

                    timeout(time: 30, unit: 'MINUTES') {
                        input(
                            message: "Deploy ${APP_NAME}:${APP_VERSION} to TESTING?",
                            ok: 'Deploy'
                        )
                    }
                }
            }
        }

        // ===============================
        // STAGE 4: DEPLOY TESTING
        // ===============================
        stage('Deploy Testing') {
            agent { label 'jenkins-light' }
            steps {
                script {
                    sendWebhook('IN_PROGRESS', 65, 'Deploy Testing')

                    def payload = JsonOutput.toJson([
                        appName : APP_NAME,
                        imageTag: APP_VERSION
                    ])

                    writeFile file: 'deploy_test.json', text: payload

                    sh """
                        curl -s -X POST '${WEBUI_API}/api/jenkins/deploy-test' \
                        -H 'Content-Type: application/json' \
                        --data @deploy_test.json || true
                    """

                    sh """
                        curl -s -X POST '${WEBUI_API}/api/sync' \
                        -H 'Authorization: Bearer ${SYNC_JOB_TOKEN}' || true
                    """
                }
            }
        }

        // ===============================
        // STAGE 5: FINAL PROD APPROVAL
        // ===============================
        stage('Approval Production') {
            agent { label 'jenkins-light' }
            steps {
                script {
                    sendWebhook('IN_PROGRESS', 85, 'Prod Approval')

                    timeout(time: 30, unit: 'MINUTES') {
                        input(
                            message: "DEPLOY ${APP_NAME}:${APP_VERSION} TO PRODUCTION?",
                            ok: 'DEPLOY PROD'
                        )
                    }
                }
            }
        }

        // ===============================
        // STAGE 6: DEPLOY PRODUCTION
        // ===============================
        stage('Deploy Production') {
            agent { label 'jenkins-light' }
            steps {
                script {
                    sendWebhook('IN_PROGRESS', 95, 'Deploy Prod')

                    def payload = JsonOutput.toJson([
                        appName : APP_NAME,
                        imageTag: APP_VERSION,
                        env     : 'prod'
                    ])

                    writeFile file: 'deploy_prod.json', text: payload

                    sh """
                        curl -s -X POST '${WEBUI_API}/api/manifest/update-image' \
                        -H 'Content-Type: application/json' \
                        --data @deploy_prod.json || true
                    """

                    sh """
                        curl -s -X POST '${WEBUI_API}/api/sync' \
                        -H 'Authorization: Bearer ${SYNC_JOB_TOKEN}' || true
                    """
                }
            }
        }
    }

    post {
        success {
            script {
                sendWebhook('SUCCESS', 100, 'Completed')
            }
        }
        failure {
            script {
                sendWebhook('FAILED', 100, 'Failed')
            }
        }
        always {
            script {
                node('jenkins-light') {
                    cleanWs()
                }
            }
        }
    }
}
