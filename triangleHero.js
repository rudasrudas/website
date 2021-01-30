/*
Triangle hero interactive section for a landing page.

Project goal is to pick up on javascript, learn to use github version
control effectively, learn to create a responsive website
part from scratch (meaning pure JS).

Start date: 2021/01/26
End date: In progress

Expected features:
 [X] Displayed in a hexagonal pattern and not square
 [X] Disappear if clicked as a ripple
 [ ] Disappear along the direction of one side of the triangles on click instead(?)
 [X] Have padding on all sides
 [ ] Adapt triangle size based on the density value
 [ ] Disappear/reapper on scroll
 [X] Responsive to mouse hovering effects
 [ ] Display a picture or a video with value customization

 Expected triangle settings:
 [X] Stroke thickness
 [X] Target stroke thickness
 [X] Opacity
 [X] Corner radius

 */

 //CONSTANTS

const elementId = "canvas1";
const imageFileName = "cat.jpg";

//The variable that determines how dense the triangle hero section will be
//NOTE(justas): Not used yet and instead relying on canvas dimensions and sidelength to determine the density
const triangleDensity = 20; 

//The padding around the hero section in px.
const paddingTop = 10;
const paddingBottom = 10;
const paddingLeft = 10;
const paddingRight = 10; //TODO convert into a struct istead

const refreshSpeed = 0.1; //Speed at whcih the triangles reach their targetThickness (Keep as low as possible for accuracy)
const rippleSpeed = 15; //The speed at which the ripples move away from their source in px per 10 ms

const defaultTargetThickness = 2; //The default target thickness for all triangles in px
const defaultTriangleColor = '#222'; //The default color for triangles.
const borderRadius = 1; //triangle border radius
const inset = 6; //The inset/padding for each triangle in px

const imgLift = 10; //How much the image values lift at max above defaultTargetThickness
const imageTriangleOffsetX = 5;
const imageTriangleOffsetY = 0;

//VARIABLES
var canvas = document.getElementById(elementId);
var ctx = canvas.getContext("2d");

var triangleMatrix; //The triangle matrix, as a one dimensional array
var ripples; //The ripple array

var xT; //Triangle amount in x axis
var yT; //Triangle amount in y axis
var sideLength; //The length of each side of the triangles

//Mouse data
var mouse = {
    x: -500, //NOTE(justas): the negative values are to prevent
    y: -500, // a fallback to the top right corner. Find out if
             // it can be done otherwise.
    radius: 250, //radius for responsive mouse interaction
    lift: -1     //the maximum thickness difference between a triangle interacted with and baseThickness
}

var img;

//The maximum distance between any two points on the canvas
//used to ensure good performance
const maximumDistance = Math.sqrt((screen.width*screen.width)+(screen.height*screen.height));

class Ripple {
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.radius = 0;
    }

    expand(){
        return new Promise(resolve =>
            setInterval(() => {
                this.radius += rippleSpeed;

                if(this.radius > maximumDistance){
                    resolve();
                }
            }, 10)
        );
    }
}


//The triangle class
class Triangle {
    constructor(x, y, thickness, targetThickness, opacity){
        this.x = x;
        this.y = y;
        this.thickness = thickness;
        this.targetThickness = targetThickness;
        this.opacity = opacity;
        this.color = defaultTriangleColor;
        this.isFading = false;
    }

    //Drawing the triangle on the canvas, takes an index in the matrix array
    render(i){

        //tr = translated coordinates in the triangle Matrix
        let trX = Math.floor(i % xT);
        let trY = Math.floor(i / xT);

        ctx.lineWidth = this.thickness;
        ctx.strokeStyle = this.color;

        if(trY%2 === 0){
            if(trX%2 === 0){
                ctx.stroke(this.renderUp());
            }
            else{
                ctx.stroke(this.renderDown());
            }
        }
        else{
            if(trX%2 === 0){
                ctx.stroke(this.renderDown());
            }
            else{
                ctx.stroke(this.renderUp());
            }
        }
    }

