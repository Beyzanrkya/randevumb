# Node.js tabanlı bir imaj kullanıyoruz
FROM node:18-alpine

# Çalışma dizinini ayarlıyoruz
WORKDIR /app

# Bağımlılıkları kopyalayıp kuruyoruz
COPY package*.json ./
RUN npm install

# Tüm kodları kopyalıyoruz
COPY . .

# Uygulamanın çalışacağı port
EXPOSE 5000

# Uygulamayı başlatıyoruz
CMD ["npm", "start"]
