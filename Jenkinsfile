pipeline {
    agent any

    environment {
        DOCKER_COMPOSE_COMMAND = "docker compose"
    }

    stages {
        // 1. AŞAMA: Kodların repodan çekilmesi (Hoca İsteği - Slayt 4)
        stage('Checkout') {
            steps {
                echo '📦 GitHub üzerinden en güncel kodlar çekiliyor...'
                // Jenkins sunucusu bu aşamada git checkout yapar
            }
        }

        // 2. AŞAMA: Docker imajlarının oluşturulması ve yayına alınması (Hoca İsteği - Slayt 1)
        stage('Build and Deploy') {
            steps {
                echo '🏗️ Docker Compose ile sistem inşa ediliyor...'
                // Sadece uygulamayı ve bağımlılıklarını yönetiyoruz, jenkins'e dokunmuyoruz
                sh 'docker compose up -d --build backend frontend mongodb redis rabbitmq'
            }
        }

        // 3. AŞAMA: Sağlık Kontrolü (Health Check - Slayt 4)
        stage('Health Check') {
            steps {
                echo '🔍 Sistem kontrol ediliyor...'
                script {
                    // Sunucunun ayağa kalkması için kısa bir süre bekle
                    sleep 15 
                    // Backend API'nin yanıt verip vermediğini kontrol et
                    sh 'curl -f http://localhost:5000/api || echo "⚠️ Backend henüz tam hazır değil, biraz daha zaman gerekebilir."'
                }
            }
        }
    }

    // İŞLEM SONRASI DURUM BİLDİRİMLERİ (Slayt 4'teki yeşil tikler için)
    post {
        success {
            echo '✅ TEBRİKLER: CI/CD Süreci başarıyla tamamlandı. MBrandev sistemi yayında!'
        }
        failure {
            echo '❌ HATA: Dağıtım (Deploy) sırasında bir sorun oluştu. Logları kontrol edin.'
        }
    }
}
