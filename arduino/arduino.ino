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
    if (value < 48 || value > 122) {
      continue;
    }
    if (value >= 58 && value <=64) {
      continue; 
    }
    if (value >= 91 && value <= 96) {
      continue;
    }
    if (value >= 65 && value <= 90) {
      // 将大写字母映射为小写
      value = value + 32;
    }
    if (keyCount < 3) {
      keyCount +=1;
      Keyboard.press(value);
      Serial.write(value);
      delay(10);
    }
  }

  if (keyCount > 0) {
      delay(20 + random(20));
      Keyboard.releaseAll();
      blink();
  }
}
