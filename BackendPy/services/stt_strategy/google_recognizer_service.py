from __future__ import annotations

from typing import Optional
import os
import sys
import contextlib
import ctypes

# Set UTF-8 encoding for stdout/stderr to prevent UnicodeEncodeError with emojis on Windows
if sys.platform.startswith("win"):
    with contextlib.suppress(Exception):
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")

# pyrefly: ignore [missing-import]
import speech_recognition as sr
import platform

# Monkey-patch speech_recognition to support Windows ARM64 (using bundled flac-win32.exe via emulation)
if platform.system() == "Windows" and platform.machine() == "ARM64":
    _orig_get_flac_converter = sr.get_flac_converter
    def _patched_get_flac_converter():
        orig_machine = platform.machine
        try:
            platform.machine = lambda: "AMD64"
            return _orig_get_flac_converter()
        finally:
            platform.machine = orig_machine
    sr.get_flac_converter = _patched_get_flac_converter
    sr.audio.get_flac_converter = _patched_get_flac_converter


Recognizer = sr.Recognizer
Microphone = sr.Microphone
UnknownValueError = sr.UnknownValueError
RequestError = sr.RequestError
WaitTimeoutError = sr.WaitTimeoutError
AudioData = sr.AudioData



# Add BackendPy to sys.path to allow running this script directly
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from stt_strategy.recognizer_service import RecognizerService
# Context manager per sopprimere stderr a livello C (ALSA warnings)
@contextlib.contextmanager
def no_alsa_error():
    try:
        asound = ctypes.cdll.LoadLibrary('libasound.so')
        asound.snd_lib_error_set_handler(None)
        yield
    except OSError:
        try:
            asound = ctypes.cdll.LoadLibrary('libasound.so.2')
            asound.snd_lib_error_set_handler(None)
            yield
        except OSError:
            # Se non trova libasound, fa nulla
            yield

