// --- Utility Functions ---
function toCamelCase(str) {
    // console.log('utils.js: toCamelCase called with str:', str); // Server-side logging can be different
    if (!str) return '';
    let cleanedStr = str.replace(/[^a-zA-Z0-9\s]/g, '');
    return cleanedStr.toLowerCase()
        .replace(/\s+(.)/g, (match, chr) => chr.toUpperCase())
        .replace(/\s/g, '')
        .replace(/^(.)/, (match, chr) => chr.toLowerCase());
}

// --- Core Game Data ---
// Copied from public/data.js and adapted for server-side use

const ITEM_DATA = {
    "commonHerbs": { name: "Common Herbs", description: "Basic herbs for alchemy.", type: "material", tier: 1, gameAsset: 'commonHerbs.png' },
    "roughIronOre": { name: "Rough Iron Ore", description: "Unrefined ore for forging.", type: "material", tier: 1, gameAsset: 'roughIronOre.png' },
    "blankTalismanPaper": { name: "Blank Talisman Paper", description: "Paper for drawing talismans.", type: "material", tier: 1, gameAsset: 'blankTalismanPaper.png' },
    "monsterCoreWeak": { name: "Monster Core (Weak)", description: "A weak core from a defeated monster.", type: "material", tier: 1, gameAsset: 'monsterCoreWeak.png' },
    "beastBoneFragment": { name: "Beast Bone Fragment", description: "A fragment of a beast's bone.", type: "material", tier: 2, gameAsset: 'beastBoneFragment.png' },
    "spiritDust": { name: "Spirit Dust", description: "Residue with faint spiritual energy.", type: "material", tier: 2, gameAsset: 'spiritDust.png' },
    "spiritStoneFragment": { name: "Spirit Stone Fragment", description: "A small piece of a spirit stone.", type: "material", tier: 1, gameAsset: 'spiritStoneFragment.png' },
    "spiritStones": { name: "Spirit Stones", description: "Currency of the cultivation world.", type: "currency", gameAsset: 'spiritStones.png' },

    // Consumables - Effects simplified for server, client-side calls removed
    "minorHealingPill": { name: "Minor Healing Pill", description: "Restores a small amount of health.", type: "consumable", gameAsset: 'minorHealingPill.png', effectType: "heal", amount: 25, usableInCombat: true },
    "minorQiPill": { name: "Minor QI Pill", description: "Restores a small amount of QI.", type: "consumable", gameAsset: 'minorQiPill.png', effectType: "qi_restore", amount: 20, usableInCombat: true },
    
    // Equipment - equipEffect functions removed, stats preserved
    "roughSword": { name: "Rough Sword", description: "A crudely made sword. Phys. Attack +5.", type: "weapon", weaponPhysicalAttackBonus: 5, gameAsset: 'roughSword.png' },
    
    // Talismans - effectInCombat simplified
    "minorFireTalisman": { name: "Minor Fire Talisman", description: "Unleashes a small burst of fire. (10 QI)", type: "talisman", qiCost: 10, baseDamage: 15, gameAsset: 'minorFireTalisman.png' },

    "jadeleafGrass": { name: "Jadeleaf Grass", description: "Common herb that mildly restores qi.", type: "material", tier: 1, gameAsset: 'jadeleafGrass.png' },
    "crimsonSpiritBerry": { name: "Crimson Spirit Berry", description: "Used for blood regeneration and minor injuries.", type: "material", tier: 1, gameAsset: 'crimsonSpiritBerry.png' },
    "soothingRainPetal": { name: "Soothing Rain Petal", description: "Calms qi deviation; heals minor spiritual wounds.", type: "material", tier: 2, gameAsset: 'soothingRainPetal.png' },
    "moondewFlower": { name: "Moondew Flower", description: "A gentle restorative for mind and body.", type: "material", tier: 2, gameAsset: 'moondewFlower.png' },
    "earthrootGinseng": { name: "Earthroot Ginseng", description: "Recovers qi and physical stamina.", type: "material", tier: 3, gameAsset: 'earthrootGinseng.png' },
    "skyLotusBud": { name: "Sky Lotus Bud", description: "Advanced qi restoration, often used by Core cultivators.", type: "material", tier: 4, gameAsset: 'skyLotusBud.png' },
    "whisperingLeaf": { name: "Whispering Leaf", description: "Promotes faster energy circulation during rest.", type: "material", tier: 3, gameAsset: 'whisperingLeaf.png' },
    "radiantSunfruit": { name: "Radiant Sunfruit", description: "Restores both qi and vitality rapidly.", type: "material", tier: 4, gameAsset: 'radiantSunfruit.png' },
    "cloudmossVine": { name: "Cloudmoss Vine", description: "Stimulates spiritual veins; best for Nascent Soul users.", type: "material", tier: 5, gameAsset: 'cloudmossVine.png' },
    "spiritglowMushroom": { name: "Spiritglow Mushroom", description: "Heals internal meridian damage.", type: "material", tier: 5, isRare: true, gameAsset: 'spiritglowMushroom.png' },

    "breakthroughVine": { name: "Breakthrough Vine", description: "Helps cultivators leap into Foundation Establishment.", type: "material", tier: 1, isRare: true, forRealmBreak: 2, gameAsset: 'breakthroughVine.png' },
    "dragonboneFern": { name: "Dragonbone Fern", description: "Used in pills to stabilize Core Formation.", type: "material", tier: 2, isRare: true, forRealmBreak: 3, gameAsset: 'dragonboneFern.png' },
    "phoenixbloodHerb": { name: "Phoenixblood Herb", description: "Burns away impurities; ideal for advancing into Nascent Soul.", type: "material", tier: 3, isRare: true, forRealmBreak: 4, gameAsset: 'phoenixbloodHerb.png' },
    "ascensionOrchid": { name: "Ascension Orchid", description: "Rare orchid that assists in Soul Formation breakthroughs.", type: "material", tier: 4, isRare: true, forRealmBreak: 5, gameAsset: 'ascensionOrchid.png' },
    "heavenpierceRoot": { name: "Heavenpierce Root", description: "Violently clears bottlenecks; high risk, high reward.", type: "material", tier: 4, isRare: true, forRealmBreak: 5, gameAsset: 'heavenpierceRoot.png' },
    "divineFlameGrass": { name: "Divine Flame Grass", description: "Contains pure yang energy; used for fiery breakthroughs.", type: "material", tier: 3, isRare: true, gameAsset: 'divineFlameGrass.png' },
    "lunarBloom": { name: "Lunar Bloom", description: "Yin energy concentrated herb, used in realm balance pills.", type: "material", tier: 3, isRare: true, gameAsset: 'lunarBloom.png' },
    "immortaldustleaf": { name: "Immortal Dustleaf", description: "Needed for Transcendence Elixirs.", type: "material", tier: 5, isRare: true, forRealmBreak: 6, gameAsset: 'immortalDustleaf.png' },
    "voidberryThorn": { name: "Voidberry Thorn", description: "Bitter but crucial for soul ascension.", type: "material", tier: 5, isRare: true, forRealmBreak: 6, gameAsset: 'voidberryThorn.png' },
    "thunderclapFruit": { name: "Thunderclap Fruit", description: "Shocks dantian to force enlightenment at high realms.", type: "material", tier: 5, isRare: true, gameAsset: 'thunderclapFruit.png' },

    "starforgePetal": { name: "Starforge Petal", description: "A petal that glimmers with starlight.", type: "material", tier: 4, gameAsset: 'starforgePetal.png' },
    "stoneheartRoot": { name: "Stoneheart Root", description: "A root as hard as stone, imbued with earth essence.", type: "material", tier: 4, gameAsset: 'stoneheartRoot.png' },
    "spiriteyeFlower": { name: "Spirit-Eye Flower", description: "A flower that seems to gaze into the spiritual realm.", type: "material", tier: 3, gameAsset: 'spiritEyeFlower.png' },
    "heartblossomBud": { name: "Heartblossom Bud", description: "A bud said to open one's heart to spiritual senses.", type: "material", tier: 3, gameAsset: 'heartblossomBud.png' },
    "silverstormLeaf": { name: "Silverstorm Leaf", description: "A leaf that moves with incredible speed, even in stillness.", type: "material", tier: 3, gameAsset: 'silverstormLeaf.png' },
    "goldendantianFruit": { name: "Golden Dantian Fruit", description: "A fruit believed to strengthen a cultivator's core.", type: "material", tier: 4, gameAsset: 'goldenDantianFruit.png' },
    "blackflameGinseng": { name: "Blackflame Ginseng", description: "Ginseng that smolders with dark fire.", type: "material", tier: 4, isRare: true, gameAsset: 'blackflameGinseng.png' },
    "frostmarrowMoss": { name: "Frostmarrow Moss", description: "Moss that chills to the bone, yet preserves essence.", type: "material", tier: 4, isRare: true, gameAsset: 'frostmarrowMoss.png' },
    "demonCore": { name: "Demon Core", description: "A core from a defeated demon, required for all artifact refining.", type: "material", tier: 0, isRare: true, gameAsset: 'assets/mats/demon_core.png' },

    "spiritOreFragment": { name: "Spirit Ore Fragment", description: "Fragment of ore with faint spiritual energy.", type: "refining_material", tier: 1, gameAsset: 'assets/mats/spirit_ore_fragment.png' },
    "enchantedStoneDust": { name: "Enchanted Stone Dust", description: "Dust from enchanted stones, used to imbue magical properties.", type: "refining_material", tier: 1, gameAsset: 'assets/mats/enchanted_stone_dust.png' },
    "minorQiConductor": { name: "Minor Qi Conductor", description: "A material that conducts small amounts of Qi, enhancing artifact effects.", type: "refining_material", tier: 1, gameAsset: 'assets/mats/minor_qi_conductor.png' },
    "refinedSpiritOre": { name: "Refined Spirit Ore", description: "Spirit ore refined to improve its purity and conductivity.", type: "refining_material", tier: 2, gameAsset: 'refined_spirit_ore.png' },
    "moonsteelFragment": { name: "Moonsteel Fragment", description: "A fragment of moonsteel, known for its ability to store spiritual energy.", type: "refining_material", tier: 2, gameAsset: 'moonsteel_fragment.png' },
    "stabilizingRuneDust": { name: "Stabilizing Rune Dust", description: "Dust from runes used to stabilize and control magical flow in artifacts.", type: "refining_material", tier: 2, gameAsset: 'stabilizing_rune_dust.png' },
    "spiritAlloyShard": { name: "Spirit Alloy Shard", description: "A shard of spirit alloy, a stronger material for more powerful artifacts.", type: "refining_material", tier: 3, gameAsset: 'spirit_alloy_shard.png' },
    "frostIronOre": { name: "Frost-Iron Ore", description: "Ore infused with frost magic, enhancing cold-based or defensive artifacts.", type: "refining_material", tier: 3, gameAsset: 'frost_iron_ore.png' },
    "heatLinkedLens": { name: "Heat-Linked Lens", description: "A lens that channels heat and fire, used in offensive or fire-based artifacts.", type: "refining_material", tier: 3, gameAsset: 'heat_linked_lens.png' },
    "voidsteelFragment": { name: "Voidsteel Fragment", description: "A fragment of voidsteel, a mysterious material with unique properties.", type: "refining_material", tier: 4, gameAsset: 'voidsteel_fragment.png' },
    "lightningChargedPlate": { name: "Lightning-Charged Plate", description: "A plate that stores and conducts lightning, used to electrify or speed up artifacts.", type: "refining_material", tier: 4, gameAsset: 'lightning_charged_plate.png' },
    "soulEchoDust": { name: "Soul-Echo Dust", description: "Dust that resonates with souls, used to create artifacts that interact with spirits or souls.", type: "refining_material", tier: 4, gameAsset: 'soul_echo_dust.png' },
    "celestialAlloyChunk": { name: "Celestial Alloy Chunk", description: "A chunk of celestial alloy, an incredibly strong and conductive material.", type: "refining_material", tier: 5, gameAsset: 'celestial_alloy_chunk.png' },
    "phantomSilver": { name: "Phantom Silver", description: "A type of silver that interacts with the ethereal plane, useful for soul-based artifacts.", type: "refining_material", tier: 5, gameAsset: 'phantom_silver.png' },
    "echoCrystalSlab": { name: "Echo Crystal Slab", description: "A slab of crystal that echoes magical energy, amplifying artifact effects.", type: "refining_material", tier: 5, gameAsset: 'echo_crystal_slab.png' },
    "heavensteelCore": { name: "Heavensteel Core", description: "A core of heavensteel, an artifact material of legendary strength and power.", type: "refining_material", tier: 6, gameAsset: 'heavensteel_core.png' },
    "etherealJadeite": { name: "Ethereal Jadeite", description: "Jadeite that resonates with the ethereal plane, used for the most advanced soul artifacts.", type: "refining_material", tier: 6, gameAsset: 'ethereal_jadeite.png' },
    "originiteShard": { name: "Originite Shard", description: "A shard of originite, a material said to contain the original magical source.", type: "refining_material", tier: 6, gameAsset: 'originite_shard.png' },
    "harmonizingBellvine": { name: "Harmonizing Bellvine", description: "A vine whose flowers chime with balancing energies.", type: "material", tier: 5, gameAsset: 'harmonizingBellvine.png' },
    "eyeOfTheAncients": { name: "Eye of the Ancients", description: "A petrified eye that seems to hold ancient knowledge.", type: "material", tier: 5, isRare: true, gameAsset: 'eyeOfTheAncients.png' },

    // Equipment - stats preserved, client-side equipEffect functions removed
    "spiritboundBlade": { name: "Spiritbound Blade", description: "A blade infused with nascent spirit energy. +6 STR.", type: "weapon", slot: "weapon", tier: 1, weaponPhysicalAttackBonus: 10, stats: { strength: 6 }, gameAsset: 'assets/equipment/SpiritboundBlade.png' },
    "spiritboundMail": { name: "Spiritbound Mail", description: "Armor woven with spirit-enhancing threads. +8 CON.", type: "armor", tier: 1, slot: "body", stats: { constitution: 8 }, gameAsset: 'assets/equipment/SpiritboundMailArmor.png' },
    "spiritbandRing": { name: "Spiritband Ring", description: "A ring that hums with spiritual power. +5 SPR.", type: "accessory", tier: 1, slot: "ring1", stats: { spirit: 5 }, gameAsset: 'assets/equipment/SpiritbandRing.png' },
    "spiritstepBoots": { name: "Spiritstep Boots", description: "Boots that lighten your step with spirit energy. +5 AGI.", type: "armor", tier: 1, slot: "feet", stats: { agility: 5 }, gameAsset: 'assets/equipment/SpiritstepBoots.png' },
    "spiritguardHelm": { name: "Spiritguard Helm", description: "A helm that focuses spiritual defenses. +6 CON.", type: "armor", tier: 1, slot: "head", stats: { constitution: 6 }, gameAsset: 'assets/equipment/SpiritguardHelm.png' },
    "dawnlightSword": { name: "Dawnlight Sword", description: "A sword that glimmers with the first light of dawn. +5 STR, +2 AGI.", type: "weapon", tier: 1, slot: "weapon", weaponPhysicalAttackBonus: 12, stats: { strength: 5, agility: 2 }, gameAsset: 'assets/equipment/DawnlightSword.png' },
    "dawnlightVest": { name: "Dawnlight Vest", description: "Armor that catches the morning sun. +7 CON.", type: "armor", tier: 1, slot: "body", stats: { constitution: 7 }, gameAsset: 'assets/equipment/DawnlightVest.png' },
    "dawnbreakBand": { name: "Dawnbreak Band", description: "A ring that shines with hope. +4 SPR, +2 WIL.", type: "accessory", tier: 1, slot: "ring1", stats: { spirit: 4, willpower: 2 }, gameAsset: 'assets/equipment/DawnbreakBand.png' },
    "dawnbreakTreads": { name: "Dawnbreak Treads", description: "Boots that carry the swiftness of dawn. +6 AGI.", type: "armor", tier: 1, slot: "feet", stats: { agility: 6 }, gameAsset: 'assets/equipment/DawnbreakTreads.png' },
    "dawnlightCirclet": { name: "Dawnlight Circlet", description: "A circlet that clears the mind like the morning sky. +4 INT.", type: "armor", tier: 1, slot: "head", stats: { intellect: 4 }, gameAsset: 'assets/equipment/DawnlightCirclet.png' },
    "galeheartSpear": { name: "Galeheart Spear", description: "A spear that whistles with the wind's fury. +4 STR, +5 AGI.", type: "weapon", tier: 1, slot: "weapon", weaponPhysicalAttackBonus: 11, stats: { strength: 4, agility: 5 }, gameAsset: 'assets/equipment/GaleheartSpear.png' },
    "galeheartArmor": { name: "Galeheart Armor", description: "Light armor that flows like the wind. +6 CON, +1 AGI.", type: "armor", tier: 1, slot: "body", stats: { constitution: 6, agility: 1 }, gameAsset: 'assets/equipment/GaleheartArmor.png' },
    "galeheartBand": { name: "Galeheart Band", description: "A ring that carries the whisper of gales. +3 AGI, +3 SPR.", type: "accessory", tier: 1, slot: "ring1", stats: { agility: 3, spirit: 3 }, gameAsset: 'assets/equipment/GaleheartBand.png' },
    "galeheartGreaves": { name: "Galeheart Greaves", description: "Greaves that offer unmatched swiftness. +7 AGI.", type: "armor", tier: 1, slot: "feet", stats: { agility: 7 }, gameAsset: 'assets/equipment/GaleheartGreaves.png' },
    "galeheartHelm": { name: "Galeheart Helm", description: "A helm shaped by the winds, offering resilience. +5 CON.", type: "armor", tier: 1, slot: "head", stats: { constitution: 5 }, gameAsset: 'assets/equipment/GaleheartHelm.png' },
    "stonewallHammer": { name: "Stonewall Hammer", description: "A hammer of unyielding stone. +8 STR.", type: "weapon", tier: 1, slot: "weapon", weaponPhysicalAttackBonus: 15, stats: { strength: 8 }, gameAsset: 'assets/equipment/StonewallHammer.png' },
    "stonewallPlate": { name: "Stonewall Plate", description: "Impenetrable plate armor. +10 CON.", type: "armor", tier: 1, slot: "body", stats: { constitution: 10 }, gameAsset: 'assets/equipment/StonewallPlate.png' },
    "stonewallBand": { name: "Stonewall Band", description: "A ring of solid rock. +3 STR, +3 CON.", type: "accessory", tier: 1, slot: "ring1", stats: { strength: 3, constitution: 3 }, gameAsset: 'assets/equipment/StonewallBand.png' },
    "stonewallSabatons": { name: "Stonewall Sabatons", description: "Heavy boots that stand firm. +4 CON.", type: "armor", tier: 1, slot: "feet", stats: { constitution: 4 }, gameAsset: 'assets/equipment/StonewallSabatons.png' },
    "stonewallHelm": { name: "Stonewall Helm", description: "A helm of solid stone, offering great protection. +6 CON.", type: "armor", tier: 1, slot: "head", stats: { constitution: 6 }, gameAsset: 'assets/equipment/StonewallHelm.png' },
    "echoflowStaff": { name: "Echoflow Staff", description: "A staff that resonates with spiritual echoes. +5 SPR, +3 INT.", type: "weapon", tier: 1, slot: "weapon", weaponPhysicalAttackBonus: 5, stats: { spirit: 5, intellect: 3 }, gameAsset: 'assets/equipment/EchoflowStaff.png' },
    "echoflowRobe": { name: "Echoflow Robe", description: "Robes that shimmer with flowing energy. +7 SPR.", type: "armor", tier: 1, slot: "body", stats: { spirit: 7 }, gameAsset: 'assets/equipment/EchoflowRobe.png' },
    "echoflowBand": { name: "Echoflow Band", description: "A ring that amplifies spiritual resonance. +4 SPR.", type: "accessory", tier: 1, slot: "ring1", stats: { spirit: 4 }, gameAsset: 'assets/equipment/EchoflowBand.png' },
    "echoflowShoes": { name: "Echoflow Shoes", description: "Shoes that allow one to tread on echoes. +5 AGI, +3 SPR.", type: "armor", tier: 1, slot: "feet", stats: { agility: 5, spirit: 3 }, gameAsset: 'assets/equipment/EchoflowShoes.png' },
    "echoflowHood": { name: "Echoflow Hood", description: "A hood that quiets the mind and enhances focus. +4 CON, +2 SPR.", type: "armor", tier: 1, slot: "head", stats: { constitution: 4, spirit: 2 }, gameAsset: 'assets/equipment/EchoflowHood.png' }
};

