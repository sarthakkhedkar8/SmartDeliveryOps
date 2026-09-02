pipeline {

    agent any

    environment {
        FRONTEND_IMAGE = "smartdeliveryops-frontend:latest"
        BACKEND_IMAGE = "smartdeliveryops-backend:latest"
        AI_IMAGE = "smartdeliveryops-ai-prediction:latest"
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out SmartDeliveryOps source code...'
                checkout scm
            }
        }

        stage('Project Info') {
            steps {
                sh '''
                    echo "========================================="
                    echo " SmartDeliveryOps CI/CD Pipeline"
                    echo "========================================="
                    echo "Git Commit:"
                    git log -1 --oneline
                    echo "Docker:"
                    docker --version
                    echo "Docker Compose:"
                    docker compose version
                '''
            }
        }

        stage('Backend Test') {
            steps {
                echo 'Running backend validation...'

                sh '''
                    python3 --version
                    test -f backend/delivery-service/main.py
                    test -f backend/delivery-service/requirements.txt
                    echo "Backend files validated successfully."
                '''
            }
        }

        stage('Frontend Test') {
            steps {
                echo 'Building frontend...'

                dir('frontend') {
                    sh '''
                        npm --version
                        npm install
                        npm run build
                    '''
                }
            }
        }

        stage('Build Backend Docker Image') {
            steps {
                echo 'Building backend Docker image...'

                sh '''
                    docker build \
                      -t ${BACKEND_IMAGE} \
                      ./backend/delivery-service
                '''
            }
        }

        stage('Build Frontend Docker Image') {
            steps {
                echo 'Building frontend Docker image...'

                sh '''
                    docker build \
                      -t ${FRONTEND_IMAGE} \
                      ./frontend
                '''
            }
        }

        stage('Build AI Docker Image') {
            steps {
                echo 'Building AI prediction Docker image...'

                sh '''
                    docker build \
                      -t ${AI_IMAGE} \
                      ./ai-agents/delivery-prediction-agent
                '''
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying SmartDeliveryOps...'

                sh '''
                    docker compose up -d --force-recreate
                '''
            }
        }

        stage('Health Check') {
            steps {
                echo 'Checking SmartDeliveryOps services...'

                sh '''
                    sleep 10

                    echo "Checking Backend..."
                    curl -f http://localhost:8001/health

                    echo ""
                    echo "Checking AI Service..."
                    curl -f http://localhost:8002/health

                    echo ""
                    echo "Checking Frontend..."
                    curl -f http://localhost:5173

                    echo ""
                    echo "========================================="
                    echo " SmartDeliveryOps deployment successful!"
                    echo "========================================="
                '''
            }
        }
    }

    post {

        success {
            echo '========================================='
            echo ' CI/CD PIPELINE SUCCESSFUL'
            echo '========================================='
        }

        failure {
            echo '========================================='
            echo ' CI/CD PIPELINE FAILED'
            echo 'Check Jenkins console output.'
            echo '========================================='
        }

        always {
            sh '''
                echo "Running containers:"
                docker ps
            '''
        }
    }
}
