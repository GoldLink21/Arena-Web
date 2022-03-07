/**
 * A class for doing quick conversions of angles as well as keeping
 * angles within a positive 360 degree and 2PI basis
 */
class Angle{
    /**
     * @param {number} ang The degree value to base the angle object off of
     * @param {boolean} isRad If the initial value passed in is a radian. Otherwise assumed to be a degree
     */
    constructor(ang,isRad=false){
        if(isRad){
            this.rad=Angle.roundRad(ang)
            this.deg=Angle.toDeg(this.rad)
        }else{
            this.deg=Angle.roundDeg(ang)
            this.rad=Angle.toRad(this.deg)
        }
    }
    /**
     * Resets the angle to be based on a different degree value
     * @param {number} deg The degree value to set the angle to be
     */
    setDeg(deg){
        this.deg=Angle.roundDeg(deg)
        this.calcRad()
    }
    /**
     * Resets the angle to be based on a different radian value
     * @param {number} rad The radian value to set the angle to be
     */
    setRad(rad){
        this.rad=Angle.roundRad(rad)
        this.calcDeg()
    }
    /**
     * Rotates the angle by an amount of degrees
     * @param {number} deg The amount of degrees to rotate the angle by 
     */
    rotateDeg(deg){
        this.deg=Angle.roundDeg(this.deg+deg)
        this.calcRad()
    }
    /**
     * Rotates the angle by an amount of radians
     * @param {number} rad The number of radians to rotate the angle by
     */
    rotateRad(rad){
        this.rad=Angle.roundRad(this.rad+rad)
        this.calcDeg()
    }
    /**
     * Adds another angle to this angle
     * @param {Angle} other The other angle to add to the current angle
     */
    rotate(other){
        this.rotateDeg(other.deg)
    }
    /** Recalculates the degree value of the angle. Used any time radians is changed */
    calcDeg(){
        this.deg=Angle.toDeg(this.rad);
    }
    /** Recalculates the radian value of the angle. Used any time degrees is changed */
    calcRad(){
        this.rad=Angle.toRad(this.deg)
    }
    /**
     * @returns the degree value put in terms of 0-359
     * @param {number} deg The degree to round
     */
    static roundDeg(deg){
        while(deg<0)
            deg+=360;
        return deg%360
    }
    /**
     * @returns the value passed in put in terms of 0-2PI
     * @param {number} rad The radian to round
     */
    static roundRad(rad){
        while(rad<0)
            rad+=(Math.PI*2)
        return rad%(Math.PI*2)
    }
    /**
     * @returns the radian value of the degrees passed in
     * @param {number} deg the degree value to convert
     */
    static toRad(deg){
        return Angle.roundRad(Math.PI*deg/180)
    }
    /**
     * @returns the degree value of the radians passed in
     * @param {number} rad The radians to convert
     */
    static toDeg(rad){
        return Angle.roundDeg((180*rad)/Math.PI)
    }
    /**
     * @returns the closest cardinal direction to the passed in angle
     * @param {number} ang The angle to round in degrees
     */
    static degToCardinal(ang){
        return(Math.round(Angle.roundDeg(ang)/90)*90)%360;
    }
    /**
     * @returns the closest cardinal direction to the passed in angle in radians
     * @param {number} ang The angle in radians to round
     */
    static radToCardinal(ang){
        return Angle.toRad(Angle.degToCardinal(Angle.toDeg(ang)))
    }
    /**@return the cardinal direction of up */
    static get up(){return new Angle(90)}

    /**@return the cardinal direction of down */
    static get down(){return new Angle(270)}

    /**@returns the cardinal direction of left */
    static get left(){return new Angle(180)}

    /**@returns the cardinal direcion of right */
    static get right(){return new Angle(0)}

