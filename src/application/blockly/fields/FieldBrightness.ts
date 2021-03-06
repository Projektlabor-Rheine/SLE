import { isPercentageNumber, PercentageNumber } from "../../types/Types.js";
import { HSV2HEX } from "../../utils/ColorUtils.js";
import { create as C } from "../../utils/HTMLBuilder.js";
const Blockly = require("blockly");



export default class FieldBrightness extends Blockly.Field {

  // Default value for the field
  static DEFAULT_VALUE: PercentageNumber = 1 as PercentageNumber;

  SERIALIZABLE = true;

  constructor(opt_value: PercentageNumber | null = null, opt_validator?: (value: number) => boolean) {
    opt_value = FieldBrightness.validateInputColor(opt_value);
    if (opt_value === null)
      opt_value = FieldBrightness.DEFAULT_VALUE;

    super(opt_value, opt_validator);
  }

  // Validates the input-color as an hsv-object. Return null if invalid and the object if valid.
  private static validateInputColor(value: any): PercentageNumber | null {
    // Ensures the value is a number
    if (typeof value !== "number" || value === null)
      return null;

    return isPercentageNumber(value) ? value : null;
  }

  // Create an field from a given json object
  private static fromJson(options: object) {
    return new FieldBrightness(options["color" as keyof typeof options]);
  }

  // Validator for new values to the class
  private doClassValidation_(newValue: any) {
    return FieldBrightness.validateInputColor(newValue);
  }

  // Event: When the field gets initalized
  private initView() {
    // Create the color-preview
    this.createBorderRect_();
    this.borderRect_.style.fillOpacity = 1;
  }

  // Event: When the size of the field gets calculated
  private updateSize_() {
    // Updates width and height
    this.borderRect_.setAttribute(
      "width",
      this.size_.width = 25
    );

    this.borderRect_.setAttribute(
      "height",
      this.size_.height = 16
    );
  }

  // Event: When the editor get's closed
  private disposeEditor_() {
    // Removes the editor fields
    this.openEditorField_ = undefined;
  }

  // Event: When the editor get's opened
  private showEditor_() {

    // Gets the current values
    var brightness = this.getValue();

    // Creates the slider
    var slider = C("input", {
      attr: {
        "type": "range",
        "min": 0,
        "max": 1000,
        "value": brightness * 1000
      },
      evts: { "input": (evt: any) => this.onValueChange(evt.target.value) }
    });

    // Creates the drawable canvas and renders it
    var canvas = C("canvas") as HTMLCanvasElement;

    // Creates the html-part
    Blockly.DropDownDiv.getContentDiv().appendChild(C("div", {
      chld: [
        C("p", { text: "Brightness" }),
        C("div", {
          cls: "blockly-custfield-colorslider",
          chld: [
            canvas, slider
          ]
        })
      ],
      // Also uses the same class as the customcolorfield because this is basically just a custom-color field without the color and value
      cls: "blockly-custfield-colorslider-popup"
    }));

    // Sets the block-background color as the dropdown background-color
    Blockly.DropDownDiv.setColour(this.sourceBlock_.style.colourPrimary, this.sourceBlock_.style.colourTertiary);

    // Attaches the slider
    this.openEditorField_ = {
      canvas
    }

    // Opens the dropdown and registers the close-handler
    Blockly.DropDownDiv.showPositionedByField(this, this.disposeEditor_.bind(this));

    this.render_();
  }

  private getText_() {
    return this.getValue().toString();
  }

  // Renders the canvas for a given slider
  private renderSlider(canvas: HTMLCanvasElement) {
    // Opens the context
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

    // Size of the canvas
    var w = canvas.width;
    var h = canvas.height;

    // Iterates over every pixel
    for (let x = 0; x < canvas.clientWidth; x++) {
      // Draws the color
      ctx.fillStyle = HSV2HEX(0, 0, x / w);
      ctx.fillRect(x, 0, 1, h);
    }

  }

  // Event: When one slider get's updated
  private onValueChange = (value: number) => {
    this.setValue(value / 1000);

    // Rerenders the slider
    this.render_();
  }

  // Event: Render event
  private render_() {

    // Updates the color-style
    var brightness = this.getValue();
    this.borderRect_.style.fill = HSV2HEX(0, 0, brightness);

    // Draws the canvas if it hasn't been drawn yet
    if (this.openEditorField_ && this.openEditorField_.isDrawn === undefined) {
      this.renderSlider(this.openEditorField_.canvas);
      this.openEditorField_.isDrawn = true;
    }

    super.render_();
  }
}