/**
 * app.js
 * Main application controller and event handlers
 */

const App = {
    state: {
        selectedToon: null,
        equippedTrinkets: [], // Array of {trinket, count} objects for stackable trinkets, or just trinkets for non-stackable
        teamMembers: [null, null, null, null, null, null, null],
        teamToons: {}, // Map of toonId to count for team selection
        activeAbilities: [],
        activeItems: [],
        selectedConditionalStat: null,
        skillCheckSuccessRate: 1.0,
        teamSize: 1,  // ← ADD THIS: Calculate based on teamMembers
        sortBy: 'speed',
        sortDirection: 'desc'
    },
    currentStarFilters: {
        skillCheckAmount: 1,
        movementSpeed: 1,
        stamina: 1,
        stealth: 1,
        extractionSpeed: 1
    },

    /**
     * Initialize the application
     */
    async init() {
        console.log('🎪 Initializing Dandy\'s World Character Explorer...');
        
        // Load all game data
        const loaded = await DataLoader.loadAllData();
        if (!loaded) {
            alert('Failed to load game data. Please refresh the page.');
            return;
        }

        // Populate all dropdowns and lists
        this.populateUI();

        // Update star rating counts
        this.updateStarCounts();

        // Initialize star filter defaults (1 star active for each stat)
        this.initializeStarFilters();

        // Attach event listeners
        this.attachEventListeners();
        
        // Show Twisted table immediately with default speeds
        const twisteds = DataLoader.getAllTwisteds();
        UI.updateTwistedTable(twisteds, 0, 0); // 0 speeds show everything as red initially
        
        // Auto-select Boxten by default
        const boxten = DataLoader.getToon('boxten');
        if (boxten) {
            this.handleToonChange('boxten');
        }

        this.updateLuckyCoinMenuVisibility();
        console.log('✅ Application initialized successfully');
    },

    /**
     * Populate all UI elements with data
     */
    populateUI() {
        UI.populateToonGrid(DataLoader.getAllToons());
        UI.populateTrinketList(DataLoader.getVisibleTrinkets());
        UI.populateTeamDropdowns(DataLoader.getAllToons());
        UI.populateItemsList(DataLoader.getAllItems());
    },

    /**
     * Attach all event listeners
     */
    attachEventListeners() {
        // Toon selection (grid) - left click for player
        document.getElementById('toon-grid').addEventListener('click', (e) => {
            const toonItem = e.target.closest('.toon-grid-item');
            if (toonItem) {
                // Check if this is the clear team button
                if (toonItem.classList.contains('clear-team-btn')) {
                    this.handleClearTeam();
                    return;
                }
                
                const toonId = toonItem.dataset.toonId;
                if (toonId) {
                    this.handleToonChange(toonId);
                }
            }
        });
        
        // Toon selection (grid) - right click for team
        document.getElementById('toon-grid').addEventListener('contextmenu', (e) => {
            const toonItem = e.target.closest('.toon-grid-item');
            if (toonItem && !toonItem.classList.contains('clear-team-btn') && !toonItem.classList.contains('filter-toons-btn')) {
                e.preventDefault(); // Prevent context menu
                const toonId = toonItem.dataset.toonId;
                if (toonId) {
                    this.handleTeamToonToggle(toonId);
                }
            }
        });

        // Filter Toons button
        document.getElementById('toon-grid').addEventListener('click', (e) => {
            const filterBtn = e.target.closest('.filter-toons-btn');
            if (filterBtn) {
                this.showStarFilterModal();
                return;
            }
        });

        // Trinket selection (grid clicks)
        document.getElementById('trinket-list').addEventListener('click', (e) => {
            const trinketItem = e.target.closest('.trinket-grid-item');
            if (trinketItem) {
                const trinketId = trinketItem.dataset.trinketId;
                this.handleTrinketToggle(trinketItem, trinketId);
            }
        });
        
        // Trinkets - right click to decrement (stackable trinkets)
        document.getElementById('trinket-list').addEventListener('contextmenu', (e) => {
            const trinketItem = e.target.closest('.trinket-grid-item');
            if (trinketItem) {
                e.preventDefault(); // Prevent context menu
                const trinketId = trinketItem.dataset.trinketId;
                this.handleTrinketDecrement(trinketId);
            }
        });
        
        // Trinket filter
        document.getElementById('trinket-filter-select').addEventListener('change', (e) => {
            this.handleTrinketFilter(e.target.value);
        });

        // Toon filter toggle (removed - no longer exists)

        // Toon star rating filters
        document.querySelectorAll('.star-selector').forEach(star => {
            star.addEventListener('click', () => {
                this.handleToonStarFilter(star);
            });
        });

        // Team member selection
        for (let i = 1; i <= 7; i++) {
            document.getElementById(`team-${i}`).addEventListener('change', (e) => {
                this.handleTeamChange(i - 1, e.target.value);
            });
        }

        // Team abilities (delegated)
        document.getElementById('team-abilities').addEventListener('change', (e) => {
            if (e.target.type === 'checkbox') {
                this.handleAbilityToggle(e.target);
            }
        });

        // Items - left click to increment
        document.getElementById('active-items').addEventListener('click', (e) => {
            const itemDiv = e.target.closest('.item-grid-item');
            if (itemDiv) {
                const itemId = itemDiv.dataset.itemId;
                this.handleItemIncrement(itemId);
            }
        });

        // Items - right click to decrement
        document.getElementById('active-items').addEventListener('contextmenu', (e) => {
            const itemDiv = e.target.closest('.item-grid-item');
            if (itemDiv) {
                e.preventDefault(); // Prevent context menu
                const itemId = itemDiv.dataset.itemId;
                this.handleItemDecrement(itemId);
            }
        });

        // Conditional stats
        document.addEventListener('change', (e) => {
            if (e.target.name === 'stat-set') {
                this.handleConditionalStatChange(e.target.value);
            }
        });

        // Skill check slider (column 2 - legacy)
        const skillSlider = document.getElementById('skill-check-slider');
        if (skillSlider) {
            skillSlider.addEventListener('input', (e) => {
                this.handleSkillCheckChange(e.target.value);
            });
        }
        
        // Skill check slider (tab in column 3) - Now using Skill Check Great Rate
        const skillCheckGreatRateSlider = document.getElementById('skill-check-great-rate-slider');
        if (skillCheckGreatRateSlider) {
            skillCheckGreatRateSlider.addEventListener('input', (e) => {
                this.handleSkillCheckGreatRateChange(e.target.value);
            });
        }
        
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleTabSwitch(e.target.dataset.tab);
            });
        });

        // Sort buttons
        document.getElementById('sort-speed').addEventListener('click', () => {
            this.handleSort('speed');
        });
        document.getElementById('sort-name').addEventListener('click', () => {
            this.handleSort('name');
        });

        // Share button
        document.getElementById('share-build').addEventListener('click', () => {
            this.handleShareBuild();
        });

        // Lucky Coin stat selection change
        const luckyCoinSelect = document.getElementById('lucky-coin-stat');
        if (luckyCoinSelect) {
            luckyCoinSelect.addEventListener('change', () => {
                this.updateDisplay(); // Recalculate stats immediately
            });
        }
    },

    /**
     * Handle toon selection change
     */
    handleToonChange(toonId) {
        // Clear player ability states for the previous toon
        if (this.state.selectedToon) {
            this._clearPlayerAbilityStates(this.state.selectedToon);
        }
        
        this.state.selectedToon = DataLoader.getToon(toonId);
        
        // Clear player ability states for the new toon (start fresh)
        if (this.state.selectedToon) {
            this._clearPlayerAbilityStates(this.state.selectedToon);
        }
        
        // Update selected toon in grid
        UI.updateSelectedToonInGrid(toonId);
        
        // Reset conditional stat selection
        this.state.selectedConditionalStat = null;
        
        // Show/hide conditional stats selector
        if (this.state.selectedToon && this.state.selectedToon.conditionalStats) {
            UI.showConditionalStats(this.state.selectedToon.conditionalStats);
            this.state.selectedConditionalStat = this.state.selectedToon.conditionalStats[0];
        } else {
            UI.showConditionalStats(null);
        }
        
        this.updateDisplay();
    },
    
    /**
     * Clear player ability states from localStorage
     */
    _clearPlayerAbilityStates(toon) {
        if (toon.ability && toon.ability.hasToggle && toon.ability.playerEffect) {
            localStorage.removeItem(`ability-${toon.ability.id}-state`);
        }
        if (toon.ability2 && toon.ability2.hasToggle && toon.ability2.playerEffect) {
            localStorage.removeItem(`ability-${toon.ability2.id}-state`);
        }
    },

    /**
     * Handle trinket grid item toggle
     */
    handleTrinketToggle(trinketItem, trinketId) {
        const trinket = DataLoader.getTrinket(trinketId);
        
        if (trinket.stackable) {
            // For stackable trinkets, increment count (max 10)
            const existing = this.state.equippedTrinkets.find(t => 
                (t.trinket ? t.trinket.id === trinketId : t.id === trinketId)
            );
            
            // Special check for Bone: cannot exceed run speed cap of 40
            if (trinketId === 'bone') {
                // Get current stats
                const currentStats = Calculator.calculateFinalStats(
                    this.state.selectedToon,
                    this.state.equippedTrinkets,
                    this.state.activeAbilities,
                    this.state.activeItems,
                    null,
                    this.state.teamMembers.length
                );
                
                // Simulate what the trinkets array would look like with one more Bone
                let simulatedTrinkets = this.state.equippedTrinkets.map(t => ({...t})); // Deep copy
                
                if (existing) {
                    // Find and increment the Bone in the simulated array
                    const simBone = simulatedTrinkets.find(t => (t.trinket ? t.trinket.id === 'bone' : t.id === 'bone'));
                    if (simBone) simBone.count += 1;
                } else {
                    // Add a new Bone entry to the simulated array
                    simulatedTrinkets.push({ trinket, count: 1 });
                }
                
                // Calculate stats with the simulated Bone count
                const statsResult = Calculator.calculateFinalStats(
                    this.state.selectedToon,
                    simulatedTrinkets,
                    this.state.activeAbilities,
                    this.state.activeItems,
                    null,
                    this.state.teamMembers.length
                );
                
                // Check if stats are already at cap (adding another Bone doesn't change them)
                const walkSpeedAtCap = currentStats.final.walkSpeed >= 40 && statsResult.final.walkSpeed === currentStats.final.walkSpeed;
                const runSpeedAtCap = currentStats.final.runSpeed >= 40 && statsResult.final.runSpeed === currentStats.final.runSpeed;
                
                if (walkSpeedAtCap || runSpeedAtCap) {
                    console.log('Bone stacking limit reached - movement speed already at cap of 40');
                    this.updateDisplay();
                    return;
                }
                
                // Cap check passed - now actually update the state
                if (existing) {
                    existing.count += 1;
                } else {
                    this.state.equippedTrinkets.push({ trinket, count: 1 });
                }
            } else {
                // For other stackable trinkets, just increment normally
                if (existing) {
                    existing.count = Math.min(existing.count + 1, 10);
                } else {
                    this.state.equippedTrinkets.push({ trinket, count: 1 });
                }
            }
            
            trinketItem.classList.add('selected');
        } else {
            // For non-stackable trinkets, toggle on/off
            const isEquipped = this.state.equippedTrinkets.some(t => 
                (t.trinket ? t.trinket.id === trinketId : t.id === trinketId)
            );
            
            if (isEquipped) {
                // Remove trinket from list
                this.state.equippedTrinkets = this.state.equippedTrinkets.filter(t => 
                    (t.trinket ? t.trinket.id !== trinketId : t.id !== trinketId)
                );
                trinketItem.classList.remove('selected');
            } else {
                // Add trinket to list (backward compatibility: just the trinket object)
                this.state.equippedTrinkets.push(trinket);
                trinketItem.classList.add('selected');
            }
        }
        
        this.updateDisplay();
        this.updateLuckyCoinMenuVisibility();
    },
    
    /**
     * Handle incrementing a stackable trinket
     */
    handleTrinketIncrement(trinketId) {
        const trinket = DataLoader.getTrinket(trinketId);
        if (!trinket || !trinket.stackable) return;
        
        const existing = this.state.equippedTrinkets.find(t => 
            (t.trinket ? t.trinket.id === trinketId : t.id === trinketId)
        );
        if (existing) {
            existing.count = Math.min(existing.count + 1, 10);
        } else {
            this.state.equippedTrinkets.push({ trinket, count: 1 });
        }
        
        this.updateDisplay();
        this.updateLuckyCoinMenuVisibility();
    },
    
    /**
     * Handle decrementing a stackable trinket or removing a non-stackable trinket
     */
    handleTrinketDecrement(trinketId) {
        const trinket = DataLoader.getTrinket(trinketId);
        if (!trinket) return;
        
        if (trinket.stackable) {
            // For stackable trinkets, decrement count
            const existing = this.state.equippedTrinkets.find(t => 
                (t.trinket ? t.trinket.id === trinketId : t.id === trinketId)
            );
            if (existing) {
                existing.count = Math.max(existing.count - 1, 0);
                if (existing.count === 0) {
                    // Remove from equipped trinkets when count reaches 0
                    this.state.equippedTrinkets = this.state.equippedTrinkets.filter(t => 
                        !t.trinket || t.trinket.id !== trinketId
                    );
                }
            }
        } else {
            // For non-stackable trinkets, simply remove them
            this.state.equippedTrinkets = this.state.equippedTrinkets.filter(t => 
                (t.trinket ? t.trinket.id !== trinketId : t.id !== trinketId)
            );
        }
        
        this.updateDisplay();
    },
    
    /**
     * Handle trinket filter change
     */
    handleTrinketFilter(category) {
        const trinkets = document.querySelectorAll('.trinket-grid-item');

        trinkets.forEach(trinket => {
            if (category === 'all' || trinket.dataset.category === category) {
                trinket.style.display = 'block';
            } else {
                trinket.style.display = 'none';
            }
        });
    },

    getLuckyCoinEffect() {
        const select = document.getElementById('lucky-coin-stat');
        const stat = select ? select.value : 'movementSpeed';
        return {
            targetStat: stat,
            value: 0.12,
            applicationType: 'multiplicative'
        };
    },

    /**
     * Handle toon filter toggle (expand/collapse)
     */
    handleToonFilterToggle() {
        const header = document.getElementById('toon-filter-toggle');
        const content = document.getElementById('toon-filter-content');

        if (content.style.display === 'none' || content.style.display === '') {
            content.style.display = 'block';
            header.classList.add('expanded');
        } else {
            content.style.display = 'none';
            header.classList.remove('expanded');
        }
    },

    /**
     * Handle toon star rating filter changes
     * Shows only toons with star rating >= selected minimum for each stat (AND logic)
     */
    handleToonStarFilter(clickedStar = null) {
        // If a star was clicked, update the selection for that ability (legacy - not used in modal system)
        if (clickedStar) {
            const ability = clickedStar.closest('.star-rating-selector').dataset.ability;
            const clickedRating = parseInt(clickedStar.dataset.stars);

            // Update visual state - mark clicked star and all lower ratings as active
            const selector = clickedStar.closest('.star-rating-selector');
            selector.querySelectorAll('.star-selector').forEach(star => {
                const starRating = parseInt(star.dataset.stars);
                if (starRating <= clickedRating) {
                    star.classList.add('active');
                } else {
                    star.classList.remove('active');
                }
            });
        }

        // Get minimum ratings for each ability from currentStarFilters
        const abilityMinRatings = {
            movementSpeed: this.currentStarFilters.movementSpeed,
            stealth: this.currentStarFilters.stealth,
            extractionSpeed: this.currentStarFilters.extractionSpeed,
            stamina: this.currentStarFilters.stamina,
            skillCheckAmount: this.currentStarFilters.skillCheckAmount
        };

        const toonItems = document.querySelectorAll('.toon-grid-item');

        toonItems.forEach(item => {
            if (item.classList.contains('clear-team-btn') || item.classList.contains('filter-toons-btn')) {
                return; // Skip the buttons
            }

            const toonId = item.dataset.toonId;
            if (!toonId) return;

            const toon = DataLoader.getToon(toonId);
            if (!toon) return;

            // Check if toon matches ALL minimum rating filters (AND logic)
            let shouldShow = true;

            // Check Movement Speed (uses max of walkSpeed and runSpeed)
            const movementStars = Math.max(
                toon.starRatings.walkSpeed,
                toon.starRatings.runSpeed
            );
            if (movementStars < abilityMinRatings.movementSpeed) {
                shouldShow = false;
            }

            // Check Stealth
            if (shouldShow && toon.starRatings.stealth < abilityMinRatings.stealth) {
                shouldShow = false;
            }

            // Check Extraction Speed
            if (shouldShow && toon.starRatings.extractionSpeed < abilityMinRatings.extractionSpeed) {
                shouldShow = false;
            }

            // Check Stamina
            if (shouldShow && toon.starRatings.stamina < abilityMinRatings.stamina) {
                shouldShow = false;
            }

            // Check Skill Check Amount
            if (shouldShow && toon.starRatings.skillCheckAmount < abilityMinRatings.skillCheckAmount) {
                shouldShow = false;
            }

            item.style.display = shouldShow ? 'block' : 'none';
        });
    },

    /**
     * Get minimum rating for a specific ability based on current filters
     * @param {string} ability - The ability name (e.g., 'movementSpeed', 'stamina')
     * @returns {number} Minimum star rating (1-5, defaults to 1)
     */
    _getMinRatingForAbility(ability) {
        return this.currentStarFilters[ability] || 1;
    },

    /**
     * Initialize star filter defaults (1 star active for each stat)
     */
    initializeStarFilters() {
        document.querySelectorAll('.star-rating-selector').forEach(selector => {
            // Set the first star as active by default
            const firstStar = selector.querySelector('.star-selector[data-stars="1"]');
            if (firstStar) {
                firstStar.classList.add('active');
            }
        });
    },

    /**
     * Update star rating counts
     */
    updateStarCounts() {
        const starCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        const allToons = DataLoader.getAllToons();

        // Count toons by their maximum star rating
        allToons.forEach(toon => {
            const maxStars = Math.max(
                toon.starRatings.walkSpeed,
                toon.starRatings.runSpeed,
                toon.starRatings.stealth,
                toon.starRatings.extractionSpeed,
                toon.starRatings.stamina,
                toon.starRatings.skillCheckAmount
            );
            starCounts[maxStars]++;
        });

        // Update the count displays
        for (let i = 1; i <= 5; i++) {
            const countElement = document.getElementById(`star-${i}-count`);
            if (countElement) {
                countElement.textContent = `(${starCounts[i]})`;
            }
        }
    },

    /**
     * Handle team member selection change
     */
    handleTeamChange(slot, toonId) {
        this.state.teamMembers[slot] = toonId ? DataLoader.getToon(toonId) : null;
        
        // Update team size based on active team members (including player)
        this.state.teamSize = 1 + this.state.teamMembers.filter(t => t !== null).length;
        
        // Get all available team ability IDs from current team
        const availableAbilityIds = new Set();
        this.state.teamMembers.forEach(toon => {
            if (!toon) return;
            [toon.ability, toon.ability2].forEach(ability => {
                if (ability && ability.teamEffect) {
                    availableAbilityIds.add(ability.id);
                }
            });
        });
        
        // Keep only active abilities that are still available in the team
        this.state.activeAbilities = this.state.activeAbilities.filter(
            ability => availableAbilityIds.has(ability.id)
        );
        
        // Update team abilities list
        UI.updateTeamAbilities(this.state.teamMembers.filter(t => t !== null), this.state.activeAbilities);
        
        this.updateDisplay();
    },
    
    /**
     * Handle team toon toggle (right click on toon grid)
     */
    handleTeamToonToggle(toonId) {
        const currentCount = this.state.teamToons[toonId] || 0;
        
        // Max 7 team members total (8 including player)
        const totalTeamMembers = Object.values(this.state.teamToons).reduce((sum, count) => sum + count, 0);
        
        if (totalTeamMembers >= 7) {
            // Can't add more, already at 7
            UI.showToast('Team is full (7 members maximum, 8 including player)');
            return;
        }
        
        // Increment count (max 7 total)
        const newCount = currentCount + 1;
        this.state.teamToons[toonId] = newCount;
        
        // Update team members array from teamToons map
        this.updateTeamMembersFromToons();
        
        // Update display
        this.updateDisplay();
    },
    
    /**
     * Handle clear team button click
     */
    handleClearTeam() {
        this.state.teamToons = {};
        this.state.teamMembers = [null, null, null, null, null, null, null];
        this.state.activeAbilities = [];
        this.state.teamSize = 1;  // Just the player toon, no team members

        // Update UI
        UI.updateTeamToonSelection(this.state.teamToons, this.state.selectedToon ? this.state.selectedToon.id : null);
        UI.updateTeamAbilities([], this.state.activeAbilities);

        this.updateDisplay();
    },

    /**
     * Show star filter modal
     */
    showStarFilterModal() {
        const modal = document.getElementById('star-filter-modal');
        modal.style.display = 'flex';

        // Sync current filter state to modal
        this.syncFiltersToModal();

        // Add event listeners dynamically (in case they weren't set up properly)
        this.setupModalEventListeners();
    },

    /**
     * Setup modal event listeners
     */
    setupModalEventListeners() {
        // Close button
        const closeBtn = document.getElementById('close-star-modal');
        if (closeBtn) {
            closeBtn.onclick = () => this.hideStarFilterModal();
        }

        // Click outside to close
        const modal = document.getElementById('star-filter-modal');
        if (modal) {
            modal.onclick = (e) => {
                if (e.target.id === 'star-filter-modal') {
                    this.hideStarFilterModal();
                }
            };
        }

        // Apply button
        const applyBtn = document.getElementById('apply-star-filters');
        if (applyBtn) {
            applyBtn.onclick = () => {
                this.applyStarFilters();
                this.hideStarFilterModal();
            };
        }

        // Reset button
        const resetBtn = document.getElementById('reset-star-filters');
        if (resetBtn) {
            resetBtn.onclick = () => {
                this.resetStarFilters();
            };
        }

        // Star selectors
        document.querySelectorAll('#star-filter-modal .star-selector').forEach(star => {
            star.onclick = () => {
                this.handleModalStarFilter(star);
            };
        });
    },

    /**
     * Hide star filter modal
     */
    hideStarFilterModal() {
        const modal = document.getElementById('star-filter-modal');
        modal.style.display = 'none';
    },

    /**
     * Sync current filter state to modal display
     */
    syncFiltersToModal() {
        const abilities = ['skillCheckAmount', 'movementSpeed', 'stamina', 'stealth', 'extractionSpeed'];

        abilities.forEach(ability => {
            const minRating = this.currentStarFilters[ability];
            const selector = document.querySelector(`#star-filter-modal .star-rating-selector[data-ability="${ability}"]`);

            if (selector) {
                selector.querySelectorAll('.star-selector').forEach(star => {
                    const starRating = parseInt(star.dataset.stars);
                    if (starRating <= minRating) {
                        star.classList.add('active');
                    } else {
                        star.classList.remove('active');
                    }
                });
            }
        });
    },

    /**
     * Handle star filter clicks in modal
     */
    handleModalStarFilter(clickedStar) {
        const ability = clickedStar.closest('.star-rating-selector').dataset.ability;
        const clickedRating = parseInt(clickedStar.dataset.stars);

        // Update visual state - mark clicked star and all lower ratings as active
        const selector = clickedStar.closest('.star-rating-selector');
        selector.querySelectorAll('.star-selector').forEach(star => {
            const starRating = parseInt(star.dataset.stars);
            if (starRating <= clickedRating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    },

    /**
     * Apply filters from modal to main filter system
     */
    applyStarFilters() {
        // Store the current filter selections from modal
        this.currentStarFilters = {};
        const abilities = ['skillCheckAmount', 'movementSpeed', 'stamina', 'stealth', 'extractionSpeed'];

        abilities.forEach(ability => {
            const modalSelector = document.querySelector(`#star-filter-modal .star-rating-selector[data-ability="${ability}"]`);
            if (modalSelector) {
                const activeStars = modalSelector.querySelectorAll('.star-selector.active');
                const maxActiveRating = Math.max(...Array.from(activeStars).map(star => parseInt(star.dataset.stars)), 0);
                this.currentStarFilters[ability] = maxActiveRating;
            }
        });

        // Apply the filtering
        this.handleToonStarFilter();
    },

    /**
     * Reset all star filters
     */
    resetStarFilters() {
        // Reset modal stars
        document.querySelectorAll('#star-filter-modal .star-selector').forEach(star => {
            const rating = parseInt(star.dataset.stars);
            if (rating === 1) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });

        // Reset main filter stars
        document.querySelectorAll('.star-selector:not(#star-filter-modal .star-selector)').forEach(star => {
            const rating = parseInt(star.dataset.stars);
            if (rating === 1) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });

        // Apply the reset filtering
        this.handleToonStarFilter();
    },
    
    /**
     * Update team members array from teamToons map
     */
    updateTeamMembersFromToons() {
        // Clear team members
        this.state.teamMembers = [null, null, null, null, null, null, null];
        
        // Populate from teamToons
        let index = 0;
        for (const [toonId, count] of Object.entries(this.state.teamToons)) {
            const toon = DataLoader.getToon(toonId);
            for (let i = 0; i < count && index < 7; i++) {
                this.state.teamMembers[index++] = toon;
            }
        }
        
        // Update team size based on active team members (including player)
        this.state.teamSize = 1 + this.state.teamMembers.filter(t => t !== null).length;
        
        // Get all available team ability IDs from current team
        const availableAbilityIds = new Set();
        this.state.teamMembers.forEach(toon => {
            if (!toon) return;
            [toon.ability, toon.ability2].forEach(ability => {
                if (ability && ability.teamEffect) {
                    availableAbilityIds.add(ability.id);
                }
            });
        });
        
        // Keep only active abilities that are still available in the team
        this.state.activeAbilities = this.state.activeAbilities.filter(
            ability => availableAbilityIds.has(ability.id)
        );
        
        // Update team abilities list
        UI.updateTeamAbilities(this.state.teamMembers.filter(t => t !== null), this.state.activeAbilities);
    },

    /**
     * Handle ability checkbox toggle
     */
    handleAbilityToggle(checkbox) {
        const abilityId = checkbox.value;
        
        // Find the ability from team members (check both ability and ability2)
        let ability = null;
        for (const toon of this.state.teamMembers) {
            if (!toon) continue;
            
            if (toon.ability && toon.ability.id === abilityId) {
                ability = toon.ability;
                break;
            }
            if (toon.ability2 && toon.ability2.id === abilityId) {
                ability = toon.ability2;
                break;
            }
        }
        
        if (!ability) return;
        
        if (checkbox.checked) {
            // Add one instance of this ability
            this.state.activeAbilities.push(ability);
        } else {
            // Remove one instance of this ability
            const index = this.state.activeAbilities.findIndex(a => a.id === abilityId);
            if (index !== -1) {
                this.state.activeAbilities.splice(index, 1);
            }
        }
        
        this.updateDisplay();
    },

    /**
     * Handle item increment (left click)
     */
    handleItemIncrement(itemId) {
        // Get current count
        const existingItem = this.state.activeItems.find(i => i.item.id === itemId);
        const currentCount = existingItem ? existingItem.count : 0;
        
        // Increment (max 10)
        const newCount = Math.min(currentCount + 1, 10);
        
        this.updateItemState(itemId, newCount);
        this.updateDisplay();
    },

    /**
     * Handle item decrement (right click)
     */
    handleItemDecrement(itemId) {
        // Get current count
        const existingItem = this.state.activeItems.find(i => i.item.id === itemId);
        const currentCount = existingItem ? existingItem.count : 0;
        
        // Decrement (min 0)
        const newCount = Math.max(currentCount - 1, 0);
        
        this.updateItemState(itemId, newCount);
        this.updateDisplay();
    },

    /**
     * Update item state
     */
    updateItemState(itemId, count) {
        // Remove existing entry
        this.state.activeItems = this.state.activeItems.filter(i => i.item.id !== itemId);
        
        // Add new entry if count > 0
        if (count > 0) {
            const item = DataLoader.getItem(itemId);
            if (item) {
                this.state.activeItems.push({ item, count });
            }
        }
    },

    /**
     * Handle conditional stat selection change
     */
    handleConditionalStatChange(statSetId) {
        if (this.state.selectedToon && this.state.selectedToon.conditionalStats) {
            this.state.selectedConditionalStat = this.state.selectedToon.conditionalStats
                .find(s => s.id === statSetId);
            this.updateDisplay();
        }
    },

    /**
     * Handle skill check slider change
     */
    handleSkillCheckChange(value) {
        this.state.skillCheckSuccessRate = parseInt(value) / 100;
        
        // Update both skill check displays (column 2 and tab in column 3)
        const skillCheckValue = document.getElementById('skill-check-value');
        const skillCheckValueTab = document.getElementById('skill-check-value-tab');
        if (skillCheckValue) skillCheckValue.textContent = `${value}%`;
        if (skillCheckValueTab) skillCheckValueTab.textContent = `${value}%`;
        
        // Sync slider values
        const skillSlider = document.getElementById('skill-check-slider');
        const skillSliderTab = document.getElementById('skill-check-slider-tab');
        if (skillSlider) skillSlider.value = value;
        if (skillSliderTab) skillSliderTab.value = value;
        
        this.updateDisplay();
    },

    /**
     * Handle skill check great rate slider change
     */
    handleSkillCheckGreatRateChange(value) {
        this.state.skillCheckSuccessRate = parseInt(value) / 100;
        
        // Update the Skill Check Great Rate display value
        const greatRateValue = document.getElementById('skill-check-great-rate-value');
        if (greatRateValue) {
            greatRateValue.textContent = `${value}%`;
        }
        
        this.updateDisplay();
    },

    /**
     * Handle sort button clicks
     */
    handleSort(sortBy) {
        // Toggle direction if clicking the same sort button
        if (this.state.sortBy === sortBy) {
            this.state.sortDirection = this.state.sortDirection === 'desc' ? 'asc' : 'desc';
        } else {
            // New sort, default to descending for speed, ascending for name
            this.state.sortBy = sortBy;
            this.state.sortDirection = sortBy === 'speed' ? 'desc' : 'asc';
        }
        
        // Update active button
        document.querySelectorAll('.sort-btn').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.getElementById(`sort-${sortBy}`);
        activeBtn.classList.add('active');
        
        // Update button text with direction indicator
        if (sortBy === 'speed') {
            activeBtn.textContent = `Fastest ${this.state.sortDirection === 'desc' ? '▼' : '▲'}`;
        } else {
            activeBtn.textContent = `Name ${this.state.sortDirection === 'desc' ? '▼' : '▲'}`;
        }
        
        // Get twisteds and sort
        let twisteds = [...DataLoader.getAllTwisteds()];
        
        if (sortBy === 'speed') {
            // Sort by Normal Run speed, with Normal Walk speed as secondary sort
            if (this.state.sortDirection === 'desc') {
                twisteds.sort((a, b) => {
                    const runDiff = b.speeds.normal.run - a.speeds.normal.run;
                    if (runDiff !== 0) return runDiff;
                    return b.speeds.normal.walk - a.speeds.normal.walk;
                });
            } else {
                twisteds.sort((a, b) => {
                    const runDiff = a.speeds.normal.run - b.speeds.normal.run;
                    if (runDiff !== 0) return runDiff;
                    return a.speeds.normal.walk - b.speeds.normal.walk;
                });
            }
        } else {
            // Sort by name
            if (this.state.sortDirection === 'desc') {
                twisteds.sort((a, b) => b.name.localeCompare(a.name));
            } else {
                twisteds.sort((a, b) => a.name.localeCompare(b.name));
            }
        }
        
        // Update table (pass pre-sorted array)
        const stats = this.getCalculatedStats();
        if (stats) {
            UI.updateTwistedTable(twisteds, stats.final.walkSpeed, stats.final.runSpeed, true);
        } else {
            UI.updateTwistedTable(twisteds, 0, 0, true);
        }
    },
    
    /**
     * Handle tab switching
     */
    handleTabSwitch(tabId) {
        // Remove active class from all tabs and content
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Add active class to selected tab and content
        const selectedBtn = document.querySelector(`[data-tab="${tabId}"]`);
        const selectedContent = document.getElementById(`tab-${tabId}`);
        
        if (selectedBtn) selectedBtn.classList.add('active');
        if (selectedContent) selectedContent.classList.add('active');
    },

    /**
     * Handle share build button
     */
    handleShareBuild() {
        const url = this.generateShareURL();
        
        // Copy to clipboard
        navigator.clipboard.writeText(url).then(() => {
            UI.showToast('Build URL copied to clipboard!');
        }).catch(() => {
            UI.showToast('Failed to copy URL');
        });
    },

    /**
     * Generate shareable URL
     */
    generateShareURL() {
        const params = new URLSearchParams();
        
        if (this.state.selectedToon) {
            params.set('toon', this.state.selectedToon.id);
        }
        
        if (this.state.equippedTrinkets[0]) {
            params.set('t1', this.state.equippedTrinkets[0].id);
        }
        
        if (this.state.equippedTrinkets[1]) {
            params.set('t2', this.state.equippedTrinkets[1].id);
        }
        
        const teamIds = this.state.teamMembers.map(t => t ? t.id : '').join(',');
        if (teamIds) {
            params.set('team', teamIds);
        }
        
        if (this.state.selectedConditionalStat) {
            params.set('cond', this.state.selectedConditionalStat.id);
        }
        
        return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    },

    /**
     * Get calculated stats for current state
     */
    getCalculatedStats() {
        if (!this.state.selectedToon) {
            return null;
        }
    
        // Count team size (player toon + team members)
        const teamSize = 1 + this.state.teamMembers.filter(t => t !== null).length;
    
        // Copy equipped trinkets for calculation
        let trinketsForCalc = [...this.state.equippedTrinkets.filter(t => t !== null)];
    
        // Inject Lucky Coin effect if equipped
        const luckyCoinEntry = trinketsForCalc.find(t => (t.trinket ? t.trinket.id : t.id) === 'lucky_coin');
        if (luckyCoinEntry) {
            const baseLuckyCoin = DataLoader.getTrinket('lucky_coin');
            const luckyCoinForCalc = { ...baseLuckyCoin, effects: [this.getLuckyCoinEffect()] };
            trinketsForCalc = trinketsForCalc.map(t =>
                (t.trinket ? t.trinket.id : t.id) === 'lucky_coin' ? luckyCoinForCalc : t
            );
        }
    
        return Calculator.calculateFinalStats(
            this.state.selectedToon,
            trinketsForCalc,
            this.state.activeAbilities,
            this.state.activeItems,
            this.state.selectedConditionalStat,
            teamSize
        );
    },

    /**
     * Update all displays
     */
    updateDisplay() {
        const stats = this.getCalculatedStats();
        
        // Sync trinket UI selections
        // Handle both old format (trinket) and new format ({trinket, count})
        const selectedTrinketIds = this.state.equippedTrinkets.map(t => 
            t.trinket ? t.trinket.id : t.id
        );
        UI.updateSelectedTrinketsInGrid(selectedTrinketIds, this.state.equippedTrinkets);
        
        // Update item counters
        UI.updateItemCounters(this.state.activeItems);
        
        // Update team toon selection display
        UI.updateTeamToonSelection(this.state.teamToons, this.state.selectedToon ? this.state.selectedToon.id : null);
        
        if (stats) {
            // Update stats table (pass the selected toon for star ratings and conditional stat set)
            UI.updateStatsDisplay(stats, this.state.selectedToon, this.state.selectedConditionalStat);
            console.log('🔍 TOON STATS - Extraction Speed:', stats.final.extractionSpeed);
            console.log('   Full stats object:', stats);
            
            // Update machine extraction with state-based cascading calculation
            // --- Inject Lucky Coin for machine stats ---
            let trinketsForCalc = [...this.state.equippedTrinkets.filter(t => t !== null)];
            const luckyCoinEntry = trinketsForCalc.find(t => (t.trinket ? t.trinket.id : t.id) === 'lucky_coin');
            if (luckyCoinEntry) {
                const baseLuckyCoin = DataLoader.getTrinket('lucky_coin');
                const luckyCoinForCalc = { ...baseLuckyCoin, effects: [this.getLuckyCoinEffect()] };
                trinketsForCalc = trinketsForCalc.map(t =>
                    (t.trinket ? t.trinket.id : t.id) === 'lucky_coin' ? luckyCoinForCalc : t
                );
            }
            
            // Pass the modified trinkets array to machine stats calculation
            const extraction = Calculator.calculateMachineStatsFromState({
                ...this.state,
                equippedTrinkets: trinketsForCalc
            });
            UI.updateMachineExtraction(extraction);
            
            // Update twisted table with current sort
            let twisteds = [...DataLoader.getAllTwisteds()];
            
            // Apply current sort order
            if (this.state.sortBy === 'speed') {
                if (this.state.sortDirection === 'desc') {
                    twisteds.sort((a, b) => {
                        const runDiff = b.speeds.normal.run - a.speeds.normal.run;
                        if (runDiff !== 0) return runDiff;
                        return b.speeds.normal.walk - a.speeds.normal.walk;
                    });
                } else {
                    twisteds.sort((a, b) => {
                        const runDiff = a.speeds.normal.run - b.speeds.normal.run;
                        if (runDiff !== 0) return runDiff;
                        return a.speeds.normal.walk - b.speeds.normal.walk;
                    });
                }
            } else {
                if (this.state.sortDirection === 'desc') {
                    twisteds.sort((a, b) => b.name.localeCompare(a.name));
                } else {
                    twisteds.sort((a, b) => a.name.localeCompare(b.name));
                }
            }
            
            UI.updateTwistedTable(twisteds, stats.final.walkSpeed, stats.final.runSpeed, true);
        }
    },

    // Show/hide Lucky Coin stat menu based on whether Lucky Coin trinket is equipped
    updateLuckyCoinMenuVisibility() {
        const luckyCoinSelected = this.state.equippedTrinkets.some(
            t => (t.trinket ? t.trinket.id : t.id) === 'lucky_coin'
        );
        
        const menuEl = document.getElementById('lucky-coin-container');
        if (menuEl) {
            menuEl.style.display = luckyCoinSelected ? 'block' : 'none';
        }
    }
};


// Initialize app when DOM is ready
// Expose App to window for ability checkbox event listeners
window.App = App;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}
