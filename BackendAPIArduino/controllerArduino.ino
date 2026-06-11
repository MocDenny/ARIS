/*
 * ══════════════════════════════════════════════════════════════════════════════
 *  ARIS — Arduino Controller
 *  Firmware per Arduino UNO/Mega
 * ══════════════════════════════════════════════════════════════════════════════
 *
 *  Riceve comandi seriali dal server FastAPI (Python) e controlla:
 *    - LED (PWM) per le luci di ogni stanza
 *    - Servo motori per le tende (open/closed)
 *    - Ventole DC (PWM) per l'HVAC
 *    - Display LCD I2C 16x2 per le temperature
 *
 *  PROTOCOLLO SERIALE (testo, terminato da \n):
 *    LIGHT:<stanza>:<indice>:<ON|OFF>:<brightness 0-255>
 *    HVAC:<stanza>:STATE:<ON|OFF>
 *    HVAC:<stanza>:TEMP:<target>:<current>
 *    FAN:<stanza>:<ON|OFF>:<speed 0-255>
 *    CURTAIN:<stanza>:<indice>:<OPEN|CLOSED>
 *
 * ══════════════════════════════════════════════════════════════════════════════
 */

#include <Servo.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

/* ═══════════════════════════════════════════════════════════════════════════
 *  MAPPATURA PIN — Ogni pin è commentato con il componente fisico collegato
 * ═══════════════════════════════════════════════════════════════════════════ */

// ─── LUCI (LED con PWM per regolare luminosità) ─────────────────────────────
//
// Ogni LED simula la luce di una stanza. Si usa analogWrite (0-255) per
// controllare la luminosità. Il server invia valori 0-100 già convertiti
// in 0-255 dal FastAPI.

const int PIN_LIGHT_BEDROOM_CEIL1   = 3;   // Pin 3  (PWM) → LED bianco: Bedroom Ceiling light 1
const int PIN_LIGHT_BEDROOM_BEDSIDE = 5;   // Pin 5  (PWM) → LED giallo caldo: Bedroom Bedside lamp 1
const int PIN_LIGHT_BATHROOM_CEIL1  = 6;   // Pin 6  (PWM) → LED bianco: Bathroom Ceiling light 1
const int PIN_LIGHT_LIVING_CEIL1    = 9;   // Pin 9  (PWM) → LED bianco: Living Room Ceiling light 1
const int PIN_LIGHT_LIVING_CEIL2    = 10;  // Pin 10 (PWM) → LED bianco: Living Room Ceiling light 2

// ─── VENTOLE HVAC (Ventola DC controllata via PWM / digitale) ───────────────
//
// La ventola della bedroom usa PWM per regolare la velocità (0-255).
// Le ventole di bathroom e living room usano pin analogici come digitali
// (solo ON/OFF) per semplicità di cablaggio.

const int PIN_FAN_BEDROOM    = 11;   // Pin 11  (PWM) → Ventola DC: Bedroom HVAC fan (velocità variabile)
const int PIN_FAN_BATHROOM   = A0;   // Pin A0 (digitale) → Ventola DC: Bathroom HVAC fan (ON/OFF)
const int PIN_FAN_LIVING     = A1;   // Pin A1 (digitale) → Ventola DC: Living Room HVAC fan (ON/OFF)

// ─── TENDE (Servo motori: 0° = chiusa, 90° = aperta) ───────────────────────
//
// Ogni servo simula il movimento di una tenda. Posizione 0° = tenda chiusa,
// posizione 90° = tenda aperta.

const int PIN_CURTAIN_BEDROOM_1  = 2;   // Pin 2  → Servo: Bedroom Window blind 1
const int PIN_CURTAIN_BEDROOM_2  = 4;   // Pin 4  → Servo: Bedroom Window blind 2
const int PIN_CURTAIN_BATHROOM_1 = 7;   // Pin 7  → Servo: Bathroom Window blind 1
const int PIN_CURTAIN_LIVING_1   = 8;   // Pin 8  → Servo: Living Room Window blind 1
const int PIN_CURTAIN_LIVING_2   = 12;  // Pin 12 → Servo: Living Room Window blind 2

// ─── DISPLAY LCD I2C (mostra temperature HVAC) ─────────────────────────────
//
// Display LCD 16x2 collegato via I2C (SDA = A4, SCL = A5).
// Mostra la temperatura target e corrente della stanza che è stata
// aggiornata per ultima.
// Indirizzo I2C tipico: 0x27 (o 0x3F a seconda del modulo).

LiquidCrystal_I2C lcd(0x27, 16, 2);  // Indirizzo 0x27, 16 colonne, 2 righe


