/* ============================================================================
 * trigger.ino — Go/No-Go gorevi icin Arduino fNIRS tetik kutusu
 *
 * Tarayici (Web Serial) her olayda tek byte'lik bir KOD gonderir.
 * Bu kod, D2..D9 pinlerine 8-bit paralel TTL olarak yansitilir ve kisa bir
 * darbe (PULSE_MS) uretilir. Bu pinleri fNIRS cihazinin paralel/dijital tetik
 * girisine baglayin. Tek hatli (yalnizca "olay var") bir giris icin D2'yi
 * kullanin.
 *
 * Baud: 115200 (gorevdeki Triggers.connectSerial ile ayni).
 * Kart: Arduino Uno/Nano/Leonardo vb.
 *
 * Kod esleme (config.js -> fnirs.triggerCodes):
 *   1=goOnset  2=targetOnset  3=standardOnset  8=response
 *   10=blockStart  15=rest  20=blockEnd
 * ==========================================================================*/

const uint8_t DATA_PINS[8] = {2, 3, 4, 5, 6, 7, 8, 9}; // D2..D9 = bit0..bit7
const int     STROBE_PIN   = 10;   // istege bagli: olay aninda kisa strobe
const int     LED_PIN      = 13;   // gorsel onay
const unsigned long PULSE_MS = 5;  // tetik darbesi suresi (ms)

void writeByteToPins(uint8_t value) {
  for (uint8_t i = 0; i < 8; i++) {
    digitalWrite(DATA_PINS[i], (value >> i) & 0x01);
  }
}

void setup() {
  for (uint8_t i = 0; i < 8; i++) pinMode(DATA_PINS[i], OUTPUT);
  pinMode(STROBE_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  writeByteToPins(0);
  digitalWrite(STROBE_PIN, LOW);
  Serial.begin(115200);
}

void loop() {
  if (Serial.available() > 0) {
    uint8_t code = (uint8_t) Serial.read();

    // 8-bit paralel deger + strobe darbesi
    writeByteToPins(code);
    digitalWrite(STROBE_PIN, HIGH);
    digitalWrite(LED_PIN, HIGH);
    delay(PULSE_MS);
    digitalWrite(STROBE_PIN, LOW);
    digitalWrite(LED_PIN, LOW);
    writeByteToPins(0);          // hatti temizle (cihaz yukselen kenarda latch'ler)

    // Hata ayiklama icin (seri monitorde gorunur; gorevle ayni portu paylasmayin)
    // Serial.print("trigger "); Serial.println(code);
  }
}
