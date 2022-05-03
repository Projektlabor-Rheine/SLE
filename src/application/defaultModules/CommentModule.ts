import { Environment } from "../Environment.js";
import { ModuleBase, ModuleReturn } from "../modules/ModuleBase.js";
import { PositiveNumber } from "../types/Types.js";
import { VariableSystem } from "../variablesystem/VariableSystem.js";


/**
 * This is a special module which can't be directly instanciated by a json-config.
 * To comment something, just write a string inside the modules
 */


export type CommentModuleConfig = {
    text: string
}

class CommentModule_ extends ModuleBase<CommentModuleConfig> {

    public generateCode(env: Environment, _: VariableSystem, config: CommentModuleConfig, isDirty: boolean): ModuleReturn {
        return {
            loop: "// "+config.text
        };
    }
}

export const CommentMod = new CommentModule_();