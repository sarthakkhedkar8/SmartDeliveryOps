pipeline {
    agent any

    environment {
        REGISTRY = "192.168.49.2:5000"

        BACKEND_IMAGE = "192.168.49.2:5000/smartdeliveryops-backend"
        FRONTEND_IMAGE = "192.168.49.2:5000/smartdeliveryops-frontend"
        AI_IMAGE = "192.168.49.2:5000/smartdeliveryops-ai-prediction"

        KUBECONFIG = "/var/lib/jenkins/.kube/config"
        MINIKUBE_HOME = "/var/lib/jenkins/.minikube"
        MINIKUBE_PROFILE = "minikube"
    }

    stages {

        stage('01 - Checkout') {
            steps {
                checkout scm
            }
        }

        stage('02 - Project Info') {
            steps {
                sh '''
                    echo "======================================"
                    echo " SmartDeliveryOps CI/CD"
                    echo " Build: ${BUILD_NUMBER}"
                    echo " Branch: ${BRANCH_NAME:-main}"
                    echo "======================================"

                    git rev-parse --short HEAD
                    git status --short
                '''
            }
        }

        stage('03 - Backend Validation') {
            steps {
                sh '''
                    set -e

                    cd backend/delivery-service

                    echo "Checking backend files..."

                    test -f main.py
                    test -f requirements.txt
                    test -f Dockerfile

                    python3 -m py_compile main.py

                    echo "Backend validation PASSED"
                '''
            }
        }

        stage('04 - AI Validation') {
            steps {
                sh '''
                    set -e

                    cd ai-agents/delivery-prediction-agent

                    echo "Checking AI agent files..."

                    test -f agent.py
                    test -f api.py
                    test -f requirements.txt
                    test -f Dockerfile

                    python3 -m py_compile agent.py
                    python3 -m py_compile api.py

                    echo "AI validation PASSED"
                '''
            }
        }

        stage('05 - Frontend Validation') {
            steps {
                sh '''
                    set -e

                    cd frontend

                    test -f package.json
                    test -f package-lock.json
                    test -f Dockerfile

                    echo "Installing frontend dependencies..."
                    npm ci

                    echo "Building frontend..."
                    npm run build

                    echo "Frontend validation PASSED"
                '''
            }
        }

        stage('06 - Docker Build') {
            steps {
                sh '''
                    set -e

                    echo "Building Backend image..."
                    docker build \
                        -t ${BACKEND_IMAGE}:build-${BUILD_NUMBER} \
                        backend/delivery-service

                    echo "Building Frontend image..."
                    docker build \
                        -t ${FRONTEND_IMAGE}:build-${BUILD_NUMBER} \
                        frontend

                    echo "Building AI image..."
                    docker build \
                        -t ${AI_IMAGE}:build-${BUILD_NUMBER} \
                        ai-agents/delivery-prediction-agent

                    echo "Docker builds PASSED"
                '''
            }
        }

        stage('07 - Docker Registry Push') {
            steps {
                sh '''
                    set -e

                    echo "Pushing Backend..."
                    docker push ${BACKEND_IMAGE}:build-${BUILD_NUMBER}

                    echo "Pushing Frontend..."
                    docker push ${FRONTEND_IMAGE}:build-${BUILD_NUMBER}

                    echo "Pushing AI..."
                    docker push ${AI_IMAGE}:build-${BUILD_NUMBER}

                    echo "All images pushed successfully."
                '''
            }
        }

        stage('08 - Registry Verification') {
            steps {
                sh '''
                    set -e

                    echo "Registry repositories:"
                    curl -fsS http://${REGISTRY}/v2/_catalog

                    echo
                    echo "Backend tags:"
                    curl -fsS http://${REGISTRY}/v2/smartdeliveryops-backend/tags/list

                    echo
                    echo "Frontend tags:"
                    curl -fsS http://${REGISTRY}/v2/smartdeliveryops-frontend/tags/list

                    echo
                    echo "AI tags:"
                    curl -fsS http://${REGISTRY}/v2/smartdeliveryops-ai-prediction/tags/list

                    echo
                    echo "Registry verification PASSED"
                '''
            }
        }

        stage('09 - Kubernetes Connectivity') {
            steps {
                sh '''
                    set -e

                    echo "Kubernetes context:"
                    kubectl config current-context

                    echo
                    echo "Kubernetes nodes:"
                    kubectl get nodes

                    echo
                    echo "Kubernetes connectivity PASSED"
                '''
            }
        }

        stage('10 - Deploy PostgreSQL') {
            steps {
                sh '''
                    set -e

                    kubectl apply -f kubernetes/postgres-secret.yaml
                    kubectl apply -f kubernetes/postgres-pvc.yaml
                    kubectl apply -f kubernetes/postgres-deployment.yaml
                    kubectl apply -f kubernetes/postgres-service.yaml

                    kubectl rollout status deployment/postgres --timeout=180s

                    echo "PostgreSQL deployment PASSED"
                '''
            }
        }

        stage('11 - Deploy Backend') {
            steps {
                sh '''
                    set -e

                    kubectl apply -f kubernetes/backend-service.yaml

                    kubectl set image deployment/backend \
                        backend=${BACKEND_IMAGE}:build-${BUILD_NUMBER}

                    kubectl rollout status deployment/backend --timeout=180s

                    echo "Backend deployment PASSED"
                '''
            }
        }

        stage('12 - Deploy Frontend') {
            steps {
                sh '''
                    set -e

                    kubectl apply -f kubernetes/frontend-service.yaml

                    kubectl set image deployment/frontend \
                        frontend=${FRONTEND_IMAGE}:build-${BUILD_NUMBER}

                    kubectl rollout status deployment/frontend --timeout=180s

                    echo "Frontend deployment PASSED"
                '''
            }
        }

        stage('13 - Deploy AI Image') {
            steps {
                sh '''
                    set -e

                    echo "AI image is available in registry:"
                    curl -fsS \
                        http://${REGISTRY}/v2/smartdeliveryops-ai-prediction/tags/list

                    echo
                    echo "AI image push verification PASSED"
                    echo "Dedicated AI Kubernetes Deployment will be added in next architecture step."
                '''
            }
        }

        stage('14 - Kubernetes Status') {
            steps {
                sh '''
                    echo "======================================"
                    echo " Kubernetes Deployments"
                    echo "======================================"

                    kubectl get deployments -o wide

                    echo
                    echo "======================================"
                    echo " Kubernetes Pods"
                    echo "======================================"

                    kubectl get pods -o wide

                    echo
                    echo "======================================"
                    echo " Kubernetes Services"
                    echo "======================================"

                    kubectl get services
                '''
            }
        }

        stage('15 - Backend Health Check') {
            steps {
                sh '''
                    set -e

                    echo "Waiting for backend..."

                    sleep 5

                    BACKEND_POD=$(kubectl get pods \
                        -l app=backend \
                        -o jsonpath='{.items[0].metadata.name}')

                    echo "Backend pod: ${BACKEND_POD}"

                    kubectl exec ${BACKEND_POD} -- \
                        python3 -c "import urllib.request; print(urllib.request.urlopen('http://127.0.0.1:8001/health').read().decode())"

                    echo "Backend health check PASSED"
                '''
            }
        }

        stage('16 - Database Verification') {
            steps {
                sh '''
                    set -e

                    BACKEND_POD=$(kubectl get pods \
                        -l app=backend \
                        -o jsonpath='{.items[0].metadata.name}')

                    echo "Testing database through backend..."

                    kubectl exec ${BACKEND_POD} -- \
                        python3 -c "import urllib.request; print(urllib.request.urlopen('http://127.0.0.1:8001/deliveries').read().decode())"

                    echo
                    echo "Database verification PASSED"
                '''
            }
        }

        stage('17 - AI Prediction Verification') {
            steps {
                sh '''
                    set -e

                    BACKEND_POD=$(kubectl get pods \
                        -l app=backend \
                        -o jsonpath='{.items[0].metadata.name}')

                    echo "Testing AI prediction endpoint..."

                    kubectl exec ${BACKEND_POD} -- \
                        python3 -c "import urllib.request; print(urllib.request.urlopen('http://127.0.0.1:8001/ai/predictions').read().decode())"

                    echo
                    echo "AI prediction verification PASSED"
                '''
            }
        }

        stage('18 - Frontend Verification') {
            steps {
                sh '''
                    set -e

                    FRONTEND_POD=$(kubectl get pods \
                        -l app=frontend \
                        -o jsonpath='{.items[0].metadata.name}')

                    echo "Frontend pod: ${FRONTEND_POD}"

                    kubectl exec ${FRONTEND_POD} -- \
                        wget -qO- http://127.0.0.1:5173/ | head -20

                    echo
                    echo "Frontend verification PASSED"
                '''
            }
        }

        stage('19 - Final Deployment Summary') {
            steps {
                sh '''
                    echo
                    echo "=============================================="
                    echo " SMARTDELIVERYOPS DEPLOYMENT SUCCESS"
                    echo "=============================================="

                    echo
                    echo "Build Number:"
                    echo "${BUILD_NUMBER}"

                    echo
                    echo "Backend Image:"
                    echo "${BACKEND_IMAGE}:build-${BUILD_NUMBER}"

                    echo
                    echo "Frontend Image:"
                    echo "${FRONTEND_IMAGE}:build-${BUILD_NUMBER}"

                    echo
                    echo "AI Image:"
                    echo "${AI_IMAGE}:build-${BUILD_NUMBER}"

                    echo
                    echo "Kubernetes:"
                    kubectl get deployments

                    echo
                    kubectl get pods

                    echo
                    kubectl get services

                    echo
                    echo "=============================================="
                '''
            }
        }
    }

    post {

        success {
            echo "SmartDeliveryOps CI/CD pipeline completed successfully."
        }

        failure {
            echo "SmartDeliveryOps CI/CD pipeline FAILED."
            sh '''
                echo "===== FAILED BUILD DEBUG ====="
                kubectl get pods -o wide || true
                kubectl get events --sort-by=.lastTimestamp | tail -30 || true
            '''
        }

        always {
            echo "Pipeline finished: ${currentBuild.currentResult}"
        }
    }
}
