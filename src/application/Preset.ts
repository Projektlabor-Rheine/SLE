// Preset source-code for new projects
export const PRESET_SOURCECODE = `
#include <FastLED.h>

#define LED_PIN $LED_PIN$
#define LED_AMT $LED_AMOUNT$

// Fast-led api
CRGB leds[LED_AMT];

$VARIABLES$

$FUNC_DEFS$

void setup(){
    // Setups fastled-library
    FastLED.addLeds<NEOPIXEL, LED_PIN>(leds, LED_AMT);
    
    $SETUP_CODE$
}

void loop(){
$RUN_CODE$
}`;