import React, { useState, useEffect, useRef } from 'react';
import '../styles/FlappyBird.css';

const FlappyBird = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const bgMusicRef = useRef(null);
  const failedAudioRef = useRef(null);
  const highScoreAudioRef = useRef(null);
  const jumpAudioRef = useRef(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('flappyBirdHighScore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 800, height: 600 });
  const gameStateRef = useRef({
    birdY: 150,
    birdX: 50,
    birdWidth: 80,
    birdHeight: 60,
    velocity: 0,
    gravity: 0.12,
    jump: -4,
    pipeGap: 220,
    pipeWidth: 80,
    pipeSpeed: 3,
    pipes: [],
    score: 0,
  });

  const soundsRef = useRef({
    jump: null,
    death: null,
    start: null,
  });

  // Initialize sounds using Web Audio API
  useEffect(() => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Jump sound - high beep
    soundsRef.current.jump = () => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.frequency.value = 600;
      gain.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      osc.start(audioContext.currentTime);
      osc.stop(audioContext.currentTime + 0.2);
    };

    // Death sound - descending beep
    soundsRef.current.death = () => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.frequency.setValueAtTime(800, audioContext.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.5);
      gain.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      osc.start(audioContext.currentTime);
      osc.stop(audioContext.currentTime + 0.5);
    };

    // Start sound - ascending beep
    soundsRef.current.start = () => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.frequency.setValueAtTime(300, audioContext.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.3);
      gain.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      osc.start(audioContext.currentTime);
      osc.stop(audioContext.currentTime + 0.3);
    };
  }, []);

  const playSound = (soundType) => {
    if (soundsRef.current[soundType]) {
      try {
        soundsRef.current[soundType]();
      } catch (error) {
        console.log('Sound playback failed:', error);
      }
    }
  };

  const goHome = () => {
    if (bgMusicRef.current) { bgMusicRef.current.pause(); bgMusicRef.current.currentTime = 0; }
    if (failedAudioRef.current) { failedAudioRef.current.pause(); failedAudioRef.current.currentTime = 0; }
    if (highScoreAudioRef.current) { highScoreAudioRef.current.pause(); highScoreAudioRef.current.currentTime = 0; }
    setGameStarted(false);
    setGameOver(false);
    setScore(0);
  };

  const startGame = () => {
    playSound('start');
    if (failedAudioRef.current) { failedAudioRef.current.pause(); failedAudioRef.current.currentTime = 0; }
    if (highScoreAudioRef.current) { highScoreAudioRef.current.pause(); highScoreAudioRef.current.currentTime = 0; }
    if (bgMusicRef.current) {
      bgMusicRef.current.volume = 0.1;
      bgMusicRef.current.currentTime = 0;
      bgMusicRef.current.play().catch(() => { });
    }
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    gameStateRef.current = {
      birdY: 150,
      birdX: 50,
      birdWidth: 80,
      birdHeight: 60,
      velocity: 0,
      gravity: 0.2,
      jump: -6,
      pipeGap: 200,
      pipeWidth: 80,
      pipeSpeed: 3,
      pipes: [{ x: 800 }],
      score: 0,
    };
  };

  const handleJump = () => {
    if (!gameOver && gameStarted) {
      gameStateRef.current.velocity = gameStateRef.current.jump;
      if (jumpAudioRef.current) {
        jumpAudioRef.current.currentTime = 0;
        jumpAudioRef.current.play().catch(() => { });
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      e.preventDefault();
      if (!gameStarted) {
        startGame();
      } else if (!gameOver) {
        handleJump();
      } else {
        startGame();
      }
    }
  };

  const handleTouchStart = () => {
    if (!gameStarted) {
      startGame();
    } else if (!gameOver) {
      handleJump();
    } else {
      startGame();
    }
  };

  // Responsive canvas sizing
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const width = window.innerWidth;
        const isMobile = width < 768;

        if (isMobile) {
          const maxWidth = Math.min(width - 20, 500);
          const aspectRatio = 800 / 600;
          const maxHeight = window.innerHeight * 0.7;
          const height = Math.min(maxWidth / aspectRatio, maxHeight);
          setCanvasDimensions({ width: maxWidth, height });
        } else {
          setCanvasDimensions({ width: 800, height: 600 });
        }
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  // Main game loop
  useEffect(() => {
    if (!gameStarted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const images = {
      bird: new Image(),
      pipe: new Image(),
      bg: new Image(),
    };

    images.bird.src = '/bird.png';
    images.pipe.src = '/pipe.png';
    images.bg.src = '/background.svg';

    const gameLoop = setInterval(() => {
      const state = gameStateRef.current;

      // Update bird position
      state.velocity += state.gravity;
      state.birdY += state.velocity;

      // Generate pipes
      if (state.pipes.length === 0 || state.pipes[state.pipes.length - 1].x < 300) {
        const randomGapY = Math.random() * (canvas.height - state.pipeGap - 100) + 50;
        state.pipes.push({
          x: canvas.width,
          gapY: randomGapY,
        });
      }

      // Move pipes
      state.pipes = state.pipes.filter((pipe) => {
        pipe.x -= state.pipeSpeed;
        return pipe.x > -state.pipeWidth;
      });

      // Update score
      state.pipes.forEach((pipe) => {
        if (
          pipe.x + state.pipeWidth < state.birdX &&
          !pipe.scored
        ) {
          pipe.scored = true;
          state.score += 1;
          setScore(state.score);
        }
      });

      // Check collisions
      let collision = false;

      // Collision with ground or ceiling
      if (
        state.birdY + state.birdHeight >= canvas.height ||
        state.birdY <= 0
      ) {
        collision = true;
      }

      // Collision with pipes
      state.pipes.forEach((pipe) => {
        const pipeTopHeight = pipe.gapY;
        const pipeBottomY = pipe.gapY + state.pipeGap;

        if (
          state.birdX + state.birdWidth > pipe.x &&
          state.birdX < pipe.x + state.pipeWidth
        ) {
          if (
            state.birdY < pipeTopHeight ||
            state.birdY + state.birdHeight > pipeBottomY
          ) {
            collision = true;
          }
        }
      });

      if (collision) {
        playSound('death');
        if (bgMusicRef.current) { bgMusicRef.current.pause(); bgMusicRef.current.currentTime = 0; }
        const finalScore = state.score;
        const prevHigh = parseInt(localStorage.getItem('flappyBirdHighScore') || '0', 10);
        const gotNewHigh = finalScore > 0 && finalScore >= prevHigh;
        setIsNewHighScore(gotNewHigh);
        if (gotNewHigh && highScoreAudioRef.current) {
          highScoreAudioRef.current.currentTime = 0;
          highScoreAudioRef.current.play().catch(() => { });
        } else if (!gotNewHigh && failedAudioRef.current) {
          failedAudioRef.current.currentTime = 0;
          failedAudioRef.current.play().catch(() => { });
        }
        setHighScore(prev => {
          const newHigh = Math.max(prev, finalScore);
          localStorage.setItem('flappyBirdHighScore', newHigh.toString());
          return newHigh;
        });
        setGameStarted(false);
        setGameOver(true);
        clearInterval(gameLoop);
        return;
      }

      // Draw game
      // Draw background
      if (images.bg.complete) {
        ctx.drawImage(images.bg, 0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Draw pipes
      state.pipes.forEach((pipe) => {
        if (images.pipe.complete) {
          // Draw top pipe
          ctx.save();
          ctx.scale(1, -1);
          ctx.drawImage(
            images.pipe,
            pipe.x,
            -pipe.gapY,
            state.pipeWidth,
            pipe.gapY
          );
          ctx.restore();

          // Draw bottom pipe
          ctx.drawImage(
            images.pipe,
            pipe.x,
            pipe.gapY + state.pipeGap,
            state.pipeWidth,
            canvas.height - (pipe.gapY + state.pipeGap)
          );
        } else {
          ctx.fillStyle = '#228B22';
          ctx.fillRect(pipe.x, 0, state.pipeWidth, pipe.gapY);
          ctx.fillRect(
            pipe.x,
            pipe.gapY + state.pipeGap,
            state.pipeWidth,
            canvas.height - (pipe.gapY + state.pipeGap)
          );
        }

        // Draw pipe outlines
        ctx.strokeStyle = '#1a5c1a';
        ctx.lineWidth = 3;
        ctx.strokeRect(pipe.x, 0, state.pipeWidth, pipe.gapY);
        ctx.strokeRect(pipe.x, pipe.gapY + state.pipeGap, state.pipeWidth, canvas.height - (pipe.gapY + state.pipeGap));
      });

      // Draw ground
      ctx.fillStyle = '#8B7355';
      ctx.fillRect(0, canvas.height - 40, canvas.width, 40);

      // Draw bird
      if (images.bird.complete) {
        ctx.save();
        ctx.translate(state.birdX + state.birdWidth / 2, state.birdY + state.birdHeight / 2);
        ctx.rotate((Math.min(state.velocity, 10) / 10) * 0.4);
        const radius = Math.min(state.birdWidth, state.birdHeight) / 2;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(
          images.bird,
          -state.birdWidth / 2,
          -state.birdHeight / 2,
          state.birdWidth,
          state.birdHeight
        );
        ctx.restore();
      } else {
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(state.birdX + state.birdWidth / 2, state.birdY + state.birdHeight / 2, Math.min(state.birdWidth, state.birdHeight) / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw score
      ctx.fillStyle = '#000';
      ctx.font = 'bold 32px Arial';
      ctx.fillText(`Score: ${state.score}`, 20, 50);

      // Draw high score
      ctx.fillStyle = '#DAA520';
      ctx.font = 'bold 20px Arial';
      const hsText = `🏆 Best: ${highScore}`;
      const hsWidth = ctx.measureText(hsText).width;
      ctx.fillText(hsText, canvas.width - hsWidth - 20, 50);
    }, 1000 / 60); // 60 FPS

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      clearInterval(gameLoop);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [gameStarted, gameOver]);

  return (
    <div className="flappy-bird-container" ref={containerRef}>
      <canvas
        ref={canvasRef}
        width={canvasDimensions.width}
        height={canvasDimensions.height}
        className="game-canvas"
        onClick={() => {
          if (!gameStarted) {
            startGame();
          } else if (!gameOver) {
            handleJump();
          } else {
            startGame();
          }
        }}
        onTouchStart={handleTouchStart}
      />

      {gameStarted && !gameOver && (
        <button onClick={goHome} className="home-button">
          🏠
        </button>
      )}

      {!gameStarted && !gameOver && (
        <div className="game-overlay">
          <div className="overlay-content home-screen">
            <img src="/bird.png" alt="Flappy Bird" className="home-bird" />
            <h1>Flappy Likith</h1>
            <p className="home-subtitle">Navigate through the pipes!</p>
            {highScore > 0 && (
              <p className="home-highscore">🏆 High Score: {highScore}</p>
            )}
            <p className="home-instructions">
              {window.innerWidth < 768 ? 'Tap to jump' : 'Press SPACE or click to jump'}
            </p>
            <button onClick={startGame} className="start-button">
              🎮 Start Game
            </button>
          </div>
        </div>
      )}

      {gameOver && (
        <div className="game-overlay">
          <div className="overlay-content gameover-screen">
            <h1>{isNewHighScore ? '🎉 New High Score!' : '💥 Game Over!'}</h1>
            <video
              className="gameover-video"
              src={isNewHighScore ? '/highscore.mp4' : '/failed.mp4'}
              autoPlay
              loop
              muted
              playsInline
            />
            <div className="score-board">
              <div className="score-item">
                <span className="score-label">Score</span>
                <span className="score-value">{score}</span>
              </div>
              <div className="score-divider"></div>
              <div className="score-item">
                <span className="score-label">🏆 Best</span>
                <span className="score-value highscore-value">{highScore}</span>
              </div>
            </div>
            {isNewHighScore && (
              <p className="new-best">🎉 You beat your record!</p>
            )}
            <div className="gameover-buttons">
              <button onClick={goHome} className="start-button home-btn">
                🏠 Home
              </button>
              <button onClick={startGame} className="start-button">
                🔄 Play Again
              </button>
            </div>
          </div>
        </div>
      )}

      <audio ref={bgMusicRef} src="/backgroundmusic.m4a" loop preload="auto" volume="0.3" />
      <audio ref={failedAudioRef} src="/failedaudio.m4a" loop preload="auto" />
      <audio ref={highScoreAudioRef} src="/highscoreaudio.m4a" loop preload="auto" />
      <audio ref={jumpAudioRef} src="/jumpaudio.m4a" preload="auto" />

      <div className="controls">
        <p>🎮 {window.innerWidth < 768 ? 'Tap to jump' : 'Press SPACE or click to jump'}</p>
      </div>
    </div>
  );
};

export default FlappyBird;