    /**
     * @returns true if the angles of both are the same
     * @param {Angle} other The other angle to compare
     */
    equals(other){
        return(this.deg===other.deg||this.rad===other.rad)
    }
    toString(){
        return this.deg+' degrees'
    }
    /*
               PI/2
                90
                |
                |
                |
    PI 180------|-------0  0PI
                |
                |
                |
               270
              3PI/2
    */
    /** Logs a copy of the graph showing where each angle value lays in the console */
    static graph(){
        function s(n){return ' '.repeat(n)}
        console.log(s(11)+'PI/2\n'+s(12)+'90\n'+(s(12)+'|\n').repeat(3)+
        'PI 180'+'-'.repeat(6)+'|'+'-'.repeat(6)+'0 0PI\n'+(s(12)+'|\n').repeat(3)+
        s(11)+'270\n'+s(10)+'3PI/2')
    }
}
/** Class for getting values of colors in rgb, hex, and even from css color names */
class Color{
    /**
     * @param {number|string} r The red value of the color, or the hex value of the color, or the name of the color
     * @param {number} g The green value of the color
     * @param {number} b The blue value of the color
     */
    constructor(r,g,b){
        if(!g&&!b){
            if(r.length<2||r.length>7)
                throw new Error('Invalid hex value')
            if(r.charAt(0)==='#')
                this.hex=r;
            else
                this.hex=Color.nameToHex(r)
                
            var arr=Color.toRgb(this.hex);
            this.r=arr[0]
            this.g=arr[1]
            this.b=arr[2]
        }else if(r&&g&&b){
            if(Color.checkRgb(r,g,b))
                throw new Error('Invalid values for rgb')
            this.r=r;
            this.g=g;
            this.b=b;
            this.hex=Color.toHex(r,g,b)
        }
    }
    setRgb(r,g,b){
        if(Color.checkRgb())
            throw new Error('Invalid values for rgb')
        this.r=r
        this.g=g
        this.b=b
        this.hex=Color.toHex(r,g,b)
        return Color.rgbString(this.r,this.g,this.b)
    }
    setHex(hex){
        if(hex.length<1||hex.length>7)
            throw new Error('Invalid hex value')
        if(hex.charAt(0)==='#')
            this.hex=hex;
        else
            this.hex='#'+Color.trimHex(hex)
        var arr=Color.toRgb(this.hex);
        this.r=arr[0]
        this.g=arr[1]
        this.b=arr[2]
        return this.hex
    }
    setName(str){
        this.hex=Color.nameToHex(str);
        var temp=Color.nameToRGB(str)
        this.r=temp[0]
        this.g=temp[1]
        this.b=temp[2]
        return this.hex
    }
    /** @returns the css formatting for the proper  */
    static rgbString(r,g,b){
        if(this.checkRgb(r,g,b))
            throw new Error('Invalid values for rgb')
        return "rgb("+r+','+g+','+b+')'
    }
    /**@returns the hex value of the rgb with # preceding it */
    static toHex(r=0,g=0,b=0){
        //This gets the individual hex pieces of the full hex code
        function h(rgb){var hex=Number(rgb).toString(16);return (hex.length<2)?'0'+hex:hex;}

        if(this.checkRgb(r,g,b))
            throw new Error('Invalid values for rgb')

        return '#'+h(r)+h(g)+h(b)
    }
    /**
     * Trims down a hex code to be without the #
     * @param {string} hex The hex to trim down to be without the #. Returns the original string
     * if there was no # bedore
     */
    static trimHex(hex){
        var temp=(typeof hex==='string'&&hex.charAt(0)==='#')?hex.substring(1):hex.toString();
        if(temp.length%2===1)
            temp+='0'
        return temp
    }
    static toRgb(hex){
        hex=Color.trimHex(hex)
        var arr=[
            hex.charAt(0)+hex.charAt(1),
            hex.charAt(2)+hex.charAt(3),
            hex.charAt(4)+hex.charAt(5)
        ];
        for(let i=0;i<arr.length;i++)
            if(!arr[i])
                arr[i]='00'
        hex=arr
        //Puts it in base 10 from base 16
        function s(p){return parseInt(p,16)}

        var r=s(hex[0]),
            g=s(hex[1]),
            b=s(hex[2])
        return [r,g,b];
    }
    toString(){
        return this.hex
    }
    /**Converts css names for colors into a big integer value, and then to rgb */
    static nameToRGB(str){
        return Color.toRgb(Color.nameToHex(str))
    }
    /** Converts css color names into hex */
    static nameToHex(str){
        var ct=document.createElement('canvas').getContext('2d')
        ct.fillStyle=(isNaN(str))?str:'#'+str
        return ct.fillStyle
    }
    static checkRgb(r,g,b){
        return(r>255||r<0||g>255||g<0||b>255||b<0)
    }
}

