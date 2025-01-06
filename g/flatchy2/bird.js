import { StateMachine } from './machine.js';

export class FlappyBird {
    constructor() {
        // Game state constants
        this.GameState = {
            TITLE: 'title',
            READY: 'ready',
            PLAYING: 'playing',
            DEAD: 'dead',
            END: 'end'
        };
        
        // Initialize state machine
        this.stateMachine = new StateMachine(
            Object.values(this.GameState),
            this.GameState.TITLE
        );

        // Set up state handlers
        this.setupStateHandlers();
        
        this.gameFont = '"Chalkboard SE", cursive';
        
        // Bird sprite setup and loading
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

        // Feather trail effect assets
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

        // Sprite animation configuration
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
        
        // Canvas setup with mobile-friendly dimensions (16:9 aspect ratio)
        this.canvas = document.createElement('canvas');
        this.canvas.width = 400;
        this.canvas.height = this.canvas.width / (9/16);
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        
        // Bird physics configuration
        this.bird = {
            x: this.canvas.width * 0.25,
            y: this.canvas.height * 0.4,
            velocity: 0,
            gravity: this.canvas.height * 0.00045,
            jump: this.canvas.height * -0.011,
            size: this.canvas.width * 0.19
        };
        
        // Game speed and obstacle settings
        this.baseSpeed = 4.5;
        this.currentSpeed = this.baseSpeed;
        
        this.logs = [];
        this.logWidth = this.canvas.width * 0.25;
        this.logGap = this.canvas.height * 0.25;
        this.logInterval = 1400;
        this.lastLog = 0;
        
        // Score tracking
        this.score = 0;
        this.gameStarted = false;
        this.gameOver = false;
        
        // UI button dimensions
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
            height: this.canvas.width * 0.4 * 0.25
        };
        
        // Load UI assets
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
        
        this.titleFlatchyImg = new Image();
        this.titleFlatchyImg.onload = () => {
            this.titleFlatchyLoaded = true;
        };
        this.titleFlatchyImg.src = 'images/title/title_flatchy.png';
        this.titleFlatchyLoaded = false;
        
        this.gameLoopStarted = false;
        this.bindEvents();

        // Load cloud variations
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

        // Title screen configuration
        this.titleScreenAlpha = 1;
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

        // Load background assets
        this.titleBgImg = new Image();
        this.titleBgImg.onload = () => {
            this.titleBgLoaded = true;
        };
        this.titleBgImg.src = 'images/title/title_bg.png';
        this.titleBgLoaded = false;

        this.skyBgImg = new Image();
        this.skyBgImg.onload = () => {
            this.skyBgLoaded = true;
        };
        this.skyBgImg.src = 'images/sky_bg.png';
        this.skyBgLoaded = false;

        // Ready state assets
        this.isReadyState = false;
        
        this.tapIconImg = new Image();
        this.tapIconImg.onload = () => {
            this.tapIconLoaded = true;
        };
        this.tapIconImg.src = 'images/tap_icon.png';
        this.tapIconLoaded = false;
        
        this.getReadyImg = new Image();
        this.getReadyImg.onload = () => {
            this.getReadyLoaded = true;
        };
        this.getReadyImg.src = 'images/game/get_ready_text.png';
        this.getReadyLoaded = false;

        this.tapTextImg = new Image();
        this.tapTextImg.onload = () => {
            this.tapTextLoaded = true;
        };
        this.tapTextImg.src = 'images/game/tap_text.png';
        this.tapTextLoaded = false;

        // Load sound effects
        this.whooshSound = new Audio('audio/woosh.wav');
        
        // Load fart sound effects (only existing ones)
        this.fartSounds = [];
        const existingGasSounds = [1, 3, 4, 7, 14, 15, 18, 19, 29, 30];
        existingGasSounds.forEach(num => {
            const sound = new Audio(`audio/toots/gas${num}.wav`);
            this.fartSounds.push(sound);
        });
        
        this.lastFartTime = 0;
        this.fartInterval = 2000 + Math.random() * 3000;

        this.featherParticles = [];
        this.hitSound = new Audio('audio/hit.wav');

