var c=document.createElement('canvas');
var ctx=c.getContext('2d');
c.id='game'
document.body.appendChild(c);
c.height=500;
c.width=500;
var debug=document.createElement('div')
document.body.appendChild(debug);

var stats={
    deaths:0,
    kills:0,
    isPaused:false
}

function debugInfo(str){
    debug.innerHTML=str;
}
/**@enum {number} */
const dir={up:90,down:270,left:180,right:0}

/**@description short for weapon types */
const wTypes={sword:'sword',spear:'spear'}

var map=[];

var curWave=1;

/**@description This is a getter and setter for tiles on the map */
function m(x,y,type){
    if(type)
        return(map[x][y]=type)
    return map[x][y];
}

/**@returns the tile coord of the point */
function roundPoint(x,y){return[Math.floor(x/Tile.size),Math.floor(y/Tile.size)];}

function resetCanvasSize(){
    c.width=map.length*Tile.size
    c.height=map[0].length*Tile.size
}

function mapBase(type,width,height){
    for(let i=0;i<width;i++){
        map[i]=[]
        for(let j=0;j<height;j++)
            map[i][j]=type;
    }
}

var entities=[];

class Entity{
    /**
     * @param {string} name The name of the entity. Has no effect yet
     * @param {number} width The width of the entity
     * @param {number} height The height of the entity
     * @param {string} color The color to draw the entity
     * @param {number} speed The farthest the entity can move in one step
     * @param {number} hp The maximum health of the entity
     * @param {number} x No nessecary
     * @param {number} y 
     * @param {string} img The name of the image for the entity
     */
    constructor(name,width,height,color,speed,hp,x=0,y=0,img){
        this.name=name;
        this.width=width;
        this.height=height;
        this.color=color;
        this.dir=dir.up;
        this.speed=speed;
        this.hpMax=hp;
        this.hp=hp;
        this.x=x
        this.y=y
        this.setPosition(this.x,this.y)
        this.active=true;
        this.img=(img)?"img/"+img:img
        this.canMove=true;
        this.toRemove=false
    }
    draw(){
        if(this.active){
            ctx.fillStyle=this.color;
            ctx.fillRect(this.x,this.y,this.width,this.height);
            ctx.strokeStyle='black'
            ctx.strokeRect(this.x,this.y,this.width,this.height);
            if(this.weapon){
                this.weapon.draw()
            }
        }

        if(this.hp<this.hpMax){
            var offset=10,offsetHeight=5;
            var hpRatio=(this.hp/this.hpMax);
            ctx.fillStyle='red'
            ctx.fillRect(this.x,this.y-offset-offsetHeight,this.width*hpRatio,offsetHeight)
            ctx.strokeRect(this.x,this.y-offset-offsetHeight,this.width,offsetHeight)
        }
    }
    /**
     * @returns true is this entity is colliding with other entity
     * @param {Entity} other The other entity to check if collides with
     */
    collidesWith(other){
        //Only if both are active
        if(this.active&&other.active)
            return !(((this.y+this.height)<(other.y))||(this.y>(other.y+other.height))||
                ((this.x+this.width)<other.x)||(this.x>(other.x+other.width)));
        return false;
    }
    /**@final */
    setPosition(x,y){
        this.x=x-this.width/2
        this.y=y-this.height/2
    }
    /**@final */
    mapPosition(x,y){
        this.x=Math.floor(Tile.size*x-this.width/2+Tile.size/2);
        this.y=Math.floor(Tile.size*y-this.height/2+Tile.size/2);
    }
    /**@param {number} theta The direction to move in*/
    moveIn(theta){
        if(this.canMove){
            var xCom=this.speed*Math.cos(toRad(theta)),yCom=this.speed*Math.sin(toRad(theta))
            this.x+=xCom
            if(this.x<0||this.x+this.width>c.width||this.checkCollide())
                this.x-=xCom

            this.y-=yCom
            if(this.y<0||this.y+this.height>c.height||this.checkCollide())
                this.y+=yCom
        }
    }
    /**@interface */
    move(){}
    /**@description This is so you don't have to keep doing ent.weapon.swing() */
    swing(){
        if(this.weapon)
            this.weapon.swing()
    }

