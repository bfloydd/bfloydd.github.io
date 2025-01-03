class FlappyBird {
    constructor() {
        // Define game states
        this.GameState = {
            TITLE: 'title',
            READY: 'ready',
            PLAYING: 'playing',
            END: 'end'
        };
        
        // Initialize current state
        this.currentState = this.GameState.TITLE;
        
        this.gameFont = '"Chalkboard SE", cursive';
        
        // Load and setup bird sprite animation
        this.birdSprite = new Image();
        this.birdSprite.onload = () => {
            console.log('Sprite loaded:', this.birdSprite.width, 'x', this.birdSprite.height);
            this.spriteLoaded = true;
            this.spriteAnimation.frameWidth = this.birdSprite.width / this.spriteAnimation.framesPerRow;
            this.spriteAnimation.frameHeight = this.birdSprite.height / 2;
            console.log('Frame size:', this.spriteAnimation.frameWidth, 'x', this.spriteAnimation.frameHeight);
            if (!this.gameLoopStarted) {
                this.init();
            }
        };
        this.birdSprite.onerror = (e) => {
            console.error('Error loading sprite:', e);
        };
        this.birdSprite.src = 'images/flatchy_flap_sprite.png';

        // Load background assets
        this.backgroundImg = new Image();
        this.backgroundImg.onload = () => {
            this.backgroundLoaded = true;
        };
        this.backgroundImg.src = 'images/hills.png';
        this.backgroundLoaded = false;

        this.groundImg = new Image();
        this.groundImg.onload = () => {
            this.groundLoaded = true;
        };
        this.groundImg.src = 'images/ground.png';
        this.groundLoaded = false;
        this.groundOffset = 0;

        this.treeImg = new Image();
        this.treeImg.onload = () => {
            this.treeLoaded = true;
        };
        this.treeImg.src = 'images/tree.png';
        this.treeLoaded = false;

        // Load feather trail effects
        this.feather1 = new Image();
        this.feather1.onload = () => {
            this.feather1Loaded = true;
        };
        this.feather1.src = 'images/feather_1.png';
        this.feather1Loaded = false;

        this.feather2 = new Image();
        this.feather2.onload = () => {
            this.feather2Loaded = true;
        };
        this.feather2.src = 'images/feather_2.png';
        this.feather2Loaded = false;

        this.feather3 = new Image();
        this.feather3.onload = () => {
            this.feather3Loaded = true;
        };
        this.feather3.src = 'images/feather_3.png';
        this.feather3Loaded = false;

        this.feather4 = new Image();
        this.feather4.onload = () => {
            this.feather4Loaded = true;
        };
        this.feather4.src = 'images/feather_4.png';
        this.feather4Loaded = false;

        this.spriteLoaded = false;
        this.spriteAnimation = {
            frameWidth: 8,
            frameHeight: 8,
            totalFrames: 11,
            framesPerRow: 6,
            currentFrame: 0,
            frameTimer: 0,
            frameInterval: 100,
            lastFrameTime: 0
        };
        
        // Setup difficulty scaling
        this.startingLevel = 1;
        this.speedIncreasePerLevel = 0.5;
        this.pillarSpaceIncreasePerLevel = .05;
        
        this.canvas = document.createElement('canvas');
        
        // Set mobile-friendly dimensions
        const aspectRatio = 9/16; // Common mobile aspect ratio
        this.canvas.width = 400; // Base width for mobile
        this.canvas.height = this.canvas.width / aspectRatio;
        
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        
        // Setup bird physics
        this.bird = {
            x: this.canvas.width * 0.2,
            y: this.canvas.height * 0.4,
            velocity: 0,
            gravity: this.canvas.height * 0.0004,
            jump: this.canvas.height * -0.012,
            size: this.canvas.width * 0.12
        };
        
        // Setup game speed and obstacles
        this.baseSpeed = 1.8;
        this.currentSpeed = this.baseSpeed * (1 + (this.startingLevel - 1) * this.speedIncreasePerLevel);
        
        this.pipes = [];
        this.pipeWidth = this.canvas.width * 0.15;
        this.pipeGap = this.canvas.height * 0.25;
        this.pipeInterval = 2000;
        this.lastPipe = 0;
        
        // Setup scoring and game state
        this.score = 0;
        this.levelScore = 0;
        this.gameStarted = false;
        this.gameOver = false;
        
        // Setup UI elements
        this.startButton = {
            x: this.canvas.width * 0.25,
            y: this.canvas.height * 0.6,
            width: this.canvas.width * 0.5,
            height: this.canvas.height * 0.1
        };
        
        this.restartButton = {
            x: this.canvas.width * 0.25,
            y: this.canvas.height * 0.6,
            width: this.canvas.width * 0.5,
            height: this.canvas.height * 0.1
        };
        
        // Setup ambient effects
        this.fireBase = {
            flames: Array(20).fill().map((_, i) => ({
                x: i * (this.canvas.width / 19),
                size: Math.random() * 10 + 30,
                offset: Math.random() * Math.PI
            }))
        };
        
        this.bosses = [];
        
        // Setup level completion UI
        this.levelComplete = false;
        this.continueButton = {
            x: this.canvas.width * 0.25,
            y: this.canvas.height * 0.6,
            width: this.canvas.width * 0.5,
            height: this.canvas.height * 0.1
        };
        
        // Setup victory effects
        this.flashEffect = {
            active: false,
            duration: 60,
            currentFrame: 0,
            colors: ['#FF0000', '#00FF00', '#0000FF', '#FF00FF', '#FFFF00']
        };
        
        this.currentLevel = this.startingLevel;
        
        // Setup background effects
        this.background = {
            torches: Array(4).fill().map((_, i) => ({
                x: i * (this.canvas.width / 3),
                y: 60 + (i % 2) * 30,
                flameOffset: Math.random() * Math.PI
            }))
        };
        
        // Setup boss types and behaviors
        this.bossTypes = {
            GHOST: {
                emoji: '👻',
                size: 40,
                projectileEmoji: '☠️',
                projectileSize: 15
            },
            DEMON: {
                emoji: '👿',
                size: 45,
                projectileEmoji: '🔥',
                projectileSize: 18
            },
            SKULL: {
                emoji: '💀',
                size: 50,
                projectileEmoji: '🦴',
                projectileSize: 20
            }
        };
        
        this.bossHasAppeared = false;
        
        // Setup boss attack timing
        this.bossShootTimer = {
            lastShot: 0,
            minInterval: 3000
        };
        
        // Load game assets
        this.gameOverImg = new Image();
        this.gameOverImg.onload = () => {
            this.gameOverImgLoaded = true;
        };
        this.gameOverImg.src = 'images/game_over_text.png';
        this.gameOverImgLoaded = false;
        
        this.startBtnImg = new Image();
        this.startBtnImg.onload = () => {
            this.startBtnLoaded = true;
        };
        this.startBtnImg.src = 'images/start_btn_up.png';
        this.startBtnLoaded = false;
        
        this.plainBtnImg = new Image();
        this.plainBtnImg.onload = () => {
            this.plainBtnLoaded = true;
        };
        this.plainBtnImg.src = 'images/plain_btn.png';
        this.plainBtnLoaded = false;
        
        this.titleLogoImg = new Image();
        this.titleLogoImg.onload = () => {
            this.titleLogoLoaded = true;
        };
        this.titleLogoImg.src = 'images/title/title_logo.png';
        this.titleLogoLoaded = false;
        
        // Add title flatchy image
        this.titleFlatchyImg = new Image();
        this.titleFlatchyImg.onload = () => {
            this.titleFlatchyLoaded = true;
        };
        this.titleFlatchyImg.src = 'images/title/title_flatchy.png';
        this.titleFlatchyLoaded = false;
        
        this.gameLoopStarted = false;
        this.bindEvents();

        // Load cloud variations for background
        this.clouds = [];
        for (let i = 1; i <= 4; i++) {
            const cloud = new Image();
            cloud.onload = () => {
                cloud.loaded = true;
            };
            cloud.src = `images/clouds/cloud_0${i}.png`;
            cloud.loaded = false;
            this.clouds.push(cloud);
        }

        // Add title screen state
        this.titleScreenAlpha = 1; // For fade transition
        this.titleScreenElements = {
            logo: {
                width: 0,
                height: 0,
                x: 0,
                y: 0,
                scale: 0,
                targetScale: 1
            },
            startButton: {
                width: 0,
                height: 0,
                x: 0,
                y: 0,
                alpha: 0
            }
        };

        // Load title background
        this.titleBgImg = new Image();
        this.titleBgImg.onload = () => {
            this.titleBgLoaded = true;
        };
        this.titleBgImg.src = 'images/title/title_bg.png';
        this.titleBgLoaded = false;

        // Load sky background
        this.skyBgImg = new Image();
        this.skyBgImg.onload = () => {
            this.skyBgLoaded = true;
        };
        this.skyBgImg.src = 'images/sky_bg.png';
        this.skyBgLoaded = false;

        // Add ready state
        this.isReadyState = false;
        
        // Load tap icon
        this.tapIconImg = new Image();
        this.tapIconImg.onload = () => {
            this.tapIconLoaded = true;
        };
        this.tapIconImg.src = 'images/tap_icon.png';
        this.tapIconLoaded = false;
        
        // Load get ready text
        this.getReadyImg = new Image();
        this.getReadyImg.onload = () => {
            this.getReadyLoaded = true;
        };
        this.getReadyImg.src = 'images/game/get_ready_text.png';
        this.getReadyLoaded = false;

        // Load tap text
        this.tapTextImg = new Image();
        this.tapTextImg.onload = () => {
            this.tapTextLoaded = true;
        };
        this.tapTextImg.src = 'images/game/tap_text.png';
        this.tapTextLoaded = false;

        // Load whoosh sound
        this.whooshSound = new Audio('audio/woosh.wav');
        
        // Load only existing fart sounds
        this.fartSounds = [];
        const existingGasSounds = [1, 3, 4, 7, 14, 15, 18, 19, 29, 30];
        existingGasSounds.forEach(num => {
            const sound = new Audio(`audio/toots/gas${num}.wav`);
            this.fartSounds.push(sound);
        });
        
        // Setup fart sound timer for ambient sounds
        this.lastFartTime = 0;
        this.fartInterval = 2000 + Math.random() * 3000;
    }
    
    init() {
        this.bosses = [];
        this.bossHasAppeared = false;
        
        // Set initial game speed based on level
        this.currentSpeed = this.baseSpeed * (1 + (this.startingLevel - 1) * this.speedIncreasePerLevel);
        
        if (!this.gameLoopStarted) {
            this.gameLoopStarted = true;
            this.gameLoop();
        }
    }
    
    bindEvents() {
        const handleInput = () => {
            if (!this.spriteLoaded) return;
            
            switch (this.currentState) {
                case this.GameState.TITLE:
                    this.setState(this.GameState.READY);
                    break;
                case this.GameState.READY:
                    this.setState(this.GameState.PLAYING);
                    break;
                case this.GameState.PLAYING:
                    this.bird.velocity = this.bird.jump;
                    
                    // Play either whoosh or fart sound (35% chance for fart)
                    if (Math.random() < 0.35) {
                        // Play random fart sound
                        const randomIndex = Math.floor(Math.random() * this.fartSounds.length);
                        this.fartSounds[randomIndex].currentTime = 0; // Reset sound to start
                        this.fartSounds[randomIndex].play();
                    } else {
                        // Play whoosh sound
                        this.whooshSound.currentTime = 0; // Reset sound to start
                        this.whooshSound.play();
                    }
                    break;
                case this.GameState.END:
                    this.setState(this.GameState.READY);
                    break;
            }
        };
        
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            
            if (this.isOnTitleScreen) {
                const btn = this.titleScreenElements.startButton;
                if (clickX >= btn.x && 
                    clickX <= btn.x + btn.width &&
                    clickY >= btn.y && 
                    clickY <= btn.y + btn.height) {
                    this.startGameFromTitle();
                }
                return;
            }
            
            if (this.levelComplete) {
                if (clickX >= this.continueButton.x && 
                    clickX <= this.continueButton.x + this.continueButton.width &&
                    clickY >= this.continueButton.y && 
                    clickY <= this.continueButton.y + this.continueButton.height) {
                    this.startLevel(this.currentLevel + 1);
                }
            } else if (this.gameOver) {
                if (clickX >= this.restartButton.x && 
                    clickX <= this.restartButton.x + this.restartButton.width &&
                    clickY >= this.restartButton.y && 
                    clickY <= this.restartButton.y + this.restartButton.height) {
                    this.restart();
                }
            } else if (!this.gameStarted) {
                if (clickX >= this.startButton.x && 
                    clickX <= this.startButton.x + this.startButton.width &&
                    clickY >= this.startButton.y && 
                    clickY <= this.startButton.y + this.startButton.height) {
                    handleInput();
                }
            } else {
                handleInput();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                if (this.levelComplete) {
                    this.startLevel(this.currentLevel + 1);
                } else if (this.gameOver) {
                    this.restart();
                } else if (!this.gameStarted) {
                    handleInput();
                } else {
                    handleInput();
                }
            }
        });
    }
    
    restart() {
        this.resetBirdPosition();
        this.pipes = [];
        this.lastPipe = 0;
        this.score = 0;
        this.setState(this.GameState.READY);
    }
    
    update() {
        // Always update animation frames
        const currentTime = Date.now();
        if (currentTime - this.spriteAnimation.lastFrameTime > this.spriteAnimation.frameInterval) {
            this.spriteAnimation.currentFrame = (this.spriteAnimation.currentFrame + 1) % this.spriteAnimation.totalFrames;
            this.spriteAnimation.lastFrameTime = currentTime;
        }
        
        // Only update game logic in PLAYING state
        if (!this.isState(this.GameState.PLAYING)) return;
        
        // Scroll ground texture
        if (this.groundLoaded) {
            this.groundOffset -= this.currentSpeed;
            if (this.groundOffset <= -this.groundImg.width) {
                this.groundOffset = 0;
            }
        }

        // Apply gravity and update bird position
        this.bird.velocity += this.bird.gravity;
        this.bird.y += this.bird.velocity;
        
        // Check ground collision
        if (this.bird.y + this.bird.size > this.canvas.height - 50) {
            this.bird.y = this.canvas.height - 50 - this.bird.size;
            this.setState(this.GameState.END);
            return;
        }
        
        // Check ceiling collision
        if (this.bird.y < 0) {
            this.bird.y = 0;
            this.setState(this.GameState.END);
            return;
        }

        const now = Date.now();
        
        // Generate new pipes
        if (now - this.lastPipe > this.pipeInterval) {
            const pipeY = Math.random() * (this.canvas.height - this.pipeGap - 100) + 50;
            this.pipes.push({
                x: this.canvas.width,
                y: pipeY,
                scored: false
            });
            this.lastPipe = now;
        }
        
        // Update pipes
        this.pipes.forEach((pipe, index) => {
            pipe.x -= this.currentSpeed;
            
            // Check for score
            if (!pipe.scored && pipe.x + this.pipeWidth < this.bird.x) {
                pipe.scored = true;
                this.score++;
            }
            
            // Check for collisions
            if (this.checkCollision(pipe)) {
                this.setState(this.GameState.END);
                return;
            }
        });
        
        // Remove off-screen pipes
        this.pipes = this.pipes.filter(pipe => pipe.x + this.pipeWidth > 0);
    }
    
    startLevel(levelNumber) {
        this.currentLevel = levelNumber;
        this.levelScore = 0;
        
        // Scale difficulty with level
        this.currentSpeed = this.baseSpeed * (1 + (levelNumber - 1) * this.speedIncreasePerLevel);
        
        // Reset game state
        this.bird = {
            x: this.canvas.width * 0.2,
            y: this.canvas.height * 0.4,
            velocity: 0,
            gravity: this.canvas.height * 0.0004,
            jump: this.canvas.height * -0.012,
            size: this.canvas.width * 0.12
        };
        this.pipes = [];
        this.lastPipe = 0;
        this.gameStarted = true;
        this.gameOver = false;
        this.levelComplete = false;
        
        this.bosses = [];
        this.bossHasAppeared = false;
        
        this.flashEffect.active = false;
        this.flashEffect.currentFrame = 0;
        
        cancelAnimationFrame(this.animationFrame);
        this.gameLoopStarted = true;
        this.gameLoop();
    }
    
    checkCollision(pipe) {
        const birdBox = {
            left: this.bird.x,
            right: this.bird.x + this.bird.size,
            top: this.bird.y,
            bottom: this.bird.y + this.bird.size
        };
        
        // Top pipe
        const topPipeBox = {
            left: pipe.x,
            right: pipe.x + this.pipeWidth,
            top: 0,
            bottom: pipe.y
        };
        
        // Bottom pipe
        const bottomPipeBox = {
            left: pipe.x,
            right: pipe.x + this.pipeWidth,
            top: pipe.y + this.pipeGap,
            bottom: this.canvas.height
        };
        
        return this.checkBoxCollision(birdBox, topPipeBox) || 
               this.checkBoxCollision(birdBox, bottomPipeBox);
    }
    
    checkBoxCollision(box1, box2) {
        return box1.left < box2.right &&
               box1.right > box2.left &&
               box1.top < box2.bottom &&
               box1.bottom > box2.top;
    }
    
    draw() {
        if (!this.spriteLoaded) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        switch (this.currentState) {
            case this.GameState.TITLE:
                this.drawTitleScreen();
                break;
                
            case this.GameState.READY:
                this.drawGameBackground();
                this.drawBird();
                this.drawReadyOverlay();
                break;
                
            case this.GameState.PLAYING:
                this.drawGameBackground();
                this.drawPipes();
                this.drawBird();
                this.drawHUD();
                break;
                
            case this.GameState.END:
                this.drawGameBackground();
                this.drawPipes();
                this.drawBird();
                this.drawGameOverOverlay();
                break;
        }
    }
    
    // Main game loop
    gameLoop() {
        this.update();
        this.draw();
        this.animationFrame = requestAnimationFrame(() => this.gameLoop());
    }
    
    // Create a themed button with stone texture and glow effects
    drawDungeonButton(x, y, width, height, text) {
        this.ctx.save();
        
        // Add orange glow
        this.ctx.shadowColor = '#ff4400';
        this.ctx.shadowBlur = 20;
        
        // Create stone texture
        this.ctx.fillStyle = '#2C2F33';
        this.ctx.fillRect(x, y, width, height);
        
        // Add vertical lines for depth
        this.ctx.fillStyle = '#23272A';
        for (let i = 0; i < width; i += 20) {
            this.ctx.fillRect(x + i, y, 2, height);
        }
        
        // Add raised border
        this.ctx.fillStyle = '#4A4D50';
        this.ctx.fillRect(x - 2, y - 2, width + 4, 4);
        this.ctx.fillRect(x - 2, y + height - 2, width + 4, 4);
        this.ctx.fillRect(x - 2, y, 4, height);
        this.ctx.fillRect(x + width - 2, y, 4, height);
        
        // Add glowing text
        this.ctx.fillStyle = '#fff';
        this.ctx.font = `bold ${this.canvas.width * 0.06}px ${this.gameFont}`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(text, x + width/2, y + height/2);
        
        this.ctx.restore();
    }

    // Add new method to handle title screen transition
    startGameFromTitle() {
        const fadeOut = () => {
            this.titleScreenAlpha -= 0.05;
            if (this.titleScreenAlpha > 0) {
                requestAnimationFrame(fadeOut);
            } else {
                this.setState(this.GameState.READY);
            }
        };
        fadeOut();
    }

    // Add new method for drawing title screen
    drawTitleScreen() {
        // Draw sky background first if loaded
        if (this.skyBgLoaded) {
            this.ctx.drawImage(
                this.skyBgImg,
                0, 0,
                this.canvas.width,
                this.canvas.height
            );
        } else {
            // Fallback to gradient if sky image isn't loaded
            const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
            gradient.addColorStop(0, '#87CEEB');
            gradient.addColorStop(1, '#4A90E2');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        // Draw title background image if loaded
        if (this.titleBgLoaded) {
            const bgWidth = this.canvas.width;
            const bgHeight = this.canvas.height * 0.4;
            const bgY = this.canvas.height - bgHeight;
            
            this.ctx.drawImage(
                this.titleBgImg,
                0, bgY,
                bgWidth,
                bgHeight
            );
        }
        
        // Draw decorative clouds if loaded
        this.clouds.forEach((cloud, index) => {
            if (cloud.loaded) {
                const cloudWidth = this.canvas.width * 0.3;
                const aspectRatio = cloud.height / cloud.width;
                const cloudHeight = cloudWidth * aspectRatio;
                
                const x = (index * (this.canvas.width / 3)) - 50;
                const y = (index % 2) * this.canvas.height * 0.2;
                
                this.ctx.globalAlpha = 0.8;
                this.ctx.drawImage(cloud, x, y, cloudWidth, cloudHeight);
                this.ctx.globalAlpha = 1;
            }
        });
        
        // Apply fade effect
        this.ctx.fillStyle = `rgba(0, 0, 0, ${1 - this.titleScreenAlpha})`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.titleLogoLoaded) {
            // Animate logo
            const logo = this.titleScreenElements.logo;
            logo.width = this.canvas.width * 0.8;
            logo.height = logo.width * (this.titleLogoImg.height / this.titleLogoImg.width);
            logo.x = (this.canvas.width - logo.width) / 2;
            logo.y = this.canvas.height * 0.35;
            
            // Draw logo with slight bounce effect
            const bounce = Math.sin(Date.now() / 1000) * 5;
            this.ctx.drawImage(
                this.titleLogoImg,
                logo.x,
                logo.y + bounce,
                logo.width,
                logo.height
            );
        }
        
        // Draw title flatchy
        if (this.titleFlatchyLoaded) {
            const flatchyWidth = this.canvas.width * 0.4;
            const aspectRatio = this.titleFlatchyImg.height / this.titleFlatchyImg.width;
            const flatchyHeight = flatchyWidth * aspectRatio;
            const flatchyX = (this.canvas.width - flatchyWidth) / 2 - (this.canvas.width * 0.05);
            const flatchyY = this.canvas.height * 0.7;
            
            // Add floating animation
            const float = Math.sin(Date.now() / 800) * 8;
            
            this.ctx.drawImage(
                this.titleFlatchyImg,
                flatchyX,
                flatchyY + float,
                flatchyWidth,
                flatchyHeight
            );
        }
        
        if (this.startBtnLoaded) {
            // Setup start button
            const btn = this.titleScreenElements.startButton;
            btn.width = this.canvas.width * 0.5;
            btn.height = btn.width * (this.startBtnImg.height / this.startBtnImg.width);
            btn.x = (this.canvas.width - btn.width) / 2;
            btn.y = this.canvas.height * 0.48;
            
            // Draw button without animation
            this.ctx.drawImage(
                this.startBtnImg,
                btn.x,
                btn.y,
                btn.width,
                btn.height
            );
        }
    }

    // Add state machine methods
    setState(newState) {
        const oldState = this.currentState;
        this.currentState = newState;
        
        // Handle state exit
        switch (oldState) {
            case this.GameState.TITLE:
                this.titleScreenAlpha = 0;
                break;
            case this.GameState.READY:
                // Clean up ready state
                break;
            case this.GameState.PLAYING:
                // Clean up playing state
                break;
            case this.GameState.END:
                // Clean up end state
                break;
        }
        
        // Handle state enter
        switch (newState) {
            case this.GameState.TITLE:
                this.titleScreenAlpha = 1;
                break;
            case this.GameState.READY:
                this.resetBirdPosition();
                break;
            case this.GameState.PLAYING:
                this.pipes = [];
                this.score = 0;
                // Make sure game loop is running
                if (!this.gameLoopStarted) {
                    this.gameLoopStarted = true;
                    this.gameLoop();
                }
                break;
            case this.GameState.END:
                // Setup end state
                break;
        }
    }
    
    isState(state) {
        return this.currentState === state;
    }
    
    // Helper method to reset bird position
    resetBirdPosition() {
        this.bird = {
            x: this.canvas.width * 0.2,
            y: this.canvas.height * 0.4,
            velocity: 0,
            gravity: this.canvas.height * 0.0004,
            jump: this.canvas.height * -0.012,
            size: this.canvas.width * 0.12
        };
    }

    drawGameBackground() {
        // Draw sky background
        if (this.skyBgLoaded) {
            this.ctx.drawImage(
                this.skyBgImg,
                0, 0,
                this.canvas.width,
                this.canvas.height
            );
        }
        
        // Draw background with proper scaling
        if (this.backgroundLoaded) {
            const scale = Math.max(
                this.canvas.width / this.backgroundImg.width,
                this.canvas.height / this.backgroundImg.height
            );
            const width = this.backgroundImg.width * scale;
            const height = this.backgroundImg.height * scale;
            const x = (this.canvas.width - width) / 2;
            const y = (this.canvas.height - height) / 2;
            
            this.ctx.drawImage(this.backgroundImg, x, y, width, height);
        }

        // Draw ground
        if (this.groundLoaded) {
            const y = this.canvas.height - 50;
            this.ctx.drawImage(
                this.groundImg,
                this.groundOffset, y,
                this.groundImg.width, 50
            );
            this.ctx.drawImage(
                this.groundImg,
                this.groundOffset + this.groundImg.width, y,
                this.groundImg.width, 50
            );
        }
    }

    drawBird() {
        this.ctx.save();
        
        // Tilt bird based on velocity (only if game is started)
        let rotation = 0;
        if (this.isState(this.GameState.PLAYING)) {
            if (this.bird.velocity < 0) {
                rotation = -0.2;
            } else if (this.bird.velocity > 0) {
                rotation = 0.2;
            }
        }
        
        this.ctx.translate(this.bird.x + this.bird.size/2, this.bird.y + this.bird.size/2);
        this.ctx.rotate(rotation);
        
        // Select sprite frame
        let column = this.spriteAnimation.currentFrame % this.spriteAnimation.framesPerRow;
        let row = Math.floor(this.spriteAnimation.currentFrame / this.spriteAnimation.framesPerRow);
        
        this.ctx.drawImage(
            this.birdSprite,
            column * this.spriteAnimation.frameWidth,
            row * this.spriteAnimation.frameHeight,
            this.spriteAnimation.frameWidth,
            this.spriteAnimation.frameHeight,
            -this.bird.size/2,
            -this.bird.size/2,
            this.bird.size,
            this.bird.size
        );
        
        this.ctx.restore();
    }

    drawReadyOverlay() {
        // Draw "GET READY!" text
        if (this.getReadyLoaded) {
            const textWidth = this.canvas.width * 0.7;
            const aspectRatio = this.getReadyImg.height / this.getReadyImg.width;
            const textHeight = textWidth * aspectRatio;
            
            this.ctx.drawImage(
                this.getReadyImg,
                (this.canvas.width - textWidth) / 2,
                this.canvas.height * 0.25,
                textWidth,
                textHeight
            );
        }
        
        // Draw tap text next to bird
        if (this.tapTextLoaded) {
            const tapWidth = this.canvas.width * 0.2;
            const aspectRatio = this.tapTextImg.height / this.tapTextImg.width;
            const tapHeight = tapWidth * aspectRatio;
            
            const tapX = this.bird.x + this.bird.size + (this.canvas.width * 0.05);
            const tapY = this.bird.y + (this.bird.size / 2) - (tapHeight / 2);
            
            this.ctx.drawImage(
                this.tapTextImg,
                tapX,
                tapY,
                tapWidth,
                tapHeight
            );
        }
    }

    drawPipes() {
        this.pipes.forEach(pipe => {
            if (this.treeLoaded) {
                // Draw bottom tree
                this.ctx.drawImage(
                    this.treeImg,
                    0, 0,
                    this.treeImg.width, this.treeImg.height,
                    pipe.x + 1, pipe.y + this.pipeGap,
                    this.pipeWidth, this.canvas.height - (pipe.y + this.pipeGap)
                );
                
                // Draw top tree (flipped)
                this.ctx.save();
                this.ctx.translate(pipe.x + this.pipeWidth/2, pipe.y);
                this.ctx.scale(1, -1);
                this.ctx.drawImage(
                    this.treeImg,
                    0, 0,
                    this.treeImg.width, this.treeImg.height,
                    -this.pipeWidth/2 + 1, 0,
                    this.pipeWidth, pipe.y
                );
                this.ctx.restore();
            }
        });
    }

    drawHUD() {
        // Draw score
        this.ctx.fillStyle = '#fff';
        this.ctx.font = `bold ${this.canvas.width * 0.06}px ${this.gameFont}`;
        this.ctx.textAlign = 'center';
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 3;
        this.ctx.strokeText(this.score.toString(), this.canvas.width / 2, 50);
        this.ctx.fillText(this.score.toString(), this.canvas.width / 2, 50);
    }

    drawGameOverOverlay() {
        // Draw "GAME OVER" text
        if (this.gameOverImgLoaded) {
            const textWidth = this.canvas.width * 0.7;
            const aspectRatio = this.gameOverImg.height / this.gameOverImg.width;
            const textHeight = textWidth * aspectRatio;
            
            this.ctx.drawImage(
                this.gameOverImg,
                (this.canvas.width - textWidth) / 2,
                this.canvas.height * 0.3,
                textWidth,
                textHeight
            );
        }

        // Draw score
        this.ctx.fillStyle = '#fff';
        this.ctx.font = `bold ${this.canvas.width * 0.08}px ${this.gameFont}`;
        this.ctx.textAlign = 'center';
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 3;
        this.ctx.strokeText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height * 0.5);
        this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height * 0.5);

        // Draw restart button
        if (this.plainBtnLoaded) {
            const btnWidth = this.canvas.width * 0.4;
            const aspectRatio = this.plainBtnImg.height / this.plainBtnImg.width;
            const btnHeight = btnWidth * aspectRatio;
            
            this.restartButton.width = btnWidth;
            this.restartButton.height = btnHeight;
            this.restartButton.x = (this.canvas.width - btnWidth) / 2;
            this.restartButton.y = this.canvas.height * 0.6;
            
            this.ctx.drawImage(
                this.plainBtnImg,
                this.restartButton.x,
                this.restartButton.y,
                btnWidth,
                btnHeight
            );

            this.ctx.fillStyle = '#000000';
            this.ctx.font = `bold ${this.canvas.width * 0.05}px ${this.gameFont}`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(
                'Restart',
                this.restartButton.x + (btnWidth/2),
                this.restartButton.y + (btnHeight/2)
            );
        }
    }
} 