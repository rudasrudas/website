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
 [ ] Have margins on all sides
 [ ] Adapt triangle size based on the density value
 [ ] Disappear/reapper on scroll
 [ ] Responsive to mouse hovering effects
 [ ] Display a picture or a video with value customization

 Expected triangle settings:
 [X] Stroke thickness
 [X] Target stroke thickness
 [X] Opacity
 [X] Corner radius

 */

 //CONSTANTS

const elementId = "canvas1";

//The variable that determines how dense the triangle hero section will be
//NOTE(justas): Not used yet and instead relying on canvas dimensions and sidelength to determine the density
const triangleDensity = 20; 

//The padding around the hero section in px.
const paddingTop = 0;
const paddingBottom = 0;
const paddingLeft = 0;
const paddingRight = 0; //TODO convert into a struct istead

const refreshSpeed = 0.1; //Speed at whcih the triangles reach their targetThickness (Keep as low as possible for accuracy)
const rippleSpeed = 5; //The speed at which the ripples move away from their source in px per 10 ms

const defaultTargetThickness = 4; //The default target thickness for all triangles in px
const defaultTriangleColor = '#555555'; //The default color for triangles.
const borderRadius = 1; //triangle border radius
const inset = 7; //The inset/padding for each triangle in px

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
}

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
                this.targetThickness = 0.001; //TODO(justas): A super small value or just 0?
            }
        }

        //TODO(justas): Update the opacity(or just the thickness?)
        // based on the scrolled position.

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

        //NOTE(justas): This is to only catch mouse moves
        // while on the actual hero section.
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

function init(){
    triangleMatrix = [];
    ripples = [];

    //Initializing the canvas width and height
    canvas.width = screen.width - paddingLeft - paddingRight;
    canvas.height = screen.height - paddingTop - paddingBottom;

    console.log(canvas.width + "x" + canvas.height); //Logging

    sideLength = canvas.width*canvas.width / 20000; // numOfPixelsOnCanvas / selectedValue
    

    xT = Math.floor(canvas.width/(sideLength/2))-1;
    yT = Math.floor(canvas.height/(sideLength*Math.sqrt(3)/2))-1;

    for(let i = 0; i < yT; i++){
        for(let j = 0; j < xT; j++){
            let x = j * (sideLength/2) + paddingLeft;
            let y = i * (sideLength*Math.sqrt(3)/2) + paddingTop;

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
console.log("canvas dims: " + canvas.width + ";" + canvas.height);
console.log("sidelength: " + sideLength);
animate();