    getAngleBetween(other){
        var tx=this.x+this.width/2,ty=this.y+this.height/2
        var ox=other.x+other.width/2,oy=other.y+other.height/2
        //This is the enemy relative to the player
        var dx=tx-ox,dy=oy-ty

        //This makes theta 0-359 starting from the right going counterclockwise
        var theta=180+toDeg(Math.atan2(dy,dx))
        return (theta===360)? 0:theta
    }
    /**@returns true if this collides with any of the entities in the array*/
    checkCollide(){
        for(let i=0;i<entities.length;i++)
            if(this!==entities[i]&&this.collidesWith(entities[i]))
                return true;
        return false
    }
    getRoundedPoints(){
        var x=this.x,y=this.y,h=this.height,w=this.width
        function rp(x,y){return roundPoint(x,y)}
        return[rp(x,y),rp(x,y+h),rp(x+w,y),rp(x+w,y+h)];
    }

    /**@returns true if the entity is out of bounds */
    checkBounds(){return(this.x<0||this.x+this.width>c.width||this.y<0||this.y+this.height>c.height)}
    get centerX(){return this.x+this.width/2}
    get centerY(){return this.y+this.height/2}
}



class Tile{
    constructor(color,canMoveOn=true){
        this.color=color;
        this.canMoveOn=canMoveOn
    }
    static get size(){return 35;}
    draw(x,y){
        ctx.fillStyle=this.color;
        ctx.strokeStyle='black'
        ctx.fillRect(x*Tile.size,y*Tile.size,Tile.size,Tile.size);
        ctx.strokeRect(x*Tile.size,y*Tile.size,Tile.size,Tile.size)
        //line(x*Tile.size,y*Tile.size,x*Tile.size+Tile.size,y*Tile.size+Tile.size)
        //line(x*Tile.size+Tile.size,y*Tile.size,x*Tile.size,y*Tile.size+Tile.size)
    }
}

function projectile(speed,width,height,color,img){
    return{dir:dir,speed:speed,width:width,height:height,color:color,img:img};
}

class Projectile extends Entity{
    constructor(dir,parent,speed,width,height,color,img){
        if(typeof dir==='object'){
            super('projectile',dir.type,dir.height,dir.width,dir.speed,0,parent.x,parent.y,dir.img)
            
            this.dir=dir.dir
        }else{
            super('projectile',width,height,color,speed,0,parent.x,parent.y,img)
            this.dir=dir
        }
        this.parent=parent
        entities.push(this)
    }
    move(){
        this.moveIn(this.dir)
        this.draw()
    }
    moveIn(theta){
        if(this.canMove){
            var xCom=this.speed*Math.cos(toRad(theta)),yCom=this.speed*Math.sin(toRad(theta))
            this.x+=xCom
            if(this.x<0||this.x+this.width>c.width||this.checkCollide())
                this.x-=xCom
            else this.toRemove=true

            this.y-=yCom
            if(this.y<0||this.y+this.height>c.height||this.checkCollide())
                this.y+=yCom
            else this.toRemove=true
        }
    }
    checkCollide(){
        for(let i=0;i<entities.length;i++)
            if(this!==entities[i]&&entities[i]===this.parent&&this.collidesWith(entities[i]))
                return true;
        return false
    }
}

function colorToRGB(str){
    var ct=document.createElement('canvas').getContext('2d')
    ct.fillStyle=str
    var bi=parseInt(ct.fillStyle.slice(1),16)
    return'rgb('+((bi>>16)&255)+','+((bi>>8)&255)+','+(bi&255)+')'
}

function getImgNoExt(file){return file.split('.').shift()}
function getImgExt(file){return file.split('.').pop()}

var pw={
    start:weapon('sword',10,33,'grey',13,7,1,"sword1.png"),
    master:weapon('sword',12,45,'royalblue',12,7,1.5,'mSword.png'),
    rapier:weapon('sword',8,30,'lightgrey',5,1,1),
    spear:weapon('spear',4,35,'brown',10,8,1)
}

/**This stores what the last weapon the player had was so the player can have it back upon death */
var lastPWeapon=pw.start

