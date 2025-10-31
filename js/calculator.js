/**
 * calculator.js
 * Core stat calculation engine based on generator_models.py
 */

const Calculator = {
    /**
     * Calculate final stats for a toon with all modifiers applied
     * @param {Object} toon - The selected toon
     * @param {Array} trinkets - Array of equipped trinket objects
     * @param {Array} teamAbilities - Array of active team ability objects
     * @param {Array} items - Array of {item, count} objects
     * @param {Object} conditionalStatSet - Optional conditional stat override
     * @param {number} teamSize - Number of toons on team (for Boxten's ability)
     * @returns {Object} Final calculated stats
     */
    calculateFinalStats(toon, trinkets, teamAbilities, items, conditionalStatSet, teamSize = 1) {
        if (!toon) {
            return null;
        }

        // Start with base stats
        let baseStats = { ...toon.baseStats };

        // Apply conditional stat set if selected (e.g., Looey's hearts, Razzle & Dazzle floors)
        if (conditionalStatSet && conditionalStatSet.statModifiers) {
            baseStats = { ...baseStats, ...conditionalStatSet.statModifiers };
        }

        // Keep track of the base stats BEFORE applying base stat increases
        let originalBase = { ...baseStats };

        // Apply base stat overrides from toggled player abilities (Flutter, Rudie, Eclipse)
        this._applyBaseStatOverrides(toon, baseStats);
        
        // Update originalBase if base stat overrides were applied
        originalBase = { ...baseStats };

        // Apply direct base stat increases from trinkets/items (e.g., Cooler's +50 stamina)
        this._applyBaseStatIncreases(trinkets, items, baseStats, teamSize);

        // Collect all multiplicative and additive modifiers by stat
        const modifiers = {
            movementSpeed: { multiplicative: [], additive: 0 },
            walkSpeed: { multiplicative: [], additive: 0 },  // Walk-only modifiers
            runSpeed: { multiplicative: [], additive: 0 },   // Run-only modifiers
            stealth: { multiplicative: [], additive: 0 },
            extractionSpeed: { multiplicative: [], additive: 0 },
            stamina: { multiplicative: [], additive: 0 },
            skillCheckAmount: { multiplicative: [], additive: 0 },
            skillCheckSize: { multiplicative: [], additive: 0 },
            skillCheckChance: { multiplicative: [], additive: 0 },
            staminaRegen: { multiplicative: [], additive: 0 }
        };

        // Apply player toon abilities
        this._applyPlayerAbilities(toon, modifiers, teamSize);

        // Apply conditional modifier overrides (e.g., Looey's heart-based speed boost)
        if (conditionalStatSet && conditionalStatSet.modifierOverrides) {
            Object.entries(conditionalStatSet.modifierOverrides).forEach(([stat, value]) => {
                if (modifiers[stat]) {
                    modifiers[stat].multiplicative.push({ value: value, cap: null });
                }
            });
        }

        // Handle Bone trinket separately - it needs special logic for the 40 cap
        const boneModifiers = this._extractBoneModifiers(trinkets);
        
        // Add trinket modifiers (but skip Bone trinkets for now)
        trinkets.forEach(trinketEntry => {
            // Handle both old format (just trinket object) and new format ({trinket, count})
            const trinket = trinketEntry.trinket || trinketEntry;
            const count = trinketEntry.count || 1;
            
            if (trinket && trinket.effects) {
                // Skip Bone trinket - it's handled separately
                if (trinket.id === 'bone') {
                    return;
                }
                
                // Apply effects multiple times for stackable trinkets
                for (let i = 0; i < count; i++) {
                    trinket.effects.forEach(effect => {
                        // Skip baseStatIncrease effects - they're handled in _applyBaseStatIncreases
                        if (effect.applicationType === 'baseStatIncrease') {
                            return;
                        }
                        
                        const stat = this._mapTargetStat(effect.targetStat);
                        if (modifiers[stat]) {
                            if (effect.applicationType === 'multiplicative') {
                                modifiers[stat].multiplicative.push({
                                    value: effect.value,
                                    cap: effect.cap || null
                                });
                            } else if (effect.applicationType === 'additive') {
                                modifiers[stat].additive += effect.value;
                            }
                        }
                    });
                }
            }
        });
        
        // Now apply Bone modifiers with special capping logic
        if (boneModifiers.count > 0) {
            this._applyBoneModifiers(baseStats, modifiers, boneModifiers);
        }

        // Add team ability modifiers
        // Note: Team abilities are already filtered by the app - if they're in this array, they're enabled
        teamAbilities.forEach(ability => {
            // Apply teamEffect if present
            if (ability.teamEffect) {
                this._applyTeamEffect(ability.teamEffect, modifiers);
            }
            // Otherwise use the legacy approach
            else if (ability && ability.applicationType === 'multiplicative') {
                const stat = this._mapTargetStat(ability.targetStat);
                if (modifiers[stat]) {
                    modifiers[stat].multiplicative.push({
                        value: ability.value,
                        cap: null
                    });
                }
            }
        });

        // Add item modifiers (with counts)
        items.forEach(itemObj => {
            if (itemObj.item && itemObj.item.effects && itemObj.count > 0) {
                itemObj.item.effects.forEach(effect => {
                    if (effect.applicationType === 'multiplicative') {
                        const stat = this._mapTargetStat(effect.targetStat);
                        if (modifiers[stat]) {
                            // Add modifier once per item count
                            for (let i = 0; i < itemObj.count; i++) {
                                modifiers[stat].multiplicative.push({
                                    value: effect.value,
                                    cap: null
                                });
                            }
                        }
                    }
                });
            }
        });

        // Calculate final stats
        const STAMINA_REGEN_BASE = 2.4;
        
        // Get skill check size base value from star rating
        const skillCheckAmountStars = toon.starRatings.skillCheckAmount;
        const skillCheckSizeBase_original = DataLoader.getStatValue('skillCheckSize', skillCheckAmountStars);
        let skillCheckSizeBase = skillCheckSizeBase_original;
        
        // Apply any base stat increases to skillCheckSize (e.g., Thinking Cap's +40 units)
        trinkets.forEach(trinketEntry => {
            const trinket = trinketEntry.trinket || trinketEntry;
            const count = trinketEntry.count || 1;
            if (trinket && trinket.effects) {
                // Apply effects multiple times for stackable trinkets
                for (let i = 0; i < count; i++) {
                    trinket.effects.forEach(effect => {
                        if (effect.targetStat === 'skillCheckSize' && effect.applicationType === 'baseStatIncrease') {
                            skillCheckSizeBase += effect.value;
                        }
                    });
                }
            }
        });
        
        items.forEach(itemObj => {
            if (itemObj.item && itemObj.item.effects && itemObj.count > 0) {
                // Apply effects multiple times for stacked items
                for (let i = 0; i < itemObj.count; i++) {
                    itemObj.item.effects.forEach(effect => {
                        if (effect.targetStat === 'skillCheckSize' && effect.applicationType === 'baseStatIncrease') {
                            skillCheckSizeBase += effect.value;
                        }
                    });
                }
            }
        });

        // Combine movementSpeed and walk/run-specific modifiers
        const walkSpeedModifiers = {
            multiplicative: [...modifiers.movementSpeed.multiplicative, ...modifiers.walkSpeed.multiplicative],
            additive: modifiers.movementSpeed.additive + modifiers.walkSpeed.additive
        };
        const runSpeedModifiers = {
            multiplicative: [...modifiers.movementSpeed.multiplicative, ...modifiers.runSpeed.multiplicative],
            additive: modifiers.movementSpeed.additive + modifiers.runSpeed.additive
        };
        
        const finalStats = {
            walkSpeed: this._applyAllModifiers(baseStats.walkSpeed, walkSpeedModifiers),
            runSpeed: this._applyAllModifiers(baseStats.runSpeed, runSpeedModifiers),
            stealth: this._applyAllModifiers(baseStats.stealth, modifiers.stealth),
            extractionSpeed: this._applyAllModifiers(baseStats.extractionSpeed, modifiers.extractionSpeed),
            stamina: this._applyAllModifiers(baseStats.stamina, modifiers.stamina),
            skillCheckAmount: this._applyAllModifiers(baseStats.skillCheckAmount, modifiers.skillCheckAmount, true, 2),
            skillCheckSize: this._applyAllModifiers(skillCheckSizeBase, modifiers.skillCheckSize),
            skillCheckChance: this._applyAllModifiers(baseStats.skillCheckChance, modifiers.skillCheckChance, false),
            staminaRegen: this._applyAllModifiers(STAMINA_REGEN_BASE, modifiers.staminaRegen),
            hearts: baseStats.hearts
        };

        // Calculate percentage modifiers for display
        const percentages = {
            walkSpeed: this._calculatePercentage(walkSpeedModifiers.multiplicative, walkSpeedModifiers.additive, baseStats.walkSpeed),
            runSpeed: this._calculatePercentage(runSpeedModifiers.multiplicative, runSpeedModifiers.additive, baseStats.runSpeed),
            stealth: this._calculatePercentage(modifiers.stealth.multiplicative, modifiers.stealth.additive, baseStats.stealth),
            extractionSpeed: this._calculatePercentage(modifiers.extractionSpeed.multiplicative, modifiers.extractionSpeed.additive, baseStats.extractionSpeed),
            stamina: this._calculatePercentage(modifiers.stamina.multiplicative, modifiers.stamina.additive, baseStats.stamina),
            skillCheckAmount: this._calculatePercentage(modifiers.skillCheckAmount.multiplicative, modifiers.skillCheckAmount.additive, baseStats.skillCheckAmount),
            skillCheckSize: this._calculatePercentage(modifiers.skillCheckSize.multiplicative, modifiers.skillCheckSize.additive, skillCheckSizeBase),
            staminaRegen: this._calculatePercentage(modifiers.staminaRegen.multiplicative, modifiers.staminaRegen.additive, STAMINA_REGEN_BASE)
        };

        return {
            base: baseStats,
            final: finalStats,
            percentages: percentages,
            originalBase: originalBase,
            derivedStatBases: {
                skillCheckSize: skillCheckSizeBase,
                skillCheckSize_original: skillCheckSizeBase_original
            }
        };
    },

    /**
     * Extract Bone trinket modifiers from trinket list
     * @param {Array} trinkets - Array of trinkets
     * @returns {Object} { count: number, singleModifier: number }
     */
    _extractBoneModifiers(trinkets) {
        let count = 0;
        let singleModifier = 0.25; // Default Bone modifier
        
        trinkets.forEach(trinketEntry => {
            const trinket = trinketEntry.trinket || trinketEntry;
            const trinketCount = trinketEntry.count || 1;
            
            if (trinket && trinket.id === 'bone' && trinket.effects) {
                count += trinketCount;
                // Extract the modifier value from effects
                trinket.effects.forEach(effect => {
                    if (effect.targetStat === 'movementSpeed' && effect.applicationType === 'multiplicative') {
                        singleModifier = effect.value;
                    }
                });
            }
        });
        
        return { count, singleModifier };
    },

    /**
     * Apply Bone trinket modifiers with special capping logic
     * When Run speed reaches 40, cap the modifier so Run = 40 and apply same modifier to Walk
     */
    _applyBoneModifiers(baseStats, modifiers, boneModifiers) {
        const RUN_SPEED_CAP = 40;
        const { count, singleModifier } = boneModifiers;
        
        // Calculate what the multiplier would be after applying count Bone trinkets
        // Each Bone trinket multiplies by (1 + singleModifier)
        let targetMultiplier = Math.pow(1 + singleModifier, count);
        
        // Calculate what Run speed would be with this multiplier
        let projectedRunSpeed = baseStats.runSpeed * targetMultiplier;
        
        // If Run speed would exceed the cap, calculate the exact modifier needed
        if (projectedRunSpeed > RUN_SPEED_CAP) {
            // Calculate the multiplier that makes Run = 40
            const cappedMultiplier = RUN_SPEED_CAP / baseStats.runSpeed;
            
            // Convert back to modifier form: multiplier = 1 + modifier, so modifier = multiplier - 1
            const cappedModifier = cappedMultiplier - 1;
            
            // Apply this capped modifier to movementSpeed
            modifiers.movementSpeed.multiplicative.push({
                value: cappedModifier,
                cap: null
            });
        } else {
            // Run speed is still under cap, apply all Bone modifiers normally
            for (let i = 0; i < count; i++) {
                modifiers.movementSpeed.multiplicative.push({
                    value: singleModifier,
                    cap: null
                });
            }
        }
    },

    /**
     * Apply base stat overrides from toggled player abilities
     */
    _applyBaseStatOverrides(toon, baseStats) {
        // Check ability 1
        if (toon.ability && toon.ability.playerEffect && toon.ability.playerEffect.baseStatOverrides) {
            // Check if ability is toggled on
            if (toon.ability.hasToggle) {
                const savedState = localStorage.getItem(`ability-${toon.ability.id}-state`);
                const isEnabled = savedState !== null ? savedState === 'true' : false;
                if (!isEnabled) {
                    return; // Ability is toggled off
                }
            }
            
            // Apply overrides
            const overrides = toon.ability.playerEffect.baseStatOverrides;
            Object.entries(overrides).forEach(([stat, value]) => {
                if (stat === 'walkSpeed' || stat === 'runSpeed') {
                    // For walkSpeed and runSpeed, ADD the value
                    baseStats[stat] = baseStats[stat] + value;
                } else {
                    // For other stats like stamina, SET the value
                    baseStats[stat] = value;
                }
            });
        }
        
        // Check ability 2
        if (toon.ability2 && toon.ability2.playerEffect && toon.ability2.playerEffect.baseStatOverrides) {
            // Check if ability is toggled on
            if (toon.ability2.hasToggle) {
                const savedState = localStorage.getItem(`ability-${toon.ability2.id}-state`);
                const isEnabled = savedState !== null ? savedState === 'true' : false;
                if (!isEnabled) {
                    return; // Ability is toggled off
                }
            }
            
            // Apply overrides
            const overrides = toon.ability2.playerEffect.baseStatOverrides;
            Object.entries(overrides).forEach(([stat, value]) => {
                if (stat === 'walkSpeed' || stat === 'runSpeed') {
                    // For walkSpeed and runSpeed, ADD the value
                    baseStats[stat] = baseStats[stat] + value;
                } else {
                    // For other stats like stamina, SET the value
                    baseStats[stat] = value;
                }
            });
        }
    },

    /**
     * Apply player toon abilities to modifiers
     */
    _applyPlayerAbilities(toon, modifiers, teamSize) {
        // Check ability 1
        if (toon.ability && toon.ability.playerEffect) {
            this._applyAbilityEffect(toon.ability, modifiers, teamSize);
        }
        
        // Check ability 2
        if (toon.ability2 && toon.ability2.playerEffect) {
            this._applyAbilityEffect(toon.ability2, modifiers, teamSize);
        }
    },

    /**
     * Apply team effect to modifiers
     */
    _applyTeamEffect(effect, modifiers) {
        // Get default application type from the effect object
        const defaultAppType = effect.applicationType || 'multiplicative';
        
        // Apply movement speed effects
        if (effect.movementSpeed !== undefined) {
            const appType = effect.movementSpeedApplicationType || defaultAppType;
            if (appType === 'multiplicative') {
                modifiers.movementSpeed.multiplicative.push({ value: effect.movementSpeed, cap: null });
            } else if (appType === 'additive') {
                modifiers.movementSpeed.additive += effect.movementSpeed;
            }
        }

        // Apply extraction speed effects
        if (effect.extractionSpeed !== undefined) {
            const appType = effect.extractionSpeedApplicationType || defaultAppType;
            if (appType === 'multiplicative') {
                modifiers.extractionSpeed.multiplicative.push({ value: effect.extractionSpeed, cap: null });
            } else if (appType === 'additive') {
                modifiers.extractionSpeed.additive += effect.extractionSpeed;
            }
        }

        // Apply skill check amount effects
        if (effect.skillCheckAmount !== undefined) {
            const appType = effect.skillCheckAmountApplicationType || defaultAppType;
            if (appType === 'multiplicative') {
                modifiers.skillCheckAmount.multiplicative.push({ value: effect.skillCheckAmount, cap: null });
            } else if (appType === 'additive') {
                modifiers.skillCheckAmount.additive += effect.skillCheckAmount;
            }
        }
        
        // Apply skill check size effects (Brusha uses this - affects visual size, not bonus amount)
        if (effect.skillCheckSize !== undefined) {
            const appType = effect.skillCheckSizeApplicationType || defaultAppType;
            if (appType === 'multiplicative') {
                modifiers.skillCheckSize.multiplicative.push({ value: effect.skillCheckSize, cap: null });
            } else if (appType === 'additive') {
                modifiers.skillCheckSize.additive += effect.skillCheckSize;
            }
        }
        
        // Apply skill check chance effects (Brusha uses additive for this)
        if (effect.skillCheckChance !== undefined) {
            const appType = effect.skillCheckChanceApplicationType || defaultAppType;
            if (appType === 'multiplicative') {
                modifiers.skillCheckChance.multiplicative.push({ value: effect.skillCheckChance, cap: null });
            } else if (appType === 'additive') {
                modifiers.skillCheckChance.additive += effect.skillCheckChance;
            }
        }

        // Apply stamina regen effects
        if (effect.staminaRegen !== undefined) {
            const appType = effect.staminaRegenApplicationType || defaultAppType;
            if (appType === 'multiplicative') {
                modifiers.staminaRegen.multiplicative.push({ value: effect.staminaRegen, cap: null });
            } else if (appType === 'additive') {
                modifiers.staminaRegen.additive += effect.staminaRegen;
            }
        }
    },

    /**
     * Apply a single ability effect
     */
    _applyAbilityEffect(ability, modifiers, teamSize) {
        const effect = ability.playerEffect;
        
        // Check if ability is toggled on (if it has a toggle)
        if (ability.hasToggle) {
            const savedState = localStorage.getItem(`ability-${ability.id}-state`);
            const isEnabled = savedState !== null ? savedState === 'true' : false;
            if (!isEnabled) {
                return; // Ability is toggled off
            }
        }

        // Handle special abilities
        if (effect.special) {
            return; // Special abilities handled separately (Looey, Razzle&Dazzle)
        }
        
        // Skip if baseStatOverrides exists - those are handled in _applyBaseStatOverrides
        if (effect.baseStatOverrides) {
            // Still need to apply non-base-stat modifiers like movement speed for Eclipse
            if (effect.movementSpeed !== undefined && effect.applicationType === 'multiplicative') {
                modifiers.movementSpeed.multiplicative.push({ value: effect.movementSpeed, cap: null });
            }
            return;
        }

        // Handle per-team-member bonuses (Boxten's Wind-Up)
        if (effect.perTeamMember && effect.extractionSpeed) {
            modifiers.extractionSpeed.additive += effect.extractionSpeed * teamSize;
            return;
        }

        // Apply movement speed effects
        if (effect.movementSpeed !== undefined) {
            if (effect.applicationType === 'multiplicative') {
                modifiers.movementSpeed.multiplicative.push({ value: effect.movementSpeed, cap: null });
            } else if (effect.applicationType === 'additive') {
                modifiers.movementSpeed.additive += effect.movementSpeed;
            }
        }

        // Apply extraction speed effects
        if (effect.extractionSpeed !== undefined) {
            if (effect.applicationType === 'multiplicative') {
                modifiers.extractionSpeed.multiplicative.push({ value: effect.extractionSpeed, cap: null });
            } else if (effect.applicationType === 'additive') {
                modifiers.extractionSpeed.additive += effect.extractionSpeed;
            }
        }

        // Apply skill check effects
        if (effect.skillCheckSize !== undefined) {
            modifiers.skillCheckAmount.multiplicative.push({ value: effect.skillCheckSize, cap: null });
        }
        if (effect.skillCheckChance !== undefined) {
            modifiers.skillCheckChance.multiplicative.push({ value: effect.skillCheckChance, cap: null });
        }

        // Apply stamina regen effects
        if (effect.staminaRegen !== undefined) {
            modifiers.staminaRegen.multiplicative.push({ value: effect.staminaRegen, cap: null });
        }
    },

    /**
     * Apply direct base stat increases from trinkets/items (e.g., Cooler's +50 stamina)
     */
    _applyBaseStatIncreases(trinkets, items, baseStats, teamSize) {
        trinkets.forEach(trinketEntry => {
            const trinket = trinketEntry.trinket || trinketEntry;
            const count = trinketEntry.count || 1;

            // Handle dynamic team-based trinkets (e.g., Friendship Bracelet)
            if (trinket && trinket.dynamicTeamBased && trinket.id === 'friendship_bracelet') {
                // 5 stamina per toon in team (including player), max 40
                const staminaBonus = Math.min(trinket.baseStaminaPerToon * teamSize, trinket.maxBonus);
                baseStats.stamina += staminaBonus;
                return;
            }

            if (trinket && trinket.effects) {
                trinket.effects.forEach(effect => {
                    if (effect.applicationType === 'baseStatIncrease') {
                        const stat = this._mapTargetStat(effect.targetStat);
                        if (baseStats[stat] !== undefined) {
                            baseStats[stat] += effect.value * count;
                        }
                    }
                });
            }
        });

        items.forEach(itemObj => {
            if (itemObj.item && itemObj.item.effects) {
                itemObj.item.effects.forEach(effect => {
                    if (effect.applicationType === 'baseStatIncrease') {
                        const stat = this._mapTargetStat(effect.targetStat);
                        if (baseStats[stat] !== undefined) {
                            baseStats[stat] += effect.value * itemObj.count;
                        }
                    }
                });
            }
        });
    },

    /**
     * Apply both multiplicative and additive modifiers
     */
    _applyAllModifiers(baseStat, modifierObj, shouldRound = true, decimalPlaces = 1) {
        // First apply additive
        let stat = baseStat + modifierObj.additive;
        
        // Then apply multiplicative
        let totalMultiplier = 1.0;
        let hasCap = false;
        let capValue = null;

        modifierObj.multiplicative.forEach(modifier => {
            totalMultiplier *= (1 + modifier.value);
            if (modifier.cap !== null) {
                hasCap = true;
                capValue = modifier.cap;
            }
        });

        let finalValue = stat * totalMultiplier;

        // Apply cap if present
        if (hasCap && capValue !== null) {
            finalValue = Math.min(finalValue, capValue);
        }

        // IMPORTANT: Always return full precision values for calculations
        // Rounding should only happen in the UI display layer
        // This prevents cascading rounding errors in dependent calculations
        return finalValue;
    },

    /**
     * Apply multiplicative modifiers to a base stat
     */
    _applyModifiers(baseStat, modifiers) {
        let totalMultiplier = 1.0;
        let hasCap = false;
        let capValue = null;

        modifiers.forEach(modifier => {
            totalMultiplier *= (1 + modifier.value);
            if (modifier.cap !== null) {
                hasCap = true;
                capValue = modifier.cap;
            }
        });

        let finalValue = baseStat * totalMultiplier;

        // Apply cap if present
        if (hasCap && capValue !== null) {
            finalValue = Math.min(finalValue, capValue);
        }

        // Return full precision - rounding happens in UI display layer only
        return finalValue;
    },

    /**
     * Calculate total percentage modifier including additive bonuses
     */
    _calculatePercentage(multiplicativeModifiers, additiveValue, baseStat) {
        // Calculate the combined effect of additive and multiplicative
        const statAfterAdditive = baseStat + additiveValue;
        
        let totalMultiplier = 1.0;
        multiplicativeModifiers.forEach(modifier => {
            totalMultiplier *= (1 + modifier.value);
        });
        
        const finalValue = statAfterAdditive * totalMultiplier;
        const percentChange = ((finalValue - baseStat) / baseStat) * 100;
        
        // Round to 1 decimal place to preserve precision (e.g., 7.5% instead of 8%)
        return parseFloat(percentChange.toFixed(1));
    },

    /**
     * Map effect target stat names to internal stat names
     */
    _mapTargetStat(targetStat) {
        const mapping = {
            'movementSpeed': 'movementSpeed',
            'walkSpeed': 'walkSpeed',
            'runSpeed': 'runSpeed',
            'stealth': 'stealth',
            'stealthRating': 'stealth',
            'extractionSpeed': 'extractionSpeed',
            'stamina': 'stamina',
            'skillCheckAmount': 'skillCheckAmount',
            'skillCheckSize': 'skillCheckSize',
            'skillCheckChance': 'skillCheckChance',
            'staminaRegen': 'staminaRegen'
        };
        return mapping[targetStat] || targetStat;
    },

    /**
     * Calculate machine extraction time using the model from generator_models.py
     * @param {number} extractionSpeed - Final extraction speed
     * @param {number} skillCheckAmount - Final skill check bonus units
     * @param {number} skillCheckSuccess - Success rate (0-1)
     * @param {number} skillCheckChance - Chance of skill check per second (0-1)
     * @returns {Object} Extraction time information
     */
    calculateMachineTime(extractionSpeed, skillCheckAmount, skillCheckSuccess, skillCheckChance = 0.25) {
        const TOTAL_UNITS = 45.0;
        const SKILL_CHECK_CHANCE = skillCheckChance;  // p = skill check chance per second
        const MIN_DURATION = 0.75;
        const MAX_DURATION = 2.5;
        const GRACE_PERIOD = 2.0;

        // Calculate dead time (mean duration + grace)
        const meanDuration = (MIN_DURATION + MAX_DURATION) / 2;
        const deadTime = meanDuration + GRACE_PERIOD;

        // Base time without any skill checks
        const defaultTime = TOTAL_UNITS / extractionSpeed;

        // Calculate hazard (d) from skill check chance using -LN(1-p)
        const hazard = -Math.log(1 - SKILL_CHECK_CHANCE);

        // Discrete model: effective check rate using formula r = d / (1 + d*D)
        const effectiveCheckRate = hazard / (1.0 + hazard * deadTime);

        // Expected bonus per check
        const expectedBonusPerCheck = skillCheckAmount * skillCheckSuccess;

        // Effective progress rate (units per second)
        const effectiveProgressRate = extractionSpeed + (expectedBonusPerCheck * effectiveCheckRate);

        // Average completion time
        const averageTime = TOTAL_UNITS / effectiveProgressRate;

        // Expected number of skill checks
        const expectedSkillChecks = effectiveCheckRate * averageTime;
        const expectedSuccessfulChecks = expectedSkillChecks * skillCheckSuccess;

        // DEBUG: Log all intermediate calculations
        console.group('🔧 Machine Stats Calculation Debug');
        console.log('📊 Inputs:');
        console.log(`  Extraction Speed (u): ${extractionSpeed}`);
        console.log(`  Skill Check Amount (S): ${skillCheckAmount}`);
        console.log(`  Skill Check Success Rate: ${(skillCheckSuccess * 100).toFixed(1)}%`);
        
        console.log('\n📐 Constants:');
        console.log(`  TOTAL_UNITS: ${TOTAL_UNITS}`);
        console.log(`  SKILL_CHECK_CHANCE (p): ${(SKILL_CHECK_CHANCE * 100).toFixed(1)}%`);
        console.log(`  MIN_DURATION: ${MIN_DURATION}s`);
        console.log(`  MAX_DURATION: ${MAX_DURATION}s`);
        console.log(`  GRACE_PERIOD (g): ${GRACE_PERIOD}s`);
        
        console.log('\n🔢 Intermediate Values:');
        console.log(`  Mean Duration (L): ${meanDuration}s (average skill check length)`);
        console.log(`  Dead Time (D): ${deadTime}s (L + grace)`);
        console.log(`  d (hazard): ${hazard.toFixed(9)} (-LN(1-p))`);
        console.log(`  Effective Check Rate (r): ${effectiveCheckRate.toFixed(9)} (d / (1 + d*D))`);
        console.log(`  Expected Bonus Per Check: ${expectedBonusPerCheck.toFixed(2)} (S × success rate)`);
        console.log(`  Effective Progress Rate (P): ${effectiveProgressRate.toFixed(2)} (u + (S×r×success))`);
        
        console.log('\n✅ Results (before rounding):');
        console.log(`  Default Time: ${defaultTime.toFixed(2)}s (45 / u)`);
        console.log(`  Average Time: ${averageTime.toFixed(2)}s (45 / P)`);
        console.log(`  Expected Skill Checks: ${expectedSkillChecks.toFixed(2)} (r × average time)`);
        console.log(`  Expected Successful Checks: ${expectedSuccessfulChecks.toFixed(2)} (checks × success rate)`);
        
        console.log('\n📋 Results (after rounding to 1 decimal):');
        console.log(`  Default Time: ${Math.round(defaultTime * 10) / 10}s`);
        console.log(`  Average Time: ${Math.round(averageTime * 10) / 10}s`);
        console.log(`  Expected Skill Checks: ${Math.round(expectedSkillChecks * 10) / 10}`);
        console.groupEnd();

        return {
            defaultTime: Math.round(defaultTime * 10) / 10,
            averageTime: Math.round(averageTime * 10) / 10,
            expectedSkillChecks: Math.round(expectedSkillChecks * 10) / 10,
            expectedSuccessfulChecks: Math.round(expectedSuccessfulChecks * 10) / 10,
            effectiveProgressRate: Math.round(effectiveProgressRate * 100) / 100
        };
    },

    /**
     * Compare player speed against twisted speed
     * @param {number} playerWalk - Player's walk speed
     * @param {number} playerRun - Player's run speed
     * @param {number} twistedSpeed - Twisted's speed
     * @returns {string} Color code: 'green', 'yellow', or 'red'
     */
    compareTwistedSpeed(playerWalk, playerRun, twistedSpeed) {
        if (playerWalk >= twistedSpeed) {
            return 'green';
        } else if (playerRun > twistedSpeed) {
            return 'yellow';
        } else {
            return 'red';
        }
    }
};

