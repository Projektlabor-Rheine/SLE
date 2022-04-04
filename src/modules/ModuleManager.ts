import { ModuleBase } from "./ModuleBase";
import TestModule from "../defaultModules/TestModule";

// List with all registered modules
const MODULES = {
    "test": TestModule
}

class ModuleManager{

    /**
     * Tries to get a module by it's unique key (name)
     * @param key to search for as the module's unique identifier or name
     * @returns undefined if no module get found, otherwise the module
     */
    getModuleByName(key: string) : ModuleBase|undefined{
        // Gets the value
        var value : any = MODULES[key as keyof typeof MODULES];
        
        // Checks if the module couldn't be found
        if(value === undefined)
            return undefined;

        return value as ModuleBase;
    }
}

export default new ModuleManager();