class Weapon extends Entity{
    /**
     * @param {"sword"|"spear"|"weapon()"} type The type to make the weapon/The object with all weapon properties
     * @param {Entity} parent 
     * @param {number} width 
     * @param {number} height 
     * @param {string} color 
     * @param {string} img The name of the image
     */
    constructor(type,parent,width,height,color,swingLength,delayLength,damage,img){
        //You can also pass in an object with all of the properties you need
        if(typeof type==='object'){
            super("weapon",type.width,type.height,type.color,0,1,parent.x,parent.y,type.img)
            this.type=type.type
            this.sCountMax=type.sLen
            this.dCountMax=type.dLen
            this.damage=type.damage
            if(parent instanceof Player)
                lastPWeapon=type;
        }else{
            super("weapon",width,height,color,0,1,parent.x,parent.y,img)
            this.type=type;
            this.dCountMax=delayLength;
            this.sCountMax=swingLength;
            this.damage=damage
        }
        parent.weapon=this;
        this.alternateSwing=true;
        this.parent=parent;
        this.rotation=45;
        this.dir=parent.dir
        this.initWidth=this.width;
        this.initHeight=this.height;
        this.swingOffset=0;
        this.sCount=0;
        this.dCount=0;
        this.active=false
        this.canSwing=true;
        //This is how wide apart the weapon is apart if it is a sword
        this.swingDist=10;
        //If it's a spear, it goes a certain extra distance when swinging
        if(this.type==='spear')this.swingDist+=7
        
    }
    /**
     * @description This is what is done pre swing
     */
    swing(){
        if(this.canSwing&&!this.active&&!stats.isPaused){
            this.alternateSwing^=true;
            this.active=true;
            this.parent.canMove=false;
            this.dir=toCardninal(this.parent.dir)
            switch(this.dir){
                case dir.up:case dir.down:
                    this.swingOffset=4*this.parent.height/5
                    this.width=this.initWidth
                    this.height=this.initHeight
                    break;
                case dir.right:case dir.left:
                    this.swingOffset=4*this.parent.width/5
                    this.width=this.initHeight
                    this.height=this.initWidth
                    break;
            }
            this.x=this.parent.x+this.parent.width/2-this.width/2
            this.y=this.parent.y+this.parent.height/2-this.height/2
            //This does the offset for if it's a sword
            if(this.type==='sword'){
                switch(this.dir){
                    case dir.up:
                        this.y-=this.swingOffset
                        if(this.alternateSwing)
                            this.x-=this.swingDist/2
                        else
                            this.x+=this.swingDist/2
                        break;
                    case dir.down:
                        this.y+=this.swingOffset;
                        if(this.alternateSwing)
                            this.x+=this.swingDist/2
                        else
                            this.x-=this.swingDist/2
                        break;
                    case dir.left:
                        this.x-=this.swingOffset;
                        if(this.alternateSwing)
                            this.y+=this.swingDist/2
                        else
                            this.y-=this.swingDist/2
                        break
                    case dir.right:
                        this.x+=this.swingOffset
                        if(this.alternateSwing)
                            this.y-=this.swingDist/2
                        else
                            this.y+=this.swingDist/2
                        break
                }
            }
        }
    }
    /**
     * @description this is what is done post swing
     */
    move(){
        //This counts during the swing
        if(this.active){
            if(this.sCount<this.sCountMax){
                this.sCount++
                //These are the actions done each tick of the weapon being swung
                var ratio=(1/this.sCountMax)*this.swingDist
                if(this.type==='sword'){
                    switch(this.dir){
                        case dir.up:
                            this.x+=(this.alternateSwing)?ratio:-ratio;break;
                        case dir.down:
                            this.x-=(this.alternateSwing)?ratio:-ratio;break;
                        case dir.right:
                            this.y+=(this.alternateSwing)?ratio:-ratio;break;
                        case dir.left:
                            this.y-=(this.alternateSwing)?ratio:-ratio;break;
                    }
                }else if(this.type==='spear'){
                    switch(this.dir){
                        case dir.up:this.y-=ratio;break;
                        case dir.down:this.y+=ratio;break
                        case dir.right:this.x+=ratio;break;
                        case dir.left:this.x-=ratio;break;
                    }
                }
            }else{
                //This is at the end of the swing
                this.sCount=0;
                this.active=false;
                this.parent.canMove=true;
                this.canSwing=false;
            }            
        }
        //This counts up the delay
        if(!this.canSwing&&!this.parent.beingHit){
            if(this.dCount<this.dCountMax)
                this.dCount++
            else{
                this.dCount=0;
                this.canSwing=true;
            }
        }
    }
    draw(){
        if(this.active&&this.img!==undefined){
            var image=new Image(this.initWidth,this.initHeight)
            image.src=getImgNoExt(this.img)+'('+this.dir+').'+getImgExt(this.img)
            ctx.drawImage(image,this.x,this.y,this.width,this.height)            
        }else super.draw()
    }
}

