"""
FastAPI Server — Ponte tra il server Node.js (porta 3000) e Arduino via seriale.

Architettura:
  Node.js ──POST /sync──▶ FastAPI (:8001) ──Seriale USB──▶ Arduino

Questo server:
  1. Riceve il JSON completo della configurazione stanze dal server Node.js
  2. Confronta il nuovo stato con quello precedente (diff)
  3. Invia SOLO i comandi seriali necessari per i cambiamenti rilevati
  4. Mantiene lo stato corrente in memoria

Protocollo seriale (testo, terminato da \\n):
  LIGHT:<stanza>:<indice>:<ON|OFF>:<brightness 0-255>
  HVAC:<stanza>:STATE:<ON|OFF>
  HVAC:<stanza>:TEMP:<target>:<current>
  FAN:<stanza>:<ON|OFF>:<speed 0-255>
  CURTAIN:<stanza>:<indice>:<OPEN|CLOSED>

Autore: ARIS Team
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Any
import serial
import serial.tools.list_ports
import json
import logging
import threading
import time

# ──────────────────────────────────────────────────────────────────────────────
# Logging
# ──────────────────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger("FastAPIArduino")

# ──────────────────────────────────────────────────────────────────────────────
# Configurazione Seriale
# ──────────────────────────────────────────────────────────────────────────────
SERIAL_PORT = "COM3"          # ← Cambia con la tua porta (es. COM4, /dev/ttyUSB0)
SERIAL_BAUDRATE = 9600        # Deve corrispondere al baudrate nel .ino
SERIAL_TIMEOUT = 2            # Timeout lettura seriale in secondi


# ──────────────────────────────────────────────────────────────────────────────
# Classe per gestire la connessione seriale con Arduino
# ──────────────────────────────────────────────────────────────────────────────
class ArduinoSerial:
    """
    Gestisce la connessione seriale con Arduino.
    - Connessione e riconnessione automatica
    - Invio comandi thread-safe tramite lock
    - Logging dettagliato
    """

    def __init__(self, port: str, baudrate: int, timeout: float):
        self.port = port
        self.baudrate = baudrate
        self.timeout = timeout
        self.connection: serial.Serial | None = None
        self.lock = threading.Lock()  # Lock per thread-safety

    def connect(self) -> bool:
        """Tenta di aprire la connessione seriale."""
        try:
            self.connection = serial.Serial(
                port=self.port,
                baudrate=self.baudrate,
                timeout=self.timeout,
            )
            # Attendi che Arduino faccia il reset dopo la connessione seriale
            time.sleep(2)
            logger.info(f"✅ Connesso ad Arduino su {self.port} @ {self.baudrate} baud")
            return True
        except serial.SerialException as e:
            logger.warning(f"⚠️ Impossibile connettersi a {self.port}: {e}")
            self.connection = None
            return False

    def disconnect(self):
        """Chiude la connessione seriale."""
        if self.connection and self.connection.is_open:
            self.connection.close()
            logger.info("🔌 Connessione seriale chiusa.")

    def is_connected(self) -> bool:
        """Verifica se la connessione è attiva."""
        return self.connection is not None and self.connection.is_open

    def send_command(self, command: str) -> bool:
        """
        Invia un comando testuale ad Arduino (aggiunge \\n automaticamente).
        Ritorna True se l'invio ha successo, False altrimenti.
        """
        with self.lock:
            if not self.is_connected():
                logger.warning(f"⚠️ Arduino non connesso. Comando perso: {command}")
                return False
            try:
                full_cmd = command.strip() + "\n"
                self.connection.write(full_cmd.encode("utf-8"))
                logger.info(f"📤 Inviato: {command}")
                return True
            except serial.SerialException as e:
                logger.error(f"❌ Errore invio seriale: {e}")
                self.connection = None
                return False

    def reconnect(self) -> bool:
        """Tenta la riconnessione."""
        self.disconnect()
        return self.connect()

    @staticmethod
    def list_available_ports():
        """Elenca le porte seriali disponibili nel sistema."""
        ports = serial.tools.list_ports.comports()
        return [{"port": p.device, "description": p.description} for p in ports]


# ──────────────────────────────────────────────────────────────────────────────
# Stato globale e istanza seriale
# ──────────────────────────────────────────────────────────────────────────────
arduino = ArduinoSerial(SERIAL_PORT, SERIAL_BAUDRATE, SERIAL_TIMEOUT)

# Stato precedente del JSON — usato per calcolare il diff
previous_state: dict | None = None


# ──────────────────────────────────────────────────────────────────────────────
# Funzioni di confronto e generazione comandi
# ──────────────────────────────────────────────────────────────────────────────
def map_brightness(brightness_0_100: int) -> int:
    """Mappa brightness da 0-100 a 0-255 per analogWrite di Arduino."""
    val = max(0, min(100, int(brightness_0_100)))
    return round(val * 255 / 100)


def map_speed(speed_0_100: int) -> int:
    """Mappa velocità ventola da 0-100 a 0-255 per PWM Arduino."""
    val = max(0, min(100, int(speed_0_100)))
    return round(val * 255 / 100)


def generate_commands(old_data: dict | None, new_data: dict) -> list[str]:
    """
    Confronta lo stato vecchio con quello nuovo e genera la lista
    di comandi seriali da inviare ad Arduino.

    Se old_data è None (primo avvio), invia TUTTI i comandi per
    sincronizzare Arduino con lo stato corrente.
    """
    commands = []

    try:
        new_rooms = new_data["room_config"]["rooms"]
    except (KeyError, TypeError):
        logger.error("❌ JSON non valido: manca room_config.rooms")
        return commands

    old_rooms = None
    if old_data:
        old_rooms = old_data.get("room_config", {}).get("rooms", {})

    for room_key, room in new_rooms.items():
        old_room = old_rooms.get(room_key, {}) if old_rooms else {}

        # ─── LUCI ────────────────────────────────────────────────
        new_lights = room.get("lights", [])
        old_lights = old_room.get("lights", [])

        for i, light in enumerate(new_lights):
            old_light = old_lights[i] if i < len(old_lights) else {}

            new_state = light.get("state", "off")
            new_brightness = int(light.get("brightness", 0))
            old_state = old_light.get("state", None)
            old_brightness = old_light.get("brightness", None)

            # Invia comando se lo stato o la luminosità sono cambiati
            if old_state != new_state or old_brightness != new_brightness:
                state_str = "ON" if new_state == "on" else "OFF"
                pwm_val = map_brightness(new_brightness) if new_state == "on" else 0
                commands.append(f"LIGHT:{room_key}:{i}:{state_str}:{pwm_val}")

        # ─── HVAC ────────────────────────────────────────────────
        new_hvac = room.get("hvac", {})
        old_hvac = old_room.get("hvac", {})

        # Stato HVAC (on/off)
        new_hvac_state = new_hvac.get("state", "off")
        old_hvac_state = old_hvac.get("state", None)
        if old_hvac_state != new_hvac_state:
            state_str = "ON" if new_hvac_state == "on" else "OFF"
            commands.append(f"HVAC:{room_key}:STATE:{state_str}")

        # Temperature HVAC
        new_target = new_hvac.get("target_temp", 0)
        new_current = new_hvac.get("current_temp", 0)
        old_target = old_hvac.get("target_temp", None)
        old_current = old_hvac.get("current_temp", None)
        if old_target != new_target or old_current != new_current:
            commands.append(f"HVAC:{room_key}:TEMP:{new_target}:{new_current}")

        # Ventola HVAC
        new_fan = new_hvac.get("fan", {})
        old_fan = old_hvac.get("fan", {})
        new_fan_state = new_fan.get("state", "off")
        new_fan_speed = int(new_fan.get("speed", 0))
        old_fan_state = old_fan.get("state", None)
        old_fan_speed = old_fan.get("speed", None)

        if old_fan_state != new_fan_state or old_fan_speed != new_fan_speed:
            state_str = "ON" if new_fan_state == "on" else "OFF"
            pwm_val = map_speed(new_fan_speed) if new_fan_state == "on" else 0
            commands.append(f"FAN:{room_key}:{state_str}:{pwm_val}")

        # ─── TENDE ───────────────────────────────────────────────
        new_curtains = room.get("curtains", [])
        old_curtains = old_room.get("curtains", [])

        for i, curtain in enumerate(new_curtains):
            old_curtain = old_curtains[i] if i < len(old_curtains) else {}

            new_c_state = curtain.get("state", "closed")
            old_c_state = old_curtain.get("state", None)

            if old_c_state != new_c_state:
                state_str = "OPEN" if new_c_state == "open" else "CLOSED"
                commands.append(f"CURTAIN:{room_key}:{i}:{state_str}")

    return commands


# ──────────────────────────────────────────────────────────────────────────────
# FastAPI App
# ──────────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="ARIS Arduino Bridge",
    description="Ponte tra il server Node.js e Arduino via seriale",
    version="1.0.0",
)


@app.on_event("startup")
async def startup():
    """Tenta la connessione seriale all'avvio del server."""
    logger.info("🚀 Avvio FastAPI Arduino Bridge...")
    logger.info(f"📋 Porte seriali disponibili: {ArduinoSerial.list_available_ports()}")
    arduino.connect()


