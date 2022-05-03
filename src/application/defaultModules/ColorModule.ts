import { Environment } from "../Environment.js";
import { VariableSystem } from "../variablesystem/VariableSystem.js";
import { ModuleBase } from "../modules/ModuleBase.js";
import { ModuleReturn } from "../modules/ModuleBase";
import { printIf as pif } from "../utils/WorkUtils.js";
import { getFLEDColorDefinition } from "../utils/ColorUtils.js";
import { Arduino } from "../simulation/Arduino.js";
import { HexColor, Min, OpenObject, PositiveNumber as PositiveNumber } from "../types/Types.js";

export type ColorModuleConfig = {
    // Amount of leds per step
    ledsPerStep: Min<1>,

    // Where to start from on the step
    start: PositiveNumber,

    // Space between steps
    space: PositiveNumber,

    // Amount of steps
    steps: Min<1>,

    // Delay that will be waited per led
    delayPerLed: PositiveNumber,

    // Delay that will be waited between steps
    delayAfterStep: PositiveNumber,
    
    // Color
    rgbHex: HexColor
};

class ColorModule_ extends ModuleBase<ColorModuleConfig> {

    // Default configuration
    public readonly DEFAULT_CONFIG: ColorModuleConfig = {
        delayAfterStep: 0 as PositiveNumber,
        delayPerLed: 0 as PositiveNumber,
        ledsPerStep: 1 as Min<1>,
        rgbHex: "FF0000" as HexColor,
        space: 0 as PositiveNumber,
        start: 0 as PositiveNumber,
        steps: 1 as Min<1>
    };

    public generateCode(env: Environment, varSys: VariableSystem, cfg: ColorModuleConfig, isDirty: boolean): ModuleReturn {
            
        // Gets the color-string
        var [colorString, _] = getFLEDColorDefinition(cfg.rgbHex);

        // Start-addition operation
        var opStart = cfg.start > 0 ? (cfg.start + "+") : "";

        // Delay operations
        var opDelayLed = pif("\nFastLED.show();\ndelay("+cfg.delayPerLed+");",cfg.delayPerLed > 0);
        var opDelayStep = pif("\nFastLED.show();\ndelay("+cfg.delayAfterStep+");",cfg.delayAfterStep > 0);

        // Delay-bracket operations
        var opDelayLedBOpen = pif(" {",cfg.delayPerLed > 0);
        var opDelayLedBClose = pif("\n}",cfg.delayPerLed > 0);
        var opDelayStepBOpen = pif(" {",cfg.delayAfterStep > 0);
        var opDelayStepBClose = pif("\n}",cfg.delayAfterStep > 0);

        // Calculates the dirty-variable
        // Marks as dirty if no delay is given
        var isDirty = cfg.delayPerLed <= 0 && cfg.delayAfterStep <= 0;

        // Checks if there is only a singles step
        if (cfg.steps === 1) {

            // Checks if only a single led is required
            if (cfg.ledsPerStep === 1)
                return {
                    loop: `leds[${cfg.start}] = ${colorString};`,
                    isDirty: true
                }
            else {
                // Requests the led variable
                var vLed = varSys.requestLocalVariable("int", "l", "0");

                return {
                    loop: `
                        for(${vLed.declair()} ${vLed} < ${cfg.ledsPerStep}; ${vLed}++)${opDelayLedBOpen}
                            leds[${opStart}${vLed}] = ${colorString};${opDelayLed}${opDelayLedBClose}
                    `,
                    isDirty
                }
            }
        } else {
            // Gets the variables
            var vStep = varSys.requestLocalVariable("int", "s", "0");
            var vLed = varSys.requestLocalVariable("int", "l", "0");
            
            return {
                loop: `
                for(${vStep.declair()} ${vStep} < ${cfg.steps}; ${vStep}++)${opDelayStepBOpen}
                    for(${vLed.declair()} ${vLed} < ${cfg.ledsPerStep}; ${vLed}++)${opDelayLedBOpen}
                        leds[${opStart}${vStep} * ${(cfg.space+cfg.ledsPerStep)} + ${vLed}] = ${colorString};${opDelayLed}${opDelayLedBClose}${opDelayStep}${opDelayStepBClose}
                `,
                isDirty
            }
        }
    }

    
    public calculateRuntime(env: Environment, cfg: ColorModuleConfig) : number {
        // Checks if only a single led is given
        if(cfg.ledsPerStep === 1 && cfg.steps === 1)
            return 0;

        return (cfg.delayPerLed * cfg.ledsPerStep + cfg.delayAfterStep) * cfg.steps
    }

    public async simulateLoop(env : Environment, cfg: ColorModuleConfig, singleSourceOfTruth: OpenObject, arduino: Arduino){        
        // Iterates over every step
        for(var step = 0; step < cfg.steps; step++){
            // For every led of that step
            for(var led = 0; led < cfg.ledsPerStep; led++){

                // Updates the color
                arduino.setLedHex(cfg.start+step * (cfg.space+cfg.ledsPerStep) + led, cfg.rgbHex);
                
                // Inserts a delay if required and pushes the update
                if(cfg.delayPerLed > 0){
                    arduino.pushLeds();
                    await arduino.delay(cfg.delayPerLed);
                }
            }

            // Inserts a delay if required and pushes the update
            if(cfg.delayAfterStep > 0){
                arduino.pushLeds();
                await arduino.delay(cfg.delayAfterStep);
            }
        }

        // Updates the leds
        arduino.pushLeds(); 
    }
}

export const ColorModule = new ColorModule_();