export const CONFIG = {
    sensitivity: 0.002,
    playerSpeed: 14,
    jumpForce: 18,
    gravity: 35,
    botCount: 5,
    botSpawnDistance: 25,
    botDamage: { easy: 5, medium: 8, hard: 12 },
    botFireRate: { easy: 1500, medium: 1000, hard: 700 },
    botAccuracy: { easy: 0.3, medium: 0.5, hard: 0.7 },
    botReactionDelay: { easy: 1500, medium: 1000, hard: 500 },
    colors: {
        enemy: 0xff4655,
        wall: 0x1f2731,
        floor: 0x2a2a3a,
        highlight: 0x00ffcc,
        sky: 0x0a0a15
    }
};

export const WEAPONS = {
    pistol: { name: 'Ghost', damage: 30, fireRate: 0.15, magSize: 12, reloadTime: 1500, auto: false, recoil: 0.03 },
    rifle: { name: 'Vandal', damage: 40, fireRate: 0.08, magSize: 25, reloadTime: 2500, auto: true, recoil: 0.04 },
    sniper: { name: 'Operator', damage: 150, fireRate: 1.2, magSize: 5, reloadTime: 3500, auto: false, recoil: 0.15 }
};

export const BOT_NAMES = [
    "ShadowX", "NoobMaster", "DarkSniper", "RazeMain", "JettDiff", 
    "SageBot", "ClickHead", "AimGod", "PhoenixX", "ViperMain",
    "SovaKing", "BrimstoneX", "OmenMain", "ReynaOTP", "KilljoyX"
];

export const CHARACTERS = {
    balanced: { speed: 14, health: 100, name: 'Balanced' },
    speed: { speed: 18, health: 80, name: 'Speedster' },
    tank: { speed: 10, health: 150, name: 'Tank' }
};
