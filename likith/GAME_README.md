# 🎮 Flappy Bird Game - React + Vite

A fully functional Flappy Bird game built with React and Vite, featuring custom images and sound effects.

## 🎯 Features

- **Custom Bird Character**: Colorful bird with rotation based on velocity
- **Custom Pipes/Obstacles**: Green pipes with texture details
- **Beautiful Background**: Gradient sky with clouds and ground
- **Sound Effects**:
  - 🎵 Jump sound - high beep tone
  - 💀 Death sound - descending tone
  - ▶️ Start sound - ascending tone
- **Smooth 60 FPS Gameplay**
- **Score Tracking**
- **Touch & Keyboard Controls**

## 🎮 How to Play

1. Press **SPACE** or click the canvas to make the bird jump
2. Avoid the pipes!
3. Each pipe you safely pass increases your score by 1
4. Try to get the highest score possible

## 📦 Installation & Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The game will be available at `http://localhost:5174/`

## 🎨 Customizing the Game

### Replace the Bird Image
1. Create your own bird image (PNG, SVG, JPEG - 40x30 pixels recommended)
2. Replace `/public/bird.svg` with your custom image
3. Update the path in `src/components/FlappyBird.jsx` if needed

### Replace the Pipes
1. Create your pipe/obstacle image (60x200+ pixels recommended)
2. Replace `/public/pipe.svg` with your custom image
3. Update the path in `src/components/FlappyBird.jsx` if needed

### Replace the Background
1. Create a background image (800x600 pixels recommended)
2. Replace `/public/background.svg` with your custom image
3. Update the path in `src/components/FlappyBird.jsx` if needed

### Customize Sounds

The sounds are generated using the Web Audio API. To customize them, edit the sound generation functions in `src/components/FlappyBird.jsx`:

#### Jump Sound (currently high beep)
```javascript
soundsRef.current.jump = () => {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  // Customize frequency, duration, and gain values below
  osc.frequency.value = 600; // Change pitch
  gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2); // Change duration
};
```

#### Death Sound (currently descending beep)
```javascript
soundsRef.current.death = () => {
  // Customize frequency range and duration
  osc.frequency.setValueAtTime(800, audioContext.currentTime);
  osc.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.5);
};
```

#### Start Sound (currently ascending beep)
```javascript
soundsRef.current.start = () => {
  // Customize frequency range and duration
  osc.frequency.setValueAtTime(300, audioContext.currentTime);
  osc.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.3);
};
```

## 🕹️ Game Settings (Customizable)

Edit `src/components/FlappyBird.jsx` to adjust:

- `gravity`: How fast the bird falls (default: 0.5)
- `jump`: Jump strength (default: -12)
- `pipeGap`: Space between pipes (default: 120)
- `pipeWidth`: Width of pipes (default: 60)
- `pipeSpeed`: Speed pipes move (default: 3)

## 📁 Project Structure

```
likith/
├── src/
│   ├── components/
│   │   └── FlappyBird.jsx       # Main game component
│   ├── styles/
│   │   └── FlappyBird.css       # Game styling
│   ├── App.jsx                  # App entry point
│   ├── main.jsx                 # React entry point
│   └── ...
├── public/
│   ├── bird.svg                 # Bird image
│   ├── pipe.svg                 # Pipe image
│   └── background.svg           # Background image
├── package.json
├── vite.config.js
└── ...
```

## 🎯 Game Mechanics

- **Gravity**: Bird constantly falls due to gravity
- **Jump**: Pressing SPACE/clicking gives the bird upward velocity
- **Pipes**: Generated randomly with variable gaps
- **Collision**: Game ends if bird hits pipes, ground, or ceiling
- **Scoring**: +1 point for each pipe successfully passed

## 🚀 Performance

- **60 FPS** smooth gameplay
- Optimized canvas rendering
- Efficient pipe generation and cleanup

## 🌐 Browser Compatibility

Works in all modern browsers that support:
- Web Audio API (for sounds)
- Canvas API (for rendering)
- ES6+ JavaScript

## 📝 License

Free to use and modify!

## 🎨 Design Tips for Custom Assets

### Bird Image Tips
- Keep it small (40x30 pixels or thereabouts)
- Use bright, contrasting colors
- Include details for character personality

### Pipe Image Tips
- Create a seamless vertical pattern
- Use distinct colors from the background
- Make it at least 60 pixels wide

### Background Image Tips
- Use a soft, gradient sky
- Add clouds or scenery for depth
- Avoid too many distracting details

Enjoy your Flappy Bird game! 🎮✨