/* ═══════════════════════════════════════════════════════════════════════════
 *  OGGETTI SERVO
 * ═══════════════════════════════════════════════════════════════════════════ */

Servo servoBedroom1;
Servo servoBedroom2;
Servo servoBathroom1;
Servo servoLiving1;
Servo servoLiving2;


/* ═══════════════════════════════════════════════════════════════════════════
 *  BUFFER SERIALE
 * ═══════════════════════════════════════════════════════════════════════════ */

const int BUFFER_SIZE = 128;
char serialBuffer[BUFFER_SIZE];
int bufferIndex = 0;


/* ═══════════════════════════════════════════════════════════════════════════
 *  SETUP
 * ═══════════════════════════════════════════════════════════════════════════ */

void setup() {
  // Inizializza comunicazione seriale (stessa baudrate del FastAPI: 9600)
  Serial.begin(9600);

  // ─── Pin Luci (OUTPUT) ───
  pinMode(PIN_LIGHT_BEDROOM_CEIL1, OUTPUT);
  pinMode(PIN_LIGHT_BEDROOM_BEDSIDE, OUTPUT);
  pinMode(PIN_LIGHT_BATHROOM_CEIL1, OUTPUT);
  pinMode(PIN_LIGHT_LIVING_CEIL1, OUTPUT);
  pinMode(PIN_LIGHT_LIVING_CEIL2, OUTPUT);

  // ─── Pin Ventole (OUTPUT) ───
  pinMode(PIN_FAN_BEDROOM, OUTPUT);
  pinMode(PIN_FAN_BATHROOM, OUTPUT);
  pinMode(PIN_FAN_LIVING, OUTPUT);

  // ─── Pin Tende (Servo attach) ───
  servoBedroom1.attach(PIN_CURTAIN_BEDROOM_1);
  servoBedroom2.attach(PIN_CURTAIN_BEDROOM_2);
  servoBathroom1.attach(PIN_CURTAIN_BATHROOM_1);
  servoLiving1.attach(PIN_CURTAIN_LIVING_1);
  servoLiving2.attach(PIN_CURTAIN_LIVING_2);

  // Posizione iniziale tende: tutte chiuse (0°)
  servoBedroom1.write(0);
  servoBedroom2.write(0);
  servoBathroom1.write(0);
  servoLiving1.write(0);
  servoLiving2.write(0);

  // ─── LCD I2C ───
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("ARIS System");
  lcd.setCursor(0, 1);
  lcd.print("Ready...");

  // Spegni tutto all'avvio
  analogWrite(PIN_LIGHT_BEDROOM_CEIL1, 0);
  analogWrite(PIN_LIGHT_BEDROOM_BEDSIDE, 0);
  analogWrite(PIN_LIGHT_BATHROOM_CEIL1, 0);
  analogWrite(PIN_LIGHT_LIVING_CEIL1, 0);
  analogWrite(PIN_LIGHT_LIVING_CEIL2, 0);
  analogWrite(PIN_FAN_BEDROOM, 0);
  digitalWrite(PIN_FAN_BATHROOM, LOW);
  digitalWrite(PIN_FAN_LIVING, LOW);

  Serial.println("ARIS Arduino Controller ready");
}


/* ═══════════════════════════════════════════════════════════════════════════
 *  LOOP PRINCIPALE
 *  Legge caratteri dalla seriale e quando trova '\n' processa il comando.
 * ═══════════════════════════════════════════════════════════════════════════ */

void loop() {
  while (Serial.available() > 0) {
    char c = Serial.read();

    if (c == '\n') {
      serialBuffer[bufferIndex] = '\0';  // Termina la stringa
      processCommand(serialBuffer);
      bufferIndex = 0;                    // Reset buffer
    } else if (bufferIndex < BUFFER_SIZE - 1) {
      serialBuffer[bufferIndex++] = c;
    }
  }
}


/* ═══════════════════════════════════════════════════════════════════════════
 *  PARSER COMANDI
 *  Divide il comando per ':' e chiama la funzione appropriata.
 * ═══════════════════════════════════════════════════════════════════════════ */

// Numero massimo di token nel comando (es. LIGHT:bedroom:0:ON:130 = 5 token)
const int MAX_TOKENS = 6;

