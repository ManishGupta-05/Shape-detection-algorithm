# Shape Detection Challenge

## Overview

This challenge tests your ability to implement shape detection algorithms that can identify and classify the  geometric shapes in images:

## Setup Instructions

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Project Structure

```
shape-detector/
├── src/
│   ├── main.ts          # Main application code (implement here)
│   └── style.css        # Basic styling
├── test-images/         # Test images directory
├── expected_results.json # Expected detection results
├── index.html          # Application UI
└── README.md           # This file
```

## Challenge Requirements

### Primary Task

Implement the `detectShapes()` method in the `ShapeDetector` class located in `src/main.ts`. This method should:

1. Analyze the provided `ImageData` object
2. Detect all geometric shapes present in the image
3. Classify each shape into one of the five required categories
4. Return detection results with specified format

### Implementation Location

```typescript
// File: src/main.ts
async detectShapes(imageData: ImageData): Promise<DetectionResult> {
  // TODO: Implement your shape detection algorithm here
  // This is where you write your code
}
```


## Test Images

The `test-images/` directory contains 10 test images with varying complexity:

1. **Simple shapes** - Clean, isolated geometric shapes
2. **Mixed scenes** - Multiple shapes in single image
3. **Complex scenarios** - Overlapping shapes, noise, rotated shapes
4. **Edge cases** - Very small shapes, partial occlusion
5. **Negative cases** - Images with no detectable shapes

See `expected_results.json` for detailed expected outcomes for each test image.

## Evaluation Criteria

Your implementation will be assessed on:

### 1. Shape Detection Accuracy (40%)

- Correctly identifying all shapes present in test images
- Minimizing false positives (detecting shapes that aren't there)
- Handling various shape sizes, orientations, and positions

### 2. Classification Accuracy (30%)

- Correctly classifying detected shapes into the right categories
- Distinguishing between similar shapes (e.g., square vs. rectangle)
- Handling edge cases and ambiguous shapes

### 3. Precision Metrics (20%)

- **Bounding Box Accuracy**: IoU > 0.7 with expected bounding boxes
- **Center Point Accuracy**: < 10 pixels distance from expected centers
- **Area Calculation**: < 15% error from expected area values
- **Confidence Calibration**: Confidence scores should reflect actual accuracy

### 4. Code Quality & Performance (10%)

- Clean, readable, well-documented code
- Efficient algorithms (< 2000ms processing time per image)
- Proper error handling
                |

## Implementation Guidelines

### Allowed Approaches

- Computer vision algorithms (edge detection, contour analysis)
- Mathematical shape analysis (geometric properties, ratios)
- Pattern recognition techniques
- Image processing operations
- Any algorithm you can implement from scratch

### Constraints

- No external computer vision libraries (OpenCV, etc.)
- Use only browser-native APIs and basic math operations
- No pre-trained machine learning models
- Work with the provided `ImageData` object format


## Testing Your Solution

1. Use the web interface to upload and test images
2. Compare your results with `expected_results.json`
3. Test with the provided test images
4. Verify detection accuracy and confidence scores
5. Check processing time performance

## Submission Guidelines

Your final submission should include:

- Completed implementation in `src/main.ts`
- Any additional helper functions or classes you created
- Brief documentation of your approach (comments in code)
- Test results or performance notes (optional)