class Player extends Entity{
    constructor(){
        super('player',20,20,'blue',5,100)
        this.mapPosition(Math.floor(map.length/2),Math.floor(map[0].length/2))
        this.buttonDirs={
            up:false,down:false,left:false,right:false
        }
        entities.unshift(this)

        new Weapon(lastPWeapon,this)

        this.beingHit=false
        this.regen=0.05
    }
    move(){
        if(this.canMove){
            if(this.buttonDirs.up){
                this.moveIn(dir.up)
                if(this.checkTile())
                   this.moveIn(dir.down)
            }if(this.buttonDirs.down){
                this.moveIn(dir.down)
                if(this.checkTile())
                    this.moveIn(dir.up)
            }if(this.buttonDirs.left){
                this.moveIn(dir.left)
                if(this.checkTile())
                    this.moveIn(dir.right)
            }if(this.buttonDirs.right){
                this.moveIn(dir.right)
                if(this.checkTile())
                    this.moveIn(dir.left)
            }
        }
        if(this.hp<0)
            this.kill()
        else if(!this.beingHit&&this.hp<this.hpMax)
            this.hp+=this.regen;
            
        
        this.weapon.move()
    }
    checkTile(){
        if(this.checkBounds()||this.checkCollide())
            return true;
    }
    draw(){
        super.draw()
    }
    kill(){
        this.hp=0;
        this.toRemove=true
        player=new Player()
        stats.deaths++
        for(let i=1;i<entities.length;i++)
            if(entities[i] instanceof Enemy)
                entities[i].resetPosition()
        console.log('dead')
    }
}



/**
 * @description This makes preset kits for making weapons
 * @returns A weapon kit
 * @param {"sword"|"spear"} type The type of the weapon. No effect yet
 * @param {number} sLen The time spent with the sword out
 * @param {number} dLen The time between swings
 */
function weapon(type,width,height,color,sLen,dLen,damage,img){
    return{type:type,width:width,height:height,color:color,sLen:sLen,dLen:dLen,damage:damage,img:img}
}

class Enemy extends Entity{
    constructor(t){
        var dest=enemyLocation(t);
        super('enemy',t.width,t.height,t.color,t.speed,t.hp,dest[0],dest[1])

        //This means that every waveIncrement waves, the hp of enemies gets multiplied by curWave/waveIncrement
        var waveIncrement=15
        this.hpMax*=(Math.floor(curWave/waveIncrement))*0.5+1

        this.hp=this.hpMax;
        this.type=t.type
        this.lastLog=0;
        this.moveCount=0
        this.moveCountMax=10;
        this.dir=this.getPlayerDir();
        this.beingHit=false
        this.preset=t;
        entities.push(this)
    }

    static get spawnDist(){return 80;}

    resetPosition(){
        var nl=enemyLocation({type:this.type,width:this.width,height:this.height})
        this.setPosition(nl[0],nl[1])
        if(this.weapon){
            this.weapon.sCount=this.weapon.sCountMax
            this.weapon.dCount=this.weapon.dCountMax
        }
    }

    move(){
        var t=Enemy.types
        switch(this.type){
            case t.basic.type:
                this.ai2(10)
                break;
            case t.small.type:
                this.ai2(17)
                break;
            case t.big.type:
                this.ai1()
                break;
            case t.boss.type:
                this.ai1()
                break;
        }
        if(this.hp<=0)
            this.toRemove=true
        if(this.weapon&&this.weapon.collidesWith(player))
            player.hp-=this.weapon.damage

            this.weapon.move()
    }
    getPlayerDir(){
        return(this.dir=this.getAngleBetween(player))
    }

