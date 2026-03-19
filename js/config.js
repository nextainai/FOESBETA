export const CONFIG = {
    sensitivity: 0.002,
    playerSpeed: 10,
    jumpForce: 15,
    gravity: 30,
    botCount: 6,
    colors: {
        enemy: 0xff4655,
        wall: 0x1f2731,
        floor: 0x111111,
        highlight: 0x00ffcc
    }
};

export const WEAPONS = {
    pistol: { name: 'Ghost', damage: 25, fireRate: 0.2, magSize: 12, reloadTime: 1000, auto: false },
    rifle: { name: 'Vandal', damage: 35, fireRate: 0.1, magSize: 25, reloadTime: 2000, auto: true },
    sniper: { name: 'Operator', damage: 100, fireRate: 1.5, magSize: 5, reloadTime: 3000, auto: false }
};

export const BOT_NAMES = ["ShadowX", "NoobMaster", "DarkSniper", "RazeMain", "JettDiff", "SageBot", "ClickHead", "AimGod"];