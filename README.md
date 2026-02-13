# 💍 Site de Casamento - Sofia & Rafael

Site completo de casamento com React (frontend) e FastAPI (backend).

## 🚀 Estrutura do Projeto

```
casamento-site/
├── backend/              # API FastAPI
│   ├── main.py          # Servidor principal
│   └── requirements.txt # Dependências Python
├── frontend/            # App React
│   ├── src/
│   │   ├── components/  # Componentes React
│   │   ├── services/    # Comunicação com API
│   │   └── styles/      # Estilos globais
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 📦 Funcionalidades

- ✅ **Hero Section** - Página inicial elegante com nomes e data
- ✅ **Contador regressivo** - Contagem em tempo real até o casamento
- ✅ **Nossa História** - Timeline do relacionamento
- ✅ **Informações do Evento** - Cerimônia e recepção
- ✅ **RSVP** - Formulário de confirmação de presença (integrado com backend)
- ✅ **Lista de Presentes** - Presentes reserváveis (integrado com backend)
- ✅ **PIX** - Opção de presente em dinheiro com cópia de chave
- ✅ **Notificações** - Feedback visual para ações do usuário
- ✅ **Design Responsivo** - Funciona perfeitamente em mobile

## 🛠️ Como Rodar

### Backend (FastAPI)

1. **Instalar dependências Python:**
```bash
cd backend
pip install -r requirements.txt
```

2. **Rodar o servidor:**
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

O backend estará rodando em: `http://localhost:8000`
- Documentação da API: `http://localhost:8000/docs`

### Frontend (React + Vite)

1. **Instalar dependências Node:**
```bash
cd frontend
npm install
```

2. **Rodar o app React:**
```bash
npm run dev
```

O frontend estará rodando em: `http://localhost:3000`

## 🔌 API Endpoints

### RSVP
- `POST /api/rsvp` - Criar confirmação de presença
- `GET /api/rsvp` - Listar todas as confirmações
- `GET /api/rsvp/stats` - Estatísticas (confirmados, não confirmados, total de pessoas)

### Presentes
- `GET /api/presentes` - Listar todos os presentes
- `POST /api/presentes/{id}/reservar?nome=...` - Reservar um presente
- `DELETE /api/presentes/{id}/reservar` - Cancelar reserva

## 💾 Banco de Dados

O backend usa **SQLite** (arquivo `casamento.db` criado automaticamente).

Tabelas:
- `rsvps` - Confirmações de presença
- `presentes` - Lista de presentes

## 🎨 Personalização

### Cores (arquivo `frontend/src/styles/global.css`):
```css
:root {
  --cream: #f9f5ef;
  --sand: #e8ddd0;
  --warm-brown: #8b6f5e;
  --dark: #2c2520;
  --accent: #b5845a;
  --light-text: #9e8e84;
  --white: #fff;
}
```

### Dados do Casamento:
Edite os componentes em `frontend/src/components/` para mudar:
- Nomes dos noivos (Hero.jsx)
- Data do casamento (Hero.jsx, Countdown.jsx)
- Informações do evento (Evento.jsx)
- História do casal (Historia.jsx)

### Chave PIX:
Mude em `Presentes.jsx` a função `copyPix()`.

## 🚀 Deploy

### Backend
Recomendado: **Railway**, **Render** ou **Heroku**

### Frontend
Recomendado: **Vercel**, **Netlify** ou **GitHub Pages**

### Build do Frontend:
```bash
cd frontend
npm run build
```
Isso gera a pasta `dist/` com os arquivos estáticos prontos para deploy.

## 📝 Próximos Passos

- [ ] Adicionar envio de e-mails de confirmação
- [ ] Painel admin para os noivos verem RSVPs
- [ ] Upload de fotos dos convidados
- [ ] Mapa interativo dos locais
- [ ] Playlist colaborativa para a festa

## 🤝 Tecnologias Usadas

**Frontend:**
- React 18
- Vite
- Axios
- CSS3

**Backend:**
- FastAPI
- Python 3.9+
- SQLite
- Pydantic

---

Feito com 💛 para Sofia & Rafael
