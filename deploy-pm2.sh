#!/bin/bash

# Configurações
LOCAL_PROJECT_DIR="./"                      # Seu projeto Angular + Dockerfile
REMOTE_USER="root"
REMOTE_HOST="191.252.38.68"
REMOTE_PROJECT_DIR="~/landing-page-front"
DOCKER_IMAGE_NAME="landing-page-angular"
DOCKER_CONTAINER_NAME="landing-page-container"

echo "Compactando projeto para envio..."
# Gera a lista de exclusões a partir do .dockerignore (se existir)
EXCLUDES=""
if [ -f .dockerignore ]; then
  EXCLUDES=$(grep -v '^#' .dockerignore | sed '/^\s*$/d' | sed 's/^/--exclude=/' | tr '\n' ' ')
fi

tar czf project.tar.gz $EXCLUDES --exclude=project.tar.gz -C $LOCAL_PROJECT_DIR .

echo "Verificando se o arquivo project.tar.gz foi gerado..."
ls -lh project.tar.gz || { echo "Falha ao gerar o arquivo tar"; exit 1; }

echo "Enviando projeto para a VPS..."
scp project.tar.gz $REMOTE_USER@$REMOTE_HOST:$REMOTE_PROJECT_DIR/ || { echo "Falha ao enviar arquivos"; exit 1; }

echo "Conectando na VPS para build e deploy..."
ssh $REMOTE_USER@$REMOTE_HOST 'bash -s' << 'EOF'
  set -e
  cd ~/landing-page-front

  echo "Limpando restos de deploy antigo..."
  rm -rf tmp_deploy
  mkdir tmp_deploy

  echo "Movendo o arquivo compactado para a pasta temporária..."
  mv project.tar.gz tmp_deploy/

  echo "Extraindo arquivos..."
  cd tmp_deploy
  tar xzf project.tar.gz || { echo "Falha ao extrair arquivos"; exit 1; }
  rm project.tar.gz
  cd ..

  echo "Removendo conteúdo antigo da aplicação (exceto tmp_deploy)..."
  find . -mindepth 1 -maxdepth 1 ! -name 'tmp_deploy' -exec rm -rf {} +

  echo "Movendo novos arquivos para o diretório final..."
  mv tmp_deploy/* .
  rm -rf tmp_deploy

  echo "Verificando se o Dockerfile está presente..."
  ls -lh Dockerfile || { echo "Dockerfile não encontrado após a extração"; exit 1; }

  echo "Buildando Docker image..."
  docker build -t landing-page-angular . || { echo "Falha ao construir a imagem Docker"; exit 1; }

  echo "Parando container antigo (se existir)..."
  docker stop landing-page-container || true
  docker rm landing-page-container || true

  echo "Subindo novo container..."
  docker run -d --name landing-page-container -p 3000:3000 landing-page-angular || { echo "Falha ao rodar o container Docker"; exit 1; }

  echo "Deploy finalizado!"
EOF

echo "Limpeza local..."
rm project.tar.gz

echo "✅ Deploy concluído com sucesso!"
