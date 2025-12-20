# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/out /usr/share/nginx/html  
# Nếu dùng next export; hoặc .next cho Server Side Rendering
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]