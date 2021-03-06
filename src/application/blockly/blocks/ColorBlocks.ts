import { ColorModule, ColorModuleConfig } from "../../defaultModules/ColorModule.js";
import { Environment } from "../../Environment.js";
import { BlockError } from "../../errorSystem/Errors.js";
import { ConfigBuilder } from "../../ConfigBuilder.js";
import { Min, PositiveNumber, RGB } from "../../types/Types.js";
import { getNumberFromCodeAsMin, getRGBFromCode } from "../util/BlocklyBlockUtils.js";
import FieldCustomColor from "../fields/FieldCustomColor.js";
import { TB_COLOR_COLOR } from "../util/Toolbox.js";

const Blockly = require("blockly");

/**
 * Registers all blocks that are using the color-module
 */


export default function registerColorBlocks(){
    registerSingleLed('sle_simple_single_color');
    registerStripe('sle_simple_stripe_color');
    registerStepsColor('sle_steps_color');
}

//#region BlockRegister

// General color module with spaces between leds
function registerStepsColor(name: string){
    Blockly.Blocks[name] = {
        init: function() {
            this.appendValueInput("steps")
                .setCheck("Number")
                .appendField("Color");
            this.appendValueInput("start")
                .appendField("step(s) from")
                .setCheck("Number");
            this.appendValueInput("space-between-steps")
                .appendField("in")
                .appendField(new FieldCustomColor(), "color")
                .appendField("with")
                .setCheck("Number")
            this.appendValueInput("step-length")
                .appendField("leds space every")
                .setCheck("Number");
            this.appendDummyInput()
                .appendField("leds.");
            this.setColour(TB_COLOR_COLOR);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setInputsInline(true);
        }
    };

    ConfigBuilder.registerModuleBlock<ColorModuleConfig>(name, function(block:any, env: Environment) {
        // Variables
        var start: PositiveNumber = getNumberFromCodeAsMin(block,"start", 0, env);
        var steps: Min<1> = getNumberFromCodeAsMin(block,"steps", 1, env);

        // How many leds to skip between steps
        var skipLen: Min<1> = getNumberFromCodeAsMin(block,"space-between-steps", 1, env);

        // How long each step is
        var skipStart: Min<1> = getNumberFromCodeAsMin(block,"step-length", 1, env);

        // Gets the color
        var color: RGB = getRGBFromCode(block,"color");

        // Assembles the config
        return {
            module: ColorModule,
            config: {
                ...ColorModule.DEFAULT_CONFIG,
                start,
                ledsPerStep: skipStart,
                space: skipLen as any as PositiveNumber,
                steps,
                clr_r: color.r,
                clr_g: color.g,
                clr_b: color.b
            },
            block
        }
    });
}

// Colors multiple leds in a row
function registerStripe(name: string){
    Blockly.Blocks[name] = {
        init: function() {
            this.appendValueInput("start")
                .setCheck("Number")
                .appendField("Color leds");
            this.appendValueInput("end")
                .setCheck("Number")
                .appendField("to");
            this.appendDummyInput()
                .appendField("in")
                .appendField(new FieldCustomColor(), "color");
            this.setColour(TB_COLOR_COLOR);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setInputsInline(true);
        }
    };

    ConfigBuilder.registerModuleBlock<ColorModuleConfig>(name, function(block:any, env: Environment) {
        var pos1: PositiveNumber = getNumberFromCodeAsMin(block,"start", 0, env);
        var pos2: PositiveNumber = getNumberFromCodeAsMin(block,"end", 0, env);
        var color: RGB = getRGBFromCode(block,"color");
        
        // Checks if an invalid length got specified
        if(pos1 === pos2)
            throw new BlockError("The start- and end-values are equal.", block);
        
        // Gets the start
        var start = Math.min(pos1,pos2) as PositiveNumber;
        
        // How many leds are used
        var amt: Min<1> = Math.max(pos1,pos2)-start as Min<1>;
        
        return {
            module: ColorModule,
            config: {
                ...ColorModule.DEFAULT_CONFIG,
                start,
                ledsPerStep: amt,
                clr_r: color.r,
                clr_g: color.g,
                clr_b: color.b
            },
            block
        }
    });
}

// Single-led
function registerSingleLed(name: string){
    Blockly.Blocks[name] = {
        init: function() {
            this.appendValueInput("led")
                .setCheck("Number")
                .appendField("Color led");
            this.appendDummyInput()
                .appendField("in")
                .appendField(new FieldCustomColor(), "color");
            this.setColour(TB_COLOR_COLOR);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setInputsInline(true);
        }
    };

    ConfigBuilder.registerModuleBlock<ColorModuleConfig>(name, function(block:any, env: Environment) {
        // Start
        var start: PositiveNumber = getNumberFromCodeAsMin(block,"led",0, env);

        // Color
        var color: RGB = getRGBFromCode(block,"color");

        return {
            module: ColorModule,
            config:{
                ...ColorModule.DEFAULT_CONFIG,
                start,
                clr_r: color.r,
                clr_g: color.g,
                clr_b: color.b
            },
            block
        }
    });
}

//#endregion