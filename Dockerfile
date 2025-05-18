# Gunakan image resmi Node.js
FROM node:18-alpine

# Set direktori kerja
WORKDIR /app

# Salin package.json dan package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Salin semua file ke dalam container
COPY . .

# Jalankan build untuk compile TypeScript ke JavaScript
RUN npm run build

# Jalankan aplikasi (pastikan start script jalankan dist/app.js atau dist/main.js)
CMD ["npm", "start"]

# Ekspos port 3000
EXPOSE 3000
