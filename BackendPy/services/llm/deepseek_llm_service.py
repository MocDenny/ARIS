from __future__ import annotations
from typing import Optional, Dict, Any

# pyrefly: ignore [missing-import]
from openai import OpenAI
import json  # <-- IMPORT NECESSARIO QUI

import sys
import os
# Add BackendPy to sys.path to allow running this script directly
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from llm.llm_service import LLMService
class DeepSeekLLMService(LLMService):
    """
    Strategy LLM basata su DeepSeek (API compatibile OpenAI-style).
    """

    def __init__(self, api_key: str, model: str = "deepseek-chat"):
        # DeepSeek usa la stessa interfaccia di OpenAI ma con base_url diverso
        self.client = OpenAI(
            api_key=api_key,
            base_url="https://api.deepseek.com"  # <-- fondamentale
        )
        self.model = model

    def generate_reply(
        self,
        user_text: str,
        room_context: dict | None = None,
    ) -> Optional[Dict[str, Any]]:
        """
        Invia il comando vocale + lo stato della stanza a DeepSeek.
        Restituisce un dict con solo 'changes': lista di {path, value} da applicare al Room.json.
        """

        # ── System prompt ────────────────────────────────────────────────
        system_prompt = """\
Sei il sistema di controllo di una smart room.
Il tuo compito è leggere il JSON della stanza (lo stato attuale) e il comando dell'utente, \
poi generare un JSON PARZIALE che contiene SOLO i campi che devono essere modificati.

L'utente può usare parole italiane diverse dai nomi nel JSON:
- "soggiorno" → living_room
- "camera" / "camera da letto" → bedroom
- "bagno" → bathroom
- "luci" / "luce" → lights
- "tende" / "tenda" → curtains
- "clima" / "aria condizionata" / "riscaldamento" → hvac
- "ventilatore" / "fan" → hvac.fan
- "accendi" → state: "on"
- "spegni" → state: "off"
- "apri" → state: "open"
- "chiudi" → state: "closed"

REGOLE FONDAMENTALI:
1. NON generare l'intero JSON da zero.
2. NON usare un array di "changes" o path con il punto.
3. Devi generare un JSON PARZIALE che rispecchia l'esatta struttura ad albero del JSON originale, ma che include SOLO gli oggetti e i campi modificati.
4. Per gli array (es. "lights", "curtains"), includi l'oggetto con il campo "name" (per identificarlo) e i campi da aggiornare.
5. Se non ci sono modifiche, restituisci un JSON vuoto: {}

ESEMPIO - Se l'utente dice "accendi la luce del bagno":
{
  "room_config": {
    "rooms": {
      "bathroom": {
        "lights": [
          {
            "name": "ceiling_light_1",
            "state": "on"
          }
        ]
      }
    }
  }
}

Rispondi SOLO ed ESCLUSIVAMENTE con questo JSON parziale valido.
"""

        # ── Messaggio utente = comando + JSON della stanza ───────────────
        if room_context:
            room_str = json.dumps(room_context, indent=2, ensure_ascii=False)
            user_message = (
                f"COMANDO UTENTE: {user_text}\n\n"
                f"STATO ATTUALE DELLA STANZA:\n{room_str}"
            )
        else:
            user_message = f"COMANDO UTENTE: {user_text}"

        try:
            completion = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user",   "content": user_message},
                ],
            )

            raw = completion.choices[0].message.content
            print(f"[DeepSeek RAW]: {raw}")

            # Pulizia markdown ```json ... ```
            cleaned = raw.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()

            reply = json.loads(cleaned)
            return reply

        except Exception as e:
            print("[LLM ERROR DeepSeek]", e)
            return None


# ---------------------------------------------------------------
#     TEST MANUALE (ESEGUI IL FILE PER PROVARLO)
# ---------------------------------------------------------------
if __name__ == "__main__":
    print("=== TEST DEEPSEEK LLM ===")

    # ⚠️ METTI QUI LA TUA DEEPSEEK API KEY
    API_KEY = ""

    llm = DeepSeekLLMService(api_key=API_KEY, model="deepseek-chat")


    while True:
        user_input = input("scrivi:")

        print("Invio al modello DeepSeek...")
        result = llm.generate_reply(user_input)

        if result is None:
            print("❌ Nessuna risposta (errore)")
        else:
            print("\n=== RISPOSTA ===")
            print(json.dumps(result, indent=4, ensure_ascii=False))
