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
  Serial.begin(9600);

}

void loop() {
   int keyCount = 0;
   while(Serial.available()>0) {
    int value = Serial.read();
    if (value >= 48 && value <= 122 && keyCount < 2) {
      keyCount +=1;
      Keyboard.press(value);
      // Serial.write(value);
      delay(3);
    }
  }

  if (keyCount > 0) {
      delay(30 + random(30));
      Keyboard.releaseAll();
      blink();
  }
}