void processCommand(char* cmd) {
  // Dividi il comando per ':'
  char* tokens[MAX_TOKENS];
  int tokenCount = 0;

  char* token = strtok(cmd, ":");
  while (token != NULL && tokenCount < MAX_TOKENS) {
    tokens[tokenCount++] = token;
    token = strtok(NULL, ":");
  }

  if (tokenCount < 2) {
    Serial.println("ERR:INVALID_CMD");
    return;
  }

  // ─── Identifica il tipo di comando ───
  if (strcmp(tokens[0], "LIGHT") == 0) {
    handleLight(tokens, tokenCount);
  }
  else if (strcmp(tokens[0], "HVAC") == 0) {
    handleHVAC(tokens, tokenCount);
  }
  else if (strcmp(tokens[0], "FAN") == 0) {
    handleFan(tokens, tokenCount);
  }
  else if (strcmp(tokens[0], "CURTAIN") == 0) {
    handleCurtain(tokens, tokenCount);
  }
  else {
    Serial.print("ERR:UNKNOWN_CMD:");
    Serial.println(tokens[0]);
  }
}


/* ═══════════════════════════════════════════════════════════════════════════
 *  HANDLER: LUCI
 *  Formato: LIGHT:<stanza>:<indice>:<ON|OFF>:<brightness 0-255>
 *
 *  Usa analogWrite per PWM (0-255) sui pin dei LED.
 *  Se lo stato è OFF, imposta brightness a 0 indipendentemente dal valore.
 * ═══════════════════════════════════════════════════════════════════════════ */

void handleLight(char** tokens, int count) {
  if (count < 5) {
    Serial.println("ERR:LIGHT:MISSING_ARGS");
    return;
  }

  char* room    = tokens[1];    // es. "bedroom"
  int   index   = atoi(tokens[2]); // es. 0 o 1
  char* state   = tokens[3];    // "ON" o "OFF"
  int   brightness = atoi(tokens[4]); // 0-255

  int pin = getLightPin(room, index);
  if (pin < 0) {
    Serial.println("ERR:LIGHT:UNKNOWN_PIN");
    return;
  }

  // Se OFF, forza brightness a 0
  if (strcmp(state, "OFF") == 0) {
    brightness = 0;
  }

  analogWrite(pin, brightness);

  // Conferma al FastAPI
  Serial.print("OK:LIGHT:");
  Serial.print(room);
  Serial.print(":");
  Serial.print(index);
  Serial.print(":");
  Serial.println(brightness);
}

/**
 * Ritorna il pin Arduino corrispondente alla luce data stanza + indice.
 * Ritorna -1 se la combinazione non è valida.
 */
int getLightPin(char* room, int index) {
  if (strcmp(room, "bedroom") == 0) {
    if (index == 0) return PIN_LIGHT_BEDROOM_CEIL1;    // Ceiling light 1
    if (index == 1) return PIN_LIGHT_BEDROOM_BEDSIDE;  // Bedside lamp 1
  }
  else if (strcmp(room, "bathroom") == 0) {
    if (index == 0) return PIN_LIGHT_BATHROOM_CEIL1;   // Ceiling light 1
  }
  else if (strcmp(room, "living_room") == 0) {
    if (index == 0) return PIN_LIGHT_LIVING_CEIL1;     // Ceiling light 1
    if (index == 1) return PIN_LIGHT_LIVING_CEIL2;     // Ceiling light 2
  }
  return -1; // Pin non trovato
}


/* ═══════════════════════════════════════════════════════════════════════════
 *  HANDLER: HVAC
 *  Formato STATE: HVAC:<stanza>:STATE:<ON|OFF>
 *  Formato TEMP:  HVAC:<stanza>:TEMP:<target>:<current>
 *
 *  Lo stato HVAC per ora viene usato solo per logging / LCD.
 *  Le temperature vengono mostrate sul display LCD I2C.
 * ═══════════════════════════════════════════════════════════════════════════ */

void handleHVAC(char** tokens, int count) {
  if (count < 4) {
    Serial.println("ERR:HVAC:MISSING_ARGS");
    return;
  }

  char* room = tokens[1];
  char* subCmd = tokens[2];  // "STATE" o "TEMP"

  if (strcmp(subCmd, "STATE") == 0) {
    // HVAC:<stanza>:STATE:<ON|OFF>
    char* state = tokens[3];

    Serial.print("OK:HVAC:STATE:");
    Serial.print(room);
    Serial.print(":");
    Serial.println(state);

    // Aggiorna LCD con stato HVAC
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("HVAC ");
    lcd.print(room);
    lcd.setCursor(0, 1);
    lcd.print("Stato: ");
    lcd.print(state);
  }
  else if (strcmp(subCmd, "TEMP") == 0 && count >= 5) {
    // HVAC:<stanza>:TEMP:<target>:<current>
    int targetTemp  = atoi(tokens[3]);
    int currentTemp = atoi(tokens[4]);

    Serial.print("OK:HVAC:TEMP:");
    Serial.print(room);
    Serial.print(":");
    Serial.print(targetTemp);
    Serial.print(":");
    Serial.println(currentTemp);

    // Mostra le temperature sul display LCD I2C
    lcd.clear();
    lcd.setCursor(0, 0);
    // Riga 1: nome stanza abbreviato + temperatura target
    lcd.print(room);
    lcd.print(" T:");
    lcd.print(targetTemp);
    lcd.print((char)223);  // Simbolo gradi °
    lcd.print("C");

    lcd.setCursor(0, 1);
    // Riga 2: temperatura corrente
    lcd.print("Attuale: ");
    lcd.print(currentTemp);
    lcd.print((char)223);  // Simbolo gradi °
    lcd.print("C");
  }
  else {
    Serial.println("ERR:HVAC:UNKNOWN_SUBCMD");
  }
}


