

import type { ShapeDetector } from "./main.js";
import { ModalManager } from "./ui-utils.js";

export class EvaluationManager {
  private detector: ShapeDetector;
  private evaluateButton: HTMLButtonElement;
  private evaluationResultsDiv: HTMLDivElement;

  constructor(
    detector: ShapeDetector,
    evaluateButton: HTMLButtonElement,
    evaluationResultsDiv: HTMLDivElement
  ) {
    this.detector = detector;
    this.evaluateButton = evaluateButton;
    this.evaluationResultsDiv = evaluationResultsDiv;
  }

  async runSelectedEvaluation(selectedImages: string[]): Promise<void> {
    if (selectedImages.length === 0) {
      alert(
        "Please select at least one image for evaluation (right-click to select)"
      );
      return;
    }

    try {
      this.evaluateButton.disabled = true;
      this.evaluateButton.textContent = "Evaluating...";

      const evaluationModule = await import("./evaluation.js");
      const results = await evaluationModule.runSelectedEvaluation(
        this.detector,
        selectedImages
      );

      ModalManager.showEvaluationModal(results);

      console.log("Selected Evaluation Results:", results);
    } catch (error) {
      alert(`Error during evaluation: ${error}`);
      console.error("Evaluation error:", error);
    } finally {
      this.evaluateButton.disabled = false;
      this.evaluateButton.textContent = "Run Selected Evaluation";
    }
  }

  async runFullEvaluation(): Promise<void> {
    try {
      this.evaluateButton.disabled = true;
      this.evaluationResultsDiv.innerHTML =
        "<p>Running comprehensive evaluation...</p>";

      const evaluationModule = await import("./evaluation.js");
      const results = await evaluationModule.runEvaluation(this.detector);

      evaluationModule.displayEvaluationResults(
        results,
        this.evaluationResultsDiv
      );

      console.log("Full Evaluation Results:", results);
    } catch (error) {
      this.evaluationResultsDiv.innerHTML = `<p>Error during evaluation: ${error}</p>`;
      console.error("Evaluation error:", error);
    } finally {
      this.evaluateButton.disabled = false;
    }
  }
}
