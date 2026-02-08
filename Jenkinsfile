import groovy.json.JsonOutput

// Corrected Jenkinsfile (safe webui integration)
// - webhook calls are best-effort (won't fail the build)
// - writes payload to a temp file to avoid shell quoting issues
// - uses SYNC_JOB_TOKEN optionally for /api/sync

def sendWebhook(status, progress, stageName) {
    def payload = """
{"jobName":"${env.JOB_NAME}","buildNumber":"${env.BUILD_NUMBER}","status":"${status}","progress":${progress},"stage":"${stageName}"}
"""

    if (env.WEBUI_API?.trim()) {
        writeFile file: 'webui_payload.json', text: payload
        // Best-effort: do not fail the build if WebUI is unreachable
        sh(returnStatus: true, script: "curl -s -X POST '${env.WEBUI_API}/api/webhooks/jenkins' -H 'Content-Type: application/json' --data @webui_payload.json || true")
    } else {
        echo "WEBUI_API not set; skipping webhook"
    }
}

pipeline {
    agent any

    environment {
        APP_NAME       = "sawit"
        DOCKER_IMAGE   = "devopsnaratel/sawit"
        DOCKER_CRED_ID = "docker-hub"

        // URL WebUI Base
        WEBUI_API      = "https://nonfortifiable-mandie-uncontradictablely.ngrok-free.dev"
        APP_VERSION    = ""
        SYNC_JOB_TOKEN = "sync-token"
    }

    stages {
        stage('Checkout & Get Version') {
            steps {
                script {
                    sendWebhook('STARTED', 2, 'Checkout')
                    checkout scm
                    env.APP_VERSION = sh(script: "git describe --tags --always --abbrev=0 || echo ${BUILD_NUMBER}", returnStdout: true).trim()
                    echo "Building Version: ${env.APP_VERSION}"
                    sendWebhook('IN_PROGRESS', 8, 'Checkout')
                }
            }
        }

        stage('Build & Push Docker') {
            steps {
                script {
                    sendWebhook('IN_PROGRESS', 20, 'Build')
                    docker.withRegistry('', env.DOCKER_CRED_ID) {
                        def img = docker.build("${env.DOCKER_IMAGE}:${env.APP_VERSION}")
                        img.push()
                        img.push("latest")
                    }
                    sendWebhook('IN_PROGRESS', 40, 'Build')
                }
            }
        }

        stage('Configuration & Approval') {
            steps {
                script {
                    sendWebhook('IN_PROGRESS', 55, 'Approval')
                    echo "Registering pending approval in Dashboard..."
                    def payload = """
                    {"appName": "${env.APP_NAME}", "buildNumber": "${env.BUILD_NUMBER}", "version": "${env.APP_VERSION}", "jenkinsUrl": "${env.BUILD_URL ?: ''}", "inputId": "ApproveDeploy", "source": "jenkins"}
                    """

                    writeFile file: 'pending_payload.json', text: payload
                    def approvalHttp = sh(script: "curl -sS -o /dev/null -w '%{http_code}' -X POST ${env.WEBUI_API}/api/jenkins/pending -H 'Content-Type: application/json' --data @pending_payload.json", returnStdout: true).trim()
                    if (!(approvalHttp ==~ /2\d\d/)) {
                        error "Failed to register pending approval in Dashboard (HTTP ${approvalHttp}). Check WEBUI_API=${env.WEBUI_API}"
                    }

                    try {
                        input message: "Waiting for configuration & approval from Dashboard...", id: 'ApproveDeploy'
                    } catch (Exception e) {
                        currentBuild.result = 'ABORTED'
                        error "Deployment Cancelled via Dashboard."
                    }
                }
            }
        }

        stage('Deploy Testing (Ephemeral)') {
            steps {
                script {
                    sendWebhook('IN_PROGRESS', 65, 'Deploy Testing')
                    def deployPayload = JsonOutput.toJson([
                        appName : env.APP_NAME,
                        imageTag: env.APP_VERSION,
                        source  : 'jenkins'
                    ])
                    writeFile file: 'deploy_test_payload.json', text: deployPayload
                    def response = sh(script: "curl -s -X POST ${env.WEBUI_API}/api/jenkins/deploy-test -H 'Content-Type: application/json' --data @deploy_test_payload.json || true", returnStdout: true).trim()

                    echo "WebUI Response: ${response}"

                    echo "Waiting for pods to be ready..."
                    sleep 60

                    def syncHeader = SYNC_JOB_TOKEN?.trim() ? '-H "Authorization: Bearer ' + SYNC_JOB_TOKEN + '"' : ''
                    sh(script: "curl -s -X POST ${env.WEBUI_API}/api/sync ${syncHeader} || true")
                }
            }
        }

        stage('Integration Tests') {
            steps {
                script {
                    sendWebhook('IN_PROGRESS', 80, 'Tests')
                    echo "Running Tests against Testing Env..."
                }
            }
        }

        stage('Final Production Approval') {
            steps {
                script {
                    sendWebhook('IN_PROGRESS', 90, 'Prod Approval')
                    echo "Requesting Final Confirmation from Dashboard..."
                    def payload = """
                    {"appName": "${env.APP_NAME}", "buildNumber": "${env.BUILD_NUMBER}", "version": "${env.APP_VERSION}", "jenkinsUrl": "${env.BUILD_URL ?: ''}", "inputId": "ConfirmProd", "isFinal": true, "source": "jenkins"}
                    """

                    writeFile file: 'pending_payload_final.json', text: payload
                    def finalApprovalHttp = sh(script: "curl -sS -o /dev/null -w '%{http_code}' -X POST ${env.WEBUI_API}/api/jenkins/pending -H 'Content-Type: application/json' --data @pending_payload_final.json", returnStdout: true).trim()
                    if (!(finalApprovalHttp ==~ /2\d\d/)) {
                        error "Failed to register final approval in Dashboard (HTTP ${finalApprovalHttp}). Check WEBUI_API=${env.WEBUI_API}"
                    }

                    try {
                        input message: "Waiting for Final Production Confirmation...", id: 'ConfirmProd'
                    } catch (Exception e) {
                        currentBuild.result = 'ABORTED'
                        error "Production Deployment Cancelled."
                    }
                }
            }
        }

        stage('Deploy to Production') {
            steps {
                script {
                    sendWebhook('IN_PROGRESS', 95, 'Deploy Production')
                    echo "Updating Production Image Version..."
                    def updatePayload = JsonOutput.toJson([
                        appName : env.APP_NAME,
                        env     : 'prod',
                        imageTag: env.APP_VERSION,
                        source  : 'jenkins'
                    ])
                    writeFile file: 'update_image_payload.json', text: updatePayload
                    def response = sh(script: "curl -s -X POST ${env.WEBUI_API}/api/manifest/update-image -H 'Content-Type: application/json' --data @update_image_payload.json || true", returnStdout: true).trim()

                    echo "WebUI Response: ${response}"

                    def syncHeader = SYNC_JOB_TOKEN?.trim() ? '-H "Authorization: Bearer ' + SYNC_JOB_TOKEN + '"' : ''
                    sh(script: "curl -s -X POST ${env.WEBUI_API}/api/sync ${syncHeader} || true")
                }
            }
        }
    }

    post {
        success { script { sendWebhook('SUCCESS', 100, 'Completed') } }
        failure { script { sendWebhook('FAILED', 100, 'Failed') } }
        always {
            script {
                // Cleanup: destroy ephemeral test env
                def destroyPayload = JsonOutput.toJson([appName: env.APP_NAME])
                writeFile file: 'destroy_payload.json', text: destroyPayload
                sh(returnStatus: true, script: "curl -sS -X POST ${env.WEBUI_API}/api/jenkins/destroy-test -H 'Content-Type: application/json' --data @destroy_payload.json || true")
            }
            cleanWs()
        }
    }
}