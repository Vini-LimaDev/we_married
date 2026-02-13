from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
import sqlite3
import json

app = FastAPI(title="Casamento API", version="1.0.0")

# CORS - permite que o React se comunique com o backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ══════════════════════════════════════════════════════════
# MODELS (estrutura dos dados)
# ══════════════════════════════════════════════════════════

class RSVPCreate(BaseModel):
    nome: str
    email: EmailStr
    confirmado: bool
    num_convidados: int = 1
    restricao_alimentar: Optional[str] = None
    mensagem: Optional[str] = None

class RSVPResponse(BaseModel):
    id: int
    nome: str
    email: str
    confirmado: bool
    num_convidados: int
    restricao_alimentar: Optional[str]
    mensagem: Optional[str]
    criado_em: str

class PresenteResponse(BaseModel):
    id: int
    nome: str
    descricao: str
    preco: Optional[str]
    emoji: str
    reservado: bool
    reservado_por: Optional[str]

# ══════════════════════════════════════════════════════════
# DATABASE
# ══════════════════════════════════════════════════════════

def init_db():
    """Inicializa o banco de dados"""
    conn = sqlite3.connect('casamento.db')
    c = conn.cursor()
    
    # Tabela de RSVPs
    c.execute('''
        CREATE TABLE IF NOT EXISTS rsvps (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT NOT NULL,
            confirmado BOOLEAN NOT NULL,
            num_convidados INTEGER DEFAULT 1,
            restricao_alimentar TEXT,
            mensagem TEXT,
            criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Tabela de presentes
    c.execute('''
        CREATE TABLE IF NOT EXISTS presentes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            descricao TEXT NOT NULL,
            preco TEXT,
            emoji TEXT NOT NULL,
            reservado BOOLEAN DEFAULT FALSE,
            reservado_por TEXT,
            reservado_em TIMESTAMP
        )
    ''')
    
    # Inserir presentes de exemplo se a tabela estiver vazia
    c.execute('SELECT COUNT(*) FROM presentes')
    if c.fetchone()[0] == 0:
        presentes_exemplo = [
            ("Lua de mel", "Contribua para nossa viagem dos sonhos para a Itália e Grécia.", "Qualquer valor", "✈️"),
            ("Adega de vinho", "Uma adega climatizada para a nossa cozinha nova.", "R$ 1.200", "🍷"),
            ("Poltrona de leitura", "A poltrona perfeita para o cantinho de leitura.", "R$ 850", "🛋️"),
            ("Experiência", "Contribua para um passeio de ski ou mergulho durante a lua de mel.", "R$ 500", "🎿"),
            ("Nosso lar", "Qualquer contribuição para a decoração do nosso primeiro apartamento juntos.", "Qualquer valor", "🏠"),
            ("Biblioteca juntos", "Escolha um livro que nos marcou ou que nos recomenda — com dedicatória.", "Surpresa", "📚"),
        ]
        c.executemany(
            'INSERT INTO presentes (nome, descricao, preco, emoji) VALUES (?, ?, ?, ?)',
            presentes_exemplo
        )
    
    conn.commit()
    conn.close()

# Inicializa o banco ao iniciar a aplicação
@app.on_event("startup")
async def startup_event():
    init_db()

# ══════════════════════════════════════════════════════════
# RSVP ENDPOINTS
# ══════════════════════════════════════════════════════════

@app.post("/api/rsvp", response_model=RSVPResponse)
async def criar_rsvp(rsvp: RSVPCreate):
    """Cria uma nova confirmação de presença"""
    conn = sqlite3.connect('casamento.db')
    c = conn.cursor()
    
    c.execute('''
        INSERT INTO rsvps (nome, email, confirmado, num_convidados, restricao_alimentar, mensagem)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (rsvp.nome, rsvp.email, rsvp.confirmado, rsvp.num_convidados, 
          rsvp.restricao_alimentar, rsvp.mensagem))
    
    rsvp_id = c.lastrowid
    conn.commit()
    
    # Buscar o RSVP criado
    c.execute('SELECT * FROM rsvps WHERE id = ?', (rsvp_id,))
    row = c.fetchone()
    conn.close()
    
    return {
        "id": row[0],
        "nome": row[1],
        "email": row[2],
        "confirmado": bool(row[3]),
        "num_convidados": row[4],
        "restricao_alimentar": row[5],
        "mensagem": row[6],
        "criado_em": row[7]
    }

