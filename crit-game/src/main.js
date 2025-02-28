import { resources } from "./Resource.js";
import { Sprite } from "./Sprite.js";
import { Vector2 } from "./Vector2.js";

const settingsButton = document.getElementById("settingsButton");
const controlsPanel = document.getElementById("controls");

settingsButton.addEventListener("click", () => {
  if (controlsPanel.style.display === "none" || controlsPanel.style.display === "") {
    controlsPanel.style.display = "block";
  } else {
    controlsPanel.style.display = "none";
  }
});

// prd logic
const playerData = {
  damage: 50,
  critMultiplier: 2,
  critStack: 0, 
};

let totalAttacks = 0;
let totalCrits = 0;
let lastAttackWasCrit = false;
let baseCritChance = 0.00;

function getCritChancePRD(baseCrit, critStack) {
  if (baseCrit === 0) return 0;

  let stackFactor = 0.001 * (Math.log1p(critStack) / Math.log(1.3));
  return 1 - Math.pow(1 - baseCrit, 1 + stackFactor);
}


function handleGameAttack() {
  totalAttacks++;

  const adjustedCritChance = getCritChancePRD(baseCritChance, playerData.critStack);
  const isCrit = Math.random() < adjustedCritChance;

  if (isCrit) {
    totalCrits++;
    playerData.critStack = 0;
    lastAttackWasCrit = true; 
    console.log(`Attack #${totalAttacks} → CRIT (stack reset).`);
  } else {
    playerData.critStack++;
    lastAttackWasCrit = false;
    console.log(`Attack #${totalAttacks} → Normal (stack=${playerData.critStack}).`);
  }
}


function runTest() {
  const input = document.getElementById("attackCountInput");
  const attacksToSimulate = parseInt(input.value, 10);

  if (isNaN(attacksToSimulate) || attacksToSimulate <= 0) {
    console.warn("Please enter a positive integer for the number of test attacks.");
    return;
  }


  resetStats(false);


  for (let i = 0; i < attacksToSimulate; i++) {
    totalAttacks++;
    const adjustedCritChance = getCritChancePRD(baseCritChance, playerData.critStack);
    const isCrit = Math.random() < adjustedCritChance;

    if (isCrit) {
      totalCrits++;
      playerData.critStack = 0;
    } else {
      playerData.critStack++;
    }
  }

  const modal = document.getElementById("resultsModal");
  const modalResults = document.getElementById("modalResults");


  const actualCritRate = (totalCrits / totalAttacks) * 100;
  console.log("===== Test Results =====");
  console.log(`Base Crit Chance: ${(baseCritChance * 100).toFixed(1)}%`);
  console.log(`Total Attacks: ${totalAttacks}`);
  console.log(`Total Crits: ${totalCrits}`);
  console.log(`Actual Crit Rate: ${actualCritRate.toFixed(2)}%`);
  console.log(`Final critStack: ${playerData.critStack}`);
  console.log("========================");

 const resultText =  `===== Test Results =====
Base Crit Chance: ${(baseCritChance * 100).toFixed(1)}%
Total Attacks: ${totalAttacks}
Total Crits: ${totalCrits}
Actual Crit Rate: ${actualCritRate.toFixed(2)}%
Final critStack: ${playerData.critStack}
========================`;
modalResults.textContent = resultText;


modal.style.display = "block";
}

const modal = document.getElementById("resultsModal");
const closeModalBtn = document.getElementById("closeModalBtn");


closeModalBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});



function resetStats(logIt = true) {
  totalAttacks = 0;
  totalCrits = 0;
  playerData.critStack = 0;
  if (logIt) {
    console.log("Stats reset: totalAttacks=0, totalCrits=0, critStack=0");
  }
}


// game/ canvas logic
const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");

const heroIdle = new Sprite({
  resource: resources.images.hero,
  frameSize: new Vector2(128, 128),
  hFrames: 4,
  vFrames: 1,
  frame: 0,
  scale: 0.8,
});

const heroAttack = new Sprite({
  resource: resources.images.heroAttack,
  frameSize: new Vector2(128, 128),
  hFrames: 13,
  vFrames: 1,
  frame: 0,
  scale: 0.8,
});

const heroPos = new Vector2(16, 34);


const enemyIdle = new Sprite({
  resource: resources.images.enemy,
  frameSize: new Vector2(128, 128),
  hFrames: 8,
  vFrames: 1,
  frame: 0,
  scale: 0.8,
  flipX: true,
  hitbox: { x: 100, y: 40, width: 128, height: 128 },
});

const enemyHurt = new Sprite({
  resource: resources.images.enemyHurt,
  frameSize: new Vector2(128, 128),
  hFrames: 3,
  vFrames: 1,
  frame: 0,
  scale: 0.8,
  flipX: true,
  hitbox: { x: 0, y: 0, width: 128, height: 128 },
});

const enemyPos = new Vector2(210, 18);


const arrow = new Sprite({
  resource: resources.images.arrow,
  frameSize: new Vector2(64, 64),
  hFrames: 1,
  vFrames: 1,
  frame: 0,
  scale: 0.5,
  hitbox: { x: 0, y: 0, width: 64, height: 64 },
});


let arrowPos = new Vector2(-100, -100);
const ARROW_SPEED = 45;
let arrowVisible = false;


