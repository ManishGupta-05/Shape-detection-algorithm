import "./style.css";
import { SelectionManager } from "./ui-utils.js";
import { EvaluationManager } from "./evaluation-manager.js";

export interface Point {
  x: number;
  y: number;
}

export interface DetectedShape {
  type: "circle" | "triangle" | "rectangle" | "pentagon" | "star";
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  center: Point;
  area: number;
}

export interface DetectionResult {
  shapes: DetectedShape[];
  processingTime: number;
  imageWidth: number;
  imageHeight: number;
}

export class ShapeDetector {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
  }

  /**
   * MAIN ALGORITHM TO IMPLEMENT
   * Method for detecting shapes in an image
   * @param imageData - ImageData from canvas
   * @returns Promise<DetectionResult> - Detection results
   *
   * TODO: Implement shape detection algorithm here
   */
  /**
 * Shape detection algorithm:
 * 
 * 1. Separate shape pixels from the background using a brightness threshold.
 * 2. Use flood-fill (connected component labeling) to group pixels into individual shapes.
 * 3. For each component compute geometric properties:
 *      - bounding box
 *      - center point
 *      - pixel area
 * 4. Filter out noise using size, aspect ratio, and fill ratio constraints.
 * 5. Classify shapes using the ratio between pixel area and bounding box area.
 *
 */
  async detectShapes(imageData: ImageData): Promise<DetectionResult> {
    const startTime = performance.now();

    // TODO: Implement shape detection algorithm
    const shapes: DetectedShape[] = [];

    const { width, height, data } = imageData;

    // helper to get pixel index
    const getIndex = (x: number, y: number) => (y * width + x) * 4;

    // check if pixel belongs to a shape
    const isShapePixel = (x: number, y: number) => {
      const i = getIndex(x, y);
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const brightness = (r + g + b) / 3;

      return brightness < 200; // white background filter
    };

    const visited = new Uint8Array(width * height);

    const floodFill = (startX: number, startY: number) => {
      const stack: [number, number][] = [[startX, startY]];
      const pixels: Point[] = [];

      visited[startY * width + startX] = 1;

      while (stack.length > 0) {
        const [x, y] = stack.pop()!;
        pixels.push({ x, y });

        const neighbors: [number, number][]  = [
          [x + 1, y],
          [x - 1, y],
          [x, y + 1],
          [x, y - 1],
        ];

        for (const [nx, ny] of neighbors) {
          if (
            nx >= 0 &&
            ny >= 0 &&
            nx < width &&
            ny < height &&
            !visited[ny * width + nx] &&
            isShapePixel(nx, ny)
          ) {
            visited[ny * width + nx] = 1;
            stack.push([nx, ny]);
          }
        }
      }
      return pixels;
    };

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (!visited[y * width + x] && isShapePixel(x, y)) {
          const shapePixels = floodFill(x, y);

          // ignore tiny noise
          if (shapePixels.length < 120) continue;

          // compute bounding box
          let minX = Infinity;
          let minY = Infinity;
          let maxX = -Infinity;
          let maxY = -Infinity;

          for (const p of shapePixels) {
            if (p.x < minX) minX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.x > maxX) maxX = p.x;
            if (p.y > maxY) maxY = p.y;
          }

          const boxWidth = maxX - minX+1;
          const boxHeight = maxY - minY+1;
          if (boxWidth === 0 || boxHeight === 0) continue;
          if (boxWidth < 10 || boxHeight < 10) continue;
          const aspectRatio = boxWidth / boxHeight;
          if (aspectRatio > 6 || aspectRatio < 0.16) continue;

          // center
          const centerX = minX + boxWidth / 2;
          const centerY = minY + boxHeight / 2;

          // area
          const area = shapePixels.length;

          // classification of shapes using area-to-bounding-box ratio
          const boxArea = boxWidth * boxHeight;
          const fillRatio = area / boxArea;
          if (fillRatio < 0.35 || fillRatio > 1.1) continue;

          let type: DetectedShape["type"];

          if (fillRatio > 0.90) {
            type = "rectangle";
          }

          else if (fillRatio > 0.75) {
            type = "circle";
          }

          else if (fillRatio > 0.62) {
            type = "pentagon";
          }

          else if (fillRatio > 0.50) {
            type = "triangle";
          }

          else {
            type = "star";
          }

          shapes.push({
            type,
            confidence: Math.min(1, 0.6 + fillRatio * 0.5),
            boundingBox: {
              x: minX,
              y: minY,
              width: boxWidth,
              height: boxHeight,
            },
            center: {
              x: centerX,
              y: centerY,
            },
            area,
          });
        }
      }
    }

    // Placeholder implementation
    //console.log("Shape detection not implemented yet");
    //console.log("Image dimensions:", imageData.width, "x", imageData.height);

    const processingTime = performance.now() - startTime;

    return {
      shapes,
      processingTime,
      imageWidth: imageData.width,
      imageHeight: imageData.height,
    };
  }

  loadImage(file: File): Promise<ImageData> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.canvas.width = img.width;
        this.canvas.height = img.height;
        this.ctx.drawImage(img, 0, 0);
        const imageData = this.ctx.getImageData(0, 0, img.width, img.height);
        resolve(imageData);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }
}

