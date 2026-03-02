"""
Element Secretary Configuration
"""
import os
from dotenv import load_dotenv

load_dotenv()

# Matrix/Element settings
MATRIX_HOMESERVER = os.getenv("MATRIX_HOMESERVER", "https://matrix3.aaroncollins.info")
MATRIX_USER_ID = os.getenv("MATRIX_USER_ID", "@sophie:matrix3.aaroncollins.info")
MATRIX_PASSWORD = os.getenv("MATRIX_PASSWORD", "")
MATRIX_ROOM_ID = os.getenv("MATRIX_ROOM_ID", "")

# Sophie backend (MCP server)
SOPHIE_MCP_URL = os.getenv("SOPHIE_MCP_URL", "http://localhost:8014")
SOPHIE_MCP_SECRET = os.getenv("SOPHIE_MCP_SECRET", "")

# Claude Code settings
CLAUDE_MODEL = os.getenv("CLAUDE_MODEL", "sonnet")
CLAUDE_TIMEOUT = int(os.getenv("CLAUDE_TIMEOUT", "120"))

# Conversation settings
MAX_HISTORY_MESSAGES = int(os.getenv("MAX_HISTORY_MESSAGES", "20"))
IDLE_CHECK_SECONDS = int(os.getenv("IDLE_CHECK_SECONDS", "60"))

# Presence-aware settings
AARON_USER_ID = os.getenv("AARON_USER_ID", "@aaron:matrix3.aaroncollins.info")
EMPTY_ROOM_TIMEOUT = int(os.getenv("EMPTY_ROOM_TIMEOUT", "300"))  # 5 minutes

# Data storage
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
DB_PATH = os.path.join(DATA_DIR, "conversations.db")