    renderDown(){ //Render the triangle pointing down
        let path = new Path2D();

        path.moveTo(this.x + 3/Math.sqrt(3)*inset + Math.sqrt(3)*borderRadius,
                    this.y + inset);

        path.arcTo( this.x + sideLength - 3/Math.sqrt(3)*inset, this.y + inset,
                    this.x + sideLength - 3/Math.sqrt(3)*inset - Math.sqrt(3)*borderRadius, this.y + inset + 3*borderRadius,
                    borderRadius);
        path.arcTo( this.x + sideLength/2, this.y + Math.sqrt(3)*sideLength/2 - 2*inset,
                    this.x + sideLength/2 - Math.sqrt(3)*borderRadius, this.y + Math.sqrt(3)/2*sideLength - 2*inset - 3*borderRadius,
                    borderRadius);
        path.arcTo( this.x + 3/Math.sqrt(3)*inset, this.y + inset,
                    this.x + 3/Math.sqrt(3)*inset + Math.sqrt(3)*borderRadius, this.y + inset,
                    borderRadius);

        return path;
    }

    renderUp(){ //Render the triangle pointing up
        let path = new Path2D();

        path.moveTo(this.x + 3/Math.sqrt(3)*inset + Math.sqrt(3)/2*borderRadius,
                    this.y + Math.sqrt(3)/2*sideLength - inset - 3/2*borderRadius);

        path.arcTo( this.x + sideLength/2, this.y + 2*inset,
                    this.x + sideLength/2 + Math.sqrt(3)*borderRadius, this.y + 2*inset + 3*borderRadius,
                    borderRadius);
        path.arcTo( this.x + sideLength - 3/Math.sqrt(3)*inset, this.y + Math.sqrt(3)*sideLength/2 - inset,
                    this.x + sideLength - 3/Math.sqrt(3)*inset - 2*Math.sqrt(3)*borderRadius, this.y + Math.sqrt(3)*sideLength/2 - inset,
                    borderRadius);
        path.arcTo( this.x + 3/Math.sqrt(3)*inset, this.y + Math.sqrt(3)*sideLength/2 - inset,
                    this.x + 3/Math.sqrt(3)*inset + Math.sqrt(3)/2*borderRadius, this.y + Math.sqrt(3)/2*sideLength - inset - 3/2*borderRadius,
                    borderRadius);

        return path;
    }

    //returns whether a triangle within the radius of this ripple
    inRange(r){
        //Accounting for the triangle coordinates
        // being at the edge of the triangle and centering them
        let tX = this.x + (sideLength/2);
        let tY = this.y + (sideLength*Math.sqrt(3)/6); //TODO(justas): Recheck if this is accurate

        return (r.radius >= Math.sqrt((tX - r.x)*(tX - r.x) + (tY - r.y)*(tY - r.y)));
    }

    update(){
        //Iterating trough every ripple and making the triangles fade
        for(let i = 0; i < ripples.length; i++){
            if(this.inRange(ripples[i])){
                this.isFading = true;
                this.targetThickness = 0.001; //TODO(justas): A super small value or just 0?
            }
        }

        //TODO(justas): Update the opacity(or just the thickness?)
        // based on the scrolled position.

        //Mouse responsiveness
        let distanceToMouse = Math.sqrt((this.x - mouse.x)*(this.x - mouse.x) + (this.y - mouse.y)*(this.y - mouse.y));
        if(!this.isFading){
            if(mouse.radius > distanceToMouse){
                this.targetThickness = (Math.cos(distanceToMouse*Math.PI/mouse.radius) + 1)/2*mouse.lift + defaultTargetThickness;
            }
            else{
                this.targetThickness = defaultTargetThickness;
            }
        }

        //Updating the true stroke thickness values 
        if(this.thickness > this.targetThickness){
            if(this.thickness - refreshSpeed >= 0){
                this.thickness -= refreshSpeed;
            }
            else{
                this.thickness = this.targetThickness;
            }
        }
        else{
            this.thickness += refreshSpeed;
        }
    }
}