class ShapeDetectionApp {
  private detector: ShapeDetector;
  private imageInput: HTMLInputElement;
  private resultsDiv: HTMLDivElement;
  private testImagesDiv: HTMLDivElement;
  private evaluateButton: HTMLButtonElement;
  private evaluationResultsDiv: HTMLDivElement;
  private selectionManager: SelectionManager;
  private evaluationManager: EvaluationManager;

  constructor() {
    const canvas = document.getElementById(
      "originalCanvas"
    ) as HTMLCanvasElement;
    this.detector = new ShapeDetector(canvas);

    this.imageInput = document.getElementById("imageInput") as HTMLInputElement;
    this.resultsDiv = document.getElementById("results") as HTMLDivElement;
    this.testImagesDiv = document.getElementById(
      "testImages"
    ) as HTMLDivElement;
    this.evaluateButton = document.getElementById(
      "evaluateButton"
    ) as HTMLButtonElement;
    this.evaluationResultsDiv = document.getElementById(
      "evaluationResults"
    ) as HTMLDivElement;

    this.selectionManager = new SelectionManager();
    this.evaluationManager = new EvaluationManager(
      this.detector,
      this.evaluateButton,
      this.evaluationResultsDiv
    );

    this.setupEventListeners();
    this.loadTestImages().catch(console.error);
  }

  private setupEventListeners(): void {
    this.imageInput.addEventListener("change", async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        await this.processImage(file);
      }
    });

    this.evaluateButton.addEventListener("click", async () => {
      const selectedImages = this.selectionManager.getSelectedImages();
      await this.evaluationManager.runSelectedEvaluation(selectedImages);
    });
  }

  private async processImage(file: File): Promise<void> {
    try {
      this.resultsDiv.innerHTML = "<p>Processing...</p>";

      const imageData = await this.detector.loadImage(file);
      const results = await this.detector.detectShapes(imageData);

      this.displayResults(results);
    } catch (error) {
      this.resultsDiv.innerHTML = `<p>Error: ${error}</p>`;
    }
  }

  private displayResults(results: DetectionResult): void {
    const { shapes, processingTime } = results;

    let html = `
      <p><strong>Processing Time:</strong> ${processingTime.toFixed(2)}ms</p>
      <p><strong>Shapes Found:</strong> ${shapes.length}</p>
    `;

    if (shapes.length > 0) {
      html += "<h4>Detected Shapes:</h4><ul>";
      shapes.forEach((shape) => {
        html += `
          <li>
            <strong>${
              shape.type.charAt(0).toUpperCase() + shape.type.slice(1)
            }</strong><br>
            Confidence: ${(shape.confidence * 100).toFixed(1)}%<br>
            Center: (${shape.center.x.toFixed(1)}, ${shape.center.y.toFixed(
          1
        )})<br>
            Area: ${shape.area.toFixed(1)}px²
          </li>
        `;
      });
      html += "</ul>";
    } else {
      html +=
        "<p>No shapes detected in this image.</p>";
    }

    this.resultsDiv.innerHTML = html;
  }

  private async loadTestImages(): Promise<void> {
    try {
      const module = await import("./test-images-data.js");
      const testImages = module.testImages;
      const imageNames = module.getAllTestImageNames();

      let html =
        '<h4>Click to upload your own image or use test images for detection. Right-click test images to select/deselect for evaluation:</h4><div class="evaluation-controls"><button id="selectAllBtn">Select All</button><button id="deselectAllBtn">Deselect All</button><span class="selection-info">0 images selected</span></div><div class="test-images-grid">';

      // Add upload functionality as first grid item
      html += `
        <div class="test-image-item upload-item" onclick="triggerFileUpload()">
          <div class="upload-icon">📁</div>
          <div class="upload-text">Upload Image</div>
          <div class="upload-subtext">Click to select file</div>
        </div>
      `;

      imageNames.forEach((imageName) => {
        const dataUrl = testImages[imageName as keyof typeof testImages];
        const displayName = imageName
          .replace(/[_-]/g, " ")
          .replace(/\.(svg|png)$/i, "");
        html += `
          <div class="test-image-item" data-image="${imageName}" 
               onclick="loadTestImage('${imageName}', '${dataUrl}')" 
               oncontextmenu="toggleImageSelection(event, '${imageName}')">
            <img src="${dataUrl}" alt="${imageName}">
            <div>${displayName}</div>
          </div>
        `;
      });

      html += "</div>";
      this.testImagesDiv.innerHTML = html;

      this.selectionManager.setupSelectionControls();

      (window as any).loadTestImage = async (name: string, dataUrl: string) => {
        try {
          const response = await fetch(dataUrl);
          const blob = await response.blob();
          const file = new File([blob], name, { type: "image/svg+xml" });

          const imageData = await this.detector.loadImage(file);
          const results = await this.detector.detectShapes(imageData);
          this.displayResults(results);

          console.log(`Loaded test image: ${name}`);
        } catch (error) {
          console.error("Error loading test image:", error);
        }
      };

      (window as any).toggleImageSelection = (
        event: MouseEvent,
        imageName: string
      ) => {
        event.preventDefault();
        this.selectionManager.toggleImageSelection(imageName);
      };

      // Add upload functionality
      (window as any).triggerFileUpload = () => {
        this.imageInput.click();
      };
    } catch (error) {
      this.testImagesDiv.innerHTML = `
        <p>Test images not available. Run 'node convert-svg-to-png.js' to generate test image data.</p>
        <p>SVG files are available in the test-images/ directory.</p>
      `;
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new ShapeDetectionApp();
});