/* ═══════════════════════════════════════════════════════════════════════════
 *  HANDLER: VENTOLE
 *  Formato: FAN:<stanza>:<ON|OFF>:<speed 0-255>
 *
 *  Bedroom: usa PWM (pin 11) per velocità variabile.
 *  Bathroom e Living Room: solo ON/OFF (pin A0 e A1 usati come digitali).
 * ═══════════════════════════════════════════════════════════════════════════ */

void handleFan(char** tokens, int count) {
  if (count < 4) {
    Serial.println("ERR:FAN:MISSING_ARGS");
    return;
  }

  char* room  = tokens[1];
  char* state = tokens[2];   // "ON" o "OFF"
  int   speed = atoi(tokens[3]); // 0-255

  if (strcmp(room, "bedroom") == 0) {
    // Bedroom: PWM per velocità variabile
    if (strcmp(state, "OFF") == 0) speed = 0;
    analogWrite(PIN_FAN_BEDROOM, speed);
  }
  else if (strcmp(room, "bathroom") == 0) {
    // Bathroom: solo ON/OFF digitale
    digitalWrite(PIN_FAN_BATHROOM, strcmp(state, "ON") == 0 ? HIGH : LOW);
  }
  else if (strcmp(room, "living_room") == 0) {
    // Living Room: solo ON/OFF digitale
    digitalWrite(PIN_FAN_LIVING, strcmp(state, "ON") == 0 ? HIGH : LOW);
  }
  else {
    Serial.println("ERR:FAN:UNKNOWN_ROOM");
    return;
  }

  Serial.print("OK:FAN:");
  Serial.print(room);
  Serial.print(":");
  Serial.print(state);
  Serial.print(":");
  Serial.println(speed);
}


/* ═══════════════════════════════════════════════════════════════════════════
 *  HANDLER: TENDE
 *  Formato: CURTAIN:<stanza>:<indice>:<OPEN|CLOSED>
 *
 *  Usa servo motori:
 *    - OPEN   → servo a 90°  (tenda aperta)
 *    - CLOSED → servo a 0°   (tenda chiusa)
 * ═══════════════════════════════════════════════════════════════════════════ */

void handleCurtain(char** tokens, int count) {
  if (count < 4) {
    Serial.println("ERR:CURTAIN:MISSING_ARGS");
    return;
  }

  char* room  = tokens[1];
  int   index = atoi(tokens[2]);
  char* state = tokens[3];   // "OPEN" o "CLOSED"

  int angle = (strcmp(state, "OPEN") == 0) ? 90 : 0;

  Servo* servo = getCurtainServo(room, index);
  if (servo == NULL) {
    Serial.println("ERR:CURTAIN:UNKNOWN_PIN");
    return;
  }

  servo->write(angle);

  Serial.print("OK:CURTAIN:");
  Serial.print(room);
  Serial.print(":");
  Serial.print(index);
  Serial.print(":");
  Serial.println(state);
}

/**
 * Ritorna il puntatore al servo corrispondente alla tenda data stanza + indice.
 * Ritorna NULL se la combinazione non è valida.
 */
Servo* getCurtainServo(char* room, int index) {
  if (strcmp(room, "bedroom") == 0) {
    if (index == 0) return &servoBedroom1;   // Window blind 1
    if (index == 1) return &servoBedroom2;   // Window blind 2
  }
  else if (strcmp(room, "bathroom") == 0) {
    if (index == 0) return &servoBathroom1;  // Window blind 1
  }
  else if (strcmp(room, "living_room") == 0) {
    if (index == 0) return &servoLiving1;    // Window blind 1
    if (index == 1) return &servoLiving2;    // Window blind 2
  }
  return NULL;
}
