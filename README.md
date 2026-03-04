# Ramadan Pen

Draw with your index finger using a webcam, powered by MediaPipe Hands for real-time hand tracking.

## Usage

1. Open `index.html` in a browser
2. Allow camera access when prompted
3. Raise your index finger in front of the camera
4. **Hold Shift** to draw
5. **Press Space** to clear the canvas

## How It Works

- Uses **MediaPipe Hands** to detect hand landmarks via webcam
- Tracks the index fingertip (landmark #8) with smoothing for fluid strokes
- Draws in pink (#FFC5D3) with a glow effect on a dark background

## Dependencies

Loaded via CDN — no installation required.

- [@mediapipe/hands](https://cdn.jsdelivr.net/npm/@mediapipe/hands)
- [@mediapipe/camera_utils](https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils)
- [@mediapipe/drawing_utils](https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils)
