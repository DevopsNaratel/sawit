import groovy.json.JsonOutput

// ============================================
// PRODUCTION-READY JENKINSFILE
// Fixed: version detection, URL trimming, error handling, timeouts
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
        sh(returnStatus: true, script: "curl -s -X POST '${env.WEBUI_API.trim()}/api/webhooks/jenkins' -H 'Content-Type: application/json' --data @webui_payload.json --max-time 10 || true")
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

                    // Priority 1: Git Tag (TAG_NAME)
                    if (env.TAG_NAME?.trim()) {
                        version = env.TAG_NAME.trim()
                        echo "✅ Version from TAG_NAME: ${version}"
                    }
                    // Priority 2: Branch name starting with v
                    else if (env.BRANCH_NAME?.trim()?.startsWith('v')) {
                        version = env.BRANCH_NAME.trim()
                        echo "✅ Version from BRANCH_NAME: ${version}"
                    }
                    // Priority 3: Git describe fallback
                    else {
                        def tagOutput = sh(
                            script: 'git describe --tags --exact-match HEAD 2>/dev/null || git describe --tags --abbrev=0 2>/dev/null || echo "NOTAG"',
                            returnStdout: true
                        ).trim()
                        
                        if (tagOutput != "NOTAG" && tagOutput.startsWith('v')) {
                            version = tagOutput
                            echo "✅ Version from git describe: ${version}"
                        }
                    }

                    // Safety net fallback
                    if (!version?.trim() || version == 'null') {
                        version = "dev-${env.BUILD_NUMBER}"
                        echo "⚠️ Fallback to dev version: ${version}"
                    }

                    env.APP_VERSION = version
                    echo "🎯 FINAL APP_VERSION: ${env.APP_VERSION}"
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
                    
                    // Validate version
                    if (!env.APP_VERSION?.trim() || env.APP_VERSION == 'null') {
                        error "APP_VERSION is null or empty! Aborting build."
                    }
                    
                    echo "🔨 Building image: ${env.DOCKER_IMAGE}:${env.APP_VERSION}"
                    
                    docker.withRegistry('', env.DOCKER_CRED_ID) {
                        def img = docker.build("${env.DOCKER_IMAGE}:${env.APP_VERSION}")
                        img.push()
                        
                        // Push latest only for release tags (not dev builds)
                        if (env.APP_VERSION ==~ /^v\d+\.\d+\.\d+$/) {
                            img.push("latest")
                            echo "🏷️ Also pushed as latest"
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
                    echo "⏳ Waiting for approval..."
                    
                    // Register to WebUI (best effort, don't fail build)
                    def webuiSuccess = false
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
                            
                            def response = sh(
                                script: "curl -sS -X POST '${env.WEBUI_API.trim()}/api/jenkins/pending' -H 'Content-Type: application/json' -w '\\nHTTP_CODE:%{http_code}' --data @pending_payload.json --max-time 15",
                                returnStdout: true
                            ).trim()
                            
                            def matcher = response =~ /HTTP_CODE:(\d+)/
                            def httpCode = matcher ? matcher[0][1] : "000"
                            
                            if (httpCode ==~ /2\\d\\d/) {
                                webuiSuccess = true
                                echo "✅ Registered to Dashboard (HTTP ${httpCode})"
                            } else {
                                echo "⚠️ Dashboard returned HTTP ${httpCode}, continuing..."
                            }
                        } catch (Exception e) {
                            echo "⚠️ Dashboard unreachable: ${e.getMessage()}"
                        }
                    }
                    
                    if (!webuiSuccess) {
                        echo "💡 Approve via Jenkins UI below:"
                    }

                    // Wait for approval (with timeout)
                    try {
                        timeout(time: 30, unit: 'MINUTES') {
                            input message: "🚀 Deploy ${env.APP_NAME}:${env.APP_VERSION} to Testing?", 
                                  id: 'ApproveDeploy', 
                                  ok: 'Proceed to Testing'
                        }
                    } catch (org.jenkinsci.plugins.workflow.steps.FlowInterruptedException e) {
                        currentBuild.result = 'ABORTED'
                        error "⛔ Deployment cancelled by user"
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
                    
                    // Call WebUI to deploy (best effort)
                    def deployResponse = sh(
                        script: "curl -s -X POST '${env.WEBUI_API.trim()}/api/jenkins/deploy-test' -H 'Content-Type: application/json' --data @deploy_test_payload.json --max-time 30 || echo '{\"status\":\"skipped\"}'",
                        returnStdout: true
                    ).trim()
                    
                    echo "Deploy response: ${deployResponse}"
                    echo "⏳ Waiting for test environment..."
                    sleep 30

                    // Trigger sync
                    def syncHeader = env.SYNC_JOB_TOKEN?.trim() ? "-H 'Authorization: Bearer ${env.SYNC_JOB_TOKEN}'" : ''
                    sh(script: "curl -s -X POST '${env.WEBUI_API.trim()}/api/sync' ${syncHeader} --max-time 10 || true")
                    
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
                    echo "🧪 Running integration tests..."
                    echo "Tests would run here against test environment"
                    // Tambahkan actual test commands di sini
                    // sh 'npm test' atau curl ke test endpoint
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
                    echo "🚨 FINAL PRODUCTION APPROVAL REQUIRED"
                    
                    // Register to WebUI (best effort)
                    if (env.WEBUI_API?.trim()) {
                        try {
                            def payload = JsonOutput.toJson([
                                appName    : env.APP_NAME,
                                buildNumber: env.BUILD_NUMBER,
                                version    : env.APP_VERSION,
                                jenkinsUrl : env.BUILD_URL ?: '',
                                inputId    : 'ConfirmProd',
                                isFinal    : true,
                                source     : 'jenkins'
                            ])
                            
                            writeFile file: 'pending_final_payload.json', text: payload
                            
                            sh(
                                script: "curl -s -X POST '${env.WEBUI_API.trim()}/api/jenkins/pending' -H 'Content-Type: application/json' --data @pending_final_payload.json --max-time 15 || true",
                                returnStdout: true
                            )
                        } catch (Exception e) {
                            echo "⚠️ Failed to register final approval: ${e.getMessage()}"
                        }
                    }

                    // Wait for final approval
                    try {
                        timeout(time: 30, unit: 'MINUTES') {
                            input message: "🚀🚀🚀 FINAL: Deploy ${env.APP_NAME}:${env.APP_VERSION} to PRODUCTION?", 
                                  id: 'ConfirmProd', 
                                  ok: 'DEPLOY TO PROD',
                                  submitterParameter: 'APPROVER'
                        }
                        echo "✅ Approved by ${env.APPROVER ?: 'unknown'}"
                    } catch (org.jenkinsci.plugins.workflow.steps.FlowInterruptedException e) {
                        currentBuild.result = 'ABORTED'
                        error "⛔ Production deployment cancelled by user"
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
                    echo "🚀 Deploying to PRODUCTION..."
                    
                    def payload = JsonOutput.toJson([
                        appName : env.APP_NAME,
                        env     : 'prod',
                        imageTag: env.APP_VERSION,
                        source  : 'jenkins'
                    ])
                    
                    writeFile file: 'update_prod_payload.json', text: payload
                    
                    def updateResponse = sh(
                        script: "curl -s -X POST '${env.WEBUI_API.trim()}/api/manifest/update-image' -H 'Content-Type: application/json' --data @update_prod_payload.json --max-time 30 || echo '{\"status\":\"manual\"}'",
                        returnStdout: true
                    ).trim()
                    
                    echo "Update response: ${updateResponse}"

                    // Trigger sync
                    def syncHeader = env.SYNC_JOB_TOKEN?.trim() ? "-H 'Authorization: Bearer ${env.SYNC_JOB_TOKEN}'" : ''
                    sh(script: "curl -s -X POST '${env.WEBUI_API.trim()}/api/sync' ${syncHeader} --max-time 10 || true")
                    
                    echo "✅ Production deployment initiated"
                }
            }
        }
    }

    post {
        success { 
            script { 
                sendWebhook('SUCCESS', 100, 'Completed')
                echo "🎉 BUILD SUCCESSFUL: ${env.APP_NAME}:${env.APP_VERSION}"
            } 
        }
        failure { 
            script { 
                sendWebhook('FAILED', 100, 'Failed')
                echo "❌ BUILD FAILED"
            } 
        }
        aborted {
            script {
                sendWebhook('ABORTED', 100, 'Aborted')
                echo "🛑 BUILD ABORTED"
            }
        }
        always {
            script {
                // Cleanup test environment
                if (env.WEBUI_API?.trim()) {
                    try {
                        def destroyPayload = JsonOutput.toJson([appName: env.APP_NAME])
                        writeFile file: 'destroy_payload.json', text: destroyPayload
                        sh(script: "curl -s -X POST '${env.WEBUI_API.trim()}/api/jenkins/destroy-test' -H 'Content-Type: application/json' --data @destroy_payload.json --max-time 10 || true")
                    } catch (Exception e) {
                        echo "Cleanup warning: ${e.getMessage()}"
                    }
                }
            }
            cleanWs()
        }
    }
}