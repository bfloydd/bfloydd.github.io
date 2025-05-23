class FlappyBird {
    constructor() {
        // Setup main container with wooden frame effect
        this.container = document.createElement('div');
        this.container.style.position = 'fixed';
        this.container.style.left = '50%';
        this.container.style.top = '50%';
        this.container.style.transform = 'translate(-50%, -50%)';
        this.container.style.width = '920px';
        this.container.style.height = '720px';
        this.container.style.padding = '40px';
        this.container.style.display = 'flex';
        this.container.style.alignItems = 'center';
        this.container.style.justifyContent = 'center';
        this.container.style.boxSizing = 'border-box';
        this.container.style.backgroundColor = '#2b1810';
        
        // Define wood colors for frame texture
        const woodColor1 = '#3c2415'; // Base brown
        const woodColor2 = '#5c3a21'; // Mid-tone
        const woodColor3 = '#7a4a31'; // Highlight
        
        // Apply layered gradients for realistic wood grain effect
        this.container.style.background = `
            linear-gradient(${woodColor2}, ${woodColor1} 20%, ${woodColor2} 50%, ${woodColor1} 80%, ${woodColor2}),
            linear-gradient(90deg, ${woodColor2}, ${woodColor1} 20%, ${woodColor2} 50%, ${woodColor1} 80%, ${woodColor2}),
            repeating-linear-gradient(
                45deg,
                rgba(255, 255, 255, 0.05) 0px,
                rgba(255, 255, 255, 0.05) 2px,
                transparent 2px,
                transparent 4px
            )`;
        
        this.container.style.backgroundBlendMode = 'overlay, overlay, normal';
        
        // Add depth with shadows
        this.container.style.boxShadow = `
            inset 0 0 30px rgba(0,0,0,0.8),
            5px 5px 20px rgba(0,0,0,0.4)`;
        
        // Setup black game canvas container
        this.innerContainer = document.createElement('div');
        this.innerContainer.style.width = '800px';
        this.innerContainer.style.height = '600px';
        this.innerContainer.style.position = 'relative';
        this.innerContainer.style.backgroundColor = '#000';
        this.innerContainer.style.boxShadow = '0 0 20px rgba(0,0,0,0.5)';
        this.container.appendChild(this.innerContainer);
        
        // Add decorative corner pieces
        const corners = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
        corners.forEach(corner => {
            const cornerDiv = document.createElement('div');
            cornerDiv.style.position = 'absolute';
            cornerDiv.style.width = '65px';
            cornerDiv.style.height = '65px';
            cornerDiv.style.background = woodColor2;
            cornerDiv.style.borderRadius = '16px';
            cornerDiv.style.boxShadow = 'inset 0 0 10px rgba(0,0,0,0.8)';
            cornerDiv.style.zIndex = '1';
            
            // Apply gradient for dimensional effect
            cornerDiv.style.backgroundImage = `
                radial-gradient(circle at center, ${woodColor3} 0%, ${woodColor2} 60%, ${woodColor1} 100%)`;
            
            // Position each corner flush against the frame
            if (corner.includes('top')) cornerDiv.style.top = '0px';
            if (corner.includes('bottom')) cornerDiv.style.bottom = '0px';
            if (corner.includes('left')) cornerDiv.style.left = '0px';
            if (corner.includes('right')) cornerDiv.style.right = '0px';
            
            this.container.appendChild(cornerDiv);
        });
        
        // Initialize game canvas
        this.canvas = document.createElement('canvas');
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.canvas.style.display = 'block';
        this.canvas.style.backgroundColor = '#000';
        this.canvas.style.boxShadow = 'inset 0 0 20px rgba(0,0,0,0.9)';
        
        this.innerContainer.appendChild(this.canvas);
        document.body.appendChild(this.container);
        
        this.ctx = this.canvas.getContext('2d');
        
        // Game difficulty settings
        this.startingLevel = 1;
        this.speedIncreasePerLevel = 0.5;    // 50% speed increase per level
        this.pillarSpaceIncreasePerLevel = .05;
        
        // Player character physics
        this.bird = {
            x: 50,
            y: 200,
            velocity: 0,
            gravity: 0.2,
            jump: -4.5,
            size: 24
        };
        
        // Movement and obstacle settings
        this.baseSpeed = 1.8;
        this.currentSpeed = this.baseSpeed * (1 + (this.startingLevel - 1) * this.speedIncreasePerLevel);
        this.pipes = [];
        this.pipeWidth = 50;
        this.pipeGap = 150;
        this.pipeInterval = 2000;
        this.lastPipe = 0;
        
        // Score tracking
        this.score = 0;
        this.totalPoints = 0;
        this.gameStarted = false;
        this.gameOver = false;
        
        // UI button configurations
        this.startButton = {
            x: this.canvas.width / 2 - 100,
            y: this.canvas.height / 2 + 50,
            width: 200,
            height: 50
        };
        
        this.restartButton = {
            x: this.canvas.width / 2 - 100,
            y: this.canvas.height / 2 + 50,
            width: 200,
            height: 50
        };
        
        // Base flame animation setup
        this.fireBase = {
            flames: Array(20).fill().map((_, i) => ({
                x: i * (this.canvas.width / 19),
                size: Math.random() * 10 + 30,
                offset: Math.random() * Math.PI
            }))
        };
        
        this.bosses = [];
        this.levelComplete = false;
        
        // Level completion UI
        this.continueButton = {
            x: this.canvas.width / 2 - 150,
            y: this.canvas.height / 2 + 100,
            width: 300,
            height: 60
        };
        
        // Victory animation settings
        this.flashEffect = {
            active: false,
            duration: 60,
            currentFrame: 0,
            colors: ['#FF0000', '#00FF00', '#0000FF', '#FF00FF', '#FFFF00']
        };
        
        this.currentLevel = this.startingLevel;
        
        // Background torch animations
        this.background = {
            torches: Array(4).fill().map((_, i) => ({
                x: i * (this.canvas.width / 3),
                y: 60 + (i % 2) * 30,
                flameOffset: Math.random() * Math.PI
            }))
        };
        
        // Boss enemy configurations
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
        this.bossShootTimer = {
            lastShot: 0,
            minInterval: 3000
        };
        
        this.bindEvents();
        this.init();
    }
    
    init() {
        this.bosses = [];
        this.bossHasAppeared = false;
        
        // Reset speed for current level
        this.currentSpeed = this.baseSpeed * (1 + (this.startingLevel - 1) * this.speedIncreasePerLevel);
        
        this.gameLoop();
    }
    
    bindEvents() {
        const handleInput = () => {
            if (!this.gameStarted) {
                this.gameStarted = true;
            }
            this.bird.velocity = this.bird.jump;
        };
        
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            
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
        // Reset player state
        this.bird = {
            x: 50,
            y: 200,
            velocity: 0,
            gravity: 0.2,
            jump: -4.5,
            size: 24
        };
        
        // Reset game state
        this.pipes = [];
        this.lastPipe = 0;
        this.score = 0;
        this.totalPoints = 0;
        this.gameStarted = false;
        this.gameOver = false;
        
        this.bosses = [];
        this.bossHasAppeared = false;
        this.levelComplete = false;
        this.currentLevel = this.startingLevel;
        this.currentSpeed = this.baseSpeed * (1 + (this.startingLevel - 1) * this.speedIncreasePerLevel);
        
        // Reset visual effects
        this.background.torches.forEach(torch => {
            torch.flameOffset = Math.random() * Math.PI;
        });
        
        this.gameLoop();
    }
    
    update() {
        if (!this.gameStarted || this.gameOver || this.levelComplete) return;
        
        this.bird.velocity += this.bird.gravity;
        this.bird.y += this.bird.velocity;
        
        const now = Date.now();
        
        // Track remaining pipes needed to complete the level
        const unscoredPipes = this.pipes.filter(pipe => !pipe.scored).length;
        
        // Dynamic pipe spawn timing based on level difficulty
        const adjustedPipeInterval = 2000 / (1 + (this.currentLevel - 1) * this.pillarSpaceIncreasePerLevel);
        
        // Spawn new pipes until level completion (10 points)
        if (now - this.lastPipe > adjustedPipeInterval && (unscoredPipes + this.score) < 10) {
            const pipeY = Math.random() * (this.canvas.height - this.pipeGap - 100) + 50;
            this.pipes.push({
                x: this.canvas.width,
                y: pipeY,
                scored: false
            });
            this.lastPipe = now;
        }
        
        // Move pipes and handle scoring
        this.pipes.forEach(pipe => {
            pipe.x -= this.currentSpeed;
            
            if (this.checkCollision(pipe)) {
                this.gameOver = true;
            }
            
            if (!pipe.scored && pipe.x + this.pipeWidth < this.bird.x) {
                this.score++;
                this.totalPoints++;  // Track overall game progress
                pipe.scored = true;

                // Spawn level boss at halfway point
                if (this.score === 5 && !this.bossHasAppeared) {
                    const bossTypes = [this.bossTypes.GHOST, this.bossTypes.DEMON, this.bossTypes.SKULL];
                    const bossIndex = (this.currentLevel - 1) % bossTypes.length;
                    const bossType = bossTypes[bossIndex];
                    
                    const entrances = ['bottom', 'top', 'right'];
                    const entrance = entrances[Math.floor(Math.random() * entrances.length)];
                    
                    let startX, startY;
                    switch(entrance) {
                        case 'bottom':
                            startX = this.canvas.width - 100;
                            startY = this.canvas.height + 50;
                            break;
                        case 'top':
                            startX = this.canvas.width - 100;
                            startY = -50;
                            break;
                        case 'right':
                            startX = this.canvas.width + 50;
                            startY = this.canvas.height / 2;
                            break;
                    }
                    
                    this.bosses.push({
                        x: startX,
                        y: startY,
                        targetX: this.canvas.width - 100,
                        targetY: this.canvas.height / 2,
                        baseY: this.canvas.height / 2,
                        type: bossType,
                        projectiles: [],
                        entrance: entrance,
                        entranceProgress: 0
                    });
                    this.bossHasAppeared = true;
                }
            }
        });
        
        this.pipes = this.pipes.filter(pipe => pipe.x > -this.pipeWidth);
        
        if (this.bird.y > this.canvas.height - this.bird.size || this.bird.y < 0) {
            this.gameOver = true;
            this.bird.y = Math.max(0, Math.min(this.bird.y, this.canvas.height - this.bird.size));
        }
        
        // Animate background flames
        if (!this.gameOver && this.gameStarted) {
            this.fireBase.flames.forEach(flame => {
                flame.x -= this.currentSpeed * 0.67;
                if (flame.x < -20) {
                    flame.x = this.canvas.width + 20;
                    flame.size = Math.random() * 10 + 25;
                    flame.offset = Math.random() * Math.PI;
                }
            });
        }
        
        // Update boss behavior and difficulty scaling
        this.bosses.forEach(boss => {
            // Smooth entrance animation
            if (boss.entranceProgress < 1) {
                boss.entranceProgress += 0.02;
                const easing = 1 - Math.pow(1 - boss.entranceProgress, 3);
                boss.x = boss.x + (boss.targetX - boss.x) * easing;
                boss.y = boss.y + (boss.targetY - boss.y) * easing;
                return;
            }

            // Scale boss movement with level progression
            const bossSpeed = this.currentSpeed * (1 + (this.currentLevel - 1) * 0.03);
            
            // Maintain boss position in right half of screen
            if (boss.x < this.canvas.width / 2) {
                boss.x = this.canvas.width / 2;
            }
            
            // Basic horizontal movement
            boss.x -= bossSpeed * 0.2;
            if (boss.x < this.canvas.width / 2) boss.x = this.canvas.width - 50;
            
            // Level-based movement complexity
            const timeScale = 1 + (this.currentLevel - 1) * 0.05;
            
            // Restrict vertical movement range
            const maxVerticalDistance = this.canvas.height * 0.3;
            const centerY = this.canvas.height / 2;
            const verticalOffset = Math.sin(Date.now() / 1000 * timeScale) * (30 + this.currentLevel * 2);
            boss.y = centerY + Math.max(-maxVerticalDistance, Math.min(maxVerticalDistance, verticalOffset));
            
            // Boss collision detection
            const distance = Math.hypot(
                boss.x - (this.bird.x + this.bird.size/2),
                boss.y - (this.bird.y + this.bird.size/2)
            );
            if (distance < (this.bird.size/2 + boss.type.size/2)) {
                this.gameOver = true;
            }
            
            // Ensure consistent boss attack pattern
            const timeSinceLastShot = now - this.bossShootTimer.lastShot;
            const shouldForceShot = timeSinceLastShot > this.bossShootTimer.minInterval;
            
            // Fire projectiles based on timing or chance
            if (shouldForceShot || Math.random() < 0.003 * (1 + (this.currentLevel - 1) * 0.05)) {
                const angle = Math.atan2(
                    this.bird.y - boss.y,
                    this.bird.x - boss.x
                );
                
                const projectileSpeed = 1.5 * (1 + (this.currentLevel - 1) * 0.08);
                
                boss.projectiles.push({
                    x: boss.x,
                    y: boss.y,
                    size: boss.type.projectileSize,
                    emoji: boss.type.projectileEmoji,
                    velocity: {
                        x: Math.cos(angle) * projectileSpeed,
                        y: Math.sin(angle) * projectileSpeed
                    }
                });
                
                this.bossShootTimer.lastShot = now;
            }
            
            // Update projectile positions and collisions
            boss.projectiles.forEach(projectile => {
                projectile.x += projectile.velocity.x;
                projectile.y += projectile.velocity.y;
                
                const distance = Math.hypot(
                    projectile.x - (this.bird.x + this.bird.size/2),
                    projectile.y - (this.bird.y + this.bird.size/2)
                );
                
                if (distance < (this.bird.size/2 + projectile.size/2)) {
                    this.gameOver = true;
                }
            });
            
            // Clean up off-screen projectiles
            boss.projectiles = boss.projectiles.filter(projectile => 
                projectile.x > -projectile.size && 
                projectile.x < this.canvas.width + projectile.size &&
                projectile.y > -projectile.size && 
                projectile.y < this.canvas.height + projectile.size
            );
        });
        
        // Handle level completion and transition effects
        if (this.score >= 10) {
            if (!this.levelComplete) {
                this.levelComplete = true;
                this.flashEffect.active = true;
                cancelAnimationFrame(this.animationFrame);
            }
            
            // Update level completion flash animation
            if (this.flashEffect.active) {
                this.flashEffect.currentFrame++;
                if (this.flashEffect.currentFrame >= this.flashEffect.duration) {
                    this.flashEffect.active = false;
                }
            }
        }
    }
    
    // Level initialization and difficulty scaling
    startLevel(levelNumber) {
        this.currentLevel = levelNumber;
        
        // Scale game speed with level progression
        this.currentSpeed = this.baseSpeed * (1 + (this.currentLevel - 1) * this.speedIncreasePerLevel);
        
        // Reset level-specific game state
        this.bird = {
            x: 50,
            y: 200,
            velocity: 0,
            gravity: 0.2,
            jump: -4.5,
            size: 24
        };
        this.pipes = [];
        this.lastPipe = 0;
        this.score = 0;  // Reset current level score
        this.gameStarted = true;
        this.gameOver = false;
        this.levelComplete = false;
        
        // Reset boss state for new level
        this.bosses = [];
        this.bossHasAppeared = false;
        
        // Reset level transition effects
        this.flashEffect.active = false;
        this.flashEffect.currentFrame = 0;
        
        // Initialize game loop
        cancelAnimationFrame(this.animationFrame);
        this.gameLoop();
    }
    
    checkCollision(pipe) {
        const birdBox = {
            left: this.bird.x,
            right: this.bird.x + this.bird.size,
            top: this.bird.y,
            bottom: this.bird.y + this.bird.size
        };
        
        const topPipeBox = {
            left: pipe.x,
            right: pipe.x + this.pipeWidth,
            top: 0,
            bottom: pipe.y
        };
        
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
        // Create dungeon background with gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#1a1a1a');    // Very dark at top
        gradient.addColorStop(0.5, '#2d2d2d');  // Slightly lighter in middle
        gradient.addColorStop(1, '#1a1a1a');    // Dark at bottom
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Create repeating stone wall pattern with random texture
        this.ctx.fillStyle = '#333333';
        for (let y = 0; y < this.canvas.height; y += 40) {
            for (let x = 0; x < this.canvas.width; x += 60) {
                this.ctx.fillRect(x, y, 58, 38);
                
                if (Math.random() < 0.3) {
                    this.ctx.fillStyle = '#2b2b2b';
                    this.ctx.fillRect(
                        x + Math.random() * 30,
                        y + Math.random() * 20,
                        10,
                        10
                    );
                    this.ctx.fillStyle = '#333333';
                }
            }
        }
        
        // Render wall-mounted torches with metal sconces
        this.background.torches.forEach(torch => {
            this.ctx.save();
            
            // Create metal sconce with 3D effect
            this.ctx.fillStyle = '#4a4a4a';
            this.ctx.beginPath();
            this.ctx.moveTo(torch.x - 12, torch.y);
            this.ctx.lineTo(torch.x + 12, torch.y);
            this.ctx.lineTo(torch.x + 8, torch.y + 25);
            this.ctx.lineTo(torch.x - 8, torch.y + 25);
            this.ctx.closePath();
            this.ctx.fill();
            
            this.ctx.fillStyle = '#5a5a5a';
            this.ctx.fillRect(torch.x - 10, torch.y + 2, 20, 3);
            
            this.ctx.fillStyle = '#654321';
            this.ctx.fillRect(torch.x - 3, torch.y - 15, 6, 20);
            
            // Animate flame with subtle movement
            const time = Date.now() / 1000;
            const flameY = torch.y - 20 + Math.sin(time + torch.flameOffset) * 1.5;
            
            // Create radial glow effect
            const gradient = this.ctx.createRadialGradient(
                torch.x, flameY, 5,
                torch.x, flameY, 30
            );
            gradient.addColorStop(0, 'rgba(255, 68, 0, 0.3)');
            gradient.addColorStop(1, 'rgba(255, 68, 0, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(torch.x, flameY, 30, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.font = '20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('🔥', torch.x, flameY);
            
            this.ctx.restore();
        });
        
        // Render player character when game is active
        if (this.gameStarted) {
            this.ctx.save();
            
            // Tilt skull based on vertical movement
            let rotation = 0;
            if (this.bird.velocity < 0) {
                rotation = -0.3;
            } else if (this.bird.velocity > 0) {
                rotation = 0.3;
            }
            
            // Create trailing flame effect
            this.ctx.save();
            this.ctx.translate(this.bird.x + this.bird.size/2, this.bird.y + this.bird.size/2);
            this.ctx.rotate(rotation);
            
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            // Create flame trail with diminishing sizes
            this.ctx.font = '18px Arial';
            this.ctx.fillText('🔥', -20, 0);
            
            this.ctx.font = '14px Arial';
            this.ctx.fillText('🔥', -32, 0);
            
            this.ctx.font = '12px Arial';
            this.ctx.fillText('🔥', -42, 0);
            
            this.ctx.restore();
            
            // Render rotating skull
            this.ctx.translate(this.bird.x + this.bird.size/2, this.bird.y + this.bird.size/2);
            this.ctx.rotate(rotation);
            this.ctx.font = '24px Arial';
            this.ctx.fillStyle = '#fff';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('💀', 0, 0);
            this.ctx.restore();
        }
        
        this.ctx.fillStyle = '#2ecc71';
        this.pipes.forEach(pipe => {
            // Create stone pillars with detailed texturing
            this.ctx.fillStyle = '#2C2F33';
            
            this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.y);
            this.ctx.fillRect(
                pipe.x,
                pipe.y + this.pipeGap,
                this.pipeWidth,
                this.canvas.height - (pipe.y + this.pipeGap)
            );
            
            // Add horizontal stone lines for texture
            this.ctx.fillStyle = '#23272A';
            for (let i = 0; i < pipe.y; i += 40) {
                this.ctx.fillRect(pipe.x, i, this.pipeWidth, 2);
            }
            for (let i = pipe.y + this.pipeGap; i < this.canvas.height; i += 40) {
                this.ctx.fillRect(pipe.x, i, this.pipeWidth, 2);
            }
            
            // Create vertical cracks for weathered look
            this.ctx.fillStyle = '#202225';
            for (let i = 0; i < pipe.y; i += 80) {
                this.ctx.fillRect(pipe.x + this.pipeWidth/3, i, 2, 40);
                this.ctx.fillRect(pipe.x + (this.pipeWidth*2/3), i + 40, 2, 40);
            }
            for (let i = pipe.y + this.pipeGap; i < this.canvas.height; i += 80) {
                this.ctx.fillRect(pipe.x + this.pipeWidth/3, i, 2, 40);
                this.ctx.fillRect(pipe.x + (this.pipeWidth*2/3), i + 40, 2, 40);
            }
            
            // Add decorative chains on pillar sides
            this.ctx.fillStyle = '#4A4D50';
            for (let i = 0; i < pipe.y; i += 20) {
                this.ctx.fillRect(pipe.x - 8, i, 4, 10);
            }
            for (let i = pipe.y + this.pipeGap; i < this.canvas.height; i += 20) {
                this.ctx.fillRect(pipe.x - 8, i, 4, 10);
            }
            for (let i = 10; i < pipe.y; i += 20) {
                this.ctx.fillRect(pipe.x + this.pipeWidth + 4, i, 4, 10);
            }
            for (let i = pipe.y + this.pipeGap + 10; i < this.canvas.height; i += 20) {
                this.ctx.fillRect(pipe.x + this.pipeWidth + 4, i, 4, 10);
            }
            
            // Add edge highlights for depth
            this.ctx.fillStyle = '#36393F';
            this.ctx.fillRect(pipe.x, 0, 3, pipe.y);
            this.ctx.fillRect(pipe.x, pipe.y + this.pipeGap, 3, this.canvas.height - (pipe.y + this.pipeGap));
        });
        
        if (this.gameStarted && !this.gameOver) {
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '32px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 4;
            this.ctx.strokeText(`${this.score}`, this.canvas.width / 2, 50);
            this.ctx.fillText(`${this.score}`, this.canvas.width / 2, 50);

            // Display current level in top right
            this.ctx.textAlign = 'right';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.strokeText(`Level ${this.currentLevel}`, this.canvas.width - 20, 40);
            this.ctx.fillText(`Level ${this.currentLevel}`, this.canvas.width - 20, 40);

            // Display total score in top left
            this.ctx.textAlign = 'left';
            this.ctx.strokeText(`Total: ${this.totalPoints}`, 20, 40);
            this.ctx.fillText(`Total: ${this.totalPoints}`, 20, 40);
        }
        
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Create game over screen with special effects
            this.ctx.save();
            
            // Add blood drip decoration
            const bloodDrops = '🩸'.repeat(15);
            this.ctx.font = '20px Arial';
            this.ctx.fillStyle = '#FF0000';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(bloodDrops, this.canvas.width / 2, 30);
            
            // Apply shadow and glow effects to text
            this.ctx.shadowColor = '#FF0000';
            this.ctx.shadowBlur = 20;
            this.ctx.shadowOffsetX = 0;
            this.ctx.shadowOffsetY = 0;
            
            // Create random offset for glitch animation
            const glitchOffset = Math.random() * 5 - 2.5;
            
            // Render glitched red text layer
            this.ctx.fillStyle = '#FF0000';
            this.ctx.font = 'bold 43px Arial';
            this.ctx.fillText('GAME OVER', this.canvas.width / 2 + glitchOffset, this.canvas.height / 3 - 40);
            
            // Render base white text layer
            this.ctx.fillStyle = '#FFF';
            this.ctx.font = 'bold 42px Arial';
            this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 3 - 40);
            
            const finalScore = this.currentLevel * this.totalPoints;
            
            // Render final score with decorative elements
            this.ctx.fillText(`SCORE: ${finalScore}`, this.canvas.width / 2, this.canvas.height / 3 + 20);
            this.ctx.font = '24px Arial';
            this.ctx.fillText(`(Level ${this.currentLevel} × ${this.totalPoints} points)`, this.canvas.width / 2, this.canvas.height / 3 + 50);
            this.ctx.font = '30px Arial';
            this.ctx.fillText('💀 💀 💀', this.canvas.width / 2, this.canvas.height / 3 + 90);
            
            this.ctx.restore();
            
            // Render themed restart button
            this.drawDungeonButton(
                this.restartButton.x,
                this.restartButton.y,
                this.restartButton.width,
                this.restartButton.height,
                'Restart'
            );
        }
        
        if (!this.gameStarted) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Initialize title screen effects
            this.ctx.save();
            
            // Apply shadow and glow effects
            this.ctx.shadowColor = '#FF0000';
            this.ctx.shadowBlur = 20;
            this.ctx.shadowOffsetX = 0;
            this.ctx.shadowOffsetY = 0;
            
            // Create random offset for glitch animation
            const glitchOffset = Math.random() * 5 - 2.5;
            
            // Render glitched red text layer
            this.ctx.fillStyle = '#FF0000';
            this.ctx.font = 'bold 43px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('FLAMING', this.canvas.width / 2 + glitchOffset, this.canvas.height / 3 - 40);
            this.ctx.fillText('BIRD SKULL', this.canvas.width / 2 + glitchOffset, this.canvas.height / 3 + 10);
            
            // Render base white text layer
            this.ctx.fillStyle = '#FFF';
            this.ctx.font = 'bold 42px Arial';
            this.ctx.fillText('FLAMING', this.canvas.width / 2, this.canvas.height / 3 - 40);
            this.ctx.fillText('BIRD SKULL', this.canvas.width / 2, this.canvas.height / 3 + 10);
            
            // Add decorative icons
            this.ctx.font = '30px Arial';
            this.ctx.fillText('🔥 💀 🔥', this.canvas.width / 2, this.canvas.height / 3 + 60);
            
            this.ctx.restore();
            
            // Initialize start button styling
            this.ctx.save();
            
            // Apply glow effect to button
            this.ctx.shadowColor = '#ff4400';
            this.ctx.shadowBlur = 20;
            
            // Create stone-textured button background
            this.ctx.fillStyle = '#2C2F33';
            this.ctx.fillRect(
                this.startButton.x,
                this.startButton.y,
                this.startButton.width,
                this.startButton.height
            );
            
            // Add vertical lines for stone texture
            this.ctx.fillStyle = '#23272A';
            for (let i = 0; i < this.startButton.width; i += 20) {
                this.ctx.fillRect(
                    this.startButton.x + i,
                    this.startButton.y,
                    2,
                    this.startButton.height
                );
            }
            
            // Create metallic border effect
            this.ctx.fillStyle = '#4A4D50';
            this.ctx.fillRect(
                this.startButton.x - 2,
                this.startButton.y - 2,
                this.startButton.width + 4,
                4
            );
            this.ctx.fillRect(
                this.startButton.x - 2,
                this.startButton.y + this.startButton.height - 2,
                this.startButton.width + 4,
                4
            );
            this.ctx.fillRect(
                this.startButton.x - 2,
                this.startButton.y,
                4,
                this.startButton.height
            );
            this.ctx.fillRect(
                this.startButton.x + this.startButton.width - 2,
                this.startButton.y,
                4,
                this.startButton.height
            );
            
            // Render button text with glow
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(
                'Start',
                this.canvas.width / 2,
                this.startButton.y + this.startButton.height/2
            );
            
            this.ctx.restore();
        }
        
        // Render base fire effect
        this.drawFireBase();
        
        // Render boss characters and projectiles
        this.bosses.forEach(boss => {
            this.ctx.font = `${boss.type.size}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(boss.type.emoji, boss.x, boss.y);
            
            boss.projectiles.forEach(projectile => {
                this.ctx.font = `${projectile.size}px Arial`;
                this.ctx.fillText(projectile.emoji, projectile.x, projectile.y);
            });
        });
        
        // Render level completion screen
        if (this.levelComplete) {
            // Create psychedelic flash animation
            if (this.flashEffect.active) {
                const flashColor = this.flashEffect.colors[
                    Math.floor(this.flashEffect.currentFrame / 4) % this.flashEffect.colors.length
                ];
                this.ctx.fillStyle = flashColor;
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            }
            
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Initialize completion screen effects
            this.ctx.save();
            
            // Create blood drip decoration
            const bloodDrops = '🩸'.repeat(15);
            this.ctx.font = '20px Arial';
            this.ctx.fillStyle = '#FF0000';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(bloodDrops, this.canvas.width / 2, 30);
            
            // Apply shadow and glow effects
            this.ctx.shadowColor = '#FF0000';
            this.ctx.shadowBlur = 20;
            this.ctx.shadowOffsetX = 0;
            this.ctx.shadowOffsetY = 0;
            
            // Create random offset for glitch animation
            const glitchOffset = Math.random() * 5 - 2.5;
            
            // Render glitched red text layer
            this.ctx.fillStyle = '#FF0000';
            this.ctx.font = 'bold 52px Arial';
            this.ctx.fillText(`LEVEL ${this.currentLevel}`, this.canvas.width / 2 + glitchOffset, this.canvas.height / 3 - 40);
            
            // Render base white text layer
            this.ctx.fillStyle = '#FFF';
            this.ctx.font = 'bold 48px Arial';
            this.ctx.fillText(`LEVEL ${this.currentLevel}`, this.canvas.width / 2, this.canvas.height / 3 - 40);
            
            // Add completion message and decorations
            this.ctx.fillText('COMPLETE!', this.canvas.width / 2, this.canvas.height / 3 + 20);
            this.ctx.font = '30px Arial';
            this.ctx.fillText('💀 💀 💀', this.canvas.width / 2, this.canvas.height / 3 + 70);
            
            this.ctx.restore();
            
            // Render themed continue button
            this.drawDungeonButton(
                this.continueButton.x,
                this.continueButton.y,
                this.continueButton.width,
                this.continueButton.height,
                'Continue... if you dare'
            );
        }
    }
    
    drawFireBase() {
        this.ctx.save();
        this.fireBase.flames.forEach((flame, index) => {
            const time = Date.now() / 1000;
            const y = this.canvas.height - 20 + Math.sin(time + flame.offset) * 5;
            
            // Create radial gradient for flame glow
            const gradient = this.ctx.createRadialGradient(
                flame.x, y, 5,
                flame.x, y, 40
            );
            gradient.addColorStop(0, 'rgba(255, 50, 0, 0.4)');
            gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(flame.x, y, 40, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Render main flame emoji
            this.ctx.font = `${flame.size}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('🔥', flame.x, y);
            
            // Create intermediate flames for continuous fire effect
            if (index < this.fireBase.flames.length - 1) {
                const midX = (flame.x + this.fireBase.flames[index + 1].x) / 2;
                const midSize = Math.random() * 8 + 25;
                const midY = this.canvas.height - 15 + Math.sin(time + Math.PI) * 5;
                this.ctx.font = `${midSize}px Arial`;
                this.ctx.fillText('🔥', midX, midY);
            }
        });
        this.ctx.restore();
    }
    
    gameLoop() {
        this.update();
        this.draw();
        if (!this.gameOver) {
            this.animationFrame = requestAnimationFrame(() => this.gameLoop());
        }
    }
    
    // Create themed button with stone texture and glowing effects
    drawDungeonButton(x, y, width, height, text) {
        this.ctx.save();
        
        // Create orange glow effect
        this.ctx.shadowColor = '#ff4400';
        this.ctx.shadowBlur = 20;
        
        // Create base stone background
        this.ctx.fillStyle = '#2C2F33';
        this.ctx.fillRect(x, y, width, height);
        
        // Add vertical line texture
        this.ctx.fillStyle = '#23272A';
        for (let i = 0; i < width; i += 20) {
            this.ctx.fillRect(x + i, y, 2, height);
        }
        
        // Create raised border effect
        this.ctx.fillStyle = '#4A4D50';
        this.ctx.fillRect(x - 2, y - 2, width + 4, 4);
        this.ctx.fillRect(x - 2, y + height - 2, width + 4, 4);
        this.ctx.fillRect(x - 2, y, 4, height);
        this.ctx.fillRect(x + width - 2, y, 4, height);
        
        // Add glowing text
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(text, x + width/2, y + height/2);
        
        this.ctx.restore();
    }
} 