import groovy.json.JsonOutput

pipeline {
    agent none

    environment {
        APP_NAME     = 'laravel-app'
        DOCKER_IMAGE = 'nginx'
        WEBUI_API    = 'https://nonfortifiable-mandie-uncontradictablely.ngrok-free.dev'

        // Jenkins Secret Text
        NARAOPS_API_KEY = credentials('naraops-api-cred')
    }

    options {
        disableConcurrentBuilds()
        skipDefaultCheckout(true)
        timeout(time: 1, unit: 'HOURS')
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {

        stage('Checkout & Versioning') {
            agent { label 'jenkins-light' }
            steps {
                checkout scm
                sh 'git fetch --tags --force'

                script {
                    def version = env.TAG_NAME?.trim()
                    if (!version) {
                        version = sh(
                            script: "git describe --tags --exact-match HEAD 2>/dev/null || echo dev-${BUILD_NUMBER}",
                            returnStdout: true
                        ).trim()
                    }
                    env.APP_VERSION = version
                    echo "APP_VERSION=${APP_VERSION}"
                }

                stash name: 'source', includes: '**/*'
            }
        }

        stage('Build & Push Docker') {
            agent { label 'jenkins-docker' }
            environment {
                DOCKER_CREDS = credentials('docker-cred')
            }
            steps {
                unstash 'source'

                container('docker') {
                    sh '''
                      echo "$DOCKER_CREDS_PSW" | docker login -u "$DOCKER_CREDS_USR" --password-stdin
                      docker build -t $DOCKER_IMAGE:$APP_VERSION .
                      docker push $DOCKER_IMAGE:$APP_VERSION
                    '''
                }
            }
        }

        stage('Deploy Testing') {
            agent { label 'jenkins-light' }
            steps {
                script {
                    def payload = JsonOutput.toJson([
                        appName  : APP_NAME,
                        imageTag : APP_VERSION
                    ])

                    writeFile file: 'deploy_test.json', text: payload

                    sh '''
                      curl -s -X POST "$WEBUI_API/api/jenkins/deploy-test"                         -H "Content-Type: application/json"                         -H "x-auth: $NARAOPS_API_KEY"                         --data @deploy_test.json
                    '''

                    sh '''
                      curl -s -X POST "$WEBUI_API/api/sync"                         -H "x-auth: $NARAOPS_API_KEY"
                    '''
                }
            }
        }

        stage('Approval Production') {
            agent { label 'jenkins-light' }
            steps {
                timeout(time: 30, unit: 'MINUTES') {
                    input message: "DEPLOY ${APP_NAME}:${APP_VERSION} TO PRODUCTION?"
                }
            }
        }

        stage('Destroy Testing') {
            agent { label 'jenkins-light' }
            steps {
                sh '''
                  curl -s -X POST "$WEBUI_API/api/jenkins/destroy-test"                     -H "x-auth: $NARAOPS_API_KEY"
                '''
            }
        }

        stage('Deploy Production') {
            agent { label 'jenkins-light' }
            steps {
                script {
                    def payload = JsonOutput.toJson([
                        appName  : APP_NAME,
                        imageTag : APP_VERSION,
                        env      : 'prod'
                    ])

                    writeFile file: 'deploy_prod.json', text: payload

                    sh '''
                      curl -s -X POST "$WEBUI_API/api/manifest/update-image"                         -H "Content-Type: application/json"                         -H "x-auth: $NARAOPS_API_KEY"                         --data @deploy_prod.json
                    '''

                    sh '''
                      curl -s -X POST "$WEBUI_API/api/sync"                         -H "x-auth: $NARAOPS_API_KEY"
                    '''
                }
            }
        }

        stage('Cleanup') {
            agent { label 'jenkins-light' }
            steps {
                cleanWs()
            }
        }
    }
}
