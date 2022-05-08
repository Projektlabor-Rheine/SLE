import { Environment } from "../../Environment.js";
import { PopupSystem } from "../../popupSystem/PopupSystem.js";
import { ArduinoSimulation } from "../../simulation/ArduinoSimulation.js";
import { Min, PositiveNumber } from "../../types/Types.js";
import { create as C } from "../../utils/HTMLBuilder.js";
import { loadSVG } from "../../utils/SVGUtil.js";
import { S } from "./UiUtils.js";

// Path to the preview-files
export const PREVIEWS_FILE_PATH = "resources/arduinoPreviews/";

// Holds the name and file-name for a preset preview
export const PREVIEWS: {[key: string]: string} = {
    "Googles.svg": "Googles",
    "WS2812B-8x1.svg": "WS2812B (8x1)",
    "WS2812B-8x2.svg": "WS2812B (8x2)",
    "WS2812B-8x3.svg": "WS2812B (8x3)",
    "WS2812B-8x4.svg": "WS2812B (8x4)"
}

// Default element for the preview
export const DEFAULT_PREVIEW_NAME = Object.keys(PREVIEWS)[0];


// Last/Preview selected index of the preview-picker
var selectedIndex: number;

// The loaded environment-integration-collection with these elements
var envIntCol: EnvIntegrationCollection;


/**
 * Setups the environment
 * 
 * @throws {SystemError} if anything failed to load 
 */
 export function setupEnvironment(env: Environment, popsys: PopupSystem, sim: ArduinoSimulation, onEnvChange: ()=>void){
    // Loads all elements
    envIntCol = loadEnvIntegrationCollection();

    // Binds events etc.
    bindEnvironment(env, sim, popsys, onEnvChange);

    // Writes the first environment
    writeEnvironmentToPage(env);
}





/**
 * Collection with all elements that are required for the environment integration into the page.
 */
interface EnvIntegrationCollection {
    readonly pin: any/*Input-numeric*/,
    readonly amt: any/*Input-numeric*/
    readonly comments: any/*Input-checkbox*/,
    readonly precodeBtn: any/*Input-button*/,
    readonly previewSelect: HTMLSelectElement,
    
    readonly codeeditor: {
        readonly popup: HTMLDivElement
        readonly editor: HTMLTextAreaElement,
        readonly saveBtn: HTMLInputElement,
        readonly cancleBtn: HTMLInputElement,
    }
};

/**
 * Loads all env-integration elements from the document.
 * 
 * @throws {SystemError} if any element couldn't be fetched
 * @returns an object with all objects well and structured
 */
function loadEnvIntegrationCollection() : EnvIntegrationCollection{

    // Temp wrappers
    var ctrl = S("#controls") as HTMLDivElement;
    var codePopup = S("#precompEditor") as HTMLDivElement;

    return {
        pin: S("#inpPin",ctrl) as HTMLInputElement,
        amt: S("#inpAmt",ctrl) as HTMLInputElement,
        comments: S("#inpComments",ctrl) as HTMLInputElement,
        precodeBtn: S("#inpPreCode",ctrl) as HTMLInputElement,
        previewSelect:  S("#inpSelect",ctrl) as HTMLSelectElement,
        
        codeeditor: {
            popup: codePopup,
            editor: S("textarea",codePopup) as HTMLTextAreaElement,
            saveBtn: S("#pce-save",codePopup) as HTMLInputElement,
            cancleBtn: S("#pce-cancle",codePopup) as HTMLInputElement,
        }
    }
}

/**
 * Takes in the environment and the environment-integration-collction and applies the new values
 */
function writeEnvironmentToPage(env: Environment){
    envIntCol.amt.value = env.ledAmount;
    envIntCol.pin.value = env.ledPin;
    envIntCol.comments.checked = env.withComments;

    // Updates the index of the selected preview
    for(let i=0; i<envIntCol.previewSelect.children.length; i++){
        // Gets the child
        var cld = envIntCol.previewSelect.children[i];

        // Checks if the value matches
        if((cld as HTMLOptionElement).value === env.selectedPreview){
            // Updates the index
            envIntCol.previewSelect.selectedIndex = i;
            break;
        }
    }

}

/**
 * Takes in multiple required elements and bind the document-environment with all events and initalizsation stuff
 */
function bindEnvironment(env: Environment, sim: ArduinoSimulation, popsys: PopupSystem, onEnvChange: ()=>void){
    
    // Adds event below
    envIntCol.pin.addEventListener("change",(_: any)=>{
        env.ledPin=envIntCol.pin.value as PositiveNumber;
        onEnvChange();
    });
    envIntCol.amt.addEventListener("change",(_: any)=>{
        env.ledAmount=envIntCol.amt.value as Min<1>
        onEnvChange();
    });
    envIntCol.comments.addEventListener("change",(_: any)=>{
        env.withComments=envIntCol.comments.checked
        onEnvChange();
    });
    envIntCol.precodeBtn.addEventListener("click",(_: any)=>{
        popsys.showPopup(envIntCol.codeeditor.popup);
        envIntCol.codeeditor.editor.value = env.preprocessingCode;
    });

    // Adds codeeditor events
    envIntCol.codeeditor.cancleBtn.addEventListener("click",popsys.closePopup);
    envIntCol.codeeditor.saveBtn.addEventListener("click",(_: any)=>{
        env.preprocessingCode = envIntCol.codeeditor.editor.value
        popsys.closePopup();
        onEnvChange();
    });


    // Appends all preview-options for the animation
    for(var file in PREVIEWS){
        var name = PREVIEWS[file];
        
        // Creates the option
        envIntCol.previewSelect.appendChild(C("option",{
            text: name,
            attr: {
                value: file
            }
        }));
    }

    // Adds preview-events
    envIntCol.previewSelect.addEventListener("change",async()=>{        
        
        try{
            // Gets the new index
            var newIndex = envIntCol.previewSelect.selectedIndex;
            // Gets the new filename
            var filename = envIntCol.previewSelect.selectedOptions[0].getAttribute("value") as string;
            
            // Prevents changing the index
            envIntCol.previewSelect.selectedIndex = selectedIndex;            

            // Gets the new animation and tries to load it
            var svg = await loadSVG(PREVIEWS_FILE_PATH+filename);
            sim.loadPreview(svg);

            // Updates the led-amount
            env.ledAmount = sim.getLedAmount();
            env.selectedPreview = filename;

            // Updates the index
            envIntCol.previewSelect.selectedIndex = selectedIndex = newIndex;

            // Writes the changes to the page
            writeEnvironmentToPage(env);

            // Executes the callback
            onEnvChange();
        }catch(e){
            // Displays the error to the user
            // TODO: Implement using popup-system
            alert(e);
        }
    });
}