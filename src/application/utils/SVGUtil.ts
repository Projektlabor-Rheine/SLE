import { SystemError } from "../errorSystem/Errors.js";

/**
 * Loads an svg from the given path.
 * This is used to make svgs accessible and editable by css
 * 
 * @param {string} path the path to the svg-image
 * 
 * @throws {SystemError} if there is a critical error. Like if it failed to load or the loaded file didn't contain an svg
 * @returns {SVGElement} the handle to the svg-image
 */
export async function loadSVG(path: string): Promise<SVGElement>{
    // Gets the svg-image
    var res = await fetch(path);
    
    // Checks for an error
    if(!res.ok)
        throw new SystemError("Retreived invalid svg-status-code: "+res.status);

    // Creates a dummy element
    var dummy = document.createElement("div");

    // Attaches the element
    dummy.innerHTML=await res.text();

    // Checks if an error occurred
    if(dummy.children.length != 1)
        throw new SystemError("failed to retreive svg");

    // Ensures that an svg got loaded
    if(dummy.children[0].tagName.toLowerCase() !== "svg")
        throw new SystemError("retreived element was no svg");

    // Gets the element handle
    var handle: SVGElement = dummy.children[0] as SVGElement;

    // Removes the dummy object
    dummy.removeChild(handle);

    // Returns the svg-handle
    return handle;
}