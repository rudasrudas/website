var canvas  = document.getElementById("canvas1");
var ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const gap = 5;
const allSideLength = 40;

let triangleArray;

function readTextFile(file)
{
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                alert(allText);
            }
        }
    }
    rawFile.send(null);
}

function renderImageOnTriangles(){

    const xTriangles = 300/40;
    const yTriangles = 240/40;

    var translatedValues = [0.42277450980392267, 0.791585784313726, 0.9440465686274742, 0.965365196078452, 0.9568455882353077, 0.7234926470588221, 0.3632107843137253, 0.5144093137254904, 0.7925833333333291, 0.8938578431372438, 0.8713553921568666, 0.7133357843137231, 0.8959436274509954, 0.2308627450980403, 0.3909632352941185, 0.58401225490196, 0.785426470588236, 0.9529754901961011, 0.9501127450980552, 0.9598137254902162, 0.2505588235294126, 0.12707598039215884, 0.7893921568627392, 0.8437965686274493, 0.8992818627451036, 0.9468921568627573, 0.9412843137255084, 0.350808823529412, 0.17780147058823684, 0.31249754901960825, 0.814786764705882, 0.8138480392156855, 0.9227205882353126, 0.7445759803921532, 0.3982450980392155, 0.29239460784313737, 0.028727941176470775, 0.240419117647061, 0.7657426470588184, 0.8528063725490397, 0.33519362745098114, 0.4210588235294124];

    var difference = 0;

    for(let i = 0; i < yTriangles; i++){
        for(let j = 0; j < xTriangles; j++){
            triangleArray[i * xTriangles + j + i*difference].thickness = translatedValues[i * xTriangles + j] * 5;
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

    //renderImageOnTriangles();
}

function animate(){
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, innerWidth, innerHeight);

    for(let i = 0; i < triangleArray.length; i++){
        triangleArray[i].update();
        if(i%2 == 0)
            triangleArray[i].drawFlipped();
        else triangleArray[i].draw();
    }
}

init();
animate();