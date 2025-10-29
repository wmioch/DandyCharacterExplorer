/**
 * data-loader.js
 * Loads and manages all game data from JSON files
 */

const DataLoader = {
    data: {
        statMappings: null,
        toons: null,
        trinkets: null,
        items: null,
        twisteds: null
    },

    /**
     * Load all game data from JSON files
     */
    async loadAllData() {
        try {
            const [statMappings, toons, trinkets, items, twisteds] = await Promise.all([
                fetch('data/stat-mappings.json').then(r => r.json()),
                fetch('data/toons.json').then(r => r.json()),
                fetch('data/trinkets.json').then(r => r.json()),
                fetch('data/items.json').then(r => r.json()),
                fetch('data/twisteds.json').then(r => r.json())
            ]);

            this.data.statMappings = statMappings;
            this.data.toons = toons.toons;
            this.data.trinkets = trinkets.trinkets;
            this.data.items = items.items;
            this.data.twisteds = twisteds.twisteds;

            console.log('✅ All game data loaded successfully');
            return true;
        } catch (error) {
            console.error('❌ Error loading game data:', error);
            return false;
        }
    },

    /**
     * Get a toon by ID
     */
    getToon(id) {
        return this.data.toons?.find(t => t.id === id) || null;
    },

    /**
     * Get a trinket by ID
     */
    getTrinket(id) {
        return this.data.trinkets?.find(t => t.id === id) || null;
    },

    /**
     * Get an item by ID
     */
    getItem(id) {
        return this.data.items?.find(i => i.id === id) || null;
    },

    /**
     * Get a twisted by ID
     */
    getTwisted(id) {
        return this.data.twisteds?.find(t => t.id === id) || null;
    },

    /**
     * Get all toons
     */
    getAllToons() {
        return this.data.toons || [];
    },

    /**
     * Get all trinkets
     */
    getAllTrinkets() {
        return this.data.trinkets || [];
    },

    /**
     * Get all visible trinkets (excluding hidden ones)
     */
    getVisibleTrinkets() {
        return (this.data.trinkets || []).filter(t => !t.hidden);
    },

    /**
     * Get all items
     */
    getAllItems() {
        return this.data.items || [];
    },

    /**
     * Get all twisteds
     */
    getAllTwisteds() {
        return this.data.twisteds || [];
    },

    /**
     * Get stat value from star rating
     */
    getStatValue(statName, starRating) {
        return this.data.statMappings?.[statName]?.[starRating] || 0;
    }
};

