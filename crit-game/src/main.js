import { resources } from "./Resource";
import { Sprite } from "./Sprite";
import { Vector2 } from "./Vector2";

const canvas = document.querySelector('#gameCanvas');
const ctx = canvas.getContext('2d');



const hero = new Sprite({
  resource: resources.images.hero,
  frameSize: new Vector2(128, 128),
  hFrames: 4,
  vFrames: 1,
  frame: 0,
  scale: 0.8,
})

const enemy = new Sprite({
  resource: resources.images.enemy, 
  frameSize: new Vector2(128, 128),
  hFrames: 8,
  vFrames: 1,
  frame: 0,
  scale: 0.8,
  flipX: true, 
});

const heroPos = new Vector2(16, 34);
const enemyPos = new Vector2(210, 18);

let heroFrame = 0;
const totalHeroFrames = hero.hFrames * hero.vFrames;
const animateHero = () => {
  heroFrame++;
  if (heroFrame >= totalHeroFrames) {
    heroFrame = 0; 
  }
  hero.frame = heroFrame;
};


let enemyFrame = 0;
const totalEnemyFrames = enemy.hFrames * enemy.vFrames;
const animateEnemy = () => {
  enemyFrame++;
  if (enemyFrame >= totalEnemyFrames) {
    enemyFrame = 0;
  }
  enemy.frame = enemyFrame; 
};

const animate = () => {
  animateHero();
  requestAnimationFrame(animate); 
};

requestAnimationFrame(animate);

const draw = () => {
  const background = resources.images.background;
  if (background.loaded) {
    ctx.drawImage(background.image, 0, 0, canvas.width, canvas.height); 
  }
  hero.drawImage(ctx, heroPos.x, heroPos.y);
  enemy.drawImage(ctx, enemyPos.x, enemyPos.y);
}

setInterval(() => {
  animateHero();  
  animateEnemy(); 
  draw();         
}, 200);


  // const background = resources.images.background;
  // if (background.loaded) {
  //   ctx.drawImage(background.image, 0, 0, canvas.width, canvas.height);
  // }