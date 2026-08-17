FROM node:22-bookworm

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY tsconfig.json ./
COPY jest.config.js ./
COPY src ./src
COPY tests ./tests
COPY instruction.md ./
COPY task.toml ./

RUN npm run build

CMD ["npm", "test", "--", "--runInBand"]