FROM n8nio/n8n:latest

USER root
# Create the .n8n directory and assign ownership to node user
RUN mkdir -p /home/node/.n8n && chown -R node:node /home/node/.n8n

# --- VARIABLES DE ENTORNO HARDCODEADAS ---
ENV N8N_PORT=7860
ENV PORT=7860
ENV N8N_LISTEN_ADDRESS=0.0.0.0

# Forzador de SSL para la librería nativa Postgres de NodeJS
ENV PGSSLMODE=require

# Base de datos (Neon obliga a usar SSL)
ENV DB_TYPE=postgresdb
ENV DB_POSTGRESDB_DATABASE=neondb
ENV DB_POSTGRESDB_HOST=ep-rapid-hill-adiehuvc.c-2.us-east-1.aws.neon.tech
ENV DB_POSTGRESDB_PORT=5432
ENV DB_POSTGRESDB_USER=neondb_owner
ENV DB_POSTGRESDB_PASSWORD=npg_Yhvk2DzABn6P

# Variables de SSL específicas de n8n
ENV DB_POSTGRESDB_SSL=true
ENV DB_POSTGRESDB_SSL_REJECT_UNAUTHORIZED=false

# Seguridad y Persistencia
ENV N8N_ENCRYPTION_KEY=novo-heritage-super-secret-key-2026

# Switch back to the node user (ID 1000) as required by Hugging Face Spaces
USER node