//FUNCTIONS

window.addEventListener('mousemove',
    function(event){
        mouse.x = event.offsetX;
        mouse.y = event.offsetY;

        //NOTE(justas): This is to catch mouse moves
        // only while on the actual hero section.
        if(event.target.id != elementId){
            mouse.x = -500;
            mouse.y = -500;
        }
    }
);

window.addEventListener('mousedown',
    async function(event){
        //Only capture clicks on the hero
        if(event.target.id === elementId){
            let r = new Ripple(event.offsetX, event.offsetY);

            ripples.push(r);
            await r.expand();

            ripples.pop(r);
        }
    }
);

img = new Image();
img.src = imageFileName;
img.onload = function(){
    var imgCanvas = document.createElement("canvas");
    imgCanvas.width = img.width;
    imgCanvas.height = img.height;
    
    var imgCtx = imgCanvas.getContext("2d");
    imgCtx.drawImage(img, 0, 0);

    var imgData = imgCtx.getImageData(0, 0, img.width, img.height);
    renderImage(imgData);
}

function renderImage(imgData){

    const density = 20;
    const yDensity = sideLength/2*Math.sqrt(3)*density;
    const xDensity = sideLength/2*density;

    const imgYTriangles = Math.floor(imgData.height/yDensity);
    const imgXTriangles = Math.floor(imgData.width/xDensity);

    //In case the image renders outside of the matrix, prevent that
    imgYTriangles = Math.min(imgYTriangles, yT - imageTriangleOffsetY);
    imgXTriangles = Math.min(imgXTriangles, xT - imageTriangleOffsetX);

    var mappedValues = [];

    for(let i = 0; i < imgXTriangles*imgYTriangles; i++){
        mappedValues.push(0); //Creating initial values
    }

    for(let i = 0; i < imgData.height; i++){
        for(let j = 0; j < imgData.width; j++){
            let y = i%yDensity;
            let x = j%xDensity; //NOTE(justas): there may be an error here if the offsets are too high

            let index = (i * imgData.width + j) * 4;
            let avg = (imgData.data[index] + imgData.data[index + 1] + imgData.data[index + 2])/3/255;

            mappedValues[y * imgXTriangles + x] += avg;
        }
    }

    for(let i = 0; i < imgYTriangles; i++){
        for(let j = 0; j < imgXTriangles; j++){
            triangleMatrix[ (imageTriangleOffsetY + i) * imgXTriangles + 
                            (imageTriangleOffsetX + j) + i*(xT - imgXTriangles)].targetThickness = 
                            mappedValues[i * imgXTriangles + j]/(xDensity*yDensity) * imgLift;
        }
    }
}

function init(){
    triangleMatrix = [];
    ripples = [];

    sideLength = 60;

    //Initializing the canvas width and height
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    console.log(canvas.width + "x" + canvas.height); //Logging

    xT = Math.floor((canvas.width - paddingLeft - paddingRight)/(sideLength/2)) - 1;
    yT = Math.floor((canvas.height - paddingTop - paddingBottom)/(sideLength*Math.sqrt(3)/2)) - 1;

    for(let i = 0; i < yT; i++){
        for(let j = 0; j < xT; j++){
            let x = j * (sideLength/2) + paddingLeft;
            let y = i * (sideLength/2*Math.sqrt(3)) + paddingTop;

            //TODO(justas): Perhaps make use of the construction with a different thickness value
            // to achieve a beautiful booting up animation?
            triangleMatrix.push(
                new Triangle(x, y, defaultTargetThickness, defaultTargetThickness, 0, 1)
            );
        }
    }
}

function animate(){
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    triangleMatrix.forEach(function(t, i) {
        t.update();
        t.render(i);
    });
}

init();
console.log("There are " + triangleMatrix.length + " triangles created. \n xT = " + xT + " yT = " + yT);
console.log("sidelength: " + sideLength);
animate();