const MONSTER_DATA = {
    "qiWisp": { name: "Qi Wisp", health: 20, str: 2, agi: 3, con: 0, spr: 5, intl: 1, wil: 1, cultivationLevel: 1, xpReward: 15, tamable: true, image: "assets/monsters/Qi_Wisp.png" },
    "snakeVine": { name: "Snake Vine", health: 30, str: 3, agi: 2, con: 1, spr: 1, intl: 1, wil: 2, cultivationLevel: 3, xpReward: 20, tamable: false, image: "assets/monsters/Snake_Vine.png" },
    "cloudGecko": { name: "Cloud Gecko", health: 25, str: 2, agi: 4, con: 2, spr: 2, intl: 1, wil: 1, cultivationLevel: 2, xpReward: 18, tamable: true, image: "assets/monsters/Cloud_Gecko.png" },
    "rockshellTortoise": { name: "Rockshell Tortoise", health: 50, str: 1, agi: 1, con: 5, spr: 1, intl: 1, wil: 3, cultivationLevel: 4, xpReward: 25, tamable: true, image: "assets/monsters/Rockshell_Tortoise.png" },
    "mistLeopardCub": { name: "Mist Leopard Cub", health: 35, str: 3, agi: 5, con: 1, spr: 2, intl: 2, wil: 2, cultivationLevel: 5, xpReward: 30, tamable: true, image: "assets/monsters/Mist_Leopard_Cub.png" },
    "spiritBat": { name: "Spirit Bat", health: 20, str: 4, agi: 6, con: 0, spr: 3, intl: 1, wil: 1, cultivationLevel: 4, xpReward: 22, tamable: false, image: "assets/monsters/Spirit_Bat.png" },
    "boneAnt": { name: "Bone Ant", health: 15, str: 2, agi: 3, con: 1, spr: 1, intl: 1, wil: 1, cultivationLevel: 6, xpReward: 20, tamable: false, image: "assets/monsters/Bone_Ant.png" },
    "leafbladeSerpent": { name: "Leafblade Serpent", health: 40, str: 4, agi: 5, con: 2, spr: 2, intl: 2, wil: 2, cultivationLevel: 7, xpReward: 35, tamable: false, image: "assets/monsters/Leafblade_Serpent.png" },
    "phantomBeetle": { name: "Phantom Beetle", health: 30, str: 3, agi: 4, con: 3, spr: 3, intl: 1, wil: 2, cultivationLevel: 8, xpReward: 30, tamable: false, image: "assets/monsters/Phantom_Beetle.png" },
    "firefangTiger": { name: "Firefang Tiger", health: 80, str: 6, agi: 7, con: 3, spr: 4, intl: 3, wil: 4, cultivationLevel: 10, xpReward: 50, tamable: true, image: "assets/monsters/Firefang_Tiger.png" },
    "flameSalamander": { name: "Flame Salamander", health: 70, str: 5, agi: 5, con: 5, spr: 6, intl: 2, wil: 3, cultivationLevel: 11, xpReward: 45, tamable: true, image: "assets/monsters/Flame_Salamander.png" },
    "moltenRockApe": { name: "Molten Rock Ape", health: 100, str: 8, agi: 4, con: 4, spr: 3, intl: 2, wil: 5, cultivationLevel: 12, xpReward: 60, tamable: false, image: "assets/monsters/Molten_Rock_Ape.png" },
    "moonlitOwl": { name: "Moonlit Owl", health: 60, str: 5, agi: 8, con: 2, spr: 7, intl: 4, wil: 3, cultivationLevel: 13, xpReward: 40, tamable: true, image: "assets/monsters/Moonlit_Owl.png" },
    "whisperingSpecter": { name: "Whispering Specter", health: 75, str: 6, agi: 7, con: 1, spr: 8, intl: 3, wil: 4, cultivationLevel: 14, xpReward: 55, tamable: false, image: "assets/monsters/Whispering_Specter.png" },
    "echoWraith": { name: "Echo Wraith", health: 90, str: 7, agi: 6, con: 3, spr: 7, intl: 3, wil: 5, cultivationLevel: 15, xpReward: 65, tamable: false, image: "assets/monsters/Echo_Wraith.png" },
    "sandDevourerScorpion": { name: "Sand Devourer Scorpion", health: 160, str: 13, agi: 10, con: 8, spr: 6, intl: 4, wil: 7, cultivationLevel: 19, xpReward: 90, tamable: false, image: "assets/monsters/Sand_Devourer_Scorpion.png" },
    "mirageCrawler": { name: "Mirage Crawler", health: 140, str: 11, agi: 12, con: 6, spr: 7, intl: 5, wil: 6, cultivationLevel: 20, xpReward: 85, tamable: false, image: "assets/monsters/Mirage_Crawler.png" },
    "sunfireVulture": { name: "Sunfire Vulture", health: 150, str: 14, agi: 11, con: 5, spr: 8, intl: 4, wil: 7, cultivationLevel: 21, xpReward: 100, tamable: true, image: "assets/monsters/Sunfire_Vulture.png" },
    "icehowlWolf": { name: "Icehowl Wolf", health: 170, str: 13, agi: 10, con: 7, spr: 7, intl: 4, wil: 8, cultivationLevel: 22, xpReward: 95, tamable: true, image: "assets/monsters/Icehowl_Wolf.png" },
    "frostbiteBear": { name: "Frostbite Bear", health: 200, str: 15, agi: 8, con: 10, spr: 5, intl: 3, wil: 9, cultivationLevel: 23, xpReward: 120, tamable: false, image: "assets/monsters/Frostbite_Bear.png" },
    "crystallineSpiritMoth": { name: "Crystalline Spirit Moth", health: 130, str: 10, agi: 13, con: 4, spr: 10, intl: 6, wil: 5, cultivationLevel: 24, xpReward: 80, tamable: true, image: "assets/monsters/Crystalline_Spirit_Moth.png" },
    "voidEyedToad": { name: "Void-Eyed Toad", health: 300, str: 20, agi: 15, con: 15, spr: 12, intl: 8, wil: 10, cultivationLevel: 28, xpReward: 160, tamable: false, image: "assets/monsters/Void-Eyed_Toad.png" },
    "ghoulWillOWisp": { name: "Ghoul Will-O’-Wisp", health: 250, str: 18, agi: 18, con: 10, spr: 15, intl: 10, wil: 12, cultivationLevel: 29, xpReward: 150, tamable: false, image: "assets/monsters/Ghoul_Will-O’-Wisp.png" },
    "murkSerpent": { name: "Murk Serpent", health: 320, str: 23, agi: 16, con: 12, spr: 10, intl: 7, wil: 11, cultivationLevel: 30, xpReward: 180, tamable: false, image: "assets/monsters/Murk_Serpent.png" },
    "stormdrakeHatchling": { name: "Stormdrake Hatchling", health: 350, str: 25, agi: 20, con: 18, spr: 18, intl: 12, wil: 15, cultivationLevel: 31, xpReward: 200, tamable: true, image: "assets/monsters/Stormdrake_Hatchling.png" },
    "thunderclapApe": { name: "Thunderclap Ape", health: 380, str: 28, agi: 18, con: 16, spr: 15, intl: 10, wil: 16, cultivationLevel: 32, xpReward: 220, tamable: false, image: "assets/monsters/Thunderclap_Ape.png" },
    "skySerpent": { name: "Sky Serpent", health: 330, str: 24, agi: 22, con: 14, spr: 20, intl: 14, wil: 14, cultivationLevel: 33, xpReward: 190, tamable: true, image: "assets/monsters/Sky_Serpent.png" },
    "blackflameShade": { name: "Blackflame Shade", health: 500, str: 33, agi: 30, con: 22, spr: 25, intl: 18, wil: 20, cultivationLevel: 37, xpReward: 320, tamable: false, image: "assets/monsters/Blackflame_Shade.png" },
    "soulEaterWasp": { name: "Soul-Eater Wasp", health: 450, str: 35, agi: 35, con: 18, spr: 28, intl: 20, wil: 22, cultivationLevel: 38, xpReward: 300, tamable: false, image: "assets/monsters/Soul-Eater_Wasp.png" },
    "ashPhoenixFragment": { name: "Ash Phoenix Fragment", health: 550, str: 30, agi: 28, con: 25, spr: 30, intl: 22, wil: 25, cultivationLevel: 39, xpReward: 350, tamable: false, image: "assets/monsters/Ash_Phoenix_Fragment.png" },
    "enlightenedSprite": { name: "Enlightened Sprite", health: 400, str: 28, agi: 32, con: 20, spr: 35, intl: 28, wil: 24, cultivationLevel: 40, xpReward: 280, tamable: true, image: "assets/monsters/Enlightened_Sprite.png" },
    "lotusPuppetMonk": { name: "Lotus Puppet Monk", health: 600, str: 38, agi: 25, con: 30, spr: 20, intl: 15, wil: 30, cultivationLevel: 41, xpReward: 400, tamable: false, image: "assets/monsters/Lotus_Puppet_Monk.png" },
    "spiralMindLeech": { name: "Spiral Mind Leech", health: 480, str: 40, agi: 30, con: 15, spr: 38, intl: 30, wil: 28, cultivationLevel: 42, xpReward: 380, tamable: false, image: "assets/monsters/Spiral_Mind_Leech.png" },
    "starboundChimera": { name: "Starbound Chimera", health: 800, str: 50, agi: 45, con: 40, spr: 40, intl: 30, wil: 35, cultivationLevel: 46, xpReward: 550, tamable: false, image: "assets/monsters/Starbound_Chimera.png" },
    "heavenpiercerLion": { name: "Heavenpiercer Lion", health: 900, str: 55, agi: 40, con: 45, spr: 35, intl: 28, wil: 40, cultivationLevel: 47, xpReward: 600, tamable: false, image: "assets/monsters/Heavenpiercer_Lion.png" },
    "timeBendingFox": { name: "Time-Bending Fox", health: 750, str: 45, agi: 55, con: 35, spr: 50, intl: 40, wil: 38, cultivationLevel: 48, xpReward: 500, tamable: true, image: "assets/monsters/Time-Bending_Fox.png" },
    "daoFragmentWraith": { name: "Dao Fragment Wraith", health: 1000, str: 60, agi: 35, con: 30, spr: 60, intl: 35, wil: 50, cultivationLevel: 49, xpReward: 700, tamable: false, image: "assets/monsters/Dao_Fragment_Wraith.png" },
    "crumblingGuardian": { name: "Crumbling Guardian", health: 1200, str: 50, agi: 30, con: 60, spr: 30, intl: 25, wil: 45, cultivationLevel: 50, xpReward: 650, tamable: false, image: "assets/monsters/Crumbling_Guardian.png" },
    "realityScar": { name: "Reality Scar", health: 850, str: 65, agi: 40, con: 25, spr: 55, intl: 30, wil: 40, cultivationLevel: 51, xpReward: 750, tamable: false, image: "assets/monsters/Reality_Scar.png" }
};