@app.on_event("shutdown")
async def shutdown():
    """Chiude la connessione seriale allo shutdown."""
    arduino.disconnect()


class SyncPayload(BaseModel):
    """Modello per il payload ricevuto dal server Node.js."""
    room_config: Any


@app.post("/sync")
async def sync_arduino(payload: dict):
    """
    Endpoint principale: riceve il JSON completo dal server Node.js,
    calcola le differenze con lo stato precedente e invia i comandi
    seriali ad Arduino.

    Chiamato dal controller.js dopo ogni updateData / updateDataSection.
    """
    global previous_state

    # Genera i comandi basati sulle differenze
    commands = generate_commands(previous_state, payload)

    if not commands:
        logger.info("ℹ️ Nessuna modifica rilevata, nessun comando da inviare.")
        return {
            "status": "ok",
            "message": "Nessuna modifica rilevata",
            "commands_sent": 0,
        }

    # Invia ogni comando ad Arduino
    sent_count = 0
    failed_count = 0

    for cmd in commands:
        if arduino.send_command(cmd):
            sent_count += 1
            # Piccola pausa tra comandi per non sovraccaricare Arduino
            time.sleep(0.05)
        else:
            failed_count += 1

    # Aggiorna lo stato precedente con il nuovo stato
    previous_state = json.loads(json.dumps(payload))  # Deep copy

    logger.info(f"📊 Comandi inviati: {sent_count}, falliti: {failed_count}")

    return {
        "status": "ok",
        "commands_sent": sent_count,
        "commands_failed": failed_count,
        "commands": commands,
    }


@app.get("/status")
async def get_status():
    """Ritorna lo stato della connessione seriale e le porte disponibili."""
    return {
        "arduino_connected": arduino.is_connected(),
        "serial_port": arduino.port,
        "baudrate": arduino.baudrate,
        "available_ports": ArduinoSerial.list_available_ports(),
    }


@app.post("/reconnect")
async def reconnect_arduino():
    """Forza una riconnessione seriale ad Arduino."""
    success = arduino.reconnect()
    if success:
        return {"status": "ok", "message": f"Riconnesso a {arduino.port}"}
    else:
        raise HTTPException(
            status_code=503,
            detail=f"Impossibile riconnettersi a {arduino.port}",
        )


# ──────────────────────────────────────────────────────────────────────────────
# Avvio diretto: python FastAPIserver.py
# ──────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)
