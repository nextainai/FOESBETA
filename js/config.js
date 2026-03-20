export const CONFIG = {
    sensitivity: 0.002,
    playerSpeed: 14,
    jumpForce: 18,
    gravity: 35,
    botCount: 5,
    botSpawnDistance: 30,
    botDamage: { easy: 6, medium: 8, hard: 10 },
    botFireRate: { easy: 1800, medium: 1200, hard: 800 },
    botAccuracy: { easy: 0.2, medium: 0.4, hard: 0.6 },
    botReactionDelay: { easy: 2000, medium: 1200, hard: 600 },
    colors: {
        enemy: 0xff4655,
        wall: 0x1f2731,
        floor: 0x1a1a2e,
        sky: 0x05050c
    }
};

export const WEAPONS = {
    pistol: { name: 'Ghost', damage: 30, fireRate: 0.15, magSize: 12, reloadTime: 1500, auto: false, recoil: 0.025 },
    rifle: { name: 'Vandal', damage: 40, fireRate: 0.08, magSize: 25, reloadTime: 2500, auto: true, recoil: 0.035 },
    sniper: { name: 'Operator', damage: 150, fireRate: 1.2, magSize: 5, reloadTime: 3500, auto: false, recoil: 0.12 }
};

export const BOT_NAMES = [
    "ShadowX", "NoobMaster", "DarkSniper", "RazeMain", "JettDiff",
    "SageBot", "ClickHead", "AimGod", "PhoenixX", "ViperMain"
];

export const CHARACTERS = {
    balanced: { speed: 14, health: 100, name: 'Balanced' },
    speed: { speed: 18, health: 80, name: 'Speedster' },
    tank: { speed: 10, health: 150, name: 'Tank' }
};