        // End screen assets
        this.endBgImg = new Image();
        this.endBgImg.onload = () => {
            this.endBgLoaded = true;
        };
        this.endBgImg.src = 'images/end/end_bg.png';
        this.endBgLoaded = false;
        
        this.playBtnImg = new Image();
        this.playBtnImg.onload = () => {
            this.playBtnLoaded = true;
        };
        this.playBtnImg.src = 'images/ui/btns/play_btn_up.png';
        this.playBtnLoaded = false;

        // End screen animation settings
        this.endScreenAnimation = {
            bgStartY: -this.canvas.height * 0.5,
            bgTargetY: this.canvas.height * 0.2,
            bgCurrentY: -this.canvas.height * 0.5,
            velocity: 0,
            gravity: 0.8,
            bounce: -0.3,
            isAnimating: false,
            startTime: 0,
            animationDuration: 1000
        };

        // Parallax scrolling configuration
        this.backgroundOffset = 0;
        this.backgroundScrollSpeed = 0.5;

        // Cloud system configuration
        this.cloudSystem = {
            clouds: [],
            minY: 0,
            maxY: this.canvas.height * 0.4,
            minGap: this.canvas.width * 0.5,
            scrollSpeed: 0.3
        };

        this.initializeClouds();

        this.clickSound = new Audio('audio/click.wav');
        this.bestScore = 0;

        // Medal assets
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

