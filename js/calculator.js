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

        // Apply dynamic trinket effects that depend on the current item loadout
        this._applyDynamicTrinketModifiers(trinkets, items, modifiers);

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
            skillCheckChance: this._normalizeSkillCheckChance(
                this._applyAllModifiers(baseStats.skillCheckChance, modifiers.skillCheckChance, false)
            ),
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
            if (!this._isAbilityEnabled(toon.ability)) {
                return; // Ability is toggled off
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
            if (!this._isAbilityEnabled(toon.ability2)) {
                return; // Ability is toggled off
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
        
        if (!this._isAbilityEnabled(ability)) {
            return; // Ability is toggled off
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
     * Check whether a player ability is currently enabled
     * @private
     */
    _isAbilityEnabled(ability) {
        if (!ability || !ability.hasToggle) {
            return true;
        }

        const savedState = localStorage.getItem(`ability-${ability.id}-state`);
        return savedState !== null ? savedState === 'true' : false;
    },

    /**
     * Apply direct base stat increases from trinkets/items (e.g., Cooler's +50 stamina)
     */
    _applyBaseStatIncreases(trinkets, items, baseStats, teamSize) {
        trinkets.forEach(trinketEntry => {
            const trinket = trinketEntry.trinket || trinketEntry;
            const count = trinketEntry.count || 1;

            // Handle Lucky Coin: Apply once user selects a stat:
            if (trinket && trinket.id === 'lucky_coin' && trinket.selectedStat) {
                const stat = this._mapTargetStat(trinket.selectedStat);
                if (baseStats[stat] !== undefined) {
                    baseStats[stat] += trinket.value * count; // trinket.value holds bonus amount
                }
                return;
            }

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
     * Apply dynamic trinket modifiers that depend on the current item loadout
     */
    _applyDynamicTrinketModifiers(trinkets, items, modifiers) {
        const totalItemCount = items.reduce((sum, itemObj) => sum + (itemObj.count || 0), 0);

        trinkets.forEach(trinketEntry => {
            const trinket = trinketEntry.trinket || trinketEntry;
            if (!trinket || !trinket.dynamicItemBased) {
                return;
            }

            const stat = this._mapTargetStat(trinket.dynamicTargetStat || trinket.targetStat);
            if (!modifiers[stat]) {
                return;
            }

            const valuePerItem = trinket.valuePerItem ?? trinket.value ?? 0;
            const dynamicCount = trinket.id === 'whispering_flower'
                ? (trinketEntry.count || 1)
                : totalItemCount;
            const totalValue = valuePerItem * dynamicCount;
            if (totalValue === 0) {
                return;
            }

            modifiers[stat].multiplicative.push({
                value: totalValue,
                cap: null
            });
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
        const MIN_DURATION = 0.75;
        const MAX_DURATION = 2.5;
        const GRACE_PERIOD = 2.0;

        // Calculate dead time (mean duration + grace)
        const meanDuration = (MIN_DURATION + MAX_DURATION) / 2;
        const deadTime = meanDuration + GRACE_PERIOD;
        const SKILL_CHECK_CHANCE = this._normalizeSkillCheckChance(skillCheckChance);

        // Base time without any skill checks
        const defaultTime = TOTAL_UNITS / extractionSpeed;

        // Calculate hazard (d) from skill check chance using -LN(1-p)
        const effectiveCheckRate = this._calculateEffectiveCheckRate(SKILL_CHECK_CHANCE, deadTime);

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
     * Calculate partial machine completion for a specific duration with current stats
     * Detects early completion and returns actual time taken if machine finishes before duration ends
     * @param {number} extractionSpeed - Final extraction speed
     * @param {number} skillCheckAmount - Final skill check bonus units
     * @param {number} skillCheckSuccess - Success rate (0-1)
     * @param {number} durationSeconds - Maximum duration to calculate for (in real time)
     * @param {number} unitsRemaining - Units remaining in machine (default 45)
     * @param {number} skillCheckChance - Chance of skill check per second (0-1)
     * @returns {Object} Partial machine completion state with actual time taken
     */
    calculatePartialMachineCompletion(extractionSpeed, skillCheckAmount, skillCheckSuccess, durationSeconds, unitsRemaining = 45, skillCheckChance = 0.25) {
        const MIN_DURATION = 0.75;
        const MAX_DURATION = 2.5;
        const GRACE_PERIOD = 2.0;

        // Calculate dead time
        const meanDuration = (MIN_DURATION + MAX_DURATION) / 2;
        const deadTime = meanDuration + GRACE_PERIOD;
        const SKILL_CHECK_CHANCE = this._normalizeSkillCheckChance(skillCheckChance);

        // Discrete model: effective check rate
        const effectiveCheckRate = this._calculateEffectiveCheckRate(SKILL_CHECK_CHANCE, deadTime);

        // Expected bonus per check
        const expectedBonusPerCheck = skillCheckAmount * skillCheckSuccess;

        // Effective progress rate (units per second)
        const effectiveProgressRate = extractionSpeed + (expectedBonusPerCheck * effectiveCheckRate);

        // Calculate time to completion
        const timeToCompletion = unitsRemaining / effectiveProgressRate;

        // Determine actual time taken (might be less than requested duration if machine completes early)
        const actualTimeTaken = Math.min(timeToCompletion, durationSeconds);
        const isEarlyCompletion = timeToCompletion < durationSeconds;

        // Progress in actual time taken
        const baseProgress = extractionSpeed * actualTimeTaken;
        
        // Expected skill checks in actual time
        const expectedSkillChecksThisWindow = effectiveCheckRate * actualTimeTaken;
        const expectedSkillCheckUnits = expectedSkillChecksThisWindow * expectedBonusPerCheck;
        
        // Total units completed in this window
        const unitsCompletedThisWindow = baseProgress + expectedSkillCheckUnits;
        
        // Units remaining after this window
        const newUnitsRemaining = Math.max(0, unitsRemaining - unitsCompletedThisWindow);

        return {
            unitsCompleted: Math.round(unitsCompletedThisWindow * 100) / 100,
            unitsRemaining: Math.round(newUnitsRemaining * 100) / 100,
            expectedSkillChecks: Math.round(expectedSkillChecksThisWindow * 100) / 100,
            expectedSuccessfulChecks: Math.round(expectedSkillChecksThisWindow * skillCheckSuccess * 100) / 100,
            timeConsumed: actualTimeTaken,  // Actual time taken, not always = durationSeconds
            isComplete: isEarlyCompletion,  // TRUE if machine finished before duration ended
            effectiveProgressRate: Math.round(effectiveProgressRate * 100) / 100
        };
    },

    /**
     * Calculate machine completion for remaining units with current stats
     * @param {number} extractionSpeed - Final extraction speed
     * @param {number} skillCheckAmount - Final skill check bonus units
     * @param {number} skillCheckSuccess - Success rate (0-1)
     * @param {number} unitsRemaining - Units remaining in machine
     * @param {number} skillCheckChance - Chance of skill check per second (0-1)
     * @returns {Object} Machine completion results
     */
    calculateMachineCompletion(extractionSpeed, skillCheckAmount, skillCheckSuccess, unitsRemaining, skillCheckChance = 0.25) {
        if (unitsRemaining <= 0) {
            return {
                defaultTime: 0,
                averageTime: 0,
                expectedSkillChecks: 0,
                expectedSuccessfulChecks: 0,
                effectiveProgressRate: extractionSpeed
            };
        }

        const MIN_DURATION = 0.75;
        const MAX_DURATION = 2.5;
        const GRACE_PERIOD = 2.0;

        // Calculate dead time
        const meanDuration = (MIN_DURATION + MAX_DURATION) / 2;
        const deadTime = meanDuration + GRACE_PERIOD;
        const SKILL_CHECK_CHANCE = this._normalizeSkillCheckChance(skillCheckChance);

        // Base time without any skill checks
        const defaultTime = unitsRemaining / extractionSpeed;

        // Calculate hazard (d) from skill check chance using -LN(1-p)
        // Discrete model: effective check rate
        const effectiveCheckRate = this._calculateEffectiveCheckRate(SKILL_CHECK_CHANCE, deadTime);

        // Expected bonus per check
        const expectedBonusPerCheck = skillCheckAmount * skillCheckSuccess;

        // Effective progress rate (units per second)
        const effectiveProgressRate = extractionSpeed + (expectedBonusPerCheck * effectiveCheckRate);

        // Average completion time for remaining units
        const averageTime = unitsRemaining / effectiveProgressRate;

        // Expected number of skill checks
        const expectedSkillChecks = effectiveCheckRate * averageTime;
        const expectedSuccessfulChecks = expectedSkillChecks * skillCheckSuccess;

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
    },

    /**
     * Create a deep copy of the calculation state object
     * @param {Object} state - State object with toon, trinkets, items, abilities, etc.
     * @returns {Object} Deep copy of the state
     */
    _cloneCalculationState(state) {
        return {
            selectedToon: state.selectedToon,
            // Shallow copy the equipped trinkets array - preserve full objects
            equippedTrinkets: state.equippedTrinkets ? state.equippedTrinkets.map(t => ({...t})) : [],
            // Shallow copy the active items array - preserve full objects
            activeItems: state.activeItems ? state.activeItems.map(i => ({...i})) : [],
            teamMembers: state.teamMembers ? [...state.teamMembers] : [],
            activeAbilities: state.activeAbilities ? [...state.activeAbilities] : [],
            selectedConditionalStat: state.selectedConditionalStat,
            teamSize: state.teamSize || 1,
            skillCheckSuccessRate: state.skillCheckSuccessRate || 1.0
        };
    },

    /**
     * Calculate final stats from a state object
     * @param {Object} state - State object containing toon, trinkets, items, abilities, etc.
     * @returns {Object} Final calculated stats
     */
    calculateStatsFromState(state) {
        if (!state || !state.selectedToon) {
            return null;
        }

        // Debug logging for cascade troubleshooting
        const trinketList = (state.equippedTrinkets || []).map(t => (t.trinket || t).name || (t.trinket || t).id).join(', ');
        const itemList = (state.activeItems || []).map(i => (i.item || i).name || (i.item || i).id).join(', ');
        console.log(`    calculateStatsFromState: Trinkets=[${trinketList}], Items=[${itemList}]`);

        return this.calculateFinalStats(
            state.selectedToon,
            state.equippedTrinkets || [],
            state.activeAbilities || [],
            state.activeItems || [],
            state.selectedConditionalStat,
            state.teamSize || 1
        );
    },

    /**
     * Create a machine-specific state snapshot that converts timed player abilities into timed machine effects
     * @private
     */
    _createMachineCalculationState(state) {
        const machineState = this._cloneCalculationState(state);
        const machineToon = this._stripTimedMachineAbilitiesFromToon(machineState.selectedToon);
        const timedAbilityItems = this._getTimedMachineAbilityItems(
            state.selectedToon,
            state.activeAbilities || []
        );

        machineState.selectedToon = machineToon;
        machineState.activeAbilities = this._stripTimedMachineTeamAbilities(machineState.activeAbilities || []);
        machineState.activeItems = [...(machineState.activeItems || []), ...timedAbilityItems.map(item => ({ item, count: 1 }))];

        return machineState;
    },

    /**
     * Create the permanent-only machine state used for Base Time
     * @private
     */
    _createPermanentMachineBaseState(state) {
        const baseState = this._cloneCalculationState(state);

        baseState.selectedToon = this._stripTimedMachineAbilitiesFromToon(baseState.selectedToon);
        baseState.activeAbilities = this._stripTimedMachineTeamAbilities(baseState.activeAbilities || []);
        baseState.activeItems = (baseState.activeItems || []).filter(itemObj => {
            const item = itemObj.item || itemObj;
            const count = itemObj.count || 1;
            return count > 0 && (!item.duration || item.duration <= 0);
        });

        return baseState;
    },

    /**
     * Remove timed machine abilities from the normal player-effect pass
     * @private
     */
    _stripTimedMachineAbilitiesFromToon(toon) {
        if (!toon) {
            return toon;
        }

        const stripAbility = (ability) => {
            if (!this._isTimedMachineAbility(ability)) {
                return ability;
            }

            return {
                ...ability,
                playerEffect: null
            };
        };

        return {
            ...toon,
            ability: stripAbility(toon.ability),
            ability2: stripAbility(toon.ability2)
        };
    },

    /**
     * Remove timed machine team abilities from the persistent team-effect pass
     * @private
     */
    _stripTimedMachineTeamAbilities(activeAbilities) {
        return (activeAbilities || []).filter(ability => !this._isTimedMachineAbility(ability));
    },

    /**
     * Get timed machine ability pseudo-items that should start at the beginning of extraction
     * @private
     */
    _getTimedMachineAbilityItems(toon, activeAbilities = []) {
        const abilities = toon ? [toon.ability, toon.ability2].filter(Boolean) : [];
        const timedItems = [];

        abilities.forEach((ability, index) => {
            if (!this._isTimedMachineAbility(ability) || !this._isAbilityEnabled(ability)) {
                return;
            }

            if (ability.id === 'squirm_distressed_delicacy') {
                timedItems.push({
                    id: `machine_ability_squirm_distressed_delicacy_${index + 1}`,
                    name: ability.name,
                    duration: 10,
                    effects: [
                        {
                            targetStat: 'extractionSpeed',
                            value: 1.0,
                            applicationType: 'multiplicative'
                        }
                    ]
                });
            }
        });

        activeAbilities.forEach((ability, index) => {
            if (!this._isTimedMachineAbility(ability)) {
                return;
            }

            if (ability.id === 'shelly_inspiration') {
                timedItems.push({
                    id: `machine_ability_shelly_inspiration_${index + 1}`,
                    name: ability.name,
                    duration: 15,
                    effects: [
                        {
                            targetStat: 'extractionSpeed',
                            value: 0.75,
                            applicationType: 'multiplicative'
                        }
                    ]
                });
            }
        });

        return timedItems;
    },

    /**
     * Identify player abilities that should be treated as timed machine effects instead of always-on modifiers
     * @private
     */
    _isTimedMachineAbility(ability) {
        return Boolean(ability && (
            ability.id === 'squirm_distressed_delicacy' ||
            ability.id === 'shelly_inspiration'
        ));
    },

    /**
     * Remove items by ID from state's active items list
     * @param {Object} state - State object to modify
     * @param {Array} itemIdsToRemove - Array of item IDs to remove
     * @returns {Object} Modified state (mutates input)
     */
    _removeItemsFromState(state, itemIdsToRemove) {
        state.activeItems = state.activeItems.filter(itemObj => {
            const item = itemObj.item || itemObj;
            return !itemIdsToRemove.includes(item.id);
        });
        return state;
    },

    /**
     * Calculate machine stats with cascading item duration support using state object
     * This version properly recalculates stats at each cascade step as items expire
     * @param {Object} state - State object containing: selectedToon, equippedTrinkets, activeItems, activeAbilities, selectedConditionalStat, teamSize, skillCheckSuccessRate
     * @returns {Object} Complete machine stats with cascade breakdown
     */
    calculateMachineStatsFromState(state) {
        console.group('🎰 MACHINE STATS CALCULATION - STATE-BASED CASCADING');
        console.log('📊 INPUT STATE:');
        console.log(`  Toon: ${state.selectedToon ? state.selectedToon.name : 'None'}`);
        console.log(`  Trinkets: ${state.equippedTrinkets ? state.equippedTrinkets.length : 0}`);
        console.log(`  Items: ${state.activeItems ? state.activeItems.length : 0}`);
        console.log(`  Team Size: ${state.teamSize || 1}`);
        console.log(`  Team Members: ${state.teamMembers ? state.teamMembers.filter(t => t).length : 0} active`);
        console.log(`  Skill Check Success Rate: ${(state.skillCheckSuccessRate * 100).toFixed(1)}%`);
        const machineState = this._createMachineCalculationState(state);
        
        // Calculate initial stats from state
        const initialStats = this.calculateStatsFromState(machineState);
        if (!initialStats) {
            console.log('❌ No toon selected - cannot calculate');
            console.groupEnd();
            return null;
        }

        const initialExtractionSpeed = initialStats.final.extractionSpeed;
        const initialSkillCheckAmount = initialStats.final.skillCheckAmount;
        const initialSkillCheckChance = initialStats.final.skillCheckChance;

        console.log(`\n📈 INITIAL STATS (ALL ITEMS ACTIVE):`);
        console.log(`  Extraction Speed: ${initialExtractionSpeed} (base: ${initialStats.base.extractionSpeed})`);
        console.log(`  Skill Check Amount: ${initialSkillCheckAmount}`);
        console.log(`  Skill Check Chance: ${(initialSkillCheckChance * 100).toFixed(1)}%`);

        let machineUnits = 45;

        // Check for special items and trinkets
        const activeItems = machineState.activeItems || [];
        const jumperCables = activeItems.filter(itemObj => {
            const item = itemObj.item || itemObj;
            return item.id === 'jumper_cable' && (itemObj.count || 1) > 0;
        });
        const hasWrench = (state.equippedTrinkets || []).some(t => (t.trinket || t).id === 'wrench');
        const isEggson = state.selectedToon && state.selectedToon.id === 'eggson';
        const hasGlazedFondantBag = (state.equippedTrinkets || []).some(t => (t.trinket || t).id === 'glazed_fondant_bag');
        const hasStressBall = (state.equippedTrinkets || []).some(t => {
            const trinket = t.trinket || t;
            return trinket.id === 'stress_ball';
        });

        console.log('\n🔍 SPECIAL ITEMS:');
        // Calculate total jumper cable count (sum of counts across all entries)
        const totalJumperCableCount = jumperCables.reduce((sum, itemObj) => sum + (itemObj.count || 1), 0);
        console.log(`  Jumper Cables: ${totalJumperCableCount}`);
        console.log(`  Wrench: ${hasWrench ? 'Yes' : 'No'}`);
        console.log(`  Eggson: ${isEggson ? 'Yes' : 'No'}`);
        console.log(`  Glazed Fondant Bag: ${hasGlazedFondantBag ? 'Yes' : 'No'}`);
        console.log(`  Stress Ball: ${hasStressBall ? 'Yes' : 'No'}`);

        // Apply Jumper Cables instant completion
        if (totalJumperCableCount > 0) {
            const jumpCompletion = Math.min(0.33 * totalJumperCableCount, 1.0);
            console.log(`\n⚡ JUMPER CABLES:`);
            console.log(`  Count: ${totalJumperCableCount} × 33% = ${(jumpCompletion * 100).toFixed(1)}%`);
            machineUnits *= (1 - jumpCompletion);
            console.log(`  Remaining units: ${machineUnits.toFixed(2)}`);

            if (jumpCompletion >= 1.0) {
                console.log(`  ✨ INSTANT COMPLETION`);
                const instantResult = {
                    defaultTime: 0,
                    averageTime: 0,
                    expectedSkillChecks: 0,
                    expectedSuccessfulChecks: 0,
                    instant: true
                };
                const results = {
                    default: instantResult,
                    firstMachine: instantResult,
                    hasWrench: hasWrench,
                    cascadeBreakdown: []
                };
                console.groupEnd();
                return results;
            }
        }

        // Apply Eggson automatic completion
        if (isEggson) {
            console.log(`\n🥚 EGGSON: 20% automatic completion`);
            machineUnits *= 0.8;
            console.log(`  Remaining units: ${machineUnits.toFixed(2)}`);
        }

        // Build items with durations
        const itemsWithDuration = [];
        activeItems.forEach(itemObj => {
            const item = itemObj.item || itemObj;
            const count = itemObj.count || 1;

            if (item && item.duration && item.duration > 0 && item.id !== 'jumper_cable' && count > 0) {
                let duration = item.duration;

                if (hasGlazedFondantBag && this._isGlazedFondantItem(item.id)) {
                    duration += 4;
                }

                itemsWithDuration.push({
                    id: item.id,
                    name: item.name || 'Unknown',
                    duration: item.duration,
                    actualDuration: duration
                });
            }
        });

        if (itemsWithDuration.length > 0) {
            console.log(`\n⏱️ ITEMS WITH DURATION:`);
            itemsWithDuration.forEach(item => {
                console.log(`  - ${item.name}: ${item.actualDuration}s`);
            });
        }

        const permanentBaseState = this._createPermanentMachineBaseState(state);
        const permanentBaseStats = this.calculateStatsFromState(permanentBaseState);
        const permanentBaseExtractionSpeed = permanentBaseStats ? permanentBaseStats.final.extractionSpeed : 0;

        // Calculate both scenarios in parallel
        console.log(`\n📊 CALCULATING MACHINE STATS:`);
        console.log(`  Scenario 1: Default (${machineUnits.toFixed(2)} units)`);
        if (hasWrench) {
            console.log(`  Scenario 2: First Machine with Wrench (${Math.max(0, machineUnits - 15).toFixed(2)} units)`);
        }

        // Calculate default scenario
        const defaultResult = this._calculateCascadingMachineStats(
            machineState,
            itemsWithDuration,
            machineUnits,
            initialExtractionSpeed,
            initialSkillCheckAmount,
            initialSkillCheckChance,
            hasStressBall,
            permanentBaseExtractionSpeed
        );

        // Calculate wrench scenario if applicable
        let wrenchResult = null;
        if (hasWrench) {
            console.log(`\n🔧 CALCULATING WRENCH SCENARIO:`);
            const wrenchMachineUnits = Math.max(0, machineUnits - 15);
            wrenchResult = this._calculateCascadingMachineStats(
                machineState,
                itemsWithDuration,
                wrenchMachineUnits,
                initialExtractionSpeed,
                initialSkillCheckAmount,
                initialSkillCheckChance,
                hasStressBall,
                permanentBaseExtractionSpeed
            );
            console.log(`  Wrench scenario completed`);
        }

        // Combine results
        const results = {
            default: defaultResult,
            firstMachine: wrenchResult || defaultResult,
            hasWrench: hasWrench,
            cascadeBreakdown: defaultResult.cascadeBreakdown
        };

        console.log(`\n✅ FINAL RESULTS:`);
        console.log(`  Base Time: ${results.default.defaultTime}s`);
        console.log(`  Average Time: ${results.default.averageTime}s`);
        if (hasWrench) {
            console.log(`  First Machine Base Time (with Wrench): ${results.firstMachine.defaultTime}s`);
            console.log(`  First Machine Average Time (with Wrench): ${results.firstMachine.averageTime}s`);
        }
        console.groupEnd();

        return results;
    },

    /**
     * Helper function to calculate cascading machine stats for a given machine unit count
     * @private
     */
    _calculateCascadingMachineStats(state, itemsWithDuration, machineUnits, initialExtractionSpeed, initialSkillCheckAmount, initialSkillCheckChance, hasStressBall = false, permanentBaseExtractionSpeed = 0) {
        const cascadeBreakdown = [];
        const timeline = this._buildItemTimeline(itemsWithDuration);
        const EPSILON = 1e-9;
        let unitsRemaining = machineUnits;
        let timeSoFar = 0;
        let totalSkillChecks = 0;
        let totalSuccessfulChecks = 0;
        let workingState = this._cloneCalculationState(state);
        let itemIndex = 0;
        let successProgress = 0;
        let stressExpirations = [];

        console.log(`  📅 CASCADE TIMELINE (${timeline.length} item breakpoints${hasStressBall ? ' + Stress Ball events' : ''})`);
        console.log(`  🔄 Starting cascade with ${unitsRemaining.toFixed(2)} units`);

        while (unitsRemaining > 0) {
            while (stressExpirations.length > 0 && stressExpirations[0] <= timeSoFar + EPSILON) {
                stressExpirations.shift();
            }

            const stepStats = this.calculateStatsFromState(workingState);
            const stepExtractionSpeed = stepStats.final.extractionSpeed;
            const stepSkillCheckAmount = stepStats.final.skillCheckAmount;
            const stepSkillCheckChance = stepStats.final.skillCheckChance;
            const currentStressStacks = hasStressBall ? stressExpirations.length : 0;
            const metrics = this._getMachineProgressMetrics(
                stepExtractionSpeed,
                stepSkillCheckAmount,
                state.skillCheckSuccessRate,
                stepSkillCheckChance,
                currentStressStacks
            );

            const nextItemTime = itemIndex < timeline.length ? timeline[itemIndex].time : Infinity;
            const nextStressProcTime = (hasStressBall && metrics.successfulCheckRate > 0)
                ? timeSoFar + ((1 - successProgress) / metrics.successfulCheckRate)
                : Infinity;
            const nextStressExpiryTime = stressExpirations.length > 0 ? stressExpirations[0] : Infinity;
            const timeToCompletion = metrics.effectiveProgressRate > 0
                ? unitsRemaining / metrics.effectiveProgressRate
                : Infinity;
            const nextCompletionTime = timeSoFar + timeToCompletion;
            const nextBreakpointTime = Math.min(
                nextItemTime,
                nextStressProcTime,
                nextStressExpiryTime,
                nextCompletionTime
            );
            const segmentDuration = Math.max(0, nextBreakpointTime - timeSoFar);
            const segment = this._calculateMachineSegment(
                stepExtractionSpeed,
                stepSkillCheckAmount,
                state.skillCheckSuccessRate,
                segmentDuration,
                unitsRemaining,
                stepSkillCheckChance,
                currentStressStacks
            );
            const segmentStart = timeSoFar;
            const segmentEnd = timeSoFar + segment.timeConsumed;

            console.log(`    ▶️ Step ${cascadeBreakdown.length + 1}: ${segmentStart.toFixed(2)}s → ${segmentEnd.toFixed(2)}s (${segmentDuration.toFixed(2)}s)`);
            console.log(`       Stats: ${segment.adjustedExtractionSpeed.toFixed(3)} extraction (${stepExtractionSpeed}${currentStressStacks > 0 ? ` ×${(1 + (0.05 * currentStressStacks)).toFixed(3)} Stress Ball` : ''}), ${stepSkillCheckAmount} skill bonus`);
            console.log(`       Progress: ${segment.unitsCompleted.toFixed(2)} units, ${segment.expectedSkillChecks.toFixed(2)} checks`);

            unitsRemaining = segment.unitsRemaining;
            timeSoFar = segmentEnd;
            totalSkillChecks += segment.expectedSkillChecks;
            totalSuccessfulChecks += segment.expectedSuccessfulChecks;

            const reachedCompletion = unitsRemaining <= EPSILON || segment.isComplete;
            const itemExpiryTriggered = Math.abs(timeSoFar - nextItemTime) <= EPSILON;
            const stressProcTriggered = Math.abs(timeSoFar - nextStressProcTime) <= EPSILON;
            const stressExpiryTriggered = Math.abs(timeSoFar - nextStressExpiryTime) <= EPSILON;

            if (hasStressBall && metrics.successfulCheckRate > 0) {
                successProgress = Math.min(1, successProgress + (metrics.successfulCheckRate * segment.timeConsumed));
            }

            const expiredItems = [];
            if (itemExpiryTriggered) {
                while (itemIndex < timeline.length && Math.abs(timeline[itemIndex].time - timeSoFar) <= EPSILON) {
                    const timePoint = timeline[itemIndex];
                    expiredItems.push(...timePoint.expiredItems.map(item => item.name));
                    this._removeItemsFromState(workingState, timePoint.expiredItems.map(item => item.id));
                    itemIndex += 1;
                }
            }

            if (stressExpiryTriggered) {
                while (stressExpirations.length > 0 && stressExpirations[0] <= timeSoFar + EPSILON) {
                    stressExpirations.shift();
                }
            }

            if (stressProcTriggered) {
                successProgress = Math.max(0, successProgress - 1);
                stressExpirations.push(timeSoFar + 15);
                stressExpirations.sort((a, b) => a - b);
            }

            cascadeBreakdown.push({
                timePoint: Math.round(timeSoFar * 100) / 100,
                itemsExpired: expiredItems,
                statsAtStep: {
                    extractionSpeed: stepExtractionSpeed,
                    skillCheckAmount: stepSkillCheckAmount,
                    skillCheckChance: stepSkillCheckChance,
                    stressStacks: currentStressStacks,
                    adjustedExtractionSpeed: segment.adjustedExtractionSpeed
                },
                unitsCompleted: segment.unitsCompleted,
                unitsRemaining: segment.unitsRemaining,
                skillChecksThisWindow: segment.expectedSkillChecks,
                expectedSuccessfulChecks: segment.expectedSuccessfulChecks,
                actualTimeTaken: segment.timeConsumed,
                events: {
                    itemExpiry: itemExpiryTriggered,
                    stressProc: stressProcTriggered,
                    stressExpiry: stressExpiryTriggered
                },
                isEarlyCompletion: reachedCompletion
            });

            if (reachedCompletion) {
                console.log(`       ⚠️ Machine completed early!`);
                break;
            }
        }

        return {
            defaultTime: Math.round(this._calculateBaseMachineTime(machineUnits, permanentBaseExtractionSpeed) * 10) / 10,
            averageTime: Math.round(timeSoFar * 10) / 10,
            expectedSkillChecks: Math.round(totalSkillChecks * 10) / 10,
            expectedSuccessfulChecks: Math.round(totalSuccessfulChecks * 10) / 10,
            effectiveProgressRate: initialExtractionSpeed,
            cascadeBreakdown: cascadeBreakdown
        };
    },

    /**
     * Calculate base machine time using only permanent extraction stats and upfront completion effects
     * @private
     */
    _calculateBaseMachineTime(machineUnits, extractionSpeed) {
        if (extractionSpeed <= 0) {
            return Infinity;
        }

        return machineUnits / extractionSpeed;
    },

    /**
     * Calculate machine progress metrics for a fixed extraction segment
     * @private
     */
    _getMachineProgressMetrics(extractionSpeed, skillCheckAmount, skillCheckSuccess, skillCheckChance = 0.25, stressStacks = 0) {
        const SKILL_CHECK_CHANCE = this._normalizeSkillCheckChance(skillCheckChance);
        const MIN_DURATION = 0.75;
        const MAX_DURATION = 2.5;
        const GRACE_PERIOD = 2.0;
        const meanDuration = (MIN_DURATION + MAX_DURATION) / 2;
        const deadTime = meanDuration + GRACE_PERIOD;
        const effectiveCheckRate = this._calculateEffectiveCheckRate(SKILL_CHECK_CHANCE, deadTime);
        const successfulCheckRate = effectiveCheckRate * skillCheckSuccess;
        const adjustedExtractionSpeed = extractionSpeed * (1 + (0.05 * stressStacks));
        const effectiveProgressRate = adjustedExtractionSpeed + (skillCheckAmount * successfulCheckRate);

        return {
            adjustedExtractionSpeed,
            effectiveCheckRate,
            successfulCheckRate,
            effectiveProgressRate
        };
    },

    /**
     * Calculate partial machine progress for a segment with fixed stats and Stress Ball stacks
     * @private
     */
    _calculateMachineSegment(extractionSpeed, skillCheckAmount, skillCheckSuccess, durationSeconds, unitsRemaining = 45, skillCheckChance = 0.25, stressStacks = 0) {
        const metrics = this._getMachineProgressMetrics(
            extractionSpeed,
            skillCheckAmount,
            skillCheckSuccess,
            skillCheckChance,
            stressStacks
        );
        const timeToCompletion = metrics.effectiveProgressRate > 0 ? unitsRemaining / metrics.effectiveProgressRate : Infinity;
        const actualTimeTaken = Math.min(timeToCompletion, durationSeconds);
        const unitsCompleted = metrics.effectiveProgressRate * actualTimeTaken;
        const expectedSkillChecksThisWindow = metrics.effectiveCheckRate * actualTimeTaken;
        const expectedSuccessfulChecks = metrics.successfulCheckRate * actualTimeTaken;
        const newUnitsRemaining = Math.max(0, unitsRemaining - unitsCompleted);

        return {
            adjustedExtractionSpeed: metrics.adjustedExtractionSpeed,
            unitsCompleted: Math.round(unitsCompleted * 100) / 100,
            unitsRemaining: Math.round(newUnitsRemaining * 100) / 100,
            expectedSkillChecks: Math.round(expectedSkillChecksThisWindow * 100) / 100,
            expectedSuccessfulChecks: Math.round(expectedSuccessfulChecks * 100) / 100,
            timeConsumed: actualTimeTaken,
            isComplete: timeToCompletion <= durationSeconds,
            effectiveProgressRate: Math.round(metrics.effectiveProgressRate * 100) / 100
        };
    },

    /**
     * Clamp skill check chance to the valid in-game range
     * @private
     */
    _normalizeSkillCheckChance(skillCheckChance) {
        return Math.min(Math.max(skillCheckChance, 0), 1);
    },

    /**
     * Convert skill check chance into an effective check rate, with 100% treated as a hard cap
     * @private
     */
    _calculateEffectiveCheckRate(skillCheckChance, deadTime) {
        const normalizedChance = this._normalizeSkillCheckChance(skillCheckChance);
        if (normalizedChance >= 1) {
            return 1 / deadTime;
        }

        const hazard = -Math.log(1 - normalizedChance);
        return hazard / (1.0 + hazard * deadTime);
    },

    /**
     * Check if item qualifies for Glazed Fondant Bag bonus
     */
    _isGlazedFondantItem(itemId) {
        const glazedItems = [
            'gumballs',
            'stamina_candy',
            'stealth_candy',
            'chocolate',
            'speed_candy',
            'extraction_speed_candy',
            'skill_check_candy',
            'jawbreaker',
            'bonbon',
            'box_o_chocolates'
        ];
        return glazedItems.includes(itemId);
    },

    /**
     * Build a timeline of when items expire to handle cascading calculations
     */
    _buildItemTimeline(itemsWithDuration) {
        // Get unique time points where items expire
        const timePoints = new Set();
        itemsWithDuration.forEach(item => {
            timePoints.add(item.actualDuration);
        });

        // Convert to sorted array
        const sortedTimes = Array.from(timePoints).sort((a, b) => a - b);

        // For each time point, identify which items expire
        const timeline = sortedTimes.map(time => ({
            time,
            expiredItems: itemsWithDuration.filter(item => item.actualDuration === time)
        }));

        return timeline;
    }
};