const EXPLORATION_AREAS = {
    "whisperingGlade": {
        name: "Whispering Glade", requiredRealmTier: 1, description: "A tranquil glade where nascent spiritual energies gather.", monsters: ["qiWisp", "snakeVine", "cloudGecko"], image: "assets/areas/Whispering_Glade.png",
        lootTable: [
            { itemId: 'jadeleafGrass', chance: 0.6, minQuantity: 1, maxQuantity: 3 },
            { itemId: 'crimsonSpiritBerry', chance: 0.4, minQuantity: 1, maxQuantity: 2 },
            { itemId: 'breakthroughVine', chance: 0.05, minQuantity: 1, maxQuantity: 1 },
            { itemId: 'spiritStoneFragment', chance: 0.2, minQuantity: 1, maxQuantity: 1 },
            { itemId: 'spiritOreFragment', chance: 0.25, minQuantity: 1, maxQuantity: 2 },
            { itemId: "basicQiRecoveryPillRecipe", chance: 0.03, minQuantity: 1, maxQuantity: 1 }
        ]
    },
    "verdantStreamCaverns": {
        name: "Verdant Stream Caverns", requiredRealmTier: 1, description: "Damp caverns echoing with the sound of flowing water, home to glowing flora.", monsters: ["rockshellTortoise", "mistLeopardCub", "spiritBat"], image: "assets/areas/Verdant_Stream_Caverns.png",
        lootTable: [
            { itemId: 'jadeleafGrass', chance: 0.5, minQuantity: 1, maxQuantity: 2 },
            { itemId: 'crimsonSpiritBerry', chance: 0.5, minQuantity: 1, maxQuantity: 2 },
            { itemId: 'spiritEyeFlower', chance: 0.15, minQuantity: 1, maxQuantity: 1 },
            { itemId: 'breakthroughVine', chance: 0.07, minQuantity: 1, maxQuantity: 1 },
            { itemId: 'spiritStoneFragment', chance: 0.25, minQuantity: 1, maxQuantity: 2 }
        ]
    },
    "fallenLeafHills": {
        name: "Fallen Leaf Hills", requiredRealmTier: 1, description: "Rolling hills covered in ancient, fallen leaves, hiding small beasts and herbs.", monsters: ["boneAnt", "leafbladeSerpent", "phantomBeetle"], image: "assets/areas/Fallen_Leaf_Hills.png",
        lootTable: [
            { itemId: 'jadeleafGrass', chance: 0.3, minQuantity: 1, maxQuantity: 2 },
            { itemId: 'crimsonSpiritBerry', chance: 0.3, minQuantity: 1, maxQuantity: 2 },
            { itemId: 'heartblossomBud', chance: 0.2, minQuantity: 1, maxQuantity: 1 },
            { itemId: 'breakthroughVine', chance: 0.1, minQuantity: 1, maxQuantity: 1 },
            { itemId: 'spiritStoneFragment', chance: 0.3, minQuantity: 1, maxQuantity: 2 },
            { itemId: "vitalityRejuvenationPillRecipe", chance: 0.02, minQuantity: 1, maxQuantity: 1 }
        ]
    },
    "crimsonEmberValley": {
        name: "Crimson Ember Valley", requiredRealmTier: 2, description: "A valley stained red by iron-rich soil, with lingering heat from ancient volcanic activity.", monsters: ["firefangTiger", "flameSalamander", "moltenRockApe"], image: "assets/areas/Crimson_Ember_Valley.png",
        lootTable: [
            { itemId: 'soothingRainPetal', chance: 0.5, minQuantity: 1, maxQuantity: 2 },
            { itemId: 'moondewFlower', chance: 0.4, minQuantity: 1, maxQuantity: 2 },
            { itemId: 'dragonboneFern', chance: 0.08, minQuantity: 1, maxQuantity: 1 },
            { itemId: 'beastBoneFragment', chance: 0.25, minQuantity: 1, maxQuantity: 1 },
            { itemId: "mindCalmingElixirRecipe", chance: 0.03, minQuantity: 1, maxQuantity: 1 }
        ]
    },
    "moonstoneRidge": {
        name: "Moonstone Ridge", requiredRealmTier: 2, description: "A high ridge where moon-kissed stones are said to enhance spiritual perception.", monsters: ["moonlitOwl", "whisperingSpecter", "echoWraith"], image: "assets/areas/Moonstone_Ridge.png",
        lootTable: [
            { itemId: 'soothingRainPetal', chance: 0.4, minQuantity: 1, maxQuantity: 2 },
            { itemId: 'moondewFlower', chance: 0.5, minQuantity: 1, maxQuantity: 2 },
            { itemId: 'silverstormLeaf', chance: 0.2, minQuantity: 1, maxQuantity: 1 },
            { itemId: 'dragonboneFern', chance: 0.1, minQuantity: 1, maxQuantity: 1 },
            { itemId: 'beastBoneFragment', chance: 0.3, minQuantity: 1, maxQuantity: 1 }
        ]
    },
    "goldenDuneExpanse": {
        name: "Golden Dune Expanse", requiredRealmTier: 3, description: "A vast desert of golden sands, where powerful desert beasts roam.", monsters: ["sandDevourerScorpion", "mirageCrawler", "sunfireVulture"], image: "assets/areas/Golden_Dune_Expanse.png",
        lootTable: [
            { itemId: 'earthrootGinseng', chance: 0.5, minQuantity: 1, maxQuantity: 2 },
            { itemId: 'whisperingLeaf', chance: 0.4, minQuantity: 1, maxQuantity: 1 },
            { itemId: 'divineFlameGrass', chance: 0.15, minQuantity: 1, maxQuantity: 1 },
            { itemId: 'phoenixbloodHerb', chance: 0.07, minQuantity: 1, maxQuantity: 1 },
            { itemId: "advancedSpiritPillRecipe", chance: 0.03, minQuantity: 1, maxQuantity: 1 }
        ]
    },
    "frostspineTundra": {
        name: "Frostspine Tundra", requiredRealmTier: 3, description: "A frozen wasteland where only the hardiest creatures and herbs survive.", monsters: ["icehowlWolf", "frostbiteBear", "crystallineSpiritMoth"], image: "assets/areas/Frostspine_Tundra.png",
        lootTable: [
            { itemId: 'earthrootGinseng', chance: 0.4, minQuantity: 1, maxQuantity: 1 },
            { itemId: 'lunarBloom', chance: 0.25, minQuantity: 1, maxQuantity: 1 },
            { itemId: 'frostmarrowMoss', chance: 0.15, minQuantity: 1, maxQuantity: 1 },
            { itemId: 'phoenixbloodHerb', chance: 0.1, minQuantity: 1, maxQuantity: 1 },
            { itemId: "flameInfusionPillRecipe", chance: 0.02, minQuantity: 1, maxQuantity: 1 }
        ]
    },
    "abyssalVoidMarsh": {
        name: "Abyssal Void Marsh", requiredRealmTier: 4, description: "A treacherous marshland where the veil between worlds is thin.", monsters: ["voidEyedToad", "ghoulWillOWisp", "murkSerpent"], image: "assets/areas/Abyssal_Void_Marsh.png",
        lootTable: [
            { itemId: 'skyLotusBud', chance: 0.5, minQuantity: 1, maxQuantity: 1 },
            { itemId: 'radiantSunfruit', chance: 0.4, minQuantity: 1, maxQuantity: 1 },
            { itemId: 'blackflameGinseng', chance: 0.2, minQuantity: 1, maxQuantity: 1 },
            { itemId: 'ascensionOrchid', chance: 0.07, minQuantity: 1, maxQuantity: 1 },
            { itemId: 'heavenpierceRoot', chance: 0.05, minQuantity: 1, maxQuantity: 1 },
            { itemId: "nascentSoulVitalPillRecipe", chance: 0.03, minQuantity: 1, maxQuantity: 1 }
        ]
    },
    "thunderreachPeaks": {
        name: "Thunderreach Peaks", requiredRealmTier: 4, description: "Towering peaks constantly battered by spiritual thunderstorms.", monsters: ["stormdrakeHatchling", "thunderclapApe", "skySerpent"], image: "assets/areas/Thunderreach_Peaks.png",
        lootTable: [
            { itemId: 'starforgePetal', chance: 0.3, minQuantity: 1, maxQuantity: 1 },
            { itemId: 'stoneheartRoot', chance: 0.3, minQuantity: 1, maxQuantity: 1 },
            { itemId: 'goldenDantianFruit', chance: 0.25, minQuantity: 1, maxQuantity: 1 },
            { itemId: 'ascensionOrchid', chance: 0.1, minQuantity: 1, maxQuantity: 1 },
            { itemId: "starforgeStrengthPillRecipe", chance: 0.02, minQuantity: 1, maxQuantity: 1 }
        ]
    },
    "obsidianSpiritWastes": {
        name: "Obsidian Spirit Wastes", requiredRealmTier: 5, description: "Barren wastes littered with obsidian shards, resonating with potent soul energy.", monsters: ["blackflameShade", "soulEaterWasp", "ashPhoenixFragment"], image: "assets/areas/Obsidian_Spirit_Wastes.png",
        lootTable: [
            { itemId: 'cloudmossVine', chance: 0.5, minQuantity: 1, maxQuantity: 1 },
            { itemId: 'spiritglowMushroom', chance: 0.4, minQuantity: 1, maxQuantity: 1 },
            { itemId: 'immortalDustleaf', chance: 0.08, minQuantity: 1, maxQuantity: 1 },
            { itemId: 'voidberryThorn', chance: 0.06, minQuantity: 1, maxQuantity: 1 },
            { itemId: "balanceHarmonizationPillRecipe", chance: 0.03, minQuantity: 1, maxQuantity: 1 }
        ]
    },
    "etherealLotusFields": {
        name: "Ethereal Lotus Fields", requiredRealmTier: 5, description: "Fields where phantom lotuses bloom, said to nourish the soul.", monsters: ["enlightenedSprite", "lotusPuppetMonk", "spiralMindLeech"], image: "assets/areas/Ethereal_Lotus_Fields.png",
        lootTable: [
            { itemId: 'harmonizingBellvine', chance: 0.3, minQuantity: 1, maxQuantity: 1 },
            { itemId: 'eyeOfTheAncients', chance: 0.2, minQuantity: 1, maxQuantity: 1 },
            { itemId: 'thunderclapFruit', chance: 0.15, minQuantity: 1, maxQuantity: 1 },
            { itemId: 'immortalDustleaf', chance: 0.1, minQuantity: 1, maxQuantity: 1 },
            { itemId: "soulFormationHeavenPillRecipe", chance: 0.02, minQuantity: 1, maxQuantity: 1 }
        ]
    },
    "celestialRiftDomain": {
        name: "Celestial Rift Domain", requiredRealmTier: 6, description: "A tear in the fabric of reality, leading to unpredictable and powerful energies.", monsters: ["starboundChimera", "heavenpiercerLion", "timeBendingFox"], image: "assets/areas/Celestial_Rift_Domain.png",
        lootTable: [
            { itemId: 'immortalDustleaf', chance: 0.2, minQuantity: 1, maxQuantity: 1 },
            { itemId: 'voidberryThorn', chance: 0.15, minQuantity: 1, maxQuantity: 1 },
            { itemId: 'thunderclapFruit', chance: 0.1, minQuantity: 1, maxQuantity: 1 },
            { itemId: "transcendenceVoidElixirRecipe", chance: 0.05, minQuantity: 1, maxQuantity: 1 }
        ]
    },
    "realmOfBrokenDao": {
        name: "Realm of Broken Dao", requiredRealmTier: 6, description: "A chaotic space where the laws of cultivation are fractured and dangerous.", monsters: ["daoFragmentWraith", "crumblingGuardian", "realityScar"], image: "assets/areas/Realm_of_Broken_Dao.png",
        lootTable: [
            { itemId: 'spiritglowMushroom', chance: 0.1, minQuantity: 1, maxQuantity: 1 },
            { itemId: 'eyeOfTheAncients', chance: 0.1, minQuantity: 1, maxQuantity: 1 },
            { itemId: 'immortalDustleaf', chance: 0.25, minQuantity: 1, maxQuantity: 1 }
        ]
    },
    "emeraldVeinHollow": { name: "Emerald Vein Hollow", requiredRealmTier: 1, description: "Where the earth’s first breath births the humblest herbs and whispering minerals.", monsters: [], image: "assets/areas/Emerald_Vein_Hollow.png", lootTable: [ { itemId: 'jadeleafGrass', chance: 0.75, minQuantity: 2, maxQuantity: 5 }, { itemId: 'crimsonSpiritBerry', chance: 0.60, minQuantity: 1, maxQuantity: 3 }, { itemId: 'breakthroughVine', chance: 0.15, minQuantity: 1, maxQuantity: 1 }, { itemId: 'spiritStoneFragment', chance: 0.30, minQuantity: 1, maxQuantity: 2 } ] },
    "starlitMossGarden": { name: "Starlit Moss Garden", requiredRealmTier: 2, description: "Beneath glowing spores and moon-kissed leaves, the land grows firm in its Qi.", monsters: [], image: "assets/areas/Starlit_Moss_Garden.png", lootTable: [ { itemId: 'soothingRainPetal', chance: 0.70, minQuantity: 2, maxQuantity: 4 }, { itemId: 'moondewFlower', chance: 0.65, minQuantity: 1, maxQuantity: 3 }, { itemId: 'spiritEyeFlower', chance: 0.30, minQuantity: 1, maxQuantity: 2 }, { itemId: 'dragonboneFern', chance: 0.12, minQuantity: 1, maxQuantity: 1 }, { itemId: 'spiritStoneFragment', chance: 0.35, minQuantity: 1, maxQuantity: 3 } ] },
    "crimsonIronGrottos": { name: "Crimson Iron Grottos", requiredRealmTier: 3, description: "Hidden within molten caverns and spirit-forged tunnels lie roots and ores of awakening power.", monsters: [], image: "assets/areas/Crimson_Iron_Grottos.png", lootTable: [ { itemId: 'earthrootGinseng', chance: 0.65, minQuantity: 1, maxQuantity: 3 }, { itemId: 'whisperingLeaf', chance: 0.55, minQuantity: 1, maxQuantity: 2 }, { itemId: 'heartblossomBud', chance: 0.40, minQuantity: 1, maxQuantity: 2 }, { itemId: 'silverstormLeaf', chance: 0.35, minQuantity: 1, maxQuantity: 1 }, { itemId: 'phoenixbloodHerb', chance: 0.10, minQuantity: 1, maxQuantity: 1 }, { itemId: 'divineFlameGrass', chance: 0.08, minQuantity: 1, maxQuantity: 1 }, { itemId: 'lunarBloom', chance: 0.08, minQuantity: 1, maxQuantity: 1 }, { itemId: 'spiritStones', chance: 0.15, minQuantity: 1, maxQuantity: 5 } ] },
    "lotusfireMarshlands": { name: "Lotusfire Marshlands", requiredRealmTier: 4, description: "A blooming abyss where soul-charged flowers and rare metals shimmer in toxic fog.", monsters: [], image: "assets/areas/Lotusfire_Marshlands.png", lootTable: [ { itemId: 'skyLotusBud', chance: 0.60, minQuantity: 1, maxQuantity: 2 }, { itemId: 'radiantSunfruit', chance: 0.50, minQuantity: 1, maxQuantity: 2 }, { itemId: 'starforgePetal', chance: 0.30, minQuantity: 1, maxQuantity: 1 }, { itemId: 'stoneheartRoot', chance: 0.30, minQuantity: 1, maxQuantity: 1 }, { itemId: 'goldenDantianFruit', chance: 0.25, minQuantity: 1, maxQuantity: 1 }, { itemId: 'blackflameGinseng', chance: 0.10, minQuantity: 1, maxQuantity: 1 }, { itemId: 'frostmarrowMoss', chance: 0.10, minQuantity: 1, maxQuantity: 1 }, { itemId: 'ascensionOrchid', chance: 0.08, minQuantity: 1, maxQuantity: 1 }, { itemId: 'heavenpierceRoot', chance: 0.06, minQuantity: 1, maxQuantity: 1 }, { itemId: 'spiritStones', chance: 0.20, minQuantity: 3, maxQuantity: 8 } ] },
    "mirrorwindHighlands": { name: "Mirrorwind Highlands", requiredRealmTier: 5, description: "Wind-warped cliffs where illusions dance and spirit iron hums in stone-veiled shrines.", monsters: [], image: "assets/areas/Mirrorwind_Highlands.png", lootTable: [ { itemId: 'cloudmossVine', chance: 0.55, minQuantity: 1, maxQuantity: 2 }, { itemId: 'spiritglowMushroom', chance: 0.35, minQuantity: 1, maxQuantity: 1 }, { itemId: 'harmonizingBellvine', chance: 0.30, minQuantity: 1, maxQuantity: 1 }, { itemId: 'eyeOfTheAncients', chance: 0.15, minQuantity: 1, maxQuantity: 1 }, { itemId: 'immortalDustleaf', chance: 0.07, minQuantity: 1, maxQuantity: 1 }, { itemId: 'voidberryThorn', chance: 0.07, minQuantity: 1, maxQuantity: 1 }, { itemId: 'thunderclapFruit', chance: 0.05, minQuantity: 1, maxQuantity: 1 }, { itemId: 'spiritStones', chance: 0.25, minQuantity: 5, maxQuantity: 12 } ] },
    "eclipticDreamRealm": { name: "Ecliptic Dream Realm", requiredRealmTier: 6, description: "Where the world begins to blur—phantom blossoms, primal jade, and unformed Dao await.", monsters: [], image: "assets/areas/Ecliptic_Dream_Realm.png", lootTable: [ { itemId: 'immortalDustleaf', chance: 0.40, minQuantity: 1, maxQuantity: 2 }, { itemId: 'voidberryThorn', chance: 0.35, minQuantity: 1, maxQuantity: 2 }, { itemId: 'thunderclapFruit', chance: 0.25, minQuantity: 1, maxQuantity: 1 }, { itemId: 'spiritglowMushroom', chance: 0.15, minQuantity: 1, maxQuantity: 1 }, { itemId: 'eyeOfTheAncients', chance: 0.15, minQuantity: 1, maxQuantity: 1 }, { itemId: 'spiritStones', chance: 0.30, minQuantity: 10, maxQuantity: 25 } ] },
};

