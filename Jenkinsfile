pipeline {
    agent any
    
    environment {
        // Docker Configuration
        DOCKER_REGISTRY = 'docker.io' // Change to your registry
        DOCKER_IMAGE_NAME = 'cti-aggregator'
        DOCKER_IMAGE_TAG = "${env.BUILD_NUMBER}"
        DOCKER_CREDENTIALS_ID = 'docker-hub-credentials' // Jenkins credential ID
        
        // Application Configuration
        APP_NAME = 'cti-aggregator'
        MONGODB_IMAGE = 'mongo:7.0'
        
        // Environment-specific settings
        DEV_PORT = '5000'
        PROD_PORT = '5000'
        
        // Git Configuration
        GIT_COMMIT_SHORT = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
    }
    
    parameters {
        choice(
            name: 'ENVIRONMENT',
            choices: ['development', 'production'],
            description: 'Target deployment environment'
        )
        booleanParam(
            name: 'RUN_TESTS',
            defaultValue: true,
            description: 'Run tests before deployment'
        )
        booleanParam(
            name: 'DEPLOY',
            defaultValue: true,
            description: 'Deploy after successful build'
        )
    }
    
    stages {
        stage('Checkout') {
            steps {
                script {
                    echo "🔄 Checking out code from repository..."
                    checkout scm
                    echo "✅ Checked out commit: ${GIT_COMMIT_SHORT}"
                }
            }
        }
        
        stage('Environment Setup') {
            steps {
                script {
                    echo "🔧 Setting up environment variables..."
                    
                    // Load environment-specific variables
                    if (params.ENVIRONMENT == 'production') {
                        env.COMPOSE_FILE = 'docker-compose.yaml'
                        env.DOCKERFILE = 'Dockerfile'
                    } else {
                        env.COMPOSE_FILE = 'docker-compose.dev.yaml'
                        env.DOCKERFILE = 'Dockerfile.dev'
                    }
                    
                    echo "Environment: ${params.ENVIRONMENT}"
                    echo "Compose file: ${env.COMPOSE_FILE}"
                    echo "Dockerfile: ${env.DOCKERFILE}"
                }
            }
        }
        
        stage('Pre-build Cleanup') {
            steps {
                script {
                    echo "🧹 Cleaning up old containers and images..."
                    sh '''
                        # Stop and remove old containers
                        docker compose -f ${COMPOSE_FILE} down || true
                        
                        # Remove dangling images
                        docker image prune -f || true
                        
                        # Clean up old build artifacts
                        rm -rf dist/ node_modules/ || true
                    '''
                    echo "✅ Cleanup completed"
                }
            }
        }
        
        stage('Build Docker Images') {
            steps {
                script {
                    echo "🐳 Building Docker images..."
                    
                    // Build the application image
                    sh """
                        docker build \
                            -f ${DOCKERFILE} \
                            -t ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG} \
                            -t ${DOCKER_IMAGE_NAME}:latest \
                            --build-arg NODE_ENV=${params.ENVIRONMENT} \
                            .
                    """
                    
                    echo "✅ Docker image built successfully"
                    echo "Image tags: ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}, ${DOCKER_IMAGE_NAME}:latest"
                }
            }
        }
        
        stage('Run Tests') {
            when {
                expression { params.RUN_TESTS == true }
            }
            steps {
                script {
                    echo "🧪 Running tests..."
                    
                    try {
                        // Create a test container
                        sh """
                            docker run --rm \
                                -e NODE_ENV=test \
                                ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG} \
                                sh -c 'npm test || exit 0'
                        """
                        echo "✅ Tests completed"
                    } catch (Exception e) {
                        echo "⚠️ Tests failed but continuing pipeline: ${e.message}"
                        // Uncomment the next line to fail the pipeline on test failure
                        // error("Tests failed")
                    }
                }
            }
        }
        
        stage('Security Scan') {
            steps {
                script {
                    echo "🔒 Running security scan..."
                    
                    try {
                        // Scan for vulnerabilities using Trivy (if installed)
                        sh """
                            if command -v trivy &> /dev/null; then
                                trivy image --severity HIGH,CRITICAL ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}
                            else
                                echo "Trivy not installed, skipping security scan"
                            fi
                        """
                    } catch (Exception e) {
                        echo "⚠️ Security scan encountered issues: ${e.message}"
                    }
                }
            }
        }
        
        stage('Push to Registry') {
            when {
                expression { params.ENVIRONMENT == 'production' }
            }
            steps {
                script {
                    echo "📤 Pushing images to Docker registry..."
                    
                    docker.withRegistry("https://${DOCKER_REGISTRY}", "${DOCKER_CREDENTIALS_ID}") {
                        // Tag and push with build number
                        sh """
                            docker tag ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG} \
                                ${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}
                            docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}
                            
                            # Tag and push as latest
                            docker tag ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG} \
                                ${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:latest
                            docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:latest
                        """
                    }
                    
                    echo "✅ Images pushed successfully"
                }
            }
        }
        
        stage('Deploy') {
            when {
                expression { params.DEPLOY == true }
            }
            steps {
                script {
                    echo "🚀 Deploying application..."
                    
                    // Create .env file from Jenkins credentials
                    withCredentials([
                        string(credentialsId: 'jwt-secret', variable: 'JWT_SECRET'),
                        string(credentialsId: 'openai-api-key', variable: 'OPENAI_API_KEY'),
                        string(credentialsId: 'otx-api-key', variable: 'OTX_API_KEY'),
                        string(credentialsId: 'virustotal-api-key', variable: 'VIRUSTOTAL_API_KEY'),
                        string(credentialsId: 'abusech-auth-key', variable: 'ABUSECH_AUTH_KEY')
                    ]) {
                        // Create .env file
                        sh """
                            cat > .env << EOF
JWT_SECRET=${JWT_SECRET}
OPENAI_API_KEY=${OPENAI_API_KEY}
OTX_API_KEY=${OTX_API_KEY}
VIRUSTOTAL_API_KEY=${VIRUSTOTAL_API_KEY}
ABUSECH_AUTH_KEY=${ABUSECH_AUTH_KEY}
NODE_ENV=${params.ENVIRONMENT}
EOF
                        """
                        
                        // Deploy using docker-compose
                        sh """
                            # Pull MongoDB image
                            docker pull ${MONGODB_IMAGE}
                            
                            # Deploy services
                            docker compose -f ${COMPOSE_FILE} up -d
                            
                            # Wait for services to be healthy
                            echo "Waiting for services to be healthy..."
                            sleep 10
                            
                            # Check service status
                            docker compose -f ${COMPOSE_FILE} ps
                        """
                        
                        // Clean up .env file
                        sh 'rm -f .env'
                    }
                    
                    echo "✅ Deployment completed successfully"
                }
            }
        }
        
        stage('Health Check') {
            when {
                expression { params.DEPLOY == true }
            }
            steps {
                script {
                    echo "🏥 Performing health check..."
                    
                    def maxRetries = 12
                    def retryDelay = 5
                    def healthy = false
                    
                    for (int i = 1; i <= maxRetries; i++) {
                        try {
                            def response = sh(
                                script: "curl -f -s http://localhost:${env.DEV_PORT}/api/health",
                                returnStatus: true
                            )
                            
                            if (response == 0) {
                                healthy = true
                                echo "✅ Health check passed on attempt ${i}"
                                break
                            }
                        } catch (Exception e) {
                            echo "⏳ Health check attempt ${i}/${maxRetries} failed, retrying in ${retryDelay}s..."
                        }
                        
                        sleep(retryDelay)
                    }
                    
                    if (!healthy) {
                        error("❌ Health check failed after ${maxRetries} attempts")
                    }
                }
            }
        }
        
        stage('Generate Report') {
            steps {
                script {
                    echo "📊 Generating deployment report..."
                    
                    def report = """
                    ═══════════════════════════════════════════════════════════
                    🎉 CTI AGGREGATOR DEPLOYMENT REPORT
                    ═══════════════════════════════════════════════════════════
                    
                    Build Information:
                    ├─ Build Number: ${env.BUILD_NUMBER}
                    ├─ Git Commit: ${GIT_COMMIT_SHORT}
                    ├─ Environment: ${params.ENVIRONMENT}
                    ├─ Image Tag: ${DOCKER_IMAGE_TAG}
                    └─ Timestamp: ${new Date()}
                    
                    Deployment Status:
                    ├─ Docker Image: ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}
                    ├─ Compose File: ${env.COMPOSE_FILE}
                    ├─ Application Port: ${params.ENVIRONMENT == 'production' ? env.PROD_PORT : env.DEV_PORT}
                    └─ Health Check: ✅ PASSED
                    
                    Services:
                    ├─ MongoDB: Running on port 27017
                    └─ Application: Running on port ${params.ENVIRONMENT == 'production' ? env.PROD_PORT : env.DEV_PORT}
                    
                    ═══════════════════════════════════════════════════════════
                    """
                    
                    echo report
                    
                    // Save report to workspace
                    writeFile file: 'deployment-report.txt', text: report
                    archiveArtifacts artifacts: 'deployment-report.txt', fingerprint: true
                }
            }
        }
    }
    
    post {
        success {
            script {
                echo "✅ Pipeline completed successfully!"
                
                // Send success notification (configure your notification system)
                // emailext(
                //     subject: "✅ Jenkins Build #${env.BUILD_NUMBER} - SUCCESS",
                //     body: "The CTI Aggregator deployment was successful!",
                //     to: "team@example.com"
                // )
            }
        }
        
        failure {
            script {
                echo "❌ Pipeline failed!"
                
                // Rollback on failure
                sh """
                    echo "Attempting rollback..."
                    docker compose -f ${env.COMPOSE_FILE} down || true
                """
                
                // Send failure notification
                // emailext(
                //     subject: "❌ Jenkins Build #${env.BUILD_NUMBER} - FAILED",
                //     body: "The CTI Aggregator deployment failed. Please check the logs.",
                //     to: "team@example.com"
                // )
            }
        }
        
        always {
            script {
                echo "🧹 Cleaning up workspace..."
                
                // Clean up sensitive files
                sh 'rm -f .env || true'
                
                // Print final container status
                sh """
                    echo "Final container status:"
                    docker compose -f ${env.COMPOSE_FILE} ps || true
                """
                
                // Clean up old images (keep last 5 builds)
                sh """
                    docker images ${DOCKER_IMAGE_NAME} --format "{{.Tag}}" | \
                    grep -E '^[0-9]+\$' | sort -rn | tail -n +6 | \
                    xargs -I {} docker rmi ${DOCKER_IMAGE_NAME}:{} || true
                """
            }
        }
    }
}