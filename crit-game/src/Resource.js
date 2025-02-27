class Resources {
    constructor() {
        this.toLoad = {
            hero: '../public/Archer/Idle_2.png',
            heroAttack: '../public/Archer/Shot_2.png',
            arrow: '../public/Archer/Arrow.png',
            background: "../public/Bright/Battleground3.png",
            enemy: "../public/Swordsman/Idle.png",
            enemyHurt: "../public/Swordsman/Hurt.png",
        }
    
        this.images = {}

        Object.keys(this.toLoad).forEach((key) => {
            const img = new Image();
            img.src = this.toLoad[key];
            this.images[key] = {
                image: img,
                loaded: false
        };
        img.onload = () => {
            this.images[key].loaded = true;
        }
        })
    }
}

export const resources = new Resources();