const CULTIVATOR_CLASSES = {
    "martial_cultivator": { name: "Martial Cultivator", specialty: "Physical combat, brute strength, melee dominance, endurance.", recommendation: "Frontline DPS or tank roles; players who enjoy direct combat and body refinement.", baseStatsEffect: { strength: 3, constitution: 2 } },
    "qi_cultivator": { name: "Qi Cultivator", specialty: "Elemental spells, ranged attacks, flying swords, formations.", recommendation: "Ranged DPS, strategic players focused on spellcasting and control.", baseStatsEffect: { spirit: 3, intellect: 2 } },
    "alchemist": { name: "Alchemist", specialty: "Crafting pills for healing, breakthrough, poison, or buffing.", recommendation: "Support role or merchant-style gameplay; influences world through economics and rare pill production.", baseStatsEffect: { intellect: 3, willpower: 1, spirit:1 }, startingResources: { jadeleafGrass: 5, crimsonSpiritBerry: 3 } },
    "artifact_refiner": { name: "Artifact Refiner", specialty: "Forging spiritual weapons, defensive artifacts, arrays.", recommendation: "Crafters and strategic support players who arm others or gain power through custom gear.", baseStatsEffect: { intellect: 3, strength:1, constitution:1 }, startingResources: { roughIronOre: 3 } },
    "talisman_master": { name: "Talisman Master", specialty: "Drawing talismans for attack, defense, sealing, summoning.", recommendation: "Burst combat or utility players who enjoy preparation and setup playstyles.", baseStatsEffect: { spirit: 2, intellect: 2, willpower:1 }, startingResources: { blankTalismanPaper: 10 } },
    "formation_master": { name: "Formation Master", specialty: "Setting up battlefield formations for area control, traps, or enhancement.", recommendation: "Tactical thinkers; for team buffs, enemy restriction, and battlefield control.", baseStatsEffect: { intellect: 3, spirit: 2 } },
    "beast_tamer": { name: "Beast Tamer", specialty: "Taming and commanding spirit beasts or demonic creatures.", recommendation: "Summoner-style players, beast combat synergy, or solo adventuring with companions.", baseStatsEffect: { willpower: 3, spirit: 2 } },
    "poison_master": { name: "Poison Master", specialty: "Toxins, stealth, curse arts, assassination.", recommendation: "Debuffers, rogue-style gameplay, or players who enjoy subversive tactics.", baseStatsEffect: { intellect: 2, agility: 3 } },
    "puppet_master": { name: "Puppet Master", specialty: "Constructs animated puppets for combat, defense, spying.", recommendation: "Tech/artifact lovers, indirect combat style, and versatile setups.", baseStatsEffect: { intellect: 3, spirit: 1, strength:1 } },
    "soul_cultivator": { name: "Soul Cultivator", specialty: "Attacks based on divine soul/spiritual awareness, illusions, or mind control.", recommendation: "High-risk, high-reward players; focuses on soul damage and mental battles.", baseStatsEffect: { spirit: 3, willpower: 2 } },
    "demon_cultivator": { name: "Demon Cultivator", specialty: "Dark techniques, fast growth through taboo methods, body possession, curses.", recommendation: "Villainous or anti-hero players; strong but risky path with moral choices.", baseStatsEffect: { strength:1, spirit:1 } }, // demonicCorruption handled separately
    "heavenly_oracle": { name: "Heavenly Oracle", specialty: "Prophecy, luck manipulation, fate techniques.", recommendation: "Utility/support or RP-focused players; can influence events or gain rare opportunities.", baseStatsEffect: { willpower: 3, intellect: 2 } }
};