class GoogleRecognizerService(RecognizerService):
    """
    Implementazione concreta di RecognizerService che usa
    il backend gratuito di Google (speech_recognition.recognize_google).

    Richiede:
    - microfono disponibile
    - connessione Internet
    """

    def __init__(
        self,
        language: str = "it-IT",
        timeout: int | None = None,
        phrase_time_limit: int = 60,
        calibrazione_s: float = 0.8,
    ) -> None:
        super().__init__(language, timeout, phrase_time_limit, calibrazione_s)

        self.recognizer = Recognizer()

        # Parametri per il VAD (start/stop automatico)
        self.recognizer.dynamic_energy_threshold = True
        self.recognizer.pause_threshold = 2.0
        self.recognizer.speech_threshold = 0.4

        self.recognizer.speech_threshold = 0.4

        # Inizializzazione Microfono e Calibrazione (una tantum)
        with no_alsa_error():
            self.mic = Microphone()

        print(f"[GoogleRecognizerService] Inizializzato per la lingua: {self.language}")
        self._calibrate_once()

    def _calibrate_once(self):
        print("[GoogleRecognizerService] Calibrazione rumore (una tantum)...")
        with self.mic as source:
            self.recognizer.adjust_for_ambient_noise(source, duration=self.calibrazione_s)
        print("[GoogleRecognizerService] Calibrazione completata.")

    # ---------- Metodi interni ----------

    def _listen_once(self, timeout: float | None = None):
        """
        Ascolta UNA frase dal microfono e ritorna l'AudioData.
        """
        # Non ricreiamo il mic, usiamo self.mic
        with self.mic as source:
            # print("[GoogleRecognizerService] Parla pure...") # Opzionale, per meno spam
            try:
                audio = self.recognizer.listen(
                    source,
                    timeout=timeout if timeout is not None else self.timeout,
                    phrase_time_limit=self.phrase_time_limit,
                )
                return audio
            except WaitTimeoutError:
                # Con timeout=None non dovrebbe succedere, ma gestiamo comunque
                return None

    def _recognize_audio(self, audio) -> Optional[str]:
        """
        Converte l'audio in testo usando Google.
        """
        if audio is None:
            return None

        try:
            text = self.recognizer.recognize_google(audio, language=self.language)
            print("🗣:", text)
            return text

        except UnknownValueError:
            print("[GoogleRecognizerService] Non ho capito l'audio (silenzio/rumore).")
            return None

        except RequestError as e:
            print(f"[GoogleRecognizerService] Errore di rete/servizio: {e}")
            return None

        except Exception as e:
            print("[GoogleRecognizerService] Errore nel riconoscimento:", e)
            return None

    # ---------- Implementazione Strategy ----------

    def listen_and_recognize(self, timeout: float | None = None) -> Optional[str]:
        """
        Metodo esposto al resto del sistema:
        ascolta + riconosce + ritorna il testo o None.
        """
        audio = self._listen_once(timeout=timeout)
        if audio is None:
            return None
        return self._recognize_audio(audio)

    def listen_and_recognize_ptt(
        self,
        key: str = "space",
        on_start: Optional[callable] = None,
        on_stop: Optional[callable] = None,
    ) -> Optional[str]:
        """
        Push-to-talk: registra audio SOLO mentre il tasto `key` è premuto.
        Rilascia il tasto per fermare e avviare il riconoscimento Google.

        Args:
            key: nome del tasto (es. "space", "ctrl", "F1", "r", ...).
                 Usa i nomi della libreria `keyboard`.
        """
        try:
            import keyboard as kb
        except ImportError:
            print("[PTT] ERRORE: libreria 'keyboard' non installata. Esegui: pip install keyboard")
            return None

        try:
            import pyaudio
        except ImportError:
            print("[PTT] ERRORE: libreria 'pyaudio' non installata. Esegui: pip install pyaudio")
            return None


        CHUNK = 1024
        FORMAT = pyaudio.paInt16
        CHANNELS = 1
        RATE = 16000
        SAMPLE_WIDTH = 2  # paInt16 = 2 bytes per campione

        # --- Attendi la pressione del tasto ---
        print(f"[PTT] Tieni premuto '{key}' per parlare...")
        kb.wait(key, suppress=False)

        # --- Esegui la callback di inizio se definita ---
        if on_start:
            try:
                on_start()
            except Exception as e:
                print(f"[PTT] Errore in on_start: {e}")

        # --- Avvia la registrazione finché il tasto è tenuto ---
        print("[PTT] 🔴 Registrazione in corso... rilascia il tasto per fermare.")

        p = pyaudio.PyAudio()
        stream = p.open(
            format=FORMAT,
            channels=CHANNELS,
            rate=RATE,
            input=True,
            frames_per_buffer=CHUNK,
        )

        frames = []
        try:
            while kb.is_pressed(key):
                data = stream.read(CHUNK, exception_on_overflow=False)
                frames.append(data)
        finally:
            stream.stop_stream()
            stream.close()
            p.terminate()

        # --- Esegui la callback di fine se definita ---
        if on_stop:
            try:
                on_stop()
            except Exception as e:
                print(f"[PTT] Errore in on_stop: {e}")

        if not frames:
            print("[PTT] Nessun audio registrato (tasto rilasciato subito).")
            return None

        print("[PTT] ⬛ Registrazione fermata. Riconoscimento in corso...")

        # Impacchetta i frame grezzi in un AudioData compatibile con speech_recognition
        raw_audio = b"".join(frames)
        audio_data = AudioData(raw_audio, RATE, SAMPLE_WIDTH)

        return self._recognize_audio(audio_data)


# Piccolo test manuale, se lanci direttamente il file
if __name__ == "__main__":
    recog = GoogleRecognizerService()

    print("=== Test PTT (Push-to-Talk) ===")
    print("Usa la BARRA SPAZIATRICE per parlare.")
    print("Tieni premuto SPAZIO, parla, rilascia per il riconoscimento.\n")

    while True: 
      text = recog.listen_and_recognize_ptt(key="space")
      print("RISULTATO PTT:", text)

