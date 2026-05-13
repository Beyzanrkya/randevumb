FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Uygulamayı build et (Eğer statik dosya gerekiyorsa)
RUN npm run build

# Uygulamanın çalışacağı port
EXPOSE 3000

# Uygulamayı başlatıyoruz (Vite için preview modu)
CMD ["npm", "run", "preview"]
