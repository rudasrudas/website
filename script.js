var canvas  = document.getElementById("canvas1");
var ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const gap = 5;
const allSideLength = 40;

let triangleArray;

var img = new Image();
img.src = "./cat.jpg";
img.onload = function(){
    var imgCanvas = document.createElement("canvas");
    imgCanvas.width = img.width;
    imgCanvas.height = img.height;
    var imgCtx = imgCanvas.getContext('2d');

    imgCtx.drawImage(img, 0, 0);

    var imgData = imgCtx.getImageData(0, 0, img.width, img.height);

    renderImageOnTriangles(imgData);
}

function renderImageOnTriangles(imgData){

    const yDensity = 50;
    const xDensity = yDensity;// / (Math.sqrt(3)/2);
    
    const xTriangles = Math.floor(imgData.width/xDensity); //accounting for triangle width/height difference
    const yTriangles = Math.floor(imgData.height/yDensity);

    const offsetXt = 0;
    const offsetYt = 0;

    var translatedValues = [];

    var difference = ( canvas.width - gap * 5) / (Math.sqrt(3)/2 *allSideLength) - xTriangles;

    for(let i = 0; i < yTriangles; i++){
        for(let j = 0; j < xTriangles; j++){
            translatedValues.push(0); //creating initial values for averages
        }
    }

    for(let i = 0; i < imgData.height; i++){
        for(let j = 0; j < imgData.width; j++){
            let y = i % yDensity;
            let x = j % xDensity;

            let index = (i * imgData.width + j) * 4;
            let avg = (imgData.data[index] + imgData.data[index + 1] + imgData.data[index + 2])/3/255;

            translatedValues[y * xTriangles + x] += avg;
        }
    }

    for(let i = 0; i < yTriangles; i++){
        for(let j = 0; j < xTriangles; j++){
            triangleArray[(offsetYt + i) * xTriangles + (offsetXt + j) + i*difference].thickness = 
                translatedValues[i * xTriangles + j]/(xDensity*yDensity) * 100;
            console.log(triangleArray[(offsetYt + i) * xTriangles + (offsetXt + j) + i*27].thickness);
        }
    }
}

//get mouse position
let mouse = {
    x: -500,
    y: -500,
    radius: 0,
    clickX: null,
    clickY: null
}

window.addEventListener('mousemove',
    function(event) {
        mouse.x = event.offsetX;
        mouse.y = event.offsetY;

        if(event.target.id != "canvas1"){
            mouse.x = -500;
            mouse.y = -500;
        }
    }
);

window.addEventListener('mousedown',
    function(event){
        if(event.target.id == "canvas1"){
            mouse.clickX = event.x;
            mouse.clickY = event.y;

            var interval = setInterval(() => {
                diluteTriangles();
                mouse.radius += 10;
            }, 5);

            if(mouse.radius > canvas.width * canvas.height){
                clearInterval(interval);
            }
        }
    }
);

//create particle
class Triangle {
    constructor(x, y, sideLength, thickness) {
        this.x = x;
        this.y = y;
        this.sideLength = sideLength;
        this.thickness = thickness;
        this.activated = false;
    }

    //to draw
    draw(){
        let p = new Path2D(`M${this.x} ${this.y} h ${this.sideLength} l ${-this.sideLength/2} ${this.sideLength*Math.sqrt(3)/2} Z`)
        ctx.lineWidth = this.thickness;
        ctx.strokeStyle = '#444';
        ctx.lineCap = "rounded";
        ctx.stroke(p);
    }

    drawFlipped(){
        let p = new Path2D(`M${this.x} ${this.y + this.sideLength*Math.sqrt(3)/2} h ${this.sideLength} l ${-this.sideLength/2} ${-this.sideLength*Math.sqrt(3)/2} Z`)
        ctx.lineWidth = this.thickness;
        ctx.strokeStyle = '#444';
        ctx.lineCap = "rounded";
        ctx.stroke(p);
    }

    update(){

        let dist = Math.sqrt((this.x - mouse.x)*(this.x - mouse.x) + (this.y - mouse.y)*(this.y - mouse.y));
        let rad = (Math.cos(dist/Math.PI/15) + 1.6) /2;
        let baseThickness = 2;
        let diff = 2;

        if(!this.activated){
            if(dist < 120){
                if(this.thickness < baseThickness + diff)
                    if(this.thickness + rad > baseThickness + diff){
                        this.thickness = baseThickness + diff;
                    }
                    else this.thickness += rad;
            }
            //else this.thickness = baseThickness;
        }

        if(this.thickness > baseThickness){
            this.thickness -= 0.1;
        }
    }
}

function diluteTriangles(){
    for(let i = 0; i < triangleArray.length; i++){

        let distance = Math.sqrt((triangleArray[i].x - mouse.clickX)*(triangleArray[i].x - mouse.clickX) +
                                 (triangleArray[i].y - mouse.clickY)*(triangleArray[i].y - mouse.clickY));

        if(mouse.radius > distance){
            if(triangleArray[i].thickness > 0.1)
                triangleArray[i].thickness -= 0.1;
            else triangleArray[i].thickness = 0.001;
        }
        else if(mouse.radius + 30 > distance){
            triangleArray[i].thickness += 0.5;
            triangleArray[i].activated = true;
        }
    }
}

function init(){
    triangleArray = [];
    let numX = ( canvas.width - gap * 5) / (Math.sqrt(3)/2 *allSideLength);
    let numY = ( canvas.height - gap - document.getElementById("header").offsetHeight) / (allSideLength);

    for(let i = 0; i < numY; i++) {
        for(let j = 0; j < numX; j++){

            let sideLength = allSideLength;
            let x = j * Math.sqrt(3)/2 * (allSideLength) + gap;
            let y = i * Math.sqrt(3)/2 * (sideLength + gap + 10) + gap;
            let thickness = 2;

            triangleArray.push(new Triangle(x, y, sideLength, thickness));
        }
    }
}

function animate(){
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, innerWidth, innerHeight);

    for(let i = 0; i < triangleArray.length; i++){
        //triangleArray[i].update();
        if(i%2 == 0)
            triangleArray[i].drawFlipped();
        else triangleArray[i].draw();
    }
}

init();
animate();