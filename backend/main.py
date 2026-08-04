from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from io import BytesIO
import sqlite3
import json
import os
import smtplib
from email.message import EmailMessage

from dotenv import load_dotenv
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer

load_dotenv()

app = FastAPI(title="Casamento API", version="1.0.0")

# ══════════════════════════════════════════════════════════
# CONFIGURAÇÃO DE E-MAIL (gratuito via SMTP, ex: Gmail)
# Defina estas variáveis em um arquivo .env (nunca versionado):
#   SMTP_HOST=smtp.gmail.com
#   SMTP_PORT=587
#   SMTP_USER=seuemail@gmail.com
#   SMTP_PASS=senha_de_app_de_16_digitos   (gerada em myaccount.google.com/apppasswords)
#   EMAIL_NOIVOS=noivos@casamento.com.br
# ══════════════════════════════════════════════════════════
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASS = os.getenv("SMTP_PASS")
EMAIL_NOIVOS = os.getenv("EMAIL_NOIVOS", "noivos@casamento.com.br")

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
    categoria: str
    tipo: str  # 'unitario' (reserva única) ou 'cota' (contribuição em grupo)
    reservado: bool
    reservado_por: Optional[str]
    valor_meta: Optional[float] = None
    valor_arrecadado: float = 0
    num_contribuintes: int = 0