@app.get("/api/rsvp", response_model=List[RSVPResponse])
async def listar_rsvps():
    """Lista todas as confirmações (para os noivos verem)"""
    conn = sqlite3.connect('casamento.db')
    c = conn.cursor()
    
    c.execute('SELECT * FROM rsvps ORDER BY criado_em DESC')
    rows = c.fetchall()
    conn.close()
    
    return [
        {
            "id": row[0],
            "nome": row[1],
            "email": row[2],
            "confirmado": bool(row[3]),
            "num_convidados": row[4],
            "restricao_alimentar": row[5],
            "mensagem": row[6],
            "criado_em": row[7]
        }
        for row in rows
    ]

@app.get("/api/rsvp/stats")
async def estatisticas_rsvp():
    """Retorna estatísticas das confirmações"""
    conn = sqlite3.connect('casamento.db')
    c = conn.cursor()
    
    c.execute('SELECT COUNT(*) FROM rsvps WHERE confirmado = TRUE')
    confirmados = c.fetchone()[0]
    
    c.execute('SELECT COUNT(*) FROM rsvps WHERE confirmado = FALSE')
    nao_confirmados = c.fetchone()[0]
    
    c.execute('SELECT SUM(num_convidados) FROM rsvps WHERE confirmado = TRUE')
    total_pessoas = c.fetchone()[0] or 0
    
    conn.close()
    
    return {
        "confirmados": confirmados,
        "nao_confirmados": nao_confirmados,
        "total_pessoas": total_pessoas
    }

# ══════════════════════════════════════════════════════════
# PRESENTES ENDPOINTS
# ══════════════════════════════════════════════════════════

@app.get("/api/presentes", response_model=List[PresenteResponse])
async def listar_presentes():
    """Lista todos os presentes"""
    conn = sqlite3.connect('casamento.db')
    c = conn.cursor()
    
    c.execute('SELECT id, nome, descricao, preco, emoji, reservado, reservado_por FROM presentes')
    rows = c.fetchall()
    conn.close()
    
    return [
        {
            "id": row[0],
            "nome": row[1],
            "descricao": row[2],
            "preco": row[3],
            "emoji": row[4],
            "reservado": bool(row[5]),
            "reservado_por": row[6]
        }
        for row in rows
    ]

@app.post("/api/presentes/{presente_id}/reservar")
async def reservar_presente(presente_id: int, nome: str):
    """Reserva um presente"""
    conn = sqlite3.connect('casamento.db')
    c = conn.cursor()
    
    # Verificar se o presente existe e não está reservado
    c.execute('SELECT reservado FROM presentes WHERE id = ?', (presente_id,))
    result = c.fetchone()
    
    if not result:
        conn.close()
        raise HTTPException(status_code=404, detail="Presente não encontrado")
    
    if result[0]:
        conn.close()
        raise HTTPException(status_code=400, detail="Presente já foi reservado")
    
    # Reservar o presente
    c.execute('''
        UPDATE presentes 
        SET reservado = TRUE, reservado_por = ?, reservado_em = CURRENT_TIMESTAMP
        WHERE id = ?
    ''', (nome, presente_id))
    
    conn.commit()
    conn.close()
    
    return {"message": "Presente reservado com sucesso!", "reservado_por": nome}

@app.delete("/api/presentes/{presente_id}/reservar")
async def cancelar_reserva(presente_id: int):
    """Cancela a reserva de um presente (para os noivos)"""
    conn = sqlite3.connect('casamento.db')
    c = conn.cursor()
    
    c.execute('''
        UPDATE presentes 
        SET reservado = FALSE, reservado_por = NULL, reservado_em = NULL
        WHERE id = ?
    ''', (presente_id,))
    
    conn.commit()
    conn.close()
    
    return {"message": "Reserva cancelada com sucesso!"}

# ══════════════════════════════════════════════════════════
# HEALTH CHECK
# ══════════════════════════════════════════════════════════

@app.get("/")
async def root():
    return {
        "message": "API do Casamento está funcionando! 💍",
        "docs": "/docs",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {"status": "ok"}
