# Gunakan image resmi Node.js
FROM node:18-alpine

# Set direktori kerja
WORKDIR /app

# Salin file package.json dan package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Salin semua file ke dalam container
COPY . .

# Jalankan aplikasi
CMD ["npm", "start"]

# Jalankan di port 3000
EXPOSE 3000
