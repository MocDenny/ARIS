from services.stt_strategy.google_recognizer_service import GoogleRecognizerService
from services.llm.deepseek_llm_service import DeepSeekLLMService
import requests

BACKEND_URL = "http://127.0.0.1:3000"

class VocalSystem:
    def __init__(self, api_key: str):
        self.recognizer = GoogleRecognizerService()
        self.llm = DeepSeekLLMService(api_key=api_key)

    def run(self):
        while True:
            text = self.recognizer.listen_and_recognize_ptt(key="space")
            if not text:
                continue

            print(f"[VocalSystem] 🎤 Riconosciuto: {text}")

            # GET /room → ottieni il JSON della stanza come dizionario
            try:
                roomjsonContext = requests.get(f"{BACKEND_URL}/config", timeout=3).json() #RICHIESTA DEL JSON
                print(f"[VocalSystem] 📁 JSON Stanza: {roomjsonContext}")
            except Exception as e:
                print(f"[VocalSystem] ⚠️ Errore GET /room: {e}")
                roomjsonContext = None

            # Manda testo + contesto stanza all'LLM
            result = self.llm.generate_reply(text, roomjsonContext)
            if not result:
                continue

            print(f"[ARIS] 🤖 {result}")
            print(f"[VocalSystem] 📁 JSON Stanza: {roomjsonContext}")


            # Invia l'intero JSON aggiornato al backend
            if result:
                try:
                    resp = requests.post(
                        f"{BACKEND_URL}/config",
                        json=result,
                        timeout=3,
                    )
                    resp.raise_for_status()
                    print(f"[VocalSystem] ✅ Configurazione JSON aggiornata sul server")
                except Exception as e:
                    print(f"[VocalSystem] ⚠️ Errore POST /config: {e}")


if __name__ == "__main__":
    api_key = "sk-5070b96085f1414bbf91b0870f9e1265"
    vocal_system = VocalSystem(api_key)
    vocal_system.run()
