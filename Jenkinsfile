import groovy.json.JsonOutput

// ============================================
// CORRECTED JENKINSFILE - FIXED VERSION DETECTION
// ============================================

def sendWebhook(status, progress, stageName) {
    def payload = """
{"jobName":"${env.JOB_NAME}","buildNumber":"${env.BUILD_NUMBER}","status":"${status}","progress":${progress},"stage":"${stageName}"}
"""

    if (env.WEBUI_API?.trim()) {
        writeFile file: 'webui_payload.json', text: payload
        sh(returnStatus: true, script: "curl -s -X POST '${env.WEBUI_API.trim()}/api/webhooks/jenkins' -H 'Content-Type: application/json' --data @webui_payload.json || true")
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
        WEBUI_API      = "https://nonfortifiable-mandie-uncontradictablely.ngrok-free.dev"
        SYNC_JOB_TOKEN = "sync-token"
    }

    stages {

        // ============================================
        // STAGE 0: DEBUG (bisa dihapus setelah fix)
        // ============================================
        stage('🔍 Debug Environment') {
            steps {
                script {
                    echo "=== DEBUG ENV VARIABLES ==="
                    echo "TAG_NAME: '${env.TAG_NAME}'"
                    echo "BRANCH_NAME: '${env.BRANCH_NAME}'"
                    echo "GIT_BRANCH: '${env.GIT_BRANCH}'"
                    echo "JOB_NAME: '${env.JOB_NAME}'"
                }
            }
        }

        // ============================================
        // STAGE 1: CHECKOUT & GET VERSION (FIXED)
        // ============================================
        stage('Checkout & Get Version') {
            steps {
                script {
                    sendWebhook('STARTED', 2, 'Checkout')
                    checkout scm

                    sh 'git fetch --tags --force'

                    String version = null

                    // === METHOD 1: TAG_NAME (untuk tag trigger) ===
                    if (env.TAG_NAME?.trim()) {
                        version = env.TAG_NAME.trim()
                        echo "✅ Version from TAG_NAME: ${version}"
                    }
                    // === METHOD 2: BRANCH_NAME yang start dengan v ===
                    else if (env.BRANCH_NAME?.trim()?.startsWith('v')) {
                        version = env.BRANCH_NAME.trim()
                        echo "✅ Version from BRANCH_NAME: ${version}"
                    }
                    // === METHOD 3: GIT_BRANCH contains tags/ ===
                    else if (env.GIT_BRANCH?.contains('tags/v')) {
                        version = env.GIT_BRANCH.replaceAll('.*/tags/', '').trim()
                        echo "✅ Version from GIT_BRANCH: ${version}"
                    }
                    // === METHOD 4: Git describe fallback ===
                    else {
                        def tagOutput = sh(
                            script: '''
                                git describe --tags --exact-match HEAD 2>/dev/null || \
                                git describe --tags --abbrev=0 2>/dev/null || \
                                echo "NOTAG"
                            ''',
                            returnStdout: true
                        ).trim()
                        
                        if (tagOutput != "NOTAG" && tagOutput.startsWith('v')) {
                            version = tagOutput
                            echo "✅ Version from git describe: ${version}"
                        }
                    }

                    // === SAFETY NET: Jika masih null ===
                    if (!version?.trim() || version == 'null') {
                        version = "dev-${env.BUILD_NUMBER}"
                        echo "⚠️ Fallback to dev version: ${version}"
                    }

                    // Set environment variable
                    env.APP_VERSION = version
                    echo "🎯 FINAL APP_VERSION: ${env.APP_VERSION}"
                    
                    sendWebhook('IN_PROGRESS', 8, 'Checkout')
                }
            }
        }

        // ============================================
        // STAGE 2: BUILD & PUSH DOCKER
        // ============================================
        stage('Build & Push Docker') {
            steps {
                script {
                    sendWebhook('IN_PROGRESS', 20, 'Build')
                    
                    // Double check version tidak null
                    if (!env.APP_VERSION?.trim() || env.APP_VERSION == 'null') {
                        error "APP_VERSION is null or empty! Aborting build."
                    }
                    
                    echo "Building image: ${env.DOCKER_IMAGE}:${env.APP_VERSION}"
                    
                    docker.withRegistry('', env.DOCKER_CRED_ID) {
                        def img = docker.build("${env.DOCKER_IMAGE}:${env.APP_VERSION}")
                        img.push()
                        
                        // Push latest hanya jika bukan dev build
                        if (!env.APP_VERSION.startsWith('dev-')) {
                            img.push("latest")
                        }
                    }
                    sendWebhook('IN_PROGRESS', 40, 'Build')
                }
            }
        }

        // ============================================
        // STAGE 3: CONFIGURATION & APPROVAL
        // ============================================
        stage('Configuration & Approval') {
            steps {
                script {
                    sendWebhook('IN_PROGRESS', 55, 'Approval')
                    echo "Registering pending approval in Dashboard..."
                    
                    def payload = """
{"appName": "${env.APP_NAME}", "buildNumber": "${env.BUILD_NUMBER}", "version": "${env.APP_VERSION}", "jenkinsUrl": "${env.BUILD_URL ?: ''}", "inputId": "ApproveDeploy", "source": "jenkins"}
                    """

                    writeFile file: 'pending_payload.json', text: payload
                    def approvalHttp = sh(
                        script: "curl -sS -o /dev/null -w '%{http_code}' -X POST ${env.WEBUI_API.trim()}/api/jenkins/pending -H 'Content-Type: application/json' --data @pending_payload.json", 
                        returnStdout: true
                    ).trim()
                    
                    if (!(approvalHttp ==~ /2\\d\\d/)) {
                        error "Failed to register pending approval in Dashboard (HTTP ${approvalHttp})"
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

        // ============================================
        // STAGE 4: DEPLOY TESTING
        // ============================================
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
                    def response = sh(
                        script: "curl -s -X POST ${env.WEBUI_API.trim()}/api/jenkins/deploy-test -H 'Content-Type: application/json' --data @deploy_test_payload.json || true", 
                        returnStdout: true
                    ).trim()

                    echo "WebUI Response: ${response}"
                    echo "Waiting for pods to be ready..."
                    sleep 60

                    def syncHeader = env.SYNC_JOB_TOKEN?.trim() ? "-H 'Authorization: Bearer ${env.SYNC_JOB_TOKEN}'" : ''
                    sh(script: "curl -s -X POST ${env.WEBUI_API.trim()}/api/sync ${syncHeader} || true")
                }
            }
        }

        // ============================================
        // STAGE 5: INTEGRATION TESTS
        // ============================================
        stage('Integration Tests') {
            steps {
                script {
                    sendWebhook('IN_PROGRESS', 80, 'Tests')
                    echo "Running Tests against Testing Env..."
                }
            }
        }

        // ============================================
        // STAGE 6: FINAL PRODUCTION APPROVAL
        // ============================================
        stage('Final Production Approval') {
            steps {
                script {
                    sendWebhook('IN_PROGRESS', 90, 'Prod Approval')
                    echo "Requesting Final Confirmation from Dashboard..."
                    
                    def payload = """
{"appName": "${env.APP_NAME}", "buildNumber": "${env.BUILD_NUMBER}", "version": "${env.APP_VERSION}", "jenkinsUrl": "${env.BUILD_URL ?: ''}", "inputId": "ConfirmProd", "isFinal": true, "source": "jenkins"}
                    """

                    writeFile file: 'pending_payload_final.json', text: payload
                    def finalApprovalHttp = sh(
                        script: "curl -sS -o /dev/null -w '%{http_code}' -X POST ${env.WEBUI_API.trim()}/api/jenkins/pending -H 'Content-Type: application/json' --data @pending_payload_final.json", 
                        returnStdout: true
                    ).trim()
                    
                    if (!(finalApprovalHttp ==~ /2\\d\\d/)) {
                        error "Failed to register final approval in Dashboard (HTTP ${finalApprovalHttp})"
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

        // ============================================
        // STAGE 7: DEPLOY TO PRODUCTION
        // ============================================
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
                    def response = sh(
                        script: "curl -s -X POST ${env.WEBUI_API.trim()}/api/manifest/update-image -H 'Content-Type: application/json' --data @update_image_payload.json || true", 
                        returnStdout: true
                    ).trim()

                    echo "WebUI Response: ${response}"

                    def syncHeader = env.SYNC_JOB_TOKEN?.trim() ? "-H 'Authorization: Bearer ${env.SYNC_JOB_TOKEN}'" : ''
                    sh(script: "curl -s -X POST ${env.WEBUI_API.trim()}/api/sync ${syncHeader} || true")
                }
            }
        }
    }

    post {
        success { 
            script { sendWebhook('SUCCESS', 100, 'Completed') } 
        }
        failure { 
            script { sendWebhook('FAILED', 100, 'Failed') } 
        }
        always {
            script {
                // Cleanup: destroy ephemeral test env
                def destroyPayload = JsonOutput.toJson([appName: env.APP_NAME])
                writeFile file: 'destroy_payload.json', text: destroyPayload
                sh(returnStatus: true, script: "curl -sS -X POST ${env.WEBUI_API.trim()}/api/jenkins/destroy-test -H 'Content-Type: application/json' --data @destroy_payload.json || true")
            }
            cleanWs()
        }
    }
}