const CLASS_STAT_GROWTH = {
    "martial_cultivator": { str: 3, agi: 1, con: 3, spr: 0, intl: 0, wil: 0 },
    "qi_cultivator":      { str: 0, agi: 1, con: 1, spr: 4, intl: 0, wil: 0 },
    "alchemist":          { str: 0, agi: 0, con: 1, spr: 2, intl: 3, wil: 1 },
    "artifact_refiner":   { str: 1, agi: 0, con: 2, spr: 1, intl: 3, wil: 1 },
    "talisman_master":    { str: 0, agi: 2, con: 0, spr: 3, intl: 2, wil: 1 },
    "formation_master":   { str: 0, agi: 0, con: 2, spr: 2, intl: 4, wil: 0 },
    "beast_tamer":        { str: 2, agi: 3, con: 1, spr: 2, intl: 0, wil: 0 },
    "poison_master":      { str: 1, agi: 3, con: 1, spr: 2, intl: 2, wil: 1 },
    "soul_cultivator":    { str: 0, agi: 0, con: 0, spr: 3, intl: 1, wil: 4 },
    "demon_cultivator":   { str: 4, agi: 1, con: 2, spr: 0, intl: 0, wil: 1 },
    "heavenly_oracle":    { str: 0, agi: 0, con: 0, spr: 2, intl: 3, wil: 3 }
};

