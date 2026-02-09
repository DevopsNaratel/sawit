import groovy.json.JsonOutput

// ============================================
// PRODUCTION-READY JENKINSFILE
// OPSI A: Hybrid Agent (agent any, NO podTemplate)
// Alur pipeline TIDAK DIUBAH
// ============================================

def sendWebhook(status, progress, stageName) {
    def payload = JsonOutput.toJson([
        jobName    : env.JOB_NAME,
        buildNumber: env.BUILD_NUMBER,
        status     : status,
        progress   : progress,
        stage      : stageName
    ])

    if (env.WEBUI_API?.trim()) {
        writeFile file: 'webui_payload.json', text: payload
        sh(
            returnStatus: true,
            script: """curl -s -X POST '${env.WEBUI_API.trim()}/api/webhooks/jenkins' \
                       -H 'Content-Type: application/json' \
                       --data @webui_payload.json \
                       --max-time 10 || true"""
        )
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

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 1, unit: 'HOURS')
        disableConcurrentBuilds()
    }

    stages {

        // ============================================
        // STAGE 1: CHECKOUT & GET VERSION
        // ============================================
        stage('Checkout & Get Version') {
            steps {
                script {
                    sendWebhook('STARTED', 5, 'Checkout')

                    checkout scm
                    sh 'git fetch --tags --force'

                    String version = null

                    if (env.TAG_NAME?.trim()) {
                        version = env.TAG_NAME.trim()
                        echo "Version from TAG_NAME: ${version}"
                    } else if (env.BRANCH_NAME?.trim()?.startsWith('v')) {
                        version = env.BRANCH_NAME.trim()
                        echo "Version from BRANCH_NAME: ${version}"
                    } else {
                        def tagOutput = sh(
                            script: '''
                                git describe --tags --exact-match HEAD 2>/dev/null ||
                                git describe --tags --abbrev=0 2>/dev/null ||
                                echo NOTAG
                            ''',
                            returnStdout: true
                        ).trim()

                        if (tagOutput != 'NOTAG' && tagOutput.startsWith('v')) {
                            version = tagOutput
                            echo "Version from git describe: ${version}"
                        }
                    }

                    if (!version?.trim()) {
                        version = "dev-${env.BUILD_NUMBER}"
                        echo "Fallback dev version: ${version}"
                    }

                    env.APP_VERSION = version
                    echo "FINAL APP_VERSION: ${env.APP_VERSION}"

                    sendWebhook('IN_PROGRESS', 10, 'Checkout')
                }
            }
        }

        // ============================================
        // STAGE 2: BUILD & PUSH DOCKER
        // ============================================
        stage('Build & Push Docker') {
            steps {
                script {
                    sendWebhook('IN_PROGRESS', 25, 'Build')

                    if (!env.APP_VERSION?.trim()) {
                        error "APP_VERSION empty"
                    }

                    docker.withRegistry('', env.DOCKER_CRED_ID) {
                        def img = docker.build("${env.DOCKER_IMAGE}:${env.APP_VERSION}")
                        img.push()

                        if (env.APP_VERSION ==~ /^v\\d+\\.\\d+\\.\\d+$/) {
                            img.push('latest')
                        }
                    }

                    sendWebhook('IN_PROGRESS', 45, 'Build')
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

                    if (env.WEBUI_API?.trim()) {
                        try {
                            def payload = JsonOutput.toJson([
                                appName    : env.APP_NAME,
                                buildNumber: env.BUILD_NUMBER,
                                version    : env.APP_VERSION,
                                jenkinsUrl : env.BUILD_URL ?: '',
                                inputId    : 'ApproveDeploy',
                                source     : 'jenkins'
                            ])

                            writeFile file: 'pending_payload.json', text: payload

                            sh(
                                script: """curl -s -X POST '${env.WEBUI_API.trim()}/api/jenkins/pending' \
                                           -H 'Content-Type: application/json' \
                                           --data @pending_payload.json \
                                           --max-time 15 || true"""
                            )
                        } catch (e) {
                            echo "Dashboard unreachable"
                        }
                    }

                    timeout(time: 30, unit: 'MINUTES') {
                        input(
                            message: "Deploy ${env.APP_NAME}:${env.APP_VERSION} to Testing?",
                            id: 'ApproveDeploy',
                            ok: 'Proceed to Testing'
                        )
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

                    def payload = JsonOutput.toJson([
                        appName : env.APP_NAME,
                        imageTag: env.APP_VERSION,
                        source  : 'jenkins'
                    ])

                    writeFile file: 'deploy_test_payload.json', text: payload

                    sh(
                        script: """curl -s -X POST '${env.WEBUI_API.trim()}/api/jenkins/deploy-test' \
                                   -H 'Content-Type: application/json' \
                                   --data @deploy_test_payload.json \
                                   --max-time 30 || true"""
                    )

                    sleep 30

                    def syncHeader = env.SYNC_JOB_TOKEN?.trim()
                        ? "-H 'Authorization: Bearer ${env.SYNC_JOB_TOKEN}'"
                        : ''

                    sh(
                        script: """curl -s -X POST '${env.WEBUI_API.trim()}/api/sync' \
                                   ${syncHeader} --max-time 10 || true"""
                    )

                    sendWebhook('IN_PROGRESS', 75, 'Deploy Testing')
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
                    echo "Integration tests placeholder"
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

                    timeout(time: 30, unit: 'MINUTES') {
                        input(
                            message: "FINAL: Deploy ${env.APP_NAME}:${env.APP_VERSION} to PRODUCTION?",
                            id: 'ConfirmProd',
                            ok: 'DEPLOY TO PROD',
                            submitterParameter: 'APPROVER'
                        )
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

                    def payload = JsonOutput.toJson([
                        appName : env.APP_NAME,
                        env     : 'prod',
                        imageTag: env.APP_VERSION,
                        source  : 'jenkins'
                    ])

                    writeFile file: 'update_prod_payload.json', text: payload

                    sh(
                        script: """curl -s -X POST '${env.WEBUI_API.trim()}/api/manifest/update-image' \
                                   -H 'Content-Type: application/json' \
                                   --data @update_prod_payload.json \
                                   --max-time 30 || true"""
                    )

                    def syncHeader = env.SYNC_JOB_TOKEN?.trim()
                        ? "-H 'Authorization: Bearer ${env.SYNC_JOB_TOKEN}'"
                        : ''

                    sh(
                        script: """curl -s -X POST '${env.WEBUI_API.trim()}/api/sync' \
                                   ${syncHeader} --max-time 10 || true"""
                    )
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
        aborted {
            script {
                sendWebhook('ABORTED', 100, 'Aborted')
            }
        }
        always {
            script {
                if (env.WEBUI_API?.trim()) {
                    try {
                        def payload = JsonOutput.toJson([appName: env.APP_NAME])
                        writeFile file: 'destroy_payload.json', text: payload
                        sh(
                            script: """curl -s -X POST '${env.WEBUI_API.trim()}/api/jenkins/destroy-test' \
                                       -H 'Content-Type: application/json' \
                                       --data @destroy_payload.json \
                                       --max-time 10 || true"""
                        )
                    } catch (e) {
                        echo "Cleanup warning"
                    }
                }
            }
            cleanWs()
        }
    }
}
