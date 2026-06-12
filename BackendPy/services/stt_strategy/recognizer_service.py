
from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Optional


class RecognizerService(ABC):
    """
    Strategy base per il riconoscimento vocale.

    Diverse implementazioni concrete possono usare:
    - Google Web Speech API
    - Whisper
    - modelli offline, ecc.

    Il RobotBrain (o chi per lui) vedrà solo il metodo
    `listen_and_recognize()`.
    """

    def __init__(
        self,
        language: str = "it-IT",
        timeout: int = 5,
        phrase_time_limit: int = 12,
        calibrazione_s: float = 0.8,
    ) -> None:
        self.language = language
        self.timeout = timeout
        self.phrase_time_limit = phrase_time_limit
        self.calibrazione_s = calibrazione_s

    @abstractmethod
    def listen_and_recognize(self, timeout: float | None = None) -> Optional[str]:
        """
        Ascolta dal microfono e ritorna il testo riconosciuto,
        oppure None se non è stato capito nulla / errore.
        """
        raise NotImplementedError

    @abstractmethod
    def listen_and_recognize_ptt(
        self,
        key: str = "space",
        gpio_pin: int | None = None,
        on_start: Optional[callable] = None,
        on_stop: Optional[callable] = None,
    ) -> Optional[str]:
        """
        Push-to-talk: registra audio SOLO mentre il tasto `key` è tenuto premuto.
        Rilascia il tasto per fermare la registrazione e avviare il riconoscimento.
        Ritorna il testo riconosciuto oppure None.
        """
        raise NotImplementedError