    getPlayerDist(){
        return Math.hypot(player.centerX-this.centerX,player.centerY-this.centerY)
    }

    closeEnough(){
        if(this.weapon){
            if(this.getPlayerDist()<(this.weapon.initHeight+this.height)){
                return true;
            }
        }
        return false
    }
    /**@description This movement is tracking the player down moving only at it's maximum speed*/
    ai1(){
        this.beingHit=(player.weapon)?this.collidesWith(player.weapon):false
        
        if(!this.beingHit&&!this.collidesWith(player))
            this.moveIn(this.getPlayerDir())
        else if(this.beingHit)
            this.hp-=player.weapon.damage
        if(this.closeEnough()&&!this.beingHit)
            this.swing()
    }
    /**
     * @description This one moves a set number of times towards the player, then resets angle
     * @param {number} max The number of movements until resetting to face the player
     */
    ai2(max){
        this.beingHit=this.collidesWith(player.weapon)
        if(this.moveCountMax!==max)
            this.moveCountMax=max;
        if(this.moveCount<this.moveCountMax)
            this.moveCount++
        else{
            this.moveCount=0
            this.getPlayerDir()
        }
        if(this.closeEnough()&&!this.beingHit)
            this.swing()
        else if(!this.beingHit)
            this.moveIn(this.dir)
        else this.hp-=player.weapon.damage
    }
    static get types(){
        return{
            basic:{width:15,height:15,color:'teal',speed:5,type:'basic',hp:10},
            big:{width:20,height:20,color:'yellow',speed:3,type:'big',hp:25},
            small:{width:10,height:10,color:'lightblue',speed:7,type:'small',hp:5},
            boss:{width:45,height:45,color:'darkgrey',speed:5,type:'boss',hp:100}
        }
    }
    static get weapons(){
        return{
            basic:weapon('sword',5,10,'lightgrey',10,5,0.5,'sword1.png'),
            big:weapon('sword',6,14,'darkgrey',14,8,1),
            small:weapon('sword',4,8,'yellow',9,4,0.25),
            boss:weapon('sword',8,18,'orange',20,15,3),
            bSpear:weapon('spear',4,20,'brown',20,8,1)
        }
    }
    
}

function toCardninal(ang){ang=Math.round(ang/90)*90;return (ang===360)?0:ang;}
function toRad(deg){return Math.PI*deg/180}
function toDeg(rad){return 180*rad/Math.PI}

function line(x1,y1,x2,y2,showLen){
    ctx.beginPath()
    ctx.moveTo(x1,y1)
    ctx.lineTo(x2,y2)
    if(showLen)
        ctx.strokeText(Math.round(Math.hypot((x2-x1),(y2-y1))*100)/100,(x1+x2)/2,(y1+y2)/2)
    ctx.closePath()
    ctx.stroke()
}

function enemyLocation(t){
    var temp = new Entity('tester',t.width,t.height,'rgba(0,0,0,0)',0)
    var dist,p=player
    do{
        temp.x=(Math.random()*c.width+temp.width)
        temp.y=(Math.random()*c.height+temp.height)
        dist=Math.hypot(p.x+p.width-temp.x,p.y+p.height/2-temp.y)
        var isFar=(dist>Enemy.spawnDist),noCollide=(!temp.checkCollide()),inBounds=(!temp.checkBounds())
        var cond=isFar&&noCollide&&inBounds;
    }while(!cond)

    return [temp.x,temp.y];
}

function entityByName(name){
    var e=[]
    for(let i=0;i<entities.length;i++)
        if(entities[i].name===name)
            e.push(entities[i])
    return e
}

document.addEventListener('keydown',(event)=>{
    pMoveHelp(event,true)
    if(event.key===' '){
        player.swing();
    }
})

document.addEventListener('keyup',(event)=>{
    pMoveHelp(event,false)
    if(event.key==='r')
        entities.splice(1)
    if(event.key==='i'){
        new Weapon(pw.master,player)
        console.log('Equiped Sword')
    }if(event.key==='o'){
        new Weapon(pw.spear,player)
        console.log("Equiped Spear")
    }if(event.key==='p'){
        togglePause()
    }
})