        this.currentMedal = null;
    }
    
    init() {
        // Initialize game speed
        this.currentSpeed = this.baseSpeed;
        
        if (!this.gameLoopStarted) {
            this.gameLoopStarted = true;
            this.gameLoop();
        }
    }
    
    bindEvents() {
        const handleInput = () => {
            if (!this.spriteLoaded) return;
            
            switch (this.stateMachine.getCurrentState()) {
                case this.GameState.TITLE:
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
                    this.clickSound.currentTime = 0;
                    this.clickSound.play();
                    this.setState(this.GameState.READY);
                    break;
            }
        };
        
        // Handle mouse and touch events
        const handleInteraction = (e) => {
            e.preventDefault();
            
            // Convert screen coordinates to canvas coordinates
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            
            const clickX = ((e.touches ? e.touches[0].clientX : e.clientX) - rect.left) * scaleX;
            const clickY = ((e.touches ? e.touches[0].clientY : e.clientY) - rect.top) * scaleY;
            
            switch (this.stateMachine.getCurrentState()) {
                case this.GameState.TITLE:
                    // Check if click is within start button bounds
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
                    // Check if click is within play button bounds and animation is complete
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
                handleInput();
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
        // Update sprite animation except in DEAD state
        if (!this.isState(this.GameState.DEAD)) {
            const currentTime = Date.now();
            if (currentTime - this.spriteAnimation.lastFrameTime > this.spriteAnimation.frameInterval) {
                this.spriteAnimation.currentFrame = (this.spriteAnimation.currentFrame + 1) % this.spriteAnimation.totalFrames;
                this.spriteAnimation.lastFrameTime = currentTime;
            }
        }

        // Handle background scrolling in READY and PLAYING states
        if (this.isState(this.GameState.READY) || this.isState(this.GameState.PLAYING)) {
            if (this.groundLoaded) {
                this.groundOffset -= this.baseSpeed * 1.2;
                if (this.groundOffset <= -this.groundImg.width) {
                    this.groundOffset = 0;
                }
            }

            if (this.backgroundLoaded) {
                this.backgroundOffset -= this.baseSpeed * this.backgroundScrollSpeed;
                if (this.backgroundOffset <= -this.backgroundImg.width * 0.6) {
                    this.backgroundOffset = 0;
                }
            }
        }

        // Handle gameplay logic in PLAYING state
        if (this.isState(this.GameState.PLAYING)) {
            const now = Date.now();
            
            // Generate new obstacles
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
            
            // Update obstacle positions and check collisions
            this.logs.forEach(log => {
                log.x -= this.baseSpeed;
                
                if (!log.scored && log.x + this.logWidth < this.bird.x) {
                    log.scored = true;
                    this.score++;
                }
                
                if (this.checkCollision(log)) {
                    this.setState(this.GameState.DEAD);
                    return;
                }
            });
            
            // Remove off-screen obstacles
            this.logs = this.logs.filter(log => log.x + this.logWidth > 0);
            
            // Update bird physics
            this.bird.velocity += this.bird.gravity;
            this.bird.y += this.bird.velocity;
        }

        // Handle bird death animation
        if (this.isState(this.GameState.DEAD)) {
            this.bird.velocity += this.bird.gravity * 1.5;
            this.bird.y += this.bird.velocity;
            
            const groundY = this.canvas.height - 30;
            if (this.bird.y + this.bird.size > groundY) {
                this.bird.y = groundY - this.bird.size;
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

        // Update feather particle effects
        this.featherParticles = this.featherParticles.filter(particle => {
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            particle.speedY += particle.gravity;
            particle.rotation += particle.rotationSpeed;
            particle.x += Math.sin(Date.now() / 500 + particle.rotation) * 0.5;
            particle.opacity -= 0.005;
            
            return particle.opacity > 0;
        });

        // Check ground collision in PLAYING and DEAD states
        if (this.isState(this.GameState.PLAYING) || this.isState(this.GameState.DEAD)) {
            const groundY = this.canvas.height - 30;
            if (this.bird.y + this.bird.size > groundY) {
                this.bird.y = groundY - this.bird.size;
                
                if (this.isState(this.GameState.PLAYING)) {
                    this.setState(this.GameState.DEAD);
                    return;
                } else if (this.isState(this.GameState.DEAD)) {
                    this.setState(this.GameState.END);
                    return;
                }
            }
        }

        // Update cloud positions in READY and PLAYING states
        if (this.isState(this.GameState.READY) || this.isState(this.GameState.PLAYING)) {
            this.cloudSystem.clouds.forEach((cloud, index) => {
                cloud.x -= this.baseSpeed * this.cloudSystem.scrollSpeed;
                
                if (cloud.x < -this.canvas.width * cloud.scale) {
                    this.cloudSystem.clouds.splice(index, 1);
                    this.addNewCloud();
                }
            });
        }
    }
    
    startLevel() {
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
        
        cancelAnimationFrame(this.animationFrame);
        this.gameLoopStarted = true;
        this.gameLoop();
    }
    
    checkCollision(log) {
        // Create smaller hitbox for better gameplay feel (75% of visual size)
        const hitboxReduction = this.bird.size * 0.25;
        const birdBox = {
            left: this.bird.x + hitboxReduction,
            right: this.bird.x + this.bird.size - hitboxReduction,
            top: this.bird.y + hitboxReduction,
            bottom: this.bird.y + this.bird.size - hitboxReduction
        };
        
        // Calculate log dimensions based on sprite aspect ratio
        const logAspectRatio = this.treeImg.height / this.treeImg.width;
        const logHeight = this.logWidth * logAspectRatio;
        
        // Add padding to log hitbox to match visible trunk (40% padding)
        const logPadding = this.logWidth * 0.4;
        const trunkHeight = logHeight * 0.6;
        
        // Define collision boxes for top and bottom logs
        const topLogBox = {
            left: log.x + logPadding,
            right: log.x + this.logWidth - logPadding,
            top: log.y - trunkHeight,
            bottom: log.y
        };
        
        const bottomLogBox = {
            left: log.x + logPadding,
            right: log.x + this.logWidth - logPadding,
            top: log.y + this.logGap,
            bottom: log.y + this.logGap + trunkHeight
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
        
        switch (this.stateMachine.getCurrentState()) {
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
    
    gameLoop() {
        this.update();
        this.draw();
        this.animationFrame = requestAnimationFrame(() => this.gameLoop());
    }
    
    drawDungeonButton(x, y, width, height, text) {
        this.ctx.save();
        
        // Add glow effect
        this.ctx.shadowColor = '#ff4400';
        this.ctx.shadowBlur = 20;
        
        // Create stone texture background
        this.ctx.fillStyle = '#2C2F33';
        this.ctx.fillRect(x, y, width, height);
        
        // Add depth lines
        this.ctx.fillStyle = '#23272A';
        for (let i = 0; i < width; i += 20) {
            this.ctx.fillRect(x + i, y, 2, height);
        }
        
        // Add raised border effect
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

    drawTitleScreen() {
        // Draw sky background
        if (this.skyBgLoaded) {
            this.ctx.drawImage(
                this.skyBgImg,
                0, 0,
                this.canvas.width,
                this.canvas.height
            );
        }
        
        // Draw parallax clouds
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

        // Draw scrolling hills background
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

        // Draw scrolling ground
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
        
        // Draw animated title logo
        if (this.titleLogoLoaded) {
            const logo = this.titleScreenElements.logo;
            logo.width = this.canvas.width * 0.8;
            logo.height = logo.width * (this.titleLogoImg.height / this.titleLogoImg.width);
            logo.x = (this.canvas.width - logo.width) / 2;
            logo.y = this.canvas.height * 0.25;
            
            const bounce = Math.sin(Date.now() / 1000) * 5;
            this.ctx.drawImage(
                this.titleLogoImg,
                logo.x,
                logo.y + bounce,
                logo.width,
                logo.height
            );
        }
        
        // Draw animated character
        if (this.titleFlatchyLoaded) {
            const flatchyWidth = this.canvas.width * 0.4;
            const aspectRatio = this.titleFlatchyImg.height / this.titleFlatchyImg.width;
            const flatchyHeight = flatchyWidth * aspectRatio;
            const flatchyX = (this.canvas.width - flatchyWidth) / 2 - (this.canvas.width * 0.05);
            const flatchyY = this.canvas.height * 0.4;
            
            const float = Math.sin(Date.now() / 800) * 8;
            
            this.ctx.drawImage(
                this.titleFlatchyImg,
                flatchyX,
                flatchyY + float,
                flatchyWidth,
                flatchyHeight
            );
        }
        
        // Draw start button
        if (this.startBtnLoaded) {
            const btn = this.titleScreenElements.startButton;
            btn.width = this.canvas.width * 0.5;
            btn.height = btn.width * (this.startBtnImg.height / this.startBtnImg.width);
            btn.x = (this.canvas.width - btn.width) / 2;
            btn.y = this.canvas.height * 0.6;
            
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
        this.stateMachine.setState(newState);
    }
    
    isState(state) {
        return this.stateMachine.isState(state);
    }
    
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
        // Draw static sky background
        if (this.skyBgLoaded) {
            this.ctx.drawImage(
                this.skyBgImg,
                0, 0,
                this.canvas.width,
                this.canvas.height
            );
        }

        // Draw parallax cloud layer
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
        
        // Draw scrolling hills with parallax effect
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
    }

    drawGround() {
        if (this.groundLoaded) {
            const groundY = this.canvas.height - 50;
            const groundHeight = 50;
            const groundWidth = groundHeight * (this.groundImg.width / this.groundImg.height);
            
            // Draw repeating ground segments with 1px overlap to prevent gaps
            for (let x = Math.floor(this.groundOffset); x < this.canvas.width + groundWidth; x += groundWidth) {
                this.ctx.drawImage(
                    this.groundImg,
                    x, groundY,
                    groundWidth + 1,
                    groundHeight
                );
            }
        }
    }

    drawBird() {
        this.ctx.save();
        
        const birdWidth = this.bird.size;
        const birdHeight = birdWidth * (this.spriteAnimation.frameHeight / this.spriteAnimation.frameWidth);
        
        // Apply rotation based on game state
        let rotation = 0;
        if (this.isState(this.GameState.PLAYING)) {
            rotation = -0.25;
        } else if (this.isState(this.GameState.DEAD) || this.isState(this.GameState.END)) {
            rotation = Math.min(Math.PI / 2, this.bird.velocity * 0.1);
        }
        
        this.ctx.translate(this.bird.x + birdWidth/2, this.bird.y + birdHeight/2);
        this.ctx.rotate(rotation);
            
        // Select appropriate sprite frame
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
        
        // Draw tap instruction next to bird
        if (this.tapTextLoaded) {
            const tapWidth = this.canvas.width * 0.2;
            const aspectRatio = this.tapTextImg.height / this.tapTextImg.width;
            const tapHeight = tapWidth * aspectRatio;
            
            const tapX = this.bird.x + this.bird.size + (this.canvas.width * 0.15);
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
                
                // Draw bottom obstacle
                this.ctx.drawImage(
                    this.treeImg,
                    0, 0,
                    this.treeImg.width, this.treeImg.height,
                    log.x, log.y + this.logGap,
                    this.logWidth, logHeight
                );
                
                // Draw top obstacle
                this.ctx.drawImage(
                    this.treeImg,
                    0, 0,
                    this.treeImg.width, this.treeImg.height,
                    log.x, log.y - logHeight,
                    this.logWidth, logHeight
                );
            }
        });
    }

    drawHUD() {
        // Draw score with stroke outline
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
            const bgWidth = this.canvas.width * 0.9;
            const aspectRatio = this.endBgImg.height / this.endBgImg.width;
            const bgHeight = bgWidth * aspectRatio;
            
            // Update end screen animation
            if (this.endScreenAnimation.isAnimating) {
                this.endScreenAnimation.velocity += this.endScreenAnimation.gravity;
                this.endScreenAnimation.bgCurrentY += this.endScreenAnimation.velocity;
                
                if (this.endScreenAnimation.bgCurrentY > this.endScreenAnimation.bgTargetY) {
                    this.endScreenAnimation.bgCurrentY = this.endScreenAnimation.bgTargetY;
                    this.endScreenAnimation.velocity *= this.endScreenAnimation.bounce;
                    
                    if (Math.abs(this.endScreenAnimation.velocity) < 0.5) {
                        this.endScreenAnimation.isAnimating = false;
                        this.endScreenAnimation.bgCurrentY = this.endScreenAnimation.bgTargetY;
                    }
                }
            }
            
            // Draw end screen background
            this.ctx.drawImage(
                this.endBgImg,
                (this.canvas.width - bgWidth) / 2,
                this.endScreenAnimation.bgCurrentY,
                bgWidth,
                bgHeight
            );
            
            // Draw score information when animation is complete
            if (!this.endScreenAnimation.isAnimating) {
                // Draw medal if available
                if (this.currentMedal && this.currentMedal.complete) {
                    const medalSize = this.canvas.width * 0.25;
                    const medalX = this.canvas.width * 0.2;
                    const medalY = this.endScreenAnimation.bgCurrentY + bgHeight * 0.35;
                
                    this.ctx.drawImage(
                        this.currentMedal,
                        medalX,
                        medalY,
                        medalSize,
                        medalSize
                    );
                }
                
                // Draw score text
                this.ctx.fillStyle = '#000';
                this.ctx.font = `bold ${this.canvas.width * 0.08}px ${this.gameFont}`;
                this.ctx.textAlign = 'right';
                
                this.ctx.fillText(
                    this.score.toString(),
                    this.canvas.width * 0.75,
                    this.endScreenAnimation.bgCurrentY + bgHeight * 0.45
                );
                
                this.ctx.fillText(
                    this.bestScore.toString(),
                    this.canvas.width * 0.77,
                    this.endScreenAnimation.bgCurrentY + bgHeight * 0.45 + 85
                );
            }
            
            // Draw UI buttons
            if (this.playBtnLoaded) {
                const btnWidth = this.canvas.width * 0.5;
                const aspectRatio = this.playBtnImg.height / this.playBtnImg.width;
                const btnHeight = btnWidth * aspectRatio;
                
                const baseY = this.canvas.height * 0.45;
                const buttonY = this.endScreenAnimation.isAnimating ? 
                    baseY + (this.endScreenAnimation.bgCurrentY - this.endScreenAnimation.bgTargetY) : 
                    baseY;

                const buttonX = (this.canvas.width - btnWidth) / 2;
                
                this.restartButton = {
                    x: buttonX,
                    y: this.endScreenAnimation.isAnimating ? buttonY : baseY,
                    width: btnWidth,
                    height: btnHeight
                };
                
                this.ctx.drawImage(
                    this.playBtnImg,
                    buttonX,
                    buttonY,
                    btnWidth,
                    btnHeight
                );

                // Draw secondary button
                if (this.plainBtnLoaded) {
                    const plainBtnY = buttonY + btnHeight + 20;
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

    createFeatherBurst() {
        const featherImages = [];
        
        if (this.feather1Loaded) featherImages.push(this.feather1);
        if (this.feather2Loaded) featherImages.push(this.feather2);
        if (this.feather3Loaded) featherImages.push(this.feather3);
        if (this.feather4Loaded) featherImages.push(this.feather4);
        
        if (featherImages.length > 0) {
            const numFeathers = 6;
            
            for (let i = 0; i < numFeathers; i++) {
                const randomFeather = featherImages[Math.floor(Math.random() * featherImages.length)];
                
                const birdWidth = this.bird.size;
                const birdHeight = birdWidth * (this.spriteAnimation.frameHeight / this.spriteAnimation.frameWidth);
                
                // Spawn feathers from bird's rear position
                const spawnX = this.bird.x + birdWidth * 0.3;
                const spawnY = this.bird.y + birdHeight * 0.4;
                
                // Calculate burst velocity and direction
                const burstSpeed = 2.5 + Math.random() * 1;
                const angle = Math.PI + (Math.random() * 1.2 - 0.6);
                const speedX = Math.cos(angle) * burstSpeed;
                const speedY = Math.sin(angle) * burstSpeed;
                
                const particle = {
                    img: randomFeather,
                    x: spawnX,
                    y: spawnY,
                    size: this.bird.size * (0.08 + Math.random() * 0.08),
                    speedX: speedX,
                    speedY: speedY,
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.2,
                    gravity: 0.01,
                    opacity: 1
                };
                
                this.featherParticles.push(particle);
            }
        }
    }

    drawFeatherParticles() {
        this.featherParticles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.opacity;
            
            this.ctx.translate(particle.x + particle.size/2, particle.y + particle.size/2);
            this.ctx.rotate(particle.rotation);
            
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

    initializeClouds() {
        const numInitialClouds = 4;
        for (let i = 0; i < numInitialClouds; i++) {
            this.addNewCloud(i * (this.canvas.width / 2));
        }
    }

    addNewCloud(x = this.canvas.width) {
        const cloud = {
            x: x,
            y: this.cloudSystem.minY + Math.random() * (this.cloudSystem.maxY - this.cloudSystem.minY),
            scale: 0.5 + Math.random() * 0.5,
            image: this.clouds[Math.floor(Math.random() * this.clouds.length)]
        };
        this.cloudSystem.clouds.push(cloud);
    }

    setupStateHandlers() {
        // Exit handlers
        this.stateMachine.onExit(this.GameState.TITLE, () => {
            this.titleScreenAlpha = 0;
        });

        // Enter handlers
        this.stateMachine.onEnter(this.GameState.TITLE, () => {
            this.titleScreenAlpha = 1;
        });

        this.stateMachine.onEnter(this.GameState.READY, () => {
            this.resetBirdPosition();
        });

        this.stateMachine.onEnter(this.GameState.PLAYING, () => {
            this.logs = [];
            this.score = 0;
            if (!this.gameLoopStarted) {
                this.gameLoopStarted = true;
                this.gameLoop();
            }
        });

        this.stateMachine.onEnter(this.GameState.DEAD, () => {
            this.hitSound.currentTime = 0;
            this.hitSound.play();
        });

        this.stateMachine.onEnter(this.GameState.END, () => {
            // Determine medal based on score
            const isNewBest = this.score > this.bestScore;
            if (isNewBest) {
                this.currentMedal = this.medal3Img;
            } else if (this.score > 3) {
                this.currentMedal = this.medal2Img;
            } else {
                this.currentMedal = this.medal1Img;
            }
            
            this.bestScore = Math.max(this.score, this.bestScore);
            
            // Initialize end screen animation
            this.endScreenAnimation.bgStartY = -this.canvas.height * 0.5;
            this.endScreenAnimation.bgTargetY = this.canvas.height * 0.1;
            this.endScreenAnimation.bgCurrentY = this.endScreenAnimation.bgStartY;
            this.endScreenAnimation.velocity = 0;
            this.endScreenAnimation.isAnimating = true;
            this.endScreenAnimation.startTime = Date.now();
            
            // Position restart button
            const btnWidth = this.canvas.width * 0.4;
            const aspectRatio = this.playBtnImg ? (this.playBtnImg.height / this.playBtnImg.width) : 0.25;
            const btnHeight = btnWidth * aspectRatio;
            
            this.restartButton = {
                x: (this.canvas.width - btnWidth) / 2,
                y: this.canvas.height * 0.45,
                width: btnWidth,
                height: btnHeight
            };
        });
    }
} 