class Point{
    constructor(x=0,y=0){
        this.x=x;
        this.y=y;
    }
    /**
     * @returns the distance between the two points
     * @param {Point} other The other point to compare to
     */
    distBetween(other){
        return Math.hypot((this.x-other.x),(this.y-other.y))
    }
    setPosition(x,y){
        this.x=x;
        this.y=y
    }
    toString(){
        return '('+this.x+','+this.y+')'
    }
}

/** A class for defining rectangles that you can check the collisions of 2D objects easily */
class Rectangle{
    constructor(x,y,width,height){
        this.x=x;
        this.y=y
        this.width=width;
        this.height=height;
    }
    /**
     * @returns true if the objects collide
     * @param {Rectangle|Point} other The other thing to check bounds of
     */
    intersects(other){
        var type=other.constructor.name
        if(type===getObjectType(Rectangle))
            return !(((this.y+this.height)<(other.y))||(this.y>(other.y+other.height))||
                    ((this.x+this.width)<other.x)||(this.x>(other.x+other.width)));
        else if(type===getObjectType(Point))
            return !(((this.y+this.height)<(other.y))||(this.y>(other.y))||
                    ((this.x+this.width)<other.x)||(this.x>(other.x)));
    }
    /**
     * Resets the bounds of the Rectangle
     * @param {number} x 
     * @param {number} y 
     * @param {number} width 
     * @param {number} height 
     */
    setBounds(x,y,width,height){
        this.x=x
        this.y=y
        this.width=width
        this.height=height
    }
    setPosition(x,y){
        this.x=x
        this.y=y;
    }
}

/**An object for doing different random based functions */
const Random={
    /**
     * @returns true only with an n/d chance, else false
     * @param {number} n The numerator of the fractional chance. If this is only passed in, does 1/n chance
     * @param {number} d The denominator of the fractional chance
     */
    chance(n,d){
        if(d===undefined)
            return Random.chance(1,n)
        else
            return Math.floor(Math.random()*d)<n;
    },
    /**
     * @returns a random int between start and end inclusive (start,end]. If end is not passed in, returns 0-start
     * @param {number} start The start of the random int
     * @param {number} end The end of the random int non-inclusive
     */
    intRange(start,end){ 
        if(end===undefined)
            return Random.intTo(start)
        return Math.floor(Math.random()*(Math.abs(end-start)))+Math.min(start,end)
    },
    /**
     * @returns a random element from the array
     * @param {any[]} arr The array to pull from
     */
    arrayElement(arr){
        return arr[Math.floor(Math.random()*arr.length)]
    },
    /**
     * @returns an integer from 0-(max-1)
     * @param {number} max The integer one above the max returned
     */
    intTo(max){
        return Math.floor(Math.random()*max)
    },
    /**
     * @returns {number[]}an array of the values (start,end] randomized
     * @param {number} start The start number of the array
     * @param {number} end The end number of the array, non-inclusive
     */
    intArrNoRepeat(start,end){
        if(end<start){
            var t=start;start=end;end=t;
        }
        var range=(end-start),nums=new Array(range),i=0,temp;
        while(i<range){
            do{
                temp=Math.floor(Math.random()*(range))+start
            }while(nums.includes(temp));
            nums[i++]=temp;
        }
        return nums;
    },
    objProperty(obj){
        var keys=Object.keys(obj)
        return obj[keys[keys.length*Math.random()<<0]]
    },
    /**@returns a random color of the entire spectrum */
    color(){
        function r(){return Random.intTo(16*16)}
        return new Color(r(),r(),r())
    },
    /**@returns a random angle from 0-359 */
    angle(){
        return new Angle(Random.intTo(360))
    }
}

