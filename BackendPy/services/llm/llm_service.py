# robot_arduino/services/llm/llm_service.py
from __future__ import annotations
from abc import ABC, abstractmethod
from typing import Optional, Dict, Any


class LLMService(ABC):
    """
    Strategy astratta per un modello linguistico.
    """

    @abstractmethod
    def generate_reply(self, user_text: str) -> Optional[Dict[str, Any]]:
        """
        Deve restituire un dict del tipo:
        {
            "text": "...",
            "mood": "HAPPY",
            "gesture": "YES"
        }

        Oppure None in caso di errore.
        """
        pass
