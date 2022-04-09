#include <Keyboard.h>

bool led = false;
void blink() {
  digitalWrite(LED_BUILTIN, led ? HIGH : LOW);
  led = !led;
}
void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(2, INPUT);
  digitalWrite(LED_BUILTIN, LOW);
  randomSeed(analogRead(5));

  Keyboard.begin();
  Serial.begin(19200);
}

void loop() {
   int keyCount = 0;
   while(Serial.available()>0) {
    int value = Serial.read();
    if (value >= 48 && value <=122 && keyCount < 3) {
      keyCount +=1;
      Keyboard.press(value);
      delay(5);
    }
  }

  if (keyCount > 0) {
      delay(50 + random(50));
      Keyboard.releaseAll();
      blink();
  }
}