const ARTIFACT_RECIPES = {
    "spiritboundBladeRecipe": { name: "Spiritbound Blade", producesItemKey: "spiritboundBlade", ingredients: { "spiritOreFragment": 3, "enchantedStoneDust": 2, "minorQiConductor": 1, "demonCore": 1 }, requiredClass: "artifact_refiner", requiredCultivationLevel: 1, qiCost: 20 },
    "spiritboundMailRecipe": { name: "Spiritbound Mail", producesItemKey: "spiritboundMail", ingredients: { "spiritOreFragment": 3, "enchantedStoneDust": 2, "minorQiConductor": 1, "demonCore": 1 }, requiredClass: "artifact_refiner", requiredCultivationLevel: 1, qiCost: 20 },
    "spiritbandRingRecipe": { name: "Spiritband Ring", producesItemKey: "spiritbandRing", ingredients: { "spiritOreFragment": 3, "enchantedStoneDust": 2, "minorQiConductor": 1, "demonCore": 1 }, requiredClass: "artifact_refiner", requiredCultivationLevel: 1, qiCost: 15 },
    "spiritstepBootsRecipe": { name: "Spiritstep Boots", producesItemKey: "spiritstepBoots", ingredients: { "spiritOreFragment": 3, "enchantedStoneDust": 2, "minorQiConductor": 1, "demonCore": 1 }, requiredClass: "artifact_refiner", requiredCultivationLevel: 1, qiCost: 15 },
    "spiritguardHelmRecipe": { name: "Spiritguard Helm", producesItemKey: "spiritguardHelm", ingredients: { "spiritOreFragment": 3, "enchantedStoneDust": 2, "minorQiConductor": 1, "demonCore": 1 }, requiredClass: "artifact_refiner", requiredCultivationLevel: 1, qiCost: 15 },
    "dawnlightSwordRecipe": { name: "Dawnlight Sword", producesItemKey: "dawnlightSword", ingredients: { "spiritOreFragment": 3, "enchantedStoneDust": 2, "minorQiConductor": 1, "demonCore": 1 }, requiredClass: "artifact_refiner", requiredCultivationLevel: 1, qiCost: 20 },
    "dawnlightVestRecipe": { name: "Dawnlight Vest", producesItemKey: "dawnlightVest", ingredients: { "spiritOreFragment": 3, "enchantedStoneDust": 2, "minorQiConductor": 1, "demonCore": 1 }, requiredClass: "artifact_refiner", requiredCultivationLevel: 1, qiCost: 20 },
    "dawnbreakBandRecipe": { name: "Dawnbreak Band", producesItemKey: "dawnbreakBand", ingredients: { "spiritOreFragment": 3, "enchantedStoneDust": 2, "minorQiConductor": 1, "demonCore": 1 }, requiredClass: "artifact_refiner", requiredCultivationLevel: 1, qiCost: 15 },
    "dawnbreakTreadsRecipe": { name: "Dawnbreak Treads", producesItemKey: "dawnbreakTreads", ingredients: { "spiritOreFragment": 3, "enchantedStoneDust": 2, "minorQiConductor": 1, "demonCore": 1 }, requiredClass: "artifact_refiner", requiredCultivationLevel: 1, qiCost: 15 },
    "dawnlightCircletRecipe": { name: "Dawnlight Circlet", producesItemKey: "dawnlightCirclet", ingredients: { "spiritOreFragment": 3, "enchantedStoneDust": 2, "minorQiConductor": 1, "demonCore": 1 }, requiredClass: "artifact_refiner", requiredCultivationLevel: 1, qiCost: 15 },
    "galeheartSpearRecipe": { name: "Galeheart Spear", producesItemKey: "galeheartSpear", ingredients: { "spiritOreFragment": 3, "enchantedStoneDust": 2, "minorQiConductor": 1, "demonCore": 1 }, requiredClass: "artifact_refiner", requiredCultivationLevel: 1, qiCost: 20 },
    "galeheartArmorRecipe": { name: "Galeheart Armor", producesItemKey: "galeheartArmor", ingredients: { "spiritOreFragment": 3, "enchantedStoneDust": 2, "minorQiConductor": 1, "demonCore": 1 }, requiredClass: "artifact_refiner", requiredCultivationLevel: 1, qiCost: 20 },
    "galeheartBandRecipe": { name: "Galeheart Band", producesItemKey: "galeheartBand", ingredients: { "spiritOreFragment": 3, "enchantedStoneDust": 2, "minorQiConductor": 1, "demonCore": 1 }, requiredClass: "artifact_refiner", requiredCultivationLevel: 1, qiCost: 15 },
    "galeheartGreavesRecipe": { name: "Galeheart Greaves", producesItemKey: "galeheartGreaves", ingredients: { "spiritOreFragment": 3, "enchantedStoneDust": 2, "minorQiConductor": 1, "demonCore": 1 }, requiredClass: "artifact_refiner", requiredCultivationLevel: 1, qiCost: 15 },
    "galeheartHelmRecipe": { name: "Galeheart Helm", producesItemKey: "galeheartHelm", ingredients: { "spiritOreFragment": 3, "enchantedStoneDust": 2, "minorQiConductor": 1, "demonCore": 1 }, requiredClass: "artifact_refiner", requiredCultivationLevel: 1, qiCost: 15 },
    "stonewallHammerRecipe": { name: "Stonewall Hammer", producesItemKey: "stonewallHammer", ingredients: { "spiritOreFragment": 3, "enchantedStoneDust": 2, "minorQiConductor": 1, "demonCore": 1 }, requiredClass: "artifact_refiner", requiredCultivationLevel: 1, qiCost: 20 },
    "stonewallPlateRecipe": { name: "Stonewall Plate", producesItemKey: "stonewallPlate", ingredients: { "spiritOreFragment": 5, "enchantedStoneDust": 2, "minorQiConductor": 1, "demonCore": 1 }, requiredClass: "artifact_refiner", requiredCultivationLevel: 1, qiCost: 25 },
    "stonewallBandRecipe": { name: "Stonewall Band", producesItemKey: "stonewallBand", ingredients: { "spiritOreFragment": 3, "enchantedStoneDust": 2, "minorQiConductor": 1, "demonCore": 1 }, requiredClass: "artifact_refiner", requiredCultivationLevel: 1, qiCost: 15 },
    "stonewallSabatonsRecipe": { name: "Stonewall Sabatons", producesItemKey: "stonewallSabatons", ingredients: { "spiritOreFragment": 3, "enchantedStoneDust": 2, "minorQiConductor": 1, "demonCore": 1 }, requiredClass: "artifact_refiner", requiredCultivationLevel: 1, qiCost: 15 },
    "stonewallHelmRecipe": { name: "Stonewall Helm", producesItemKey: "stonewallHelm", ingredients: { "spiritOreFragment": 3, "enchantedStoneDust": 2, "minorQiConductor": 1, "demonCore": 1 }, requiredClass: "artifact_refiner", requiredCultivationLevel: 1, qiCost: 15 },
    "echoflowStaffRecipe": { name: "Echoflow Staff", producesItemKey: "echoflowStaff", ingredients: { "spiritOreFragment": 2, "enchantedStoneDust": 2, "minorQiConductor": 1, "demonCore": 1 }, requiredClass: "artifact_refiner", requiredCultivationLevel: 1, qiCost: 20 },
    "echoflowRobeRecipe": { name: "Echoflow Robe", producesItemKey: "echoflowRobe", ingredients: { "spiritOreFragment": 3, "enchantedStoneDust": 1, "minorQiConductor": 1, "demonCore": 1 }, requiredClass: "artifact_refiner", requiredCultivationLevel: 1, qiCost: 20 },
    "echoflowBandRecipe": { name: "Echoflow Band", producesItemKey: "echoflowBand", ingredients: { "spiritOreFragment": 2, "minorQiConductor": 1, "demonCore": 1 }, requiredClass: "artifact_refiner", requiredCultivationLevel: 1, qiCost: 15 },
    "echoflowShoesRecipe": { name: "Echoflow Shoes", producesItemKey: "echoflowShoes", ingredients: { "spiritOreFragment": 2, "enchantedStoneDust": 1, "demonCore": 1 }, requiredClass: "artifact_refiner", requiredCultivationLevel: 1, qiCost: 15 },
    "echoflowHoodRecipe": { name: "Echoflow Hood", producesItemKey: "echoflowHood", ingredients: { "spiritOreFragment": 2, "enchantedStoneDust": 1, "demonCore": 1 }, requiredClass: "artifact_refiner", requiredCultivationLevel: 1, qiCost: 15 }
};