function pMoveHelp(event,bool){
    switch(event.key){
        case 'w':case'ArrowUp':
            if(bool)player.dir=dir.up
            player.buttonDirs.up=bool;
            break;
        case 's':case'ArrowDown':
            if(bool)player.dir=dir.down
            player.buttonDirs.down=bool
            break;
        case 'a':case'ArrowLeft':
            if(bool)player.dir=dir.left
            player.buttonDirs.left=bool
            break;
        case 'd':case'ArrowRight':
            if(bool)player.dir=dir.right
            player.buttonDirs.right=bool
            break;
    }
}

function eSwing(){for(let i=1;i<entities.length;i++)entities[i].swing()}

function addEnemy(type,wep,n){
    if(!n)n=1
    for(let i=0;i<n;i++){
        new Enemy(type);
        new Weapon(wep,entities[entities.length-1])
    }
    return entities[entities.length-1]
}

floor()
resetCanvasSize()

function floor(){
    var nFloors=3
    switch(Math.floor(Math.random()*nFloors)){
        case 0:
            mapBase(new Tile('green'),10,10)
            break;
        case 1:
            mapBase(new Tile('rgb(165,165,165)'),9,9)
            break
        case 2:
            mapBase(new Tile('saddlebrown'),11,11)
    }
}

var player=new Player()
//var e = addEnemy(Enemy.types.big,Enemy.weapons.basic)

function moveAll(){
    for(let i=0;i<entities.length;i++){
        entities[i].move()
        if(entities[i].toRemove)
            entities.splice(i--,1)
    }
}
function drawAll(){
    ctx.clearRect(0,0,c.width,c.height)

    //Drawing tiles
    var mi=0,mj=0;
    map.forEach(x=>{
        mj=0;
        x.forEach(tile=>{
            tile.draw(mi,mj);
            mj++;
        })
        mi++;
    })

    entities.forEach(e=>{
        e.draw();
    })
    entities.forEach(e=>{
        if(e.weapon)
            e.weapon.draw()
    })    
    
    ctx.textAlign='start'
    ctx.textBaseline='alphabetic'
    ctx.font='10px sans-serif'
    ctx.strokeStyle='darkblue'
    ctx.strokeText('Wave: '+curWave,6,10)
    debugInfo(waveDelay/1000+' Seconds')

    if(stats.isPaused){
        ctx.font='35px sans-serif'
        ctx.textBaseline='center'
        ctx.textAlign='center'
        ctx.fillStyle='peru'
        ctx.fillText('Paused',c.width/2,c.height/2)
        ctx.strokeText('Paused',c.width/2,c.height/2)
        
    }
}

/**The number of enemies you can have on the map before stopping the waves*/
const maxEnemies=25;

var waveDelayArr=[waveDelay]

/**
 * @description A tester function for trying to find a good rate to do wave delay
 * @param {number} startValue The value to start counting up from
 * @param {number} b The rate to change the value
 * @param {number} n The number of times to repeat the calcuations/The wave to calculate for
 */
function getWaveDelay(n=50,startValue=6,b=0.18){
    //waveDelay=startValue
    //b=waveChangeRate
    //n=the wave
    var arr=[startValue];
    for(let i=1;i<=n;i++){
        var lastVal=arr[i-1]//This is the value before
        var nb=b;
        nb=nb/((Math.floor(lastVal/4.1))+1)//This is the rate change
        
        var toAdd=lastVal*nb//This is the ammount to add
        arr.push(lastVal+toAdd)
        //i=curWave
        if(i%10===0){arr[i]*=2}else if(i%10===1&&i!==1){arr[i]/=2;arr[i]+=toAdd}

        //arr.push((i%10===0)?b*lastVal*2:(i%10===1&&i!==1)?lastVal/2+b:b*lastVal)
        //var newVal=arr[arr.length-1];

        arr[arr.length-1]=Math.round(arr[arr.length-1]*100)/100
    }
    //for(let i=1;i<arr.length;i++)console.log('Wave '+i+': '+arr[i]);
    return (arr[n]*1000)
}

