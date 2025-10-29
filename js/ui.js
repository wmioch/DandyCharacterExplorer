/**
 * ui.js
 * UI update and manipulation functions
 */

const UI = {
    /**
     * Populate toon grid with clickable images (sorted alphabetically)
     */
    populateToonGrid(toons) {
        const grid = document.getElementById('toon-grid');
        if (!grid) {
            console.error('Toon grid container not found!');
            return;
        }
        
        grid.innerHTML = '';
        
        // Sort toons alphabetically by name
        const sortedToons = [...toons].sort((a, b) => a.name.localeCompare(b.name));
        
        sortedToons.forEach(toon => {
            const toonItem = document.createElement('div');
            toonItem.className = 'toon-grid-item';
            toonItem.dataset.toonId = toon.id;
            toonItem.title = toon.name;
            
            const imagePath = `assets/images/toons/${toon.id}.png`;
            
            // Create image/placeholder container
            const imgContainer = document.createElement('div');
            imgContainer.className = 'toon-grid-image';
            imgContainer.textContent = toon.name.charAt(0).toUpperCase();
            
            // Counter overlay (initially hidden)
            const counterOverlay = document.createElement('div');
            counterOverlay.className = 'toon-counter-overlay';
            counterOverlay.textContent = '';
            counterOverlay.style.display = 'none';
            
            // Try to load actual image
            const img = new Image();
            img.onload = function() {
                imgContainer.style.backgroundImage = `url(${imagePath})`;
                imgContainer.textContent = '';
                imgContainer.style.backgroundSize = 'cover';
                imgContainer.style.backgroundPosition = 'center';
            };
            img.onerror = function() {
                console.warn(`Failed to load toon image: ${imagePath}`);
            };
            img.src = imagePath;
            
            toonItem.appendChild(imgContainer);
            toonItem.appendChild(counterOverlay);
            grid.appendChild(toonItem);
        });
        
        // Add "Clear Team" button at the end
        const clearBtn = document.createElement('div');
        clearBtn.className = 'toon-grid-item clear-team-btn';
        clearBtn.title = 'Clear Team Selection';
        
        const clearBtnImage = document.createElement('div');
        clearBtnImage.className = 'toon-grid-image';
        clearBtnImage.textContent = 'Clear Team';
        
        clearBtn.appendChild(clearBtnImage);
        grid.appendChild(clearBtn);
        
        console.log(`Populated toon grid with ${sortedToons.length} toons`);
    },
    
    /**
     * Populate toon dropdown with all available toons (legacy - kept for team dropdowns)
     */
    populateToonDropdown(toons) {
        const select = document.getElementById('toon-select');
        if (!select) return; // May not exist if using grid instead
        
        select.innerHTML = '<option value="">-- Choose a Toon --</option>';
        
        toons.forEach(toon => {
            const option = document.createElement('option');
            option.value = toon.id;
            option.textContent = toon.name;
            select.appendChild(option);
        });
    },

    /**
     * Populate trinket grid with clickable images (similar to toon grid)
     */
    populateTrinketList(trinkets) {
        const container = document.getElementById('trinket-list');
        if (!container) {
            console.error('Trinket list container not found!');
            return;
        }
        
        container.innerHTML = '';
        console.log(`Populating ${trinkets.length} trinkets`);
        
        // Sort trinkets alphabetically by name
        const sortedTrinkets = [...trinkets].sort((a, b) => a.name.localeCompare(b.name));
        
        sortedTrinkets.forEach(trinket => {
            const trinketItem = document.createElement('div');
            trinketItem.className = 'trinket-grid-item';
            trinketItem.dataset.trinketId = trinket.id;
            // Use filterCategory from the data
            trinketItem.dataset.category = trinket.filterCategory || trinket.category || 'other';
            
            const conditional = trinket.conditional ? ' [Cond]' : '';
            // Use the effect text directly from the data
            const effectText = trinket.effect || '';
            const tooltipText = `${trinket.name}${conditional}\n${effectText}`;
            trinketItem.title = tooltipText;
            
            // Use the image filename from the data
            const imagePath = `assets/images/trinkets/${trinket.image}`;
            
            // Image/Placeholder container
            const imgContainer = document.createElement('div');
            imgContainer.className = 'trinket-grid-image';
            imgContainer.textContent = trinket.name.charAt(0).toUpperCase();
            
            // Try to load actual image
            const img = new Image();
            img.onload = function() {
                imgContainer.style.backgroundImage = `url(${imagePath})`;
                imgContainer.textContent = '';
                imgContainer.style.backgroundSize = 'cover';
                imgContainer.style.backgroundPosition = 'center';
            };
            img.onerror = function() {
                console.warn(`Failed to load image: ${imagePath}`);
            };
            img.src = imagePath;
            
            trinketItem.appendChild(imgContainer);
            container.appendChild(trinketItem);
        });
        
        console.log('Trinkets populated successfully');
    },
    
    /**
     * Update selected trinkets in grid (add/remove selected class and show counts)
     */
    updateSelectedTrinketsInGrid(selectedTrinketIds, equippedTrinkets) {
        const grid = document.getElementById('trinket-list');
        if (!grid) return;
        
        // Remove selected class and count badges from all items
        grid.querySelectorAll('.trinket-grid-item').forEach(item => {
            item.classList.remove('selected');
            const existingBadge = item.querySelector('.count-badge');
            if (existingBadge) {
                existingBadge.remove();
            }
        });
        
        // Add selected class and count badges to equipped trinkets
        equippedTrinkets.forEach(entry => {
            const trinket = entry.trinket || entry;
            const count = entry.count || 0;
            const trinketId = trinket.id;
            
            const selectedItem = grid.querySelector(`[data-trinket-id="${trinketId}"]`);
            if (selectedItem) {
                selectedItem.classList.add('selected');
                
                // Add count badge for stackable trinkets with count > 0
                if (trinket.stackable && count > 0) {
                    const badge = document.createElement('div');
                    badge.className = 'count-badge';
                    badge.textContent = `x${count}`;
                    selectedItem.appendChild(badge);
                }
            }
        });
    },
    
    /**
     * Get trinket category for filtering (legacy - now stored in data)
     */
    _getTrinketCategory(trinket) {
        return trinket.filterCategory || trinket.category || 'other';
    },
    
    /**
     * Format trinket effect for display (legacy - now stored in data)
     */
    _formatTrinketEffect(trinket) {
        return trinket.effect || '';
    },

    /**
     * Populate team member dropdowns
     */
    populateTeamDropdowns(toons) {
        for (let i = 1; i <= 7; i++) {
            const select = document.getElementById(`team-${i}`);
            if (!select) continue;
            
            select.innerHTML = '<option value="">-- Empty --</option>';
            
            toons.forEach(toon => {
                const option = document.createElement('option');
                option.value = toon.id;
                option.textContent = toon.name;
                select.appendChild(option);
            });
        }
    },

    /**
     * Update team abilities section based on selected team members
     */
    updateTeamAbilities(teamMembers, activeAbilities = []) {
        const container = document.getElementById('team-abilities');
        const emptyMessage = container.querySelector('.empty-message');
        
        // Collect all abilities with teamEffect (one entry per team member)
        const teamAbilities = [];
        teamMembers.forEach((toon, index) => {
            if (!toon) return;
            
            // Check both ability and ability2 for team effects
            [toon.ability, toon.ability2].forEach(ability => {
                if (ability && ability.teamEffect) {
                    teamAbilities.push({
                        ability: ability,
                        toonName: toon.name,
                        uniqueId: `${ability.id}_${index}` // Unique ID for this specific instance
                    });
                }
            });
        });

        // Build set of active ability unique IDs for quick lookup
        const activeAbilityIds = new Set();
        teamAbilities.forEach((item, index) => {
            // Check if this ability instance should be checked based on activeAbilities count
            const abilityInstancesInActive = activeAbilities.filter(a => a.id === item.ability.id).length;
            const abilityInstancesBeforeThis = teamAbilities.slice(0, index).filter(t => t.ability.id === item.ability.id).length;
            if (abilityInstancesBeforeThis < abilityInstancesInActive) {
                activeAbilityIds.add(item.uniqueId);
            }
        });

        // Clear existing checkboxes
        container.querySelectorAll('.ability-checkbox').forEach(el => el.remove());

        // Add abilities
        if (teamAbilities.length > 0) {
            emptyMessage.style.display = 'none';
            
            teamAbilities.forEach(({ ability, toonName, uniqueId }) => {
                const label = document.createElement('label');
                label.className = 'ability-checkbox';
                
                const effectText = this._formatTeamAbilityEffect(ability);
                const isChecked = activeAbilityIds.has(uniqueId) ? 'checked' : '';
                
                label.innerHTML = `
                    <input type="checkbox" value="${ability.id}" data-unique-id="${uniqueId}" ${isChecked}>
                    <span class="ability-name">${ability.name}</span>
                    <span class="ability-effect">${effectText}</span>
                `;
                
                container.appendChild(label);
            });
        } else {
            emptyMessage.style.display = 'block';
        }
    },

    /**
     * Format ability effect for display
     */
    _formatAbilityEffect(ability) {
        const percent = Math.round(ability.value * 100);
        const stat = this._formatStatName(ability.targetStat);
        return `+${percent}% ${stat}`;
    },

    /**
     * Format team ability effect for display
     */
    _formatTeamAbilityEffect(ability) {
        if (!ability.teamEffect) {
            return '';
        }
        
        // Build effect description from teamEffect properties
        const effects = [];
        
        if (ability.teamEffect.movementSpeed !== undefined) {
            const percent = Math.round(ability.teamEffect.movementSpeed * 100);
            effects.push(`+${percent}% Movement Speed`);
        }
        
        if (ability.teamEffect.extractionSpeed !== undefined) {
            const percent = Math.round(ability.teamEffect.extractionSpeed * 100);
            effects.push(`+${percent}% Extraction Speed`);
        }
        
        if (ability.teamEffect.staminaRegen !== undefined) {
            const percent = Math.round(ability.teamEffect.staminaRegen * 100);
            effects.push(`+${percent}% Stamina Regen`);
        }
        
        if (ability.teamEffect.skillCheckSize !== undefined) {
            const percent = Math.round(ability.teamEffect.skillCheckSize * 100);
            effects.push(`+${percent}% Skill Check Size`);
        }
        
        if (ability.teamEffect.skillCheckChance !== undefined) {
            const appType = ability.teamEffect.skillCheckChanceApplicationType || ability.teamEffect.applicationType || 'multiplicative';
            const percent = Math.round(ability.teamEffect.skillCheckChance * 100);
            if (appType === 'additive') {
                effects.push(`+${percent}% Skill Check Chance (flat)`);
            } else {
                effects.push(`+${percent}% Skill Check Chance`);
            }
        }
        
        return effects.join(', ') || 'Team Buff';
    },

    /**
     * Format stat name for display
     */
    _formatStatName(statName) {
        const names = {
            'movementSpeed': 'Movement Speed',
            'stealth': 'Stealth',
            'stealthRating': 'Stealth',
            'extractionSpeed': 'Extraction Speed',
            'stamina': 'Stamina',
            'skillCheckAmount': 'Skill Check Bonus'
        };
        return names[statName] || statName;
    },

    /**
     * Populate items list as a grid of clickable images
     */
    populateItemsList(items) {
        const container = document.getElementById('active-items');
        if (!container) {
            console.error('Items list container not found!');
            return;
        }
        
        // Filter out items that don't affect stats (hidden from UI)
        // Check both the explicit hidden property and the hardcoded list for backward compatibility
        const hiddenItemNames = [
            'Bandage', 'Basket', 'Bottle o\' Pop', 'Gumballs', 'Health Kit',
            'Ichor', 'Jawbreaker', 'Jumper Cable', 'Ornament', 'Pumpkin',
            'Smoke Bomb', 'Tapes', 'Valve'
        ];
        
        const displayableItems = items.filter(item => 
            !item.hidden && !hiddenItemNames.includes(item.name)
        );
        
        container.innerHTML = '';
        console.log(`Populating ${displayableItems.length} items (${items.length - displayableItems.length} hidden)`);
        
        // Sort items alphabetically by name
        const sortedItems = [...displayableItems].sort((a, b) => a.name.localeCompare(b.name));
        
        sortedItems.forEach(item => {
            // Use image_name from data, fall back to id.png
            const imageFileName = item.image_name || `${item.id}.png`;
            const imagePath = `assets/images/items/${imageFileName}`;
            
            const itemDiv = document.createElement('div');
            itemDiv.className = 'item-grid-item';
            itemDiv.dataset.itemId = item.id;
            itemDiv.title = `${item.name}\n${item.effect || ''}`;
            
            // Image/Placeholder container
            const imgContainer = document.createElement('div');
            imgContainer.className = 'item-grid-image';
            imgContainer.textContent = item.name.charAt(0).toUpperCase();
            
            // Counter overlay (initially hidden)
            const counterOverlay = document.createElement('div');
            counterOverlay.className = 'item-counter-overlay';
            counterOverlay.textContent = '';
            counterOverlay.style.display = 'none';
            
            // Try to load actual image
            const img = new Image();
            img.onload = function() {
                imgContainer.style.backgroundImage = `url(${imagePath})`;
                imgContainer.textContent = '';
                imgContainer.style.backgroundSize = 'cover';
                imgContainer.style.backgroundPosition = 'center';
            };
            img.onerror = function() {
                console.warn(`Failed to load item image: ${imagePath}`);
            };
            img.src = imagePath;
            
            itemDiv.appendChild(imgContainer);
            itemDiv.appendChild(counterOverlay);
            container.appendChild(itemDiv);
        });
        
        console.log('Items populated successfully');
    },

    /**
     * Update item counter overlays based on active items state
     */
    updateItemCounters(activeItems) {
        // Reset all items first
        document.querySelectorAll('.item-grid-item').forEach(item => {
            item.classList.remove('selected');
            const overlay = item.querySelector('.item-counter-overlay');
            if (overlay) {
                overlay.textContent = '';
                overlay.style.display = 'none';
            }
        });
        
        // Update active items
        activeItems.forEach(({ item, count }) => {
            const itemEl = document.querySelector(`[data-item-id="${item.id}"]`);
            if (itemEl && count > 0) {
                itemEl.classList.add('selected');
                const overlay = itemEl.querySelector('.item-counter-overlay');
                if (overlay) {
                    overlay.textContent = `x${count}`;
                    overlay.style.display = 'flex';
                }
            }
        });
    },

    /**
     * Format item effect for display
     */
    _formatItemEffect(effect) {
        const percent = Math.round(effect.value * 100);
        const stat = this._formatStatName(effect.targetStat);
        return `+${percent}% ${stat}`;
    },

    /**
     * Update stats display
     */
    updateStatsDisplay(statsResult, toon = null, conditionalStatSet = null) {
        if (!statsResult) return;

        const tbody = document.querySelector('.stats-table tbody');
        
        // Get hearts for the Health row
        let heartsHTML = '';
        if (toon && toon.baseStats && toon.baseStats.hearts) {
            heartsHTML = '♥'.repeat(toon.baseStats.hearts);
        }
        
        const stats = [
            { name: 'Health', key: 'health', isHealthRow: true, heartsHTML: heartsHTML, group: 'health' },
            { name: 'Skill Check Size', key: 'skillCheckSize', derivedStat: true, starKey: 'skillCheckAmount', group: 'skill-check' },
            { name: 'Skill Check Amount', key: 'skillCheckAmount', group: 'skill-check' },
            { name: 'Skill Check Chance', key: 'skillCheckChance', isPercentage: true, group: 'skill-check' },
            { name: 'Walk Speed', key: 'walkSpeed', group: 'movement' },
            { name: 'Run Speed', key: 'runSpeed', group: 'movement' },
            { name: 'Stamina', key: 'stamina', group: 'stamina' },
            { name: 'Stamina Regeneration', key: 'staminaRegen', baseValue: 2.4, group: 'stamina', suffix: '/s' },
            { name: 'Stealth', key: 'stealth', group: 'stealth' },
            { name: 'Extraction Speed', key: 'extractionSpeed', group: 'extraction' }
        ];

        tbody.innerHTML = stats.map(stat => {
            // Special handling for Health row
            if (stat.isHealthRow) {
                return `
                    <tr class="stat-group-${stat.group}">
                        <td class="stat-name">${stat.name}</td>
                        <td class="stat-stars stat-hearts">${stat.heartsHTML}</td>
                        <td class="stat-base">-</td>
                        <td class="stat-modifier">-</td>
                        <td class="stat-final">-</td>
                    </tr>
                `;
            }
            
            let base, final, percent;
            
            // Handle stats with a fixed base value (like Stamina Regeneration)
            if (stat.baseValue !== undefined) {
                base = stat.baseValue;
                // Check if there's a calculated final value, otherwise use base
                final = statsResult.final[stat.key] !== undefined ? statsResult.final[stat.key] : base;
                percent = statsResult.percentages && statsResult.percentages[stat.key] !== undefined ? statsResult.percentages[stat.key] : 0;
            }
            // Handle derived stats (like Skill Check Size) - now can be modified!
            else if (stat.derivedStat && toon && toon.starRatings && stat.starKey) {
                const starRating = toon.starRatings[stat.starKey];
                // Use the base value from the calculator if available (includes base stat increases)
                if (statsResult.derivedStatBases && statsResult.derivedStatBases[stat.key] !== undefined) {
                    base = statsResult.derivedStatBases[stat.key];
                } else {
                    // Fallback: calculate from data loader
                    base = DataLoader.getStatValue(stat.key, starRating);
                }
                // Check if we have calculated values for this derived stat
                if (statsResult.final[stat.key] !== undefined) {
                    final = statsResult.final[stat.key];
                    percent = statsResult.percentages[stat.key] || 0;
                } else {
                    // Fallback: no modifiers
                    final = base;
                    percent = 0;
                }
            } else {
                base = statsResult.base[stat.key];
                final = statsResult.final[stat.key];
                percent = statsResult.percentages[stat.key] || 0;
            }
            
            // For MOD column color, we should compare against the original base (before base stat increases)
            let originalBase = base;  // Default fallback
            
            // For normal stats, use originalBase from stats result
            if (statsResult.originalBase && statsResult.originalBase[stat.key] !== undefined) {
                originalBase = statsResult.originalBase[stat.key];
            }
            // For derived stats, check if we have tracked the original base value
            else if (statsResult.derivedStatBases) {
                const originalKey = stat.key + '_original';
                if (statsResult.derivedStatBases[originalKey] !== undefined) {
                    originalBase = statsResult.derivedStatBases[originalKey];
                }
            }
            
            // Special handling for Skill Check Chance (applies directly to base, not as modifier)
            let modifierDisplay = stat.noModifier ? '-' : (percent > 0 ? `+${percent}%` : `${percent}%`);
            if (stat.key === 'skillCheckChance') {
                // For Skill Check Chance, always show the absolute change (e.g., +25% or -5%)
                // skillCheckChance values are in decimal form (0.25 = 25%), so we convert the difference to percentage
                const absoluteChange = final - originalBase;
                const absoluteChangePercent = Math.round(absoluteChange * 100);
                if (absoluteChangePercent !== 0) {
                    modifierDisplay = absoluteChangePercent > 0 ? `+${absoluteChangePercent}%` : `${absoluteChangePercent}%`;
                } else {
                    modifierDisplay = '-';
                }
            } 
            // For other stats, ONLY show percentage modifiers. Base stat changes should not appear in MOD column.
            else if (percent !== 0) {
                // Show the percentage modifier
                modifierDisplay = percent > 0 ? `+${percent}%` : `${percent}%`;
            } else {
                // No percentage modifier - show as "-"
                modifierDisplay = '-';
            }
            
            let modifierClass = percent > 0 ? 'positive' : (percent < 0 ? 'negative' : '');
            // For Skill Check Chance, use the absolute change instead
            if (stat.key === 'skillCheckChance') {
                const absoluteChange = final - originalBase;
                const absoluteChangePercent = Math.round(absoluteChange * 100);
                modifierClass = absoluteChangePercent > 0 ? 'positive' : (absoluteChangePercent < 0 ? 'negative' : '');
            }
            
            // Determine color for BASE column based on whether base changed from original
            const baseClass = base > originalBase ? 'positive' : (base < originalBase ? 'negative' : '');
            
            // Get star rating if toon is provided
            let stars = '';
            if (toon && toon.starRatings) {
                const starKey = stat.starKey || stat.key;
                if (toon.starRatings[starKey] !== undefined) {
                    let starCount = toon.starRatings[starKey];
                    
                    // Check if the base value changed (from conditionalStats or base stat overrides)
                    const toonOriginalBase = toon.baseStats[stat.key];
                    const currentBase = base;
                    
                    if (currentBase !== undefined && currentBase !== toonOriginalBase) {
                        // Recalculate stars based on the new base value
                        if (stat.key === 'stamina') {
                            if (currentBase >= 200) starCount = 5;
                            else if (currentBase >= 175) starCount = 4;
                            else if (currentBase >= 150) starCount = 3;
                            else if (currentBase >= 125) starCount = 2;
                            else starCount = 1;
                        }
                        // For walkSpeed and runSpeed
                        else if (stat.key === 'walkSpeed' || stat.key === 'runSpeed') {
                            if (currentBase >= 60) starCount = 5; // Allow for dash abilities
                            else if (currentBase >= 20) starCount = 5;
                            else if (currentBase >= 17.5) starCount = 4;
                            else if (currentBase >= 15) starCount = 3;
                            else if (currentBase >= 12.5) starCount = 2;
                            else starCount = 1;
                        }
                        // For extractionSpeed
                        else if (stat.key === 'extractionSpeed') {
                            if (currentBase >= 1.5) starCount = 5;
                            else if (currentBase >= 1.2) starCount = 4;
                            else if (currentBase >= 1.0) starCount = 3;
                            else if (currentBase >= 0.85) starCount = 2;
                            else starCount = 1;
                        }
                    }
                    
                    stars = '★'.repeat(starCount);
                }
            }
            
            // Format values for percentage stats
            const suffix = stat.suffix || '';
            const decimals = stat.key === 'extractionSpeed' ? 2 : 1;
            const baseDisplay = stat.isPercentage ? `${(base * 100).toFixed(0)}%` : `${base.toFixed(decimals)}${suffix}`;
            const finalDisplay = stat.isPercentage ? `${(final * 100).toFixed(0)}%` : `${final.toFixed(decimals)}${suffix}`;
            
            return `
                <tr class="stat-group-${stat.group}">
                    <td class="stat-name">${stat.name}</td>
                    <td class="stat-stars">${stars}</td>
                    <td class="stat-base ${baseClass}">${baseDisplay}</td>
                    <td class="stat-modifier ${modifierClass}">${modifierDisplay}</td>
                    <td class="stat-final">${finalDisplay}</td>
                </tr>
            `;
        }).join('');
    },

    /**
     * Update machine extraction display
     */
    updateMachineExtraction(extractionResult) {
        if (!extractionResult) return;

        // Update Default / Circle Machines section
        const baseTimeEl = document.getElementById('default-base-time');
        const avgTimeEl = document.getElementById('default-average-time');
        const checksEl = document.getElementById('default-expected-checks');
        
        if (baseTimeEl) baseTimeEl.textContent = `${extractionResult.defaultTime}s`;
        if (avgTimeEl) avgTimeEl.textContent = `${extractionResult.averageTime}s`;
        if (checksEl) checksEl.textContent = `${extractionResult.expectedSkillChecks}`;
    },

    /**
     * Update twisted comparison table with images
     */
    updateTwistedTable(twisteds, playerWalkSpeed, playerRunSpeed, preSorted = false) {
        const tbody = document.querySelector('.twisted-table-compact tbody');
        if (!tbody) return;
        
        // Use provided array if already sorted, otherwise sort by Normal Run speed
        const sortedTwisteds = preSorted ? twisteds : [...twisteds].sort((a, b) => {
            // Primary sort: Normal Run speed (fastest first)
            const runDiff = b.speeds.normal.run - a.speeds.normal.run;
            if (runDiff !== 0) return runDiff;
            
            // Secondary sort: Normal Walk speed (fastest first) when run speeds are equal
            return b.speeds.normal.walk - a.speeds.normal.walk;
        });
        
        // Check if we can do a fast update (same twisteds in same order, just different colors)
        const existingRows = tbody.querySelectorAll('tr');
        let canFastUpdate = existingRows.length === sortedTwisteds.length;
        
        // Also verify that the twisteds are in the same order
        if (canFastUpdate) {
            for (let i = 0; i < existingRows.length; i++) {
                const row = existingRows[i];
                const twisted = sortedTwisteds[i];
                const nameCell = row.querySelector('.twisted-name span');
                if (nameCell && nameCell.textContent !== twisted.name) {
                    canFastUpdate = false;
                    break;
                }
            }
        }
        
        if (canFastUpdate) {
            // Fast path: just update speed cell colors and values
            existingRows.forEach((row, index) => {
                const twisted = sortedTwisteds[index];
                const speeds = twisted.speeds;
                
                // Calculate colors for each speed
                const colors = {
                    normalRun: Calculator.compareTwistedSpeed(playerWalkSpeed, playerRunSpeed, speeds.normal.run),
                    panicRun: Calculator.compareTwistedSpeed(playerWalkSpeed, playerRunSpeed, speeds.panic.run),
                    panicSuppRun: Calculator.compareTwistedSpeed(playerWalkSpeed, playerRunSpeed, speeds.panicSuppressed.run)
                };
                
                // Update speed cells (skip first cell which is the name)
                const speedCells = row.querySelectorAll('.speed-value');
                const speedData = [
                    { value: speeds.normal.run, color: colors.normalRun },
                    { value: speeds.panic.run, color: colors.panicRun },
                    { value: speeds.panicSuppressed.run, color: colors.panicSuppRun }
                ];
                
                speedCells.forEach((cell, i) => {
                    const { value, color } = speedData[i];
                    cell.textContent = value.toFixed(1);
                    // Remove all color classes and add the new one
                    cell.className = `speed-value ${color}`;
                });
            });
            return; // Early exit - we're done
        }
        
        // Slow path: rebuild the entire table
        tbody.innerHTML = '';
        
        sortedTwisteds.forEach(twisted => {
            const speeds = twisted.speeds;
            const imagePath = `assets/images/${twisted.image}`;
            
            // Calculate colors for each speed
            const colors = {
                normalWalk: Calculator.compareTwistedSpeed(playerWalkSpeed, playerRunSpeed, speeds.normal.walk),
                normalRun: Calculator.compareTwistedSpeed(playerWalkSpeed, playerRunSpeed, speeds.normal.run),
                panicWalk: Calculator.compareTwistedSpeed(playerWalkSpeed, playerRunSpeed, speeds.panic.walk),
                panicRun: Calculator.compareTwistedSpeed(playerWalkSpeed, playerRunSpeed, speeds.panic.run),
                panicSuppWalk: Calculator.compareTwistedSpeed(playerWalkSpeed, playerRunSpeed, speeds.panicSuppressed.walk),
                panicSuppRun: Calculator.compareTwistedSpeed(playerWalkSpeed, playerRunSpeed, speeds.panicSuppressed.run)
            };
            
            const firstLetter = twisted.name.replace('Twisted ', '').charAt(0).toUpperCase();
            
            const row = document.createElement('tr');
            
            // Name cell with image
            const nameCell = document.createElement('td');
            nameCell.className = 'twisted-name';
            const nameDiv = document.createElement('div');
            nameDiv.className = 'twisted-name-cell';
            
            // Create placeholder image container
            const imgContainer = document.createElement('div');
            imgContainer.className = 'twisted-image';
            imgContainer.textContent = firstLetter;
            imgContainer.title = twisted.name;
            
            // Try to load actual image
            const img = new Image();
            img.onload = function() {
                imgContainer.style.backgroundImage = `url(${imagePath})`;
                imgContainer.textContent = '';
                imgContainer.style.backgroundSize = 'cover';
                imgContainer.style.backgroundPosition = 'center';
            };
            img.src = imagePath;
            
            const nameSpan = document.createElement('span');
            nameSpan.textContent = twisted.name;
            
            nameDiv.appendChild(imgContainer);
            nameDiv.appendChild(nameSpan);
            nameCell.appendChild(nameDiv);
            row.appendChild(nameCell);
            
            // Speed cells (Run speeds only)
            const speedValues = [
                { value: speeds.normal.run, color: colors.normalRun },
                { value: speeds.panic.run, color: colors.panicRun },
                { value: speeds.panicSuppressed.run, color: colors.panicSuppRun }
            ];
            
            speedValues.forEach(({ value, color }) => {
                const td = document.createElement('td');
                td.className = `speed-value ${color}`;
                td.textContent = value.toFixed(1);
                row.appendChild(td);
            });
            
            tbody.appendChild(row);
        });
    },
    
    /**
     * Update selected toon in grid (add/remove selected class)
     */
    updateSelectedToonInGrid(toonId) {
        const grid = document.getElementById('toon-grid');
        if (!grid) return;
        
        // Remove selected class from all items
        grid.querySelectorAll('.toon-grid-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        // Add selected class to the clicked item
        if (toonId) {
            const selectedItem = grid.querySelector(`[data-toon-id="${toonId}"]`);
            if (selectedItem) {
                selectedItem.classList.add('selected');
            }
            
            const toon = DataLoader.getToon(toonId);
            if (toon) {
                // Update abilities display
                this.updateAbilitiesDisplay(toon);
            }
        }
    },
    
    /**
     * Update team toon selection display (borders and counters)
     */
    updateTeamToonSelection(teamToons, selectedToonId) {
        const grid = document.getElementById('toon-grid');
        if (!grid) return;
        
        // Remove team selection classes from all items
        grid.querySelectorAll('.toon-grid-item').forEach(item => {
            item.classList.remove('team-selected', 'mixed-selected');
            const overlay = item.querySelector('.toon-counter-overlay');
            if (overlay) {
                overlay.textContent = '';
                overlay.style.display = 'none';
            }
        });
        
        // Add team selection classes and counters
        for (const [toonId, count] of Object.entries(teamToons)) {
            if (count === 0) continue;
            
            const toonItem = grid.querySelector(`[data-toon-id="${toonId}"]`);
            if (toonItem) {
                // Check if this is also the player's toon
                if (toonId === selectedToonId) {
                    toonItem.classList.add('mixed-selected');
                } else {
                    toonItem.classList.add('team-selected');
                }
                
                // Show counter
                const overlay = toonItem.querySelector('.toon-counter-overlay');
                if (overlay) {
                    overlay.textContent = `x${count}`;
                    overlay.style.display = 'flex';
                }
            }
        }
    },
    
    /**
     * Update selected toon image (legacy - for dropdown mode)
     */
    updateSelectedToonImage(toonId) {
        const wrapper = document.querySelector('.toon-selection-wrapper');
        if (!wrapper) return;
        
        const existingImg = document.getElementById('selected-toon-image');
        if (existingImg) {
            existingImg.remove();
        }
        
        if (toonId) {
            const toon = DataLoader.getToon(toonId);
            if (!toon) return;
            
            const imagePath = `assets/images/toons/${toonId}.png`;
            
            // Create image/placeholder container
            const imgContainer = document.createElement('div');
            imgContainer.id = 'selected-toon-image';
            imgContainer.className = 'selected-toon-image';
            imgContainer.textContent = toon.name.charAt(0).toUpperCase();
            imgContainer.title = toon.name;
            
            // Try to load actual image
            const img = new Image();
            img.onload = function() {
                imgContainer.style.backgroundImage = `url(${imagePath})`;
                imgContainer.textContent = '';
                imgContainer.style.backgroundSize = 'cover';
                imgContainer.style.backgroundPosition = 'center';
            };
            img.src = imagePath;
            
            const dropdown = wrapper.querySelector('.toon-dropdown');
            wrapper.insertBefore(imgContainer, dropdown);
            
            // Update abilities display
            this.updateAbilitiesDisplay(toon);
        }
    },
    
    /**
     * Update abilities display for selected toon
     */
    updateAbilitiesDisplay(toon) {
        const abilitiesContainer = document.getElementById('abilities-display');
        if (!abilitiesContainer) return;
        
        abilitiesContainer.innerHTML = '';
        
        if (!toon) {
            abilitiesContainer.style.display = 'none';
            return;
        }
        
        // Always show 2 ability boxes
        abilitiesContainer.style.display = 'flex';
        
        for (let i = 0; i < 2; i++) {
            const ability = i === 0 ? toon.ability : toon.ability2;
            
            const abilityBox = document.createElement('div');
            abilityBox.className = 'ability-box';
            
            if (ability) {
                // Extract (Active), (Passive), or (Toggle) from description
                const typeMatch = ability.description.match(/^\((Active|Passive|Toggle)\)\s*/);
                const abilityType = typeMatch ? ` (${typeMatch[1]})` : '';
                const cleanDescription = ability.description.replace(/^\((Active|Passive|Toggle)\)\s*/, '');
                
                // Add checkbox if ability has toggle
                if (ability.hasToggle) {
                    const toggleContainer = document.createElement('div');
                    toggleContainer.className = 'ability-toggle';
                    
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.className = 'ability-checkbox';
                    checkbox.id = `ability-toggle-${ability.id}`;
                    checkbox.checked = false; // Default to off
                    
                    // Load saved state from localStorage (only for team abilities)
                    // Player abilities always start unchecked
                    const savedState = localStorage.getItem(`ability-${ability.id}-state`);
                    if (savedState !== null) {
                        checkbox.checked = savedState === 'true';
                    }
                    
                    // Save state when changed
                    checkbox.addEventListener('change', (e) => {
                        localStorage.setItem(`ability-${ability.id}-state`, e.target.checked);
                        // Trigger recalculation
                        if (window.App && window.App.updateDisplay) {
                            window.App.updateDisplay();
                        }
                    });
                    
                    toggleContainer.appendChild(checkbox);
                    abilityBox.appendChild(toggleContainer);
                }
                
                const title = document.createElement('div');
                title.className = 'ability-title';
                title.textContent = ability.name + abilityType;
                
                const description = document.createElement('div');
                description.className = 'ability-description';
                description.textContent = cleanDescription;
                
                abilityBox.appendChild(title);
                abilityBox.appendChild(description);
            } else {
                // Empty box
                abilityBox.classList.add('empty');
            }
            
            abilitiesContainer.appendChild(abilityBox);
        }
    },

    /**
     * Show/hide conditional stats selector
     */
    showConditionalStats(conditionalStats) {
        const container = document.getElementById('conditional-stats');
        
        if (!conditionalStats || conditionalStats.length === 0) {
            container.style.display = 'none';
            return;
        }

        container.style.display = 'block';
        const optionsDiv = container.querySelector('.stat-options');
        
        optionsDiv.innerHTML = conditionalStats.map((statSet, index) => `
            <label class="radio-option">
                <input type="radio" name="stat-set" value="${statSet.id}" ${index === 0 ? 'checked' : ''}>
                <span>${statSet.name}</span>
            </label>
        `).join('');
    },

    /**
     * Show toast notification
     */
    showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
};