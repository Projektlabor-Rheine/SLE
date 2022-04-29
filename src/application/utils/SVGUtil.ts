/**
 * Loads an svg from the given path and attaches it as a children to the given parent.
 * This is used to make svgs accessible and editable by css
 * 
 * @param {HTMLElement} parent the future parent of the svg
 * @param {string} path the path to the svg-image
 * @returns {SVGElement} the handle to the svg-image
 */
 export async function attachInfileSVG(parent: HTMLElement,path: string): Promise<SVGElement>{
    // Gets the svg-image
    var res = await fetch(path);
    
    // Checks for an error
    if(!res.ok)
        throw res.status;

    // Creates a dummy element
    var dummy = document.createElement("div");

    // Attaches the element
    dummy.innerHTML=await res.text();

    // Checks if an error occurred
    if(dummy.children.length <= 0)
        throw "failed to retreive svg";

    // Gets the element handle
    var handle: SVGElement = dummy.children[0] as SVGElement;

    // Removes the dummy object
    dummy.removeChild(handle);

    // Appends the object to the parent
    parent.appendChild(handle);

    // Returns the svg-handle
    return handle;
}