/**@description sets the wave delay up for each wave*/
function setWaveDelay(){
    var toAdd=waveDelay*(waveChangeRate/((Math.floor(waveDelay/4.1))+1))//This is the ammount to add
    waveDelay+=toAdd;
    if(curWave%10===0)
        waveDelay*=2
    else if(curWave%10===1&&curWave!==1)
        waveDelay=waveDelay/2+toAdd
    waveDelay=Math.round(waveDelay*1000)/1000
    return waveDelay;
}


/**@default 6000 //The delay between waves in milliseconds*/
var waveDelay=6000
/**@default 180 //The rate that the delay changes between waves in milliseconds*/
var waveChangeRate=180;

//Allows quick writing of waves
function wave(n,type,wep){return {n:n,type:type,wep:wep}}

//Quick reference
var et=Enemy.types,ew=Enemy.weapons;

//These are the specific waves to spawn in
var waves=[
    wave(1,et.basic,ew.basic),
    wave(2,et.basic,ew.basic),
    wave(3,et.big,ew.basic),
    wave(2,et.big,ew.big),
    wave(5,et.small,ew.small),
    wave(2,et.basic,ew.big),
]
/**Holds the wave spawning mechanics */
var waveSpawn;
/**@description This handles all the spawning in the game for premade waves. Switches to random when out */
function spawnWaves(){
    waveSpawn=new Timer(()=>{
        var w=waves[(curWave++)-1]
        try{
            if(!(entities.length>=maxEnemies)){
                addEnemy(w.type,w.wep,w.n)
                setWaveDelay()
            }else 
                curWave--;
            waveSpawn=new Timer(spawnWaves,waveDelay)//setTimeout(()=>spawnWaves(),waveDelay)
        }catch(e){
            console.log("last wave spawned. Starting random generation")
            randomWaves()
        }
    },waveDelay)
}
/**
 * @returns a random int between start and end inclusive or a random element of an array passed in (start,end]
 * @param {number|any[]} start The start of the random int or the array to return a random element in
 * @param {number} end The end of the random int non-inclusive
 */
function rnd(start,end){
    if(Array.isArray(start))
        return start[Math.floor(Math.random()*start.length)]
    return Math.floor(Math.random()*(end-start))+start
}

//function rndTest(s,e,n){var t=[];for(let i=0;i<e-s;i++)t[i]=0;for(let i=0;i<n;i++)t[rnd(s,e)-s]++;return t;}
/**@description Spawns random waves infinitely */
function randomWaves(){
    var en=[et.big,et.basic,et.small],wp=[ew.big,ew.basic,ew.small,ew.bSpear]
    if(entities.length>=maxEnemies){}//This catches if there is too many enemies before the wave increments
    else if((++curWave)%10!==0){
        addEnemy(rnd(en),rnd(wp),rnd(2,4));
    }else
        addEnemy(et.boss,ew.boss,rnd(1,2))
    setWaveDelay()
    waveSpawn=new Timer(randomWaves,waveDelay)//setTimeout(()=>randomWaves(),waveDelay);
}

/**
 * @param {function} func The function to repeat
 * @param {number} reps The number of times to repeat the function
 * @param {number} delay Time in seconds
 */
function repeat(func,reps,delay){
    var t=setInterval(()=>{
        func();
        if(--reps<=0)
            clearInterval(t)
    },delay*1000)
}


var draw=setInterval(drawAll,60)

var move;

resumeMove()

function pauseMove(){
    clearInterval(move)
}
function resumeMove(){
    move=setInterval(moveAll,60)
}

function pauseWaves(){
    waveSpawn.pause();
}
function resumeWaves(){
    waveSpawn.resume()
}

function togglePause(){
    if(stats.isPaused){
        //Unpause here
        resumeWaves()
        resumeMove()
    }else{
        //Pause here
        pauseWaves()
        pauseMove()
    }
    stats.isPaused^=true
}

spawnWaves()

/**Allows you to pause a timeout for the next action */
function Timer(callback, delay) {
    var args = arguments,
        self = this,
        timer, start;

    this.clear = function () {
        clearTimeout(timer);
    };

    this.pause = function () {
        this.clear();
        delay -= new Date() - start;
    };

    this.resume = function () {
        start = new Date();
        timer = setTimeout(function () {
            callback.apply(self, Array.prototype.slice.call(args, 2, args.length));
        }, delay);
    };

    this.resume();
}