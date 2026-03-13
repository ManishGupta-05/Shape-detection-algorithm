
export class SelectionManager {
  private selectedImages: Set<string> = new Set();

  setupSelectionControls(): void {
    const selectAllBtn = document.getElementById("selectAllBtn");
    const deselectAllBtn = document.getElementById("deselectAllBtn");

    selectAllBtn?.addEventListener("click", () => {
      const testImageItems = document.querySelectorAll(".test-image-item");
      testImageItems.forEach((item) => {
        const imageName = item.getAttribute("data-image");
        if (imageName) {
          this.selectedImages.add(imageName);
          item.classList.add("selected");
        }
      });
      this.updateSelectionInfo();
    });

    deselectAllBtn?.addEventListener("click", () => {
      this.selectedImages.clear();
      document.querySelectorAll(".test-image-item").forEach((item) => {
        item.classList.remove("selected");
      });
      this.updateSelectionInfo();
    });
  }

  toggleImageSelection(imageName: string): void {
    const imageElement = document.querySelector(`[data-image="${imageName}"]`);
    if (!imageElement) return;

    if (this.selectedImages.has(imageName)) {
      this.selectedImages.delete(imageName);
      imageElement.classList.remove("selected");
    } else {
      this.selectedImages.add(imageName);
      imageElement.classList.add("selected");
    }
    this.updateSelectionInfo();
  }

  private updateSelectionInfo(): void {
    const infoElement = document.querySelector(".selection-info");
    if (infoElement) {
      infoElement.textContent = `${this.selectedImages.size} images selected`;
    }
  }

  getSelectedImages(): string[] {
    return Array.from(this.selectedImages);
  }

  hasSelections(): boolean {
    return this.selectedImages.size > 0;
  }
}

export class ModalManager {
  static showEvaluationModal(results: any): void {
    const modalOverlay = document.createElement("div");
    modalOverlay.className = "modal-overlay";

    const modalContent = document.createElement("div");
    modalContent.className = "modal-content";

    const closeButton = document.createElement("button");
    closeButton.className = "modal-close";
    closeButton.innerHTML = "×";
    closeButton.onclick = () => {
      document.body.removeChild(modalOverlay);
    };

    const resultsContainer = document.createElement("div");

    import("./evaluation.js").then((evaluationModule) => {
      evaluationModule.displayEvaluationResults(results, resultsContainer);
    });

    modalContent.appendChild(closeButton);
    modalContent.appendChild(resultsContainer);
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) {
        document.body.removeChild(modalOverlay);
      }
    });

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        document.body.removeChild(modalOverlay);
        document.removeEventListener("keydown", handleEscape);
      }
    };
    document.addEventListener("keydown", handleEscape);
  }
}