/**
 * Rounds the value passed in to 10^nth places
 * @param {number} val The value to round 
 * @param {number} n The place to round to
 */
function round(val,n=0){
    return Math.round(val*Math.pow(10,n))/Math.pow(10,n)
}

/** @returns the name of the type of the object. Useful for getting class name */
function getObjectType(obj){
    return new obj().constructor.name;
}

/**
 * Repeats a function a set amount of times over a set amount of delay
 * @param {function} func The function to repeat. Use an arrow function here ()=>{}
 * @param {number} reps The number of times to repeat the function
 * @param {number} delay Time in milliseconds. For seconds, do delay*1000
 */
function delayedRepeat(func,reps,delay){
    var t=setInterval(()=>{
        func();
        if(--reps<=0)
            clearInterval(t)
    },delay)
}

/**
 * Calls a function after a delay. Can be
 * @param {function} callback The function to call after the delay
 * @param {number} delay The delay in milliseconds
 * @example var timer = new Timer(function(){console.log('done')},1000)//Logs 'done' after one second
 */
function Timer(callback, delay){
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

/**
 * Class for using omni directional movement that you can add and subtract from each other easily.
 * Also allows you to get the x and y components of movement if defined by r and theta
 * */
class Vector2D{
    /**
     * @param {number} x The x component of the vector or r if isPolar. Defaults to 0
     * @param {number} y The y component of the vector or theta if isPolar. Defaults to 0
     * @param {boolean} isPolar Whether the x and y passed in are instead r and theta respectively. Defaults to false
     * @param {boolean} isRad If isPolar, then tells if theta is radians instead of degrees. Defaults to false
     */
    constructor(x=0,y=0,isPolar=false,isRad=false){
        if(isPolar){
            this.r=x;
            this.ang=new Angle(y,isRad)
            this.calcCartesian()
        }else{
            this.x=x
            this.y=y
            this.calcPolar()
        }
    }
    /**
     * Adds the other vector to this vector's components
     * @param {Vector2D} other The other vector to add
     */
    add(other){
        this.x+=other.x
        this.y+=other.y
        this.calcPolar()
    }
    /**
     * Subtracts the other vector from this vector's components
     * @param {Vector2D} other The vector to subtract
     */
    subtract(other){
        this.x-=other.x
        this.y-=other.y
        this.calcPolar()
    }
    /**Calculates the angle and r of the vector*/
    calcPolar(){
        this.ang=new Angle(Math.atan2(this.y,this.x),true)
        this.r=Math.hypot(this.x,this.y)
    }
    /**Calculates x and y with r and theta */
    calcCartesian(){
        this.x=round(this.r*Math.cos(this.ang.rad),10)
        this.y=round(this.r*Math.sin(this.ang.rad),10)
    }
    toString(){
        return '(x: '+this.x+' ,y: '+this.y+')';
    }
}

/*@ignore Don't use this as it's not done yet
class Vector3D extends Vector2D{constructor(x=0,y=0,z=0){super(x,y);this.z=z;this.calcR()};add(other){super.add(other);this.z+=other.z}
    subtract(other){super.subtract(other);this.z-=other.z};calcR(){this.r=Math.hypot(this.x,this.y,this.z)};toString(){return '(x: '+this.x+',y: '+this.y+',z: '+this.z+')';}}*/