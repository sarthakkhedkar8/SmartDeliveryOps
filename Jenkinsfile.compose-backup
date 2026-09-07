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

                    echo "Git Branch:"
                    git branch --show-current

                    echo "Python:"
                    python3 --version

                    echo "Node:"
                    node --version

                    echo "NPM:"
                    npm --version

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
                    echo "Checking backend files..."

                    test -f backend/delivery-service/main.py
                    test -f backend/delivery-service/requirements.txt
                    test -f backend/delivery-service/Dockerfile

                    python3 --version

                    echo "Backend files validated successfully."
                '''
            }
        }

        stage('AI Service Test') {
            steps {
                echo 'Running AI service validation...'

                sh '''
                    echo "Checking AI service files..."

                    test -f ai-agents/delivery-prediction-agent/agent.py
                    test -f ai-agents/delivery-prediction-agent/api.py
                    test -f ai-agents/delivery-prediction-agent/requirements.txt
                    test -f ai-agents/delivery-prediction-agent/Dockerfile

                    echo "AI service files validated successfully."
                '''
            }
        }

        stage('Frontend Test') {
            steps {
                echo 'Building frontend...'

                dir('frontend') {
                    sh '''
                        echo "Node version:"
                        node --version

                        echo "NPM version:"
                        npm --version

                        echo "Installing frontend dependencies..."
                        npm install

                        echo "Running frontend production build..."
                        npm run build

                        echo "Frontend build successful."
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

                    echo "Backend Docker image created successfully."
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

                    echo "Frontend Docker image created successfully."
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

                    echo "AI Docker image created successfully."
                '''
            }
        }

        stage('Docker Images') {
            steps {
                echo 'Checking Docker images...'

                sh '''
                    echo "========================================="
                    echo " SmartDeliveryOps Docker Images"
                    echo "========================================="

                    docker images | grep smartdeliveryops || true
                '''
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying SmartDeliveryOps...'

                sh '''
                    echo "Using SmartDeliveryOps Compose project..."

                    docker compose \
                      -p smartdeliveryops \
                      up -d --force-recreate

                    echo "Deployment command completed."
                '''
            }
        }

        stage('Health Check') {
            steps {
                echo 'Checking SmartDeliveryOps services...'

                sh '''
                    echo "Waiting for services to start..."
                    sleep 10

                    echo ""
                    echo "========================================="
                    echo " Backend Health Check"
                    echo "========================================="

                    curl -f http://localhost:8001/health

                    echo ""
                    echo "Backend is healthy."

                    echo ""
                    echo "========================================="
                    echo " AI Service Health Check"
                    echo "========================================="

                    curl -f http://localhost:8002/health

                    echo ""
                    echo "AI service is healthy."

                    echo ""
                    echo "========================================="
                    echo " Frontend Health Check"
                    echo "========================================="

                    curl -f http://localhost:5173

                    echo ""
                    echo "Frontend is healthy."

                    echo ""
                    echo "========================================="
                    echo " SmartDeliveryOps deployment successful!"
                    echo "========================================="
                '''
            }
        }

        stage('Final Container Check') {
            steps {
                echo 'Checking running containers...'

                sh '''
                    echo "========================================="
                    echo " Running SmartDeliveryOps Containers"
                    echo "========================================="

                    docker ps \
                      --filter "name=smartdeliveryops" \
                      --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"
                '''
            }
        }
    }

    post {

        success {
            echo '''
=========================================
 CI/CD PIPELINE SUCCESSFUL
=========================================
 SmartDeliveryOps has been successfully
 built, deployed and health-checked.
=========================================
'''
        }

        failure {
            echo '''
=========================================
 CI/CD PIPELINE FAILED
=========================================
Please check the Jenkins Console Output
for the failed stage and error.
=========================================
'''
        }

        always {
            sh '''
                echo ""
                echo "========================================="
                echo " Docker Containers After Pipeline"
                echo "========================================="

                docker ps \
                  --filter "name=smartdeliveryops" \
                  --format "table {{.Names}}\\t{{.Image}}\\t{{.Status}}\\t{{.Ports}}" || true

                echo ""
                echo "========================================="
                echo " Pipeline Finished"
                echo "========================================="
            '''
        }
    }
}