class ContribuicaoCreate(BaseModel):
    nome: str
    valor: float

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
            categoria TEXT DEFAULT 'geral',
            tipo TEXT DEFAULT 'unitario',
            valor_meta REAL,
            valor_arrecadado REAL DEFAULT 0,
            reservado BOOLEAN DEFAULT FALSE,
            reservado_por TEXT,
            reservado_em TIMESTAMP
        )
    ''')

    # Migração leve para bancos criados antes destas colunas existirem
    colunas_existentes = {row[1] for row in c.execute('PRAGMA table_info(presentes)').fetchall()}
    for coluna, definicao in [
        ('categoria', "TEXT DEFAULT 'geral'"),
        ('tipo', "TEXT DEFAULT 'unitario'"),
        ('valor_meta', 'REAL'),
        ('valor_arrecadado', 'REAL DEFAULT 0'),
    ]:
        if coluna not in colunas_existentes:
            c.execute(f'ALTER TABLE presentes ADD COLUMN {coluna} {definicao}')

    # Tabela de contribuições (para presentes do tipo "cota", ex: lua de mel)
    c.execute('''
        CREATE TABLE IF NOT EXISTS contribuicoes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            presente_id INTEGER NOT NULL,
            nome TEXT NOT NULL,
            valor REAL NOT NULL,
            criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (presente_id) REFERENCES presentes (id)
        )
    ''')

    # Inserir presentes de exemplo se a tabela estiver vazia
    c.execute('SELECT COUNT(*) FROM presentes')
    if c.fetchone()[0] == 0:
        presentes_exemplo = [
            # nome, descricao, preco, emoji, categoria, tipo, valor_meta
            ("Lua de mel", "Contribua para nossa viagem dos sonhos para a Itália e Grécia.", "Meta: R$ 8.000", "✈️", "lua_de_mel", "cota", 8000),
            ("Experiência de mergulho", "Contribua para um passeio de mergulho durante a lua de mel.", "Meta: R$ 900", "🎿", "lua_de_mel", "cota", 900),
            ("Adega de vinho", "Uma adega climatizada para a nossa cozinha nova.", "R$ 1.200", "🍷", "casa", "unitario", None),
            ("Poltrona de leitura", "A poltrona perfeita para o cantinho de leitura.", "R$ 850", "🛋️", "casa", "unitario", None),
            ("Jogo de panelas", "Panelas antiaderentes para começarmos a cozinhar juntos.", "R$ 640", "🍳", "casa", "unitario", None),
            ("Nosso lar", "Contribua livremente para a decoração do nosso primeiro apartamento.", "Qualquer valor", "🏠", "casa", "cota", 3000),
            ("Biblioteca juntos", "Escolha um livro que nos marcou — com dedicatória.", "Surpresa", "📚", "afeto", "unitario", None),
            ("Jantar romântico", "Um jantar especial para comemorarmos o primeiro mês de casados.", "R$ 400", "🍽️", "afeto", "unitario", None),
        ]
        c.executemany(
            '''INSERT INTO presentes (nome, descricao, preco, emoji, categoria, tipo, valor_meta)
               VALUES (?, ?, ?, ?, ?, ?, ?)''',
            presentes_exemplo
        )

    conn.commit()
    conn.close()

# Inicializa o banco ao iniciar a aplicação
@app.on_event("startup")
async def startup_event():
    init_db()

# ══════════════════════════════════════════════════════════
# PDF + E-MAIL DA LISTA DE CONFIRMADOS
# ══════════════════════════════════════════════════════════

def gerar_pdf_confirmados(rows) -> bytes:
    """Gera um PDF com a lista de confirmados a partir das linhas do banco"""
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=2 * cm, bottomMargin=2 * cm)
    estilos = getSampleStyleSheet()
    elementos = []

    elementos.append(Paragraph("Lista de Confirmações — Casamento", estilos['Title']))
    elementos.append(Paragraph(
        f"Gerado em {datetime.now().strftime('%d/%m/%Y às %H:%M')}", estilos['Normal']
    ))
    elementos.append(Spacer(1, 0.8 * cm))

    confirmados = [r for r in rows if r[3]]
    nao_confirmados = [r for r in rows if not r[3]]
    total_pessoas = sum(r[4] for r in confirmados)

    elementos.append(Paragraph(
        f"<b>{len(confirmados)}</b> confirmações · <b>{total_pessoas}</b> pessoas no total · "
        f"<b>{len(nao_confirmados)}</b> ausências", estilos['Normal']
    ))
    elementos.append(Spacer(1, 0.6 * cm))

    dados_tabela = [["Nome", "E-mail", "Convidados", "Restrição", "Mensagem"]]
    for row in confirmados:
        dados_tabela.append([
            row[1], row[2], str(row[4]), row[5] or "—", (row[6] or "—")[:60]
        ])

    if len(dados_tabela) > 1:
        tabela = Table(dados_tabela, repeatRows=1, colWidths=[3.5 * cm, 4.5 * cm, 2 * cm, 2.5 * cm, 4.5 * cm])
        tabela.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#8b6f5e')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e8ddd0')),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9f5ef')]),
        ]))
        elementos.append(tabela)
    else:
        elementos.append(Paragraph("Ainda não há confirmações registradas.", estilos['Normal']))

    if nao_confirmados:
        elementos.append(Spacer(1, 1 * cm))
        elementos.append(Paragraph("Não poderão comparecer:", estilos['Heading3']))
        for row in nao_confirmados:
            elementos.append(Paragraph(f"• {row[1]} ({row[2]})", estilos['Normal']))

    doc.build(elementos)
    return buffer.getvalue()


def enviar_email_lista_confirmados(pdf_bytes: bytes, ultimo_confirmado: str = None):
    """Envia a lista atualizada de confirmados por e-mail aos noivos, em anexo PDF.
    Não interrompe a criação do RSVP caso o e-mail não esteja configurado ou falhe."""
    if not SMTP_USER or not SMTP_PASS:
        print("[email] SMTP não configurado (defina SMTP_USER e SMTP_PASS no .env) — pulando envio.")
        return

    msg = EmailMessage()
    msg["Subject"] = "Lista de confirmações do casamento atualizada 💍"
    msg["From"] = SMTP_USER
    msg["To"] = EMAIL_NOIVOS

    corpo = "Uma nova resposta foi registrada. " if ultimo_confirmado else ""
    corpo += "Segue em anexo a lista atualizada de confirmações (PDF)."
    msg.set_content(corpo)
    msg.add_attachment(
        pdf_bytes, maintype="application", subtype="pdf", filename="lista_confirmados.pdf"
    )

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.send_message(msg)
        print("[email] Lista de confirmados enviada com sucesso.")
    except Exception as e:
        # Não derruba a criação do RSVP se o envio de e-mail falhar
        print(f"[email] Falha ao enviar e-mail: {e}")


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

    # Gera e envia por e-mail a lista de confirmados atualizada aos noivos
    c.execute('SELECT * FROM rsvps ORDER BY criado_em DESC')
    todos = c.fetchall()
    conn.close()

    try:
        pdf_bytes = gerar_pdf_confirmados(todos)
        enviar_email_lista_confirmados(pdf_bytes, ultimo_confirmado=rsvp.nome)
    except Exception as e:
        print(f"[pdf] Falha ao gerar/enviar PDF: {e}")

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

@app.get("/api/rsvp/pdf")
async def baixar_pdf_confirmados():
    """Gera e permite baixar manualmente o PDF com a lista de confirmados"""
    conn = sqlite3.connect('casamento.db')
    c = conn.cursor()
    c.execute('SELECT * FROM rsvps ORDER BY criado_em DESC')
    rows = c.fetchall()
    conn.close()

    pdf_bytes = gerar_pdf_confirmados(rows)
    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=lista_confirmados.pdf"},
    )

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
async def listar_presentes(categoria: Optional[str] = None):
    """Lista os presentes, opcionalmente filtrados por categoria"""
    conn = sqlite3.connect('casamento.db')
    c = conn.cursor()

    query = '''SELECT id, nome, descricao, preco, emoji, categoria, tipo,
                      valor_meta, valor_arrecadado, reservado, reservado_por
               FROM presentes'''
    params = ()
    if categoria:
        query += ' WHERE categoria = ?'
        params = (categoria,)

    c.execute(query, params)
    rows = c.fetchall()

    resultado = []
    for row in rows:
        presente_id = row[0]
        c.execute('SELECT COUNT(*) FROM contribuicoes WHERE presente_id = ?', (presente_id,))
        num_contribuintes = c.fetchone()[0]
        resultado.append({
            "id": row[0],
            "nome": row[1],
            "descricao": row[2],
            "preco": row[3],
            "emoji": row[4],
            "categoria": row[5],
            "tipo": row[6],
            "valor_meta": row[7],
            "valor_arrecadado": row[8] or 0,
            "reservado": bool(row[9]),
            "reservado_por": row[10],
            "num_contribuintes": num_contribuintes,
        })

    conn.close()
    return resultado

@app.get("/api/presentes/categorias")
async def listar_categorias():
    """Lista as categorias de presentes disponíveis (para os filtros no site)"""
    conn = sqlite3.connect('casamento.db')
    c = conn.cursor()
    c.execute('SELECT DISTINCT categoria FROM presentes ORDER BY categoria')
    categorias = [row[0] for row in c.fetchall()]
    conn.close()
    return {"categorias": categorias}

@app.post("/api/presentes/{presente_id}/reservar")
async def reservar_presente(presente_id: int, nome: str):
    """Reserva um presente do tipo único (não aplicável a presentes em cota)"""
    conn = sqlite3.connect('casamento.db')
    c = conn.cursor()

    c.execute('SELECT reservado, tipo FROM presentes WHERE id = ?', (presente_id,))
    result = c.fetchone()

    if not result:
        conn.close()
        raise HTTPException(status_code=404, detail="Presente não encontrado")

    if result[1] == 'cota':
        conn.close()
        raise HTTPException(status_code=400, detail="Este presente aceita contribuições, use a opção de contribuir")

    if result[0]:
        conn.close()
        raise HTTPException(status_code=400, detail="Presente já foi reservado")

    c.execute('''
        UPDATE presentes 
        SET reservado = TRUE, reservado_por = ?, reservado_em = CURRENT_TIMESTAMP
        WHERE id = ?
    ''', (nome, presente_id))

    conn.commit()
    conn.close()

    return {"message": "Presente reservado com sucesso!", "reservado_por": nome}

@app.post("/api/presentes/{presente_id}/contribuir")
async def contribuir_presente(presente_id: int, contribuicao: ContribuicaoCreate):
    """Registra uma contribuição em um presente do tipo cota (ex: lua de mel)"""
    if contribuicao.valor <= 0:
        raise HTTPException(status_code=400, detail="O valor da contribuição deve ser maior que zero")

    conn = sqlite3.connect('casamento.db')
    c = conn.cursor()

    c.execute('SELECT tipo, valor_arrecadado, valor_meta FROM presentes WHERE id = ?', (presente_id,))
    result = c.fetchone()

    if not result:
        conn.close()
        raise HTTPException(status_code=404, detail="Presente não encontrado")

    tipo, valor_arrecadado, valor_meta = result
    if tipo != 'cota':
        conn.close()
        raise HTTPException(status_code=400, detail="Este presente não aceita contribuições, use a opção de reservar")

    c.execute(
        'INSERT INTO contribuicoes (presente_id, nome, valor) VALUES (?, ?, ?)',
        (presente_id, contribuicao.nome, contribuicao.valor)
    )
    novo_total = (valor_arrecadado or 0) + contribuicao.valor
    c.execute('UPDATE presentes SET valor_arrecadado = ? WHERE id = ?', (novo_total, presente_id))

    conn.commit()
    conn.close()

    return {
        "message": "Contribuição registrada com sucesso! Muito obrigado 💛",
        "valor_arrecadado": novo_total,
        "valor_meta": valor_meta,
    }

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
