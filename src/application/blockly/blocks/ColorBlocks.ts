import { HSV2HEX } from "../../utils/ColorUtils.js";
import { getNumberFromCode } from "../BlocklyUtils.js";
import { packageBlockConfig } from "../BlockRegister.js";
import FieldCustomColor from "../fields/FieldCustomColor.js";

const Blockly = require("blockly");

/**
 * This file registers all blocks that are using the color-module. Eg. generate configs for it
 */


export default function registerColorBlocks(){
    registerSingleLed();
    registerStripe();
    registerStepsColor();

}



// General color module with spaces between leds
function registerStepsColor(){
    Blockly.Blocks['sle_steps_color'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Color");
            this.appendValueInput("steps")
                .setCheck("Number")
                .appendField("step(s) from");
            this.appendValueInput("start")
                .setCheck("Number")
                .appendField("in")
                .appendField(new FieldCustomColor(), "color")
                .appendField("with");

            this.appendValueInput("skipLen")
                .setCheck("Number")
                .appendField("leds space every")
            this.appendValueInput("skipStart")
                .setCheck("Number")
                .appendField("leds.");
            this.setColour(230);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setInputsInline(true);
        }
    };

    Blockly.JavaScript['sle_steps_color'] = function(block:any) {
        // Variables
        var start = getNumberFromCode(block,"start");
        var steps = getNumberFromCode(block,"steps");

        // How many leds to skip between steps
        var skipLen = getNumberFromCode(block,"skipLen");

        // How long each step is
        var skipStart = getNumberFromCode(block,"skipStart");

        // RGB-Color
        var hsv = block.getFieldValue('color');

        // Assembles the config
        return packageBlockConfig({
            "name": "color",
            "config": {
                "start": start,
                "ledsPerStep": skipStart,      
                "rgb": HSV2HEX(hsv.h,hsv.s,hsv.v,true),
                "spaceBetweenSteps": skipLen,
                "steps": steps
            }
        });
    };
}

// Colors multiple leds in a row
function registerStripe(){
    Blockly.Blocks['sle_simple_stripe_color'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Color leds");
            this.appendValueInput("start")
                .setCheck("Number")
                .appendField("to")
            this.appendValueInput("end")
                .setCheck("Number")
                .appendField("in")
                .appendField(new FieldCustomColor(), "color")
                .appendField(".");
            this.setColour(230);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setInputsInline(true);
        }
    };

    Blockly.JavaScript['sle_simple_stripe_color'] = function(block:any) {
        var start: number = getNumberFromCode(block,"start");
        var end: number = getNumberFromCode(block,"end");
        var hsv = block.getFieldValue('color');

        // How many leds are used
        var amt = end-start;

        // Checks if an invalid length got specified
        if(amt <= 0)
            throw "The specified 'end'-value is eiter the 'start'-value or below the 'start'-value.";

        // Assembles the config
        return packageBlockConfig({
            "name": "color",
            "config": {
                "start": start,
                "ledsPerStep": amt,      
                "rgb": HSV2HEX(hsv.h,hsv.s,hsv.v,true)
            }
        });
    };
}

// Single-led
function registerSingleLed(){
    Blockly.Blocks['sle_simple_single_color'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Color led")
            this.appendValueInput("led")
                .setCheck("Number")
                .appendField("in")
                .appendField(new FieldCustomColor(), "color")
                .appendField(".");
            this.setColour(230);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setInputsInline(true);
        }
    };

    Blockly.JavaScript['sle_simple_single_color'] = function(block:any) {
        // Gets the color as an rgb-value
        var hsv = block.getFieldValue('color');

        // Assembles the config
        return packageBlockConfig({
            "name": "color",
            "config": {
                "start": getNumberFromCode(block,"led"),      
                "rgb": HSV2HEX(hsv.h,hsv.s,hsv.v,true),
                "ledsPerStep": 1
            }
        });
    };
}