const DEFAULT_SECT_RANKS = [
    { name: "Founder", permissions: ["all"], minContribution: 0, isDefaultNewMember: false, isFounder: true },
    { name: "Elder", permissions: [ "invite_member", "kick_member_lower_rank", "promote_member_lower_rank", "demote_member_lower_rank", "manage_treasury", "set_motto", "edit_description", "accept_new_member", "start_sect_event", "buy_from_sect_shop", "donate_to_treasury" ], minContribution: 10000, isDefaultNewMember: false },
    { name: "Core Disciple", permissions: [ "access_sect_storage_read", "access_sect_buffs", "buy_from_sect_shop", "donate_to_treasury" ], minContribution: 5000, isDefaultNewMember: false },
    { name: "Inner Disciple", permissions: ["buy_from_sect_shop", "donate_to_treasury"], minContribution: 1000, isDefaultNewMember: true },
    { name: "Outer Disciple", permissions: ["donate_to_treasury"], minContribution: 100, isDefaultNewMember: false }
];

const pillCsvData = `Elixir Name,Ingredients,Use
Basic Qi Recovery Pill,Jadeleaf Grass + Crimson Spirit Berry,Restores a small amount of Qi for Qi Refining cultivators.
Vitality Rejuvenation Pill,Moondew Flower + Earthroot Ginseng,Heals minor injuries and restores stamina quickly.
Mind-Calming Elixir,Soothing Rain Petal + Whispering Leaf,Clears mental fatigue and stabilizes Qi flow.
Advanced Spirit Pill,Sky Lotus Bud + Spiritglow Mushroom,Restores large amounts of Qi and spiritual health for Core cultivators.
Nascent Soul Vital Pill,Cloudmoss Vine + Radiant Sunfruit,High-grade healing and Qi replenishment for Nascent Soul stage cultivators.
Foundation Establishment Pill,Breakthrough Vine + Soothing Rain Petal,Assists Qi Refining cultivators in establishing a stable foundation.
Golden Core Nine Revolutions Pill,Dragonbone Fern + Spiritglow Mushroom + Earthroot Ginseng,Supports the formation of a perfect golden core with enhanced spiritual potential.
Nascent Soul Unification Pill,Phoenixblood Herb + Ascension Orchid,Facilitates smooth transition from Core Formation to Nascent Soul realm.
Soul Formation Heaven Pill,Heavenpierce Root + Lunar Bloom,Required to survive the soul tribulation and form the divine soul.
Transcendence Void Elixir,Voidberry Thorn + ImmortalDustleaf,Enables Soul Formation experts to ascend to the Transcendent realm.
Starforge Strength Pill,Starforge Petal + Stoneheart Root,Permanently increases physical strength and endurance.
Spirit-Eye Elixir,Spirit-Eye Flower + Heartblossom Bud,"Improves spiritual perception, range of sight, and soul awareness."
Agility Surge Pill,Silverstorm Leaf + GoldenDantian Fruit,Boosts movement speed and cultivator evasion skills.
Flame Infusion Pill,Blackflame Ginseng + Frostmarrow Moss,Enhances fire affinity and provides resistance to ice and soul damage.
Balance Harmonization Pill,Harmonizing Bellvine + Eye of the Ancients,Balances chaotic elemental Qi and enhances technique comprehension.`;

