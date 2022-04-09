#include "Keyboard.h"
#include "Mouse.h"

#define X_KEY_MAP_LEN 7
const int keyMap[] = {' ', 'w', 'a', 's', 'd', KEY_LEFT_ARROW, KEY_RIGHT_ARROW};

void sendRandomKey() {
//  int r = random(X_KEY_MAP_LEN + 1);
//
//  if (r == X_KEY_MAP_LEN) {
//    Keyboard.press(KEY_LEFT_SHIFT);
//    delay(100);
//    Keyboard.press('1');
//  } else {
//    Keyboard.press(keyMap[r]);
//  }
  Keyboard.press('1');
  delay(50 + random(100));1
  Keyboard.releaseAll();
}
bool led = false;
void blink() {
  digitalWrite(LED_BUILTIN, led ? HIGH : LOW);
  led = !led;
}

unsigned long nextKeyTime = 0;

void updateNextKeyTime() {
  nextKeyTime = millis() + random(500, 1500);
}

void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(2, INPUT);
  digitalWrite(LED_BUILTIN, LOW);

  randomSeed(analogRead(5));

  Keyboard.begin();
  Mouse.begin();

  nextKeyTime = millis() + 15000;
}

void loop() {
  if (millis() > nextKeyTime) {
     updateNextKeyTime();
     sendRandomKey();
     blink();
  }
  delay(50);
}