let isAttacking = false;
let isEnemyHurt = false;


let heroIdleFrame = 0;
const totalHeroIdleFrames = heroIdle.hFrames * heroIdle.vFrames;

let heroAttackFrame = 0;
const totalHeroAttackFrames = heroAttack.hFrames * heroAttack.vFrames;

let enemyIdleFrame = 0;
const totalEnemyIdleFrames = enemyIdle.hFrames * enemyIdle.vFrames;

let enemyHurtFrame = 0;
const totalEnemyHurtFrames = enemyHurt.hFrames * enemyHurt.vFrames;


document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && !isAttacking) {

    isAttacking = true;
    heroAttackFrame = 0;

    handleGameAttack();

    setTimeout(() => {
      arrowPos = new Vector2(heroPos.x + 30, heroPos.y + 60);
      arrowVisible = true;
    }, 250);
  }
});

function checkCollision(ax, ay, aw, ah, bx, by, bw, bh) {
  return (
    ax < bx + bw &&
    ax + aw > bx &&
    ay < by + bh &&
    ay + ah > by
  );
}


function update() {

  if (isAttacking) {
    heroAttackFrame++;
    if (heroAttackFrame >= totalHeroAttackFrames) {
      heroAttackFrame = 0;
      isAttacking = false;
    }
  } else {
    heroIdleFrame++;
    if (heroIdleFrame >= totalHeroIdleFrames) {
      heroIdleFrame = 0;
    }
  }

  if (isEnemyHurt) {
    enemyHurtFrame++;
    if (enemyHurtFrame >= totalEnemyHurtFrames) {
      enemyHurtFrame = 0;
      isEnemyHurt = false;
    }
  } else {
    enemyIdleFrame++;
    if (enemyIdleFrame >= totalEnemyIdleFrames) {
      enemyIdleFrame = 0;
    }
  }


  if (arrowVisible) {
    arrowPos.x += ARROW_SPEED;

    const arrowHitboxX = arrowPos.x + arrow.hitbox.x * arrow.scale;
    const arrowHitboxY = arrowPos.y + arrow.hitbox.y * arrow.scale;
    const arrowHitboxW = arrow.hitbox.width * arrow.scale;
    const arrowHitboxH = arrow.hitbox.height * arrow.scale;


    const enemySprite = isEnemyHurt ? enemyHurt : enemyIdle;
    const enemyHitboxX = enemyPos.x + enemySprite.hitbox.x * enemySprite.scale;
    const enemyHitboxY = enemyPos.y + enemySprite.hitbox.y * enemySprite.scale;
    const enemyHitboxW = enemySprite.hitbox.width * enemySprite.scale;
    const enemyHitboxH = enemySprite.hitbox.height * enemySprite.scale;

  
    if (
      checkCollision(
        arrowHitboxX, arrowHitboxY, arrowHitboxW, arrowHitboxH,
        enemyHitboxX, enemyHitboxY, enemyHitboxW, enemyHitboxH
      )
    ) {
      arrowVisible = false;
      console.log("COLLISION DETECTED");
    
      isEnemyHurt = true;
      enemyHurtFrame = 0;
    }

  
    if (arrowPos.x > canvas.width) {
      arrowVisible = false;
    }
  }

  draw();
}


function draw() {
  
  const background = resources.images.background;
  if (background.loaded) {
    ctx.drawImage(background.image, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

 
  const press = resources.images.pressSpace;
  const gui = resources.images.gui;
  
  if (press.loaded) ctx.drawImage(press.image, 133, 28, 60, 60);
  if (gui.loaded)   ctx.drawImage(gui.image, 0, 0, 70, 60);
  // if(gui2.loaded) ctx.drawImage(gui2.image, 240, 0, 70, 60);

 
  if (isAttacking) {
    heroAttack.frame = heroAttackFrame;
    heroAttack.drawImage(ctx, heroPos.x, heroPos.y);
  } else {
    heroIdle.frame = heroIdleFrame;
    heroIdle.drawImage(ctx, heroPos.x, heroPos.y);
  }

  
  if (isEnemyHurt) {
    enemyHurt.frame = enemyHurtFrame;
    enemyHurt.drawImage(ctx, enemyPos.x, enemyPos.y);
    if (lastAttackWasCrit) {
      const critImg = resources.images.critImg;
      if (critImg.loaded) {
        ctx.drawImage(critImg.image, 190, 80, 50, 50);
      }
    } else {
      const att50 = resources.images.att50;
      if (att50.loaded) {
        ctx.drawImage(att50.image, 200, 80, 40, 40);
      }
    }
  } else {
    enemyIdle.frame = enemyIdleFrame;
    enemyIdle.drawImage(ctx, enemyPos.x, enemyPos.y);
  }

  
  if (arrowVisible) {
    arrow.drawImage(ctx, arrowPos.x, arrowPos.y);
  }
}


setInterval(update, 100);


const baseCritChanceSelect = document.getElementById("baseCritChanceSelect");
baseCritChanceSelect.addEventListener("change", (e) => {
  baseCritChance = parseFloat(e.target.value);
  console.log(`Base Crit Chance set to ${(baseCritChance * 100).toFixed(1)}%`);
});

document.getElementById("testButton").addEventListener("click", runTest);
document.getElementById("resetButton").addEventListener("click", () => resetStats());

