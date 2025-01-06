class FlappyBird {
    constructor() {
        // Define game states
        this.GameState = {
            TITLE: 'title',
            READY: 'ready',
            PLAYING: 'playing',
            DEAD: 'dead',
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
        this.birdSprite.src = 'images/flatchy/flatchy_flap_sprite.png';

        // Load background assets
        this.backgroundImg = new Image();
        this.backgroundImg.onload = () => {
            this.backgroundLoaded = true;
            this.backgroundAspectRatio = this.backgroundImg.height / this.backgroundImg.width;
        };
        this.backgroundImg.src = 'images/game/hills.png';
        this.backgroundLoaded = false;

        this.groundImg = new Image();
        this.groundImg.onload = () => {
            this.groundLoaded = true;
        };
        this.groundImg.src = 'images/game/ground.png';
        this.groundLoaded = false;
        this.groundOffset = 0;

        this.treeImg = new Image();
        this.treeImg.onload = () => {
            this.treeLoaded = true;
        };
        this.treeImg.src = 'images/game/tree.png';
        this.treeLoaded = false;

        // Load feather trail effects
        this.feather1 = new Image();
        this.feather1.onload = () => {
            this.feather1Loaded = true;
        };
        this.feather1.src = 'images/flatchy/feather_1.png';
        this.feather1Loaded = false;

        this.feather2 = new Image();
        this.feather2.onload = () => {
            this.feather2Loaded = true;
        };
        this.feather2.src = 'images/flatchy/feather_2.png';
        this.feather2Loaded = false;

        this.feather3 = new Image();
        this.feather3.onload = () => {
            this.feather3Loaded = true;
        };
        this.feather3.src = 'images/flatchy/feather_3.png';
        this.feather3Loaded = false;

        this.feather4 = new Image();
        this.feather4.onload = () => {
            this.feather4Loaded = true;
        };
        this.feather4.src = 'images/flatchy/feather_4.png';
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
        
        // Setup bird physics with adjusted values
        this.bird = {
            x: this.canvas.width * 0.2,
            y: this.canvas.height * 0.4,
            velocity: 0,
            gravity: this.canvas.height * 0.00045,
            jump: this.canvas.height * -0.011,
            size: this.canvas.width * 0.19
        };
        
        // Setup game speed and obstacles
        this.baseSpeed = 4.5;
        this.currentSpeed = this.baseSpeed * (1 + (this.startingLevel - 1) * this.speedIncreasePerLevel);
        
        this.logs = [];
        this.logWidth = this.canvas.width * 0.25;
        this.logGap = this.canvas.height * 0.25;
        this.logInterval = 1400;
        this.lastLog = 0;
        
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
            x: 0,
            y: 0,
            width: this.canvas.width * 0.4,
            height: this.canvas.width * 0.4 * 0.25 // Assuming 4:1 aspect ratio for button
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
        
        this.startBtnImg = new Image();
        this.startBtnImg.onload = () => {
            this.startBtnLoaded = true;
        };
        this.startBtnImg.src = 'images/ui/btns/start_btn_up.png';
        this.startBtnLoaded = false;
        
        this.plainBtnImg = new Image();
        this.plainBtnImg.onload = () => {
            this.plainBtnLoaded = true;
        };
        this.plainBtnImg.src = 'images/ui/btns/plain_btn.png';
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

        // Setup feather particle system
        this.featherParticles = [];

        // Load hit sound
        this.hitSound = new Audio('audio/hit.wav');

        // Load end screen background
        this.endBgImg = new Image();
        this.endBgImg.onload = () => {
            this.endBgLoaded = true;
        };
        this.endBgImg.src = 'images/end/end_bg.png';
        this.endBgLoaded = false;
        
        // Load play button
        this.playBtnImg = new Image();
        this.playBtnImg.onload = () => {
            this.playBtnLoaded = true;
        };
        this.playBtnImg.src = 'images/ui/btns/play_btn_up.png';
        this.playBtnLoaded = false;

        // Add end screen animation properties
        this.endScreenAnimation = {
            bgStartY: -this.canvas.height * 0.5,
            bgTargetY: this.canvas.height * 0.2,
            bgCurrentY: -this.canvas.height * 0.5,
            velocity: 0,
            gravity: 0.8,
            bounce: -0.3,
            isAnimating: false,
            startTime: 0,
            animationDuration: 1000 // 1 second
        };

        // Add background parallax scrolling
        this.backgroundOffset = 0;
        this.backgroundScrollSpeed = 0.5; // Half the speed of the main game

        // Add cloud system
        this.cloudSystem = {
            clouds: [],
            minY: 0,
            maxY: this.canvas.height * 0.4,
            minGap: this.canvas.width * 0.5,
            scrollSpeed: 0.3 // Slower than hills
        };

        // Initialize some clouds
        this.initializeClouds();

        // Load click sound
        this.clickSound = new Audio('audio/click.wav');

        // Add best score tracking
        this.bestScore = 0;

        // Load medal images
        this.medal1Img = new Image();
        this.medal1Img.onload = () => {
            this.medal1Loaded = true;
        };
        this.medal1Img.src = 'images/end/medal_1.png';
        
        this.medal2Img = new Image();
        this.medal2Img.onload = () => {
            this.medal2Loaded = true;
        };
        this.medal2Img.src = 'images/end/medal_2.png';
        
        this.medal3Img = new Image();
        this.medal3Img.onload = () => {
            this.medal3Loaded = true;
        };
        this.medal3Img.src = 'images/end/medal_3.png';

        // Add medal state
        this.currentMedal = null;
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
                    // Play click for title screen button
                    this.clickSound.currentTime = 0;
                    this.clickSound.play();
                    this.setState(this.GameState.READY);
                    break;
                    
                case this.GameState.READY:
                    this.setState(this.GameState.PLAYING);
                    break;
                    
                case this.GameState.PLAYING:
            this.bird.velocity = this.bird.jump;
                    
                    // Play either whoosh or fart sound (35% chance for fart)
                    if (Math.random() < 0.35) {
                        const randomIndex = Math.floor(Math.random() * this.fartSounds.length);
                        this.fartSounds[randomIndex].currentTime = 0;
                        this.fartSounds[randomIndex].play();
                        this.createFeatherBurst();
                    } else {
                        this.whooshSound.currentTime = 0;
                        this.whooshSound.play();
                    }
                    break;
                    
                case this.GameState.END:
                    // Play click for end screen button
                    this.clickSound.currentTime = 0;
                    this.clickSound.play();
                    this.setState(this.GameState.READY);
                    break;
            }
        };
        
        // Handle both mouse clicks and touch events
        const handleInteraction = (e) => {
            e.preventDefault();
            
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            
            const clickX = ((e.touches ? e.touches[0].clientX : e.clientX) - rect.left) * scaleX;
            const clickY = ((e.touches ? e.touches[0].clientY : e.clientY) - rect.top) * scaleY;
            
            switch (this.currentState) {
                case this.GameState.TITLE:
                    // Check if click is on start button
                    const titleBtn = this.titleScreenElements.startButton;
                    if (clickX >= titleBtn.x && 
                        clickX <= titleBtn.x + titleBtn.width &&
                        clickY >= titleBtn.y && 
                        clickY <= titleBtn.y + titleBtn.height) {
                        handleInput();
                    }
                    break;
                    
                case this.GameState.READY:
                    handleInput();
                    break;
                    
                case this.GameState.PLAYING:
                    handleInput();
                    break;
                    
                case this.GameState.END:
                    // Check if click is on play button
                    if (!this.endScreenAnimation.isAnimating && 
                        this.playBtnLoaded && 
                        clickX >= this.restartButton.x && 
                    clickX <= this.restartButton.x + this.restartButton.width &&
                    clickY >= this.restartButton.y && 
                    clickY <= this.restartButton.y + this.restartButton.height) {
                    handleInput();
                }
                    break;
            }
        };

        this.canvas.addEventListener('click', handleInteraction);
        this.canvas.addEventListener('touchstart', handleInteraction);
        
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                handleInput(); // Always use handleInput for consistency
            }
        });
    }
    
    restart() {
        this.resetBirdPosition();
        this.logs = [];
        this.lastLog = 0;
        this.score = 0;
        this.setState(this.GameState.READY);
    }
    
    update() {
        // Always update animation frames except in DEAD state
        if (!this.isState(this.GameState.DEAD)) {
        const currentTime = Date.now();
        if (currentTime - this.spriteAnimation.lastFrameTime > this.spriteAnimation.frameInterval) {
            this.spriteAnimation.currentFrame = (this.spriteAnimation.currentFrame + 1) % this.spriteAnimation.totalFrames;
            this.spriteAnimation.lastFrameTime = currentTime;
            }
        }

        // Update scrolling for READY and PLAYING states only
        if (this.isState(this.GameState.READY) || this.isState(this.GameState.PLAYING)) {
            // Scroll ground texture with consistent speed
        if (this.groundLoaded) {
                this.groundOffset -= this.baseSpeed * 1.2; // Reduced from 1.5 to 1.2
            if (this.groundOffset <= -this.groundImg.width) {
                this.groundOffset = 0;
            }
        }

            // Update background position for parallax with slower speed
            if (this.backgroundLoaded) {
                this.backgroundOffset -= this.baseSpeed * this.backgroundScrollSpeed;
                if (this.backgroundOffset <= -this.backgroundImg.width * 0.6) {
                    this.backgroundOffset = 0;
                }
            }
        }

        // Only handle logs in PLAYING state
        if (this.isState(this.GameState.PLAYING)) {
        const now = Date.now();
            
            // Generate new logs
            if (now - this.lastLog > this.logInterval) {
                const screenMiddle = this.canvas.height * 0.5;
                const playableArea = this.canvas.height * 0.5;
                const minY = screenMiddle - (playableArea / 2);
                const maxY = screenMiddle + (playableArea / 2) - this.logGap;
                
                const logY = minY + (Math.random() * (maxY - minY));
                
                this.logs.push({
                x: this.canvas.width,
                    y: logY,
                scored: false
            });
                this.lastLog = now;
            }
            
            // Update logs with slower speed
            this.logs.forEach(log => {
                log.x -= this.baseSpeed; // Reduced from 1.5 to 1 times base speed
                
                if (!log.scored && log.x + this.logWidth < this.bird.x) {
                    log.scored = true;
                this.score++;
                }
                
                if (this.checkCollision(log)) {
                    this.setState(this.GameState.DEAD);
                    return;
                }
            });
            
            // Remove off-screen logs
            this.logs = this.logs.filter(log => log.x + this.logWidth > 0);
            
            // Update bird physics
            this.bird.velocity += this.bird.gravity;
            this.bird.y += this.bird.velocity;
        }

        // Handle DEAD state separately
        if (this.isState(this.GameState.DEAD)) {
            this.bird.velocity += this.bird.gravity * 1.5;
            this.bird.y += this.bird.velocity;
            
            // Transition to END state when bird hits ground
            if (this.bird.y + this.bird.size > this.canvas.height - 50) {
                this.bird.y = this.canvas.height - 50 - this.bird.size;
                this.setState(this.GameState.END);
            }
        }

        // Check ceiling collision in PLAYING state
        if (this.isState(this.GameState.PLAYING)) {
            if (this.bird.y < 0) {
                this.bird.y = 0;
                this.setState(this.GameState.DEAD);
                return;
            }
        }

        // Update feather particles
        this.featherParticles = this.featherParticles.filter(particle => {
            // Update position
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            particle.speedY += particle.gravity;
            
            // Update rotation
            particle.rotation += particle.rotationSpeed;
            
            // Add some horizontal wobble
            particle.x += Math.sin(Date.now() / 500 + particle.rotation) * 0.5;
            
            // Fade out
            particle.opacity -= 0.005;
            
            // Keep particle if it's still visible
            return particle.opacity > 0;
        });

        // Check ground collision in both PLAYING and DEAD states
        if (this.isState(this.GameState.PLAYING) || this.isState(this.GameState.DEAD)) {
            // Ground collision (50px is the height of ground.png)
            if (this.bird.y + this.bird.size > this.canvas.height - 50) {
                this.bird.y = this.canvas.height - 50 - this.bird.size;
                
                if (this.isState(this.GameState.PLAYING)) {
                    // Hit ground while playing - transition to DEAD state
                    this.setState(this.GameState.DEAD);
                    return;
                } else if (this.isState(this.GameState.DEAD)) {
                    // Hit ground while dead - transition to END state
                    this.setState(this.GameState.END);
                    return;
                }
            }
        }

        // Update cloud positions in READY and PLAYING states
        if (this.isState(this.GameState.READY) || this.isState(this.GameState.PLAYING)) {
            // Update clouds
            this.cloudSystem.clouds.forEach((cloud, index) => {
                cloud.x -= this.baseSpeed * this.cloudSystem.scrollSpeed;
                
                // Remove clouds that are off screen
                if (cloud.x < -this.canvas.width * cloud.scale) {
                    this.cloudSystem.clouds.splice(index, 1);
                    // Add new cloud at the right side
                    this.addNewCloud();
                }
            });
        }
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
            gravity: this.canvas.height * 0.00045,
            jump: this.canvas.height * -0.011,
            size: this.canvas.width * 0.19
        };
        this.logs = [];
        this.lastLog = 0;
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
    
    checkCollision(log) {
        // Create a smaller hitbox for the bird (about 75% of visual size)
        const hitboxReduction = this.bird.size * 0.25;
        const birdBox = {
            left: this.bird.x + hitboxReduction,
            right: this.bird.x + this.bird.size - hitboxReduction,
            top: this.bird.y + hitboxReduction,
            bottom: this.bird.y + this.bird.size - hitboxReduction
        };
        
        // Calculate actual log height based on aspect ratio
        const logAspectRatio = this.treeImg.height / this.treeImg.width;
        const logHeight = this.logWidth * logAspectRatio;
        
        // Add padding to log hitbox to match visible trunk (40% padding on each side)
        const logPadding = this.logWidth * 0.4; // Increased from 0.2 to 0.4 to make hitbox even smaller
        
        // Only check collision with the actual trunk parts
        const trunkHeight = logHeight * 0.6; // Only check collision with the trunk portion
        
        // Top log (flipped)
        const topLogBox = {
            left: log.x + logPadding,
            right: log.x + this.logWidth - logPadding,
            top: log.y - trunkHeight, // Only check trunk portion
            bottom: log.y
        };
        
        // Bottom log
        const bottomLogBox = {
            left: log.x + logPadding,
            right: log.x + this.logWidth - logPadding,
            top: log.y + this.logGap,
            bottom: log.y + this.logGap + trunkHeight // Only check trunk portion
        };
        
        return this.checkBoxCollision(birdBox, topLogBox) || 
               this.checkBoxCollision(birdBox, bottomLogBox);
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
                this.drawSkyAndHills();
                this.drawGround();
                this.drawBird();
                this.drawFeatherParticles();
                this.drawReadyOverlay();
                break;
                
            case this.GameState.PLAYING:
                this.drawSkyAndHills();
                this.drawLogs();
                this.drawGround();
                this.drawBird();
                this.drawFeatherParticles();
                this.drawHUD();
                break;
                
            case this.GameState.END:
                this.drawSkyAndHills();
                this.drawLogs();
                this.drawGround();
                this.drawBird();
                this.drawFeatherParticles();
                this.drawGameOverOverlay();
                break;
                
            case this.GameState.DEAD:
                this.drawSkyAndHills();
                this.drawLogs();
                this.drawGround();
                this.drawBird();
                this.drawFeatherParticles();
                this.drawHUD();
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
        }
        
        // Draw clouds
        this.cloudSystem.clouds.forEach(cloud => {
            if (cloud.image && cloud.image.loaded) {
                const cloudWidth = this.canvas.width * 0.3 * cloud.scale;
                const aspectRatio = cloud.image.height / cloud.image.width;
                const cloudHeight = cloudWidth * aspectRatio;
                
                this.ctx.globalAlpha = 0.8;
                this.ctx.drawImage(
                    cloud.image,
                    cloud.x,
                    cloud.y,
                    cloudWidth,
                    cloudHeight
                );
                this.ctx.globalAlpha = 1;
            }
        });

        // Draw hills using same positioning as game state
        if (this.backgroundLoaded) {
            const displayWidth = this.backgroundImg.width * 0.6;
            const displayHeight = displayWidth * (this.backgroundImg.height / this.backgroundImg.width);
            const y = this.canvas.height - displayHeight - 10;
            
            for (let i = 0; i < 3; i++) {
                const x = Math.floor(this.backgroundOffset + (displayWidth * i));
                this.ctx.drawImage(
                    this.backgroundImg,
                    x, y,
                    displayWidth + 1,
                    displayHeight
                );
            }
        }

        // Draw ground using same positioning as game state
        if (this.groundLoaded) {
            const groundY = this.canvas.height - 50;
            const groundHeight = 50;
            const groundWidth = groundHeight * (this.groundImg.width / this.groundImg.height);
            
            for (let x = Math.floor(this.groundOffset); x < this.canvas.width + groundWidth; x += groundWidth) {
            this.ctx.drawImage(
                this.groundImg,
                    x, groundY,
                    groundWidth + 1,
                    groundHeight
                );
            }
        }
        
        // Draw title logo higher
        if (this.titleLogoLoaded) {
            // Animate logo
            const logo = this.titleScreenElements.logo;
            logo.width = this.canvas.width * 0.8;
            logo.height = logo.width * (this.titleLogoImg.height / this.titleLogoImg.width);
            logo.x = (this.canvas.width - logo.width) / 2;
            logo.y = this.canvas.height * 0.25; // Changed from 0.35 to 0.25 to move logo higher
            
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
                this.logs = [];
                this.score = 0;
                // Make sure game loop is running
                if (!this.gameLoopStarted) {
                    this.gameLoopStarted = true;
                    this.gameLoop();
                }
                break;
            case this.GameState.DEAD:
                // Play hit sound when entering dead state
                this.hitSound.currentTime = 0;
                this.hitSound.play();
                break;
            case this.GameState.END:
                // Determine medal when entering end state
                const isNewBest = this.score > this.bestScore;
                if (isNewBest) {
                    this.currentMedal = this.medal3Img;
                } else if (this.score > 3) {
                    this.currentMedal = this.medal2Img;
                } else {
                    this.currentMedal = this.medal1Img;
                }
                
                // Update best score after determining medal
                this.bestScore = Math.max(this.score, this.bestScore);
                
                // Reset and start end screen animation with higher position
                this.endScreenAnimation.bgStartY = -this.canvas.height * 0.5;
                this.endScreenAnimation.bgTargetY = this.canvas.height * 0.1; // Changed from 0.2 to 0.1
                this.endScreenAnimation.bgCurrentY = this.endScreenAnimation.bgStartY;
                this.endScreenAnimation.velocity = 0;
                this.endScreenAnimation.isAnimating = true;
                this.endScreenAnimation.startTime = Date.now();
                
                // Position restart button initially - moved higher
                const btnWidth = this.canvas.width * 0.4;
                const aspectRatio = this.playBtnImg ? (this.playBtnImg.height / this.playBtnImg.width) : 0.25;
                const btnHeight = btnWidth * aspectRatio;
                
                this.restartButton = {
                    x: (this.canvas.width - btnWidth) / 2,
                    y: this.canvas.height * 0.45, // Changed from 0.55 to 0.45
                    width: btnWidth,
                    height: btnHeight
                };
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
            gravity: this.canvas.height * 0.00045,
            jump: this.canvas.height * -0.011,
            size: this.canvas.width * 0.19
        };
    }

    drawSkyAndHills() {
        // Draw sky background (static)
        if (this.skyBgLoaded) {
                this.ctx.drawImage(
                this.skyBgImg,
                0, 0,
                this.canvas.width,
                this.canvas.height
            );
        }

        // Draw clouds
        this.cloudSystem.clouds.forEach(cloud => {
            if (cloud.image && cloud.image.loaded) {
                const cloudWidth = this.canvas.width * 0.3 * cloud.scale;
                const aspectRatio = cloud.image.height / cloud.image.width;
                const cloudHeight = cloudWidth * aspectRatio;
                
                this.ctx.globalAlpha = 0.8;
                this.ctx.drawImage(
                    cloud.image,
                    cloud.x,
                    cloud.y,
                    cloudWidth,
                    cloudHeight
                );
                this.ctx.globalAlpha = 1;
            }
        });
        
        // Draw scrolling background hills with parallax
        if (this.backgroundLoaded) {
            // Calculate dimensions first
            const displayWidth = this.backgroundImg.width * 0.6;
            const displayHeight = displayWidth * (this.backgroundImg.height / this.backgroundImg.width);
            const y = this.canvas.height - displayHeight - 10; // Changed from -15 to -10 to move hills down more
            
            // Draw copies for seamless scrolling - remove 1px gap between images
            for (let i = 0; i < 3; i++) {
                const x = Math.floor(this.backgroundOffset + (displayWidth * i));
                this.ctx.drawImage(
                    this.backgroundImg,
                    x, y,
                    displayWidth + 1,
                    displayHeight
                );
            }
        }
    }

    drawGround() {
        if (this.groundLoaded) {
            const groundY = this.canvas.height - 50;
            const groundHeight = 50;
            const groundWidth = groundHeight * (this.groundImg.width / this.groundImg.height);
            
            // Draw multiple copies of the ground to fill the width, adding 1px overlap
            for (let x = Math.floor(this.groundOffset); x < this.canvas.width + groundWidth; x += groundWidth) {
                this.ctx.drawImage(
                    this.groundImg,
                    x, groundY,
                    groundWidth + 1, // Add 1px overlap to prevent gaps
                    groundHeight
                );
            }
        }
    }

    drawBird() {
            this.ctx.save();
        
        // Calculate bird dimensions maintaining aspect ratio
        const birdWidth = this.bird.size;
        const birdHeight = birdWidth * (this.spriteAnimation.frameHeight / this.spriteAnimation.frameWidth);
        
        // Tilt bird based on state
        let rotation = 0;
        if (this.isState(this.GameState.PLAYING)) {
            rotation = -0.25; // Reduced from -0.4 to -0.25 for a more subtle upward tilt
        } else if (this.isState(this.GameState.DEAD) || this.isState(this.GameState.END)) {
            rotation = Math.min(Math.PI / 2, this.bird.velocity * 0.1);
        }
        
        this.ctx.translate(this.bird.x + birdWidth/2, this.bird.y + birdHeight/2);
            this.ctx.rotate(rotation);
            
            // Select sprite frame
            let column, row;
        if (this.isState(this.GameState.DEAD) || this.isState(this.GameState.END)) {
                column = 5;
                row = 1;
            } else {
                column = this.spriteAnimation.currentFrame % this.spriteAnimation.framesPerRow;
                row = Math.floor(this.spriteAnimation.currentFrame / this.spriteAnimation.framesPerRow);
            }
            
            this.ctx.drawImage(
                this.birdSprite,
                column * this.spriteAnimation.frameWidth,
                row * this.spriteAnimation.frameHeight,
                this.spriteAnimation.frameWidth,
                this.spriteAnimation.frameHeight,
            -birdWidth/2,
            -birdHeight/2,
            birdWidth,
            birdHeight
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
        
        // Draw tap text next to bird - moved further right
        if (this.tapTextLoaded) {
            const tapWidth = this.canvas.width * 0.2;
            const aspectRatio = this.tapTextImg.height / this.tapTextImg.width;
            const tapHeight = tapWidth * aspectRatio;
            
            const tapX = this.bird.x + this.bird.size + (this.canvas.width * 0.15); // Increased from 0.1 to 0.15
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

    drawLogs() {
        this.logs.forEach(log => {
            if (this.treeLoaded) {
                const aspectRatio = this.treeImg.height / this.treeImg.width;
                const logHeight = this.logWidth * aspectRatio;
                
                // Draw bottom log (extending below screen if needed)
                this.ctx.drawImage(
                    this.treeImg,
                    0, 0,
                    this.treeImg.width, this.treeImg.height,
                    log.x + 1, log.y + this.logGap,
                    this.logWidth, logHeight
                );
                
                // Draw top log (flipped and extending above screen if needed)
                this.ctx.save();
                this.ctx.translate(log.x + this.logWidth/2, log.y);
                this.ctx.scale(1, -1);
                this.ctx.drawImage(
                    this.treeImg,
                    0, 0,
                    this.treeImg.width, this.treeImg.height,
                    -this.logWidth/2 + 1, 0,
                    this.logWidth, logHeight
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
        if (this.endBgLoaded) {
            // Increased width and adjusted position
            const bgWidth = this.canvas.width * 0.9; // Changed from 0.8 to 0.9
            const aspectRatio = this.endBgImg.height / this.endBgImg.width;
            const bgHeight = bgWidth * aspectRatio;
            
            // Update animation with higher target position
            if (this.endScreenAnimation.isAnimating) {
                // Apply gravity
                this.endScreenAnimation.velocity += this.endScreenAnimation.gravity;
                this.endScreenAnimation.bgCurrentY += this.endScreenAnimation.velocity;
                
                // Check for bounce at new target position
                if (this.endScreenAnimation.bgCurrentY > this.endScreenAnimation.bgTargetY) {
                    this.endScreenAnimation.bgCurrentY = this.endScreenAnimation.bgTargetY;
                    this.endScreenAnimation.velocity *= this.endScreenAnimation.bounce;
                    
                    // Stop animation when bounce is small enough
                    if (Math.abs(this.endScreenAnimation.velocity) < 0.5) {
                        this.endScreenAnimation.isAnimating = false;
                        this.endScreenAnimation.bgCurrentY = this.endScreenAnimation.bgTargetY;
                    }
                }
            }
            
            // Draw background with current animated position
            this.ctx.drawImage(
                this.endBgImg,
                (this.canvas.width - bgWidth) / 2,
                this.endScreenAnimation.bgCurrentY,
                bgWidth,
                bgHeight
            );
            
            // Draw scores when animation is complete
            if (!this.endScreenAnimation.isAnimating) {
                // Draw medal if loaded
                if (this.currentMedal && this.currentMedal.complete) {
                    const medalSize = this.canvas.width * 0.15;
                    const medalX = this.canvas.width * 0.25;
                    const medalY = this.endScreenAnimation.bgCurrentY + bgHeight * 0.35;
                
                this.ctx.drawImage(
                        this.currentMedal,
                        medalX,
                        medalY,
                        medalSize,
                        medalSize
                    );
                }
                
                // Set up text properties
                this.ctx.fillStyle = '#000';
                this.ctx.font = `bold ${this.canvas.width * 0.08}px ${this.gameFont}`;
                this.ctx.textAlign = 'right';
                
                // Draw current score (SCORE)
                this.ctx.fillText(
                    this.score.toString(),
                    this.canvas.width * 0.75,
                    this.endScreenAnimation.bgCurrentY + bgHeight * 0.42
                );
                
                // Draw best score (BEST) - moved slightly right
                this.ctx.fillText(
                    this.bestScore.toString(),
                    this.canvas.width * 0.77, // Increased from 0.75 to 0.77
                    this.endScreenAnimation.bgCurrentY + bgHeight * 0.35 + 100
                );
            }
            
            // Draw play button - using same dimensions as start button
            if (this.playBtnLoaded) {
                const btnWidth = this.canvas.width * 0.5; // Changed from 0.4 to 0.5 to match start button
                const aspectRatio = this.playBtnImg.height / this.playBtnImg.width;
                const btnHeight = btnWidth * aspectRatio;
                
                // Calculate button position based on animation
                const baseY = this.canvas.height * 0.45;
                const buttonY = this.endScreenAnimation.isAnimating ? 
                    baseY + (this.endScreenAnimation.bgCurrentY - this.endScreenAnimation.bgTargetY) : 
                    baseY;

                // Update hitbox position
                const buttonX = (this.canvas.width - btnWidth) / 2;
                
                // Update the restart button hitbox to match final position
                this.restartButton = {
                    x: buttonX,
                    y: this.endScreenAnimation.isAnimating ? buttonY : baseY,
                    width: btnWidth,
                    height: btnHeight
                };
                
                // Draw the play button
                    this.ctx.drawImage(
                    this.playBtnImg,
                    buttonX,
                    buttonY,
                    btnWidth,
                    btnHeight
                );

                // Draw plain button below play button with same dimensions
            if (this.plainBtnLoaded) {
                    const plainBtnY = buttonY + btnHeight + 20; // 20px gap between buttons
                this.ctx.drawImage(
                    this.plainBtnImg,
                        buttonX,
                        plainBtnY,
                    btnWidth,
                    btnHeight
                );
                }
            }
        }
    }

    // Add new method to create feather particles
    createFeatherBurst() {
        const featherImages = [];
        
        // Only add feathers that are loaded
        if (this.feather1Loaded) featherImages.push(this.feather1);
        if (this.feather2Loaded) featherImages.push(this.feather2);
        if (this.feather3Loaded) featherImages.push(this.feather3);
        if (this.feather4Loaded) featherImages.push(this.feather4);
        
        // Only create particles if we have loaded feather images
        if (featherImages.length > 0) {
            const numFeathers = 8; // Increased from 4 to 8 feathers per burst
            
            for (let i = 0; i < numFeathers; i++) {
                // Randomly select a feather image
                const randomFeather = featherImages[Math.floor(Math.random() * featherImages.length)];
                
                // Calculate bird dimensions (same as in drawBird)
                const birdWidth = this.bird.size;
                const birdHeight = birdWidth * (this.spriteAnimation.frameHeight / this.spriteAnimation.frameWidth);
                
                // Calculate spawn position at bird's rear
                const spawnX = this.bird.x + birdWidth * 0.1;  // Just slightly offset from bird's left edge
                const spawnY = this.bird.y + birdHeight/2; // Center Y of bird
                
                // Calculate burst velocity
                const burstSpeed = 2.5 + Math.random() * 1; // Increased initial burst speed for more explosive effect
                const angle = Math.PI + (Math.random() * 1.2 - 0.6); // Keep same wide spread angle
                const speedX = Math.cos(angle) * burstSpeed;
                const speedY = Math.sin(angle) * burstSpeed;
                
                // Create particle with burst properties
                const particle = {
                    img: randomFeather,
                    x: spawnX,
                    y: spawnY,
                    size: this.bird.size * (0.08 + Math.random() * 0.08),
                    speedX: speedX,
                    speedY: speedY,
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.2,
                    gravity: 0.01, // Keep same low gravity for slow falling
                    opacity: 1
                };
                
                this.featherParticles.push(particle);
            }
        }
    }

    // Remove feather particle drawing from drawBird method and create new method
    drawFeatherParticles() {
        this.featherParticles.forEach(particle => {
        this.ctx.save();
            this.ctx.globalAlpha = particle.opacity;
            
            // Move to particle position and apply rotation
            this.ctx.translate(particle.x + particle.size/2, particle.y + particle.size/2);
            this.ctx.rotate(particle.rotation);
            
            // Draw the feather
            this.ctx.drawImage(
                particle.img,
                -particle.size/2,
                -particle.size/2,
                particle.size,
                particle.size
            );
        
        this.ctx.restore();
        });
    }

    // Add new method to initialize clouds
    initializeClouds() {
        // Create initial set of clouds spread across the screen
        const numInitialClouds = 4;
        for (let i = 0; i < numInitialClouds; i++) {
            this.addNewCloud(i * (this.canvas.width / 2));
        }
    }

    // Add new method to create clouds
    addNewCloud(x = this.canvas.width) {
        const cloud = {
            x: x,
            y: this.cloudSystem.minY + Math.random() * (this.cloudSystem.maxY - this.cloudSystem.minY),
            scale: 0.5 + Math.random() * 0.5,
            image: this.clouds[Math.floor(Math.random() * this.clouds.length)]
        };
        this.cloudSystem.clouds.push(cloud);
    }
} 