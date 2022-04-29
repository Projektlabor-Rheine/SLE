import { Config } from "../Config.js";
import { Environment } from "../Environment.js";
import { VariableSystem } from "../variablesystem/VariableSystem.js";
import { ModuleBase } from "../modules/ModuleBase.js";
import { ModuleReturn } from "../modules/ModuleReturn.js";
import { isInteger, printIf as pif } from "../utils/WorkUtils.js";
import { tryParseModules } from "../codegenerator/ConfigValidator.js";
import { generateModuleCode } from "../codegenerator/CodeGenerator.js";
import { Arduino } from "../simulation/Arduino.js";

class LoopModule extends ModuleBase {
    
    // Validates the config and returns the required values or throws an error
    private validateConfig(cfg: Config){
        // Gets the submodules
        var rawSubmodules = cfg.getRaw("modules");

        // Gets further settings
        var repeats = cfg.getRequired("repeats",v=>isInteger(v,2),"must be an integer >= 2");
        var delayBetween = cfg.getOptional("delay",v=>isInteger(v,1),"must be an integer >= 1",undefined);


        // Validates the submodules
        var submodules = tryParseModules(rawSubmodules);

        // Checks if the submodules failed to parse
        if(typeof submodules === "string")
            throw "Failed to pass submodules: "+submodules;

        return {
            submodules: (submodules as [ModuleBase, Config][]),
            delayBetween,
            repeats
        }
    }

    public generateCode(env: Environment, varSys: VariableSystem, config: Config): string | ModuleReturn {

        // Validates the config
        var cfg = this.validateConfig(config);
        

        // Gets the generated codes (The execution may end here do to an error beeing thrown)
        var generatedCode:ModuleReturn = generateModuleCode(env,varSys,cfg.submodules);

        // Requests the local variable
        var vItr = varSys.requestLocalVariable("int","i","0");


        // Generates the new loop code
        var loopCode = `
            for(${vItr.declair()} ${vItr} < ${cfg.repeats}; ${vItr}++){
                ${generatedCode.loop ?? ""} ${pif(`\ndelay(${cfg.delayBetween});`, cfg.delayBetween !== undefined)}
            }
        `;

        return {
            setup: generatedCode.setup,
            loop: loopCode
        };
    }



    public simulateSetup(env : Environment, config: Config, singleSourceOfTruth: {[k: string]: any}, arduino: Arduino){
        // Validates the config
        var cfg = this.validateConfig(config);
        
        // Simulates the setup for the submodules
        var mods = cfg.submodules.map(mod=>{
            // Generates the new module-object
            var modObj = {
                mod: mod[0],
                cfg: mod[1],
                ssot: {}
            };

            // Executes the setup
            modObj.mod.simulateSetup(env,modObj.cfg,modObj.ssot,arduino);

            return modObj;
        });

        // Stores the module-configs for the loop-simulation
        singleSourceOfTruth.mods = mods;

        // Stores the require settings too
        singleSourceOfTruth.repeats = cfg.repeats;
        singleSourceOfTruth.delayBetween = cfg.delayBetween;
    }

    public async simulateLoop(env : Environment, singleSourceOfTruth: {[k: string]: any}, arduino: Arduino){
        // Gets the delay
        var del = singleSourceOfTruth.delayBetween;
        
        // Gets the mods
        var mods = singleSourceOfTruth.mods as {mod:ModuleBase,cfg: Config, ssot: {}}[];

        // Executes the loop
        for(var x = 0; x < singleSourceOfTruth.repeats; x++){

            // Executes the loop for the modules
            for(var modObj of mods)
                await modObj.mod.simulateLoop(env,modObj.ssot,arduino);

            // Awaits the delay if it is given
            if(del > 0)
                await arduino.delay(del);
        }
    }
}

export default new LoopModule();