const PILL_RECIPES = {};

function loadPillDataFromCSVString(csvData) {
    if (!csvData) return;
    const lines = csvData.trim().split('\n');
    if (lines.length < 2) return; // Need header + at least one data line
    
    // const headers = lines[0].split(','); // Headers not strictly used in this parsing logic

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const elixirName = values[0];
        const ingredientsStr = values[1];
        const useDescription = values[2];

        const recipeKey = toCamelCase(elixirName);
        const pillItemKey = recipeKey + "Item"; // e.g. basicQiRecoveryPillItem
        const recipeItemKey = recipeKey + "Recipe"; // e.g. basicQiRecoveryPillRecipe

        const ingredients = {};
        ingredientsStr.split(' + ').forEach(ingFull => {
            const ingName = ingFull.trim();
            const ingKey = toCamelCase(ingName);
            // Ensure ingredient exists in ITEM_DATA or add a placeholder
            if (!ITEM_DATA[ingKey]) {
                console.warn(`Server: Unknown ingredient '${ingName}' (key: '${ingKey}') for pill '${elixirName}'. Adding placeholder.`);
                ITEM_DATA[ingKey] = { name: ingName, description: `Herb for alchemy: ${ingName}. (Placeholder)`, type: "material", tier: 1, gameAsset: ingKey + '.png' };
            }
            ingredients[ingKey] = (ingredients[ingKey] || 0) + 1;
        });

        let qiCost = 5 + Object.keys(ingredients).length * 3 + (elixirName.length / 2);
        let requiredLevel = 1;

        if (elixirName === "Foundation Establishment Pill") requiredLevel = 9;
        else if (elixirName === "Golden Core Nine Revolutions Pill") requiredLevel = 18;
        else if (elixirName === "Nascent Soul Unification Pill") requiredLevel = 27;
        else if (elixirName === "Soul Formation Heaven Pill") requiredLevel = 36;
        else if (elixirName === "Transcendence Void Elixir") requiredLevel = 45;
        else if (elixirName.includes("Advanced") || elixirName.includes("Core")) requiredLevel = 19;
        else if (elixirName.includes("Nascent Soul")) requiredLevel = 28;
        else if (useDescription.toLowerCase().includes("core cultivators")) requiredLevel = 19;
        else if (useDescription.toLowerCase().includes("nascent soul")) requiredLevel = 28;
        
        PILL_RECIPES[recipeKey] = {
            name: elixirName,
            recipeKey: recipeKey,
            ingredients: ingredients,
            producesItemKey: pillItemKey,
            productName: elixirName,
            useDescription: useDescription,
            qiCost: Math.floor(qiCost),
            requiredCultivationLevel: requiredLevel,
            isBasic: elixirName === "Basic Qi Recovery Pill"
        };

        // Add the pill itself to ITEM_DATA if not already defined
        if (!ITEM_DATA[pillItemKey]) {
            let isBreakthroughPill = (
                elixirName === "Foundation Establishment Pill" ||
                elixirName === "Golden Core Nine Revolutions Pill" ||
                elixirName === "Nascent Soul Unification Pill" ||
                elixirName === "Soul Formation Heaven Pill" ||
                elixirName === "Transcendence Void Elixir"
            );
            let isPermanentStatPill = (
                elixirName === "Starforge Strength Pill" ||
                elixirName === "Agility Surge Pill"
            );

            ITEM_DATA[pillItemKey] = {
                name: elixirName,
                description: useDescription,
                type: "consumable",
                gameAsset: pillItemKey + '.png', // Assuming asset naming convention
                // Server-side effects would be different, e.g., returning changes to player data
                // For now, just defining the item. Actual effect logic will be handled by server endpoints.
                effectDetails: { // Store details for server-side processing
                    type: elixirName, // Can be more specific, e.g., "heal", "qi_restore", "breakthrough"
                    isBreakthroughPill,
                    isPermanentStatPill
                },
                usableInCombat: !(isBreakthroughPill || isPermanentStatPill)
            };
        }

        // Add the recipe item to ITEM_DATA if not basic and not already defined
        if (elixirName !== "Basic Qi Recovery Pill" && !ITEM_DATA[recipeItemKey]) {
            ITEM_DATA[recipeItemKey] = {
                name: `Recipe: ${elixirName}`,
                description: `Teaches the method to concoct ${elixirName}. Ingredients: ${ingredientsStr.replace(/\s\+\s/g, ', ')}.`,
                type: "recipe",
                gameAsset: 'recipe.png', // Generic recipe icon
                learnsRecipeKey: recipeKey
                // Server-side effect of learning a recipe would update player's knownRecipes array.
            };
        }
    }
}

// Initialize PILL_RECIPES and augment ITEM_DATA by parsing pillCsvData
loadPillDataFromCSVString(pillCsvData);


module.exports = {
    ITEM_DATA,
    MONSTER_DATA,
    EXPLORATION_AREAS,
    CULTIVATOR_CLASSES,
    CLASS_STAT_GROWTH,
    ARTIFACT_RECIPES,
    DEFAULT_SECT_RANKS,
    PILL_RECIPES,
    // toCamelCase // Not needed to be exported if only used internally
};
