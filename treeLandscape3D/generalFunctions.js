/**
 * Created by luisandresgurmendez on 31/5/17.
 */


function sunSet(){

    var counter=70
    setInterval(function(){
        if(counter>1){
            directionalLight.position.set(100-counter,counter,0);
            counter-=0.3

        }
    },100)

}



function keyDown(event){
    keyboard[event.keyCode] = true;
}

function keyUp(event){
    keyboard[event.keyCode] = false;
}


function moveCameraTo(position){
    console.log(position)
    camera.position.set(position.x,10,position.y-10)
    console.log("camera.lookAt(new THREE.Vector3(" + position.x + ",0," + position.y + "))")
    //camera.lookAt(new THREE.Vector3(position.x,0,position.y))
}



function loadSquirle(){

    var loader = new THREE.ObjectLoader();
    loader.load( 'models/nature/squirle.json', function ( object ) {
        object.traverse( function( node ) { if ( node instanceof THREE.Mesh ) { node.castShadow = true; } } );
        squirle = object;

        squirle.position.set(randomInNegativeMirrorInterval(50), 0.2, randomInNegativeMirrorInterval(50));

        //Starts facing "left"
        squirle.direction = Math.PI
        squirle.speed= Math.random() + 0.5;
        squirle.move = function(){
            var x=Math.cos(this.direction)
            var y=Math.sin(this.direction)
            var counter=0
            var thisS=this
            var counterTarget = Math.floor(Math.random()*10 + 1)
            var moveInterval = setInterval(function(){
                counter+=1
                if(counter == 10){
                    clearInterval(moveInterval)
                    thisS.changeDirection()
                }else{
                    thisS.position.x-=x*thisS.speed;
                    thisS.position.z-=y*thisS.speed;
                    thisS.speed = Math.random() + 0.5;
                }

            },100)

        }
        squirle.changeDirection = function(){
            var prevDirection = this.direction;
            this.direction = Math.random()*Math.PI
            var thisS = this;
            var counter=0
            var rotate = (prevDirection - this.direction)/10
            var rotateInterval = setInterval(function(){
                counter+=1
                if(counter ==10){
                    clearInterval(rotateInterval);
                    setTimeout(function(){
                        if(Math.random() > 0.5){
                            thisS.move()
                        }else{
                            thisS.changeDirection();
                        }
                    },Math.random()*5000 + 1000)
                }else{
                    thisS.rotation.y+=rotate
                }
            },100)
        }


        squirle.changeDirection()

        scene.add( object );

    });
}



function randomInNegativeMirrorInterval(n) {
    var num =Math.random()*n ;
    num *= Math.floor(Math.random()*2) == 1 ? 1 : -1; // this will add minus sign in 50% of cases
    return num
}



function createTreeInfoPopUp(info,position){
    html="<div class='treeInfoPopUp'><div>Owner: " + info["ownerName"] + " " + info["ownerLastname"] + "</div><div>Tree's name: " + info["name"] + "</div><div>Oxygen released: 10kg</div></div>"
    //html="<div class='treeInfoPopUp'><div>Owner: " + info["tree[ownerName]"] + " " + info["tree[ownerLastname]"] + "</div><div>Tree's name: " + info["tree[name]"] + "</div><div>Oxygen released: 10kg</div></div>"
    $(html).appendTo('body')
    $('.treeInfoPopUp').css({top:position.realY + "px",left:position.realX + "px"})

}



function onDocumentMouseMove( event ) {
    // the following line would stop any other event handler from firing
    // (such as the mouse's TrackballControls)
    // event.preventDefault();

    // update the mouse variable
    //mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    //mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    mouse.x = ( (event.clientX -renderer.domElement.offsetLeft) / renderer.domElement.width ) * 2 - 1;
    mouse.y = -( (event.clientY - renderer.domElement.offsetTop) / renderer.domElement.height ) * 2 + 1;



    mouse.realX=event.pageX
    mouse.realY=event.pageY;

    if(isPlantingTree) {

        var raycasterTemp= new THREE.Raycaster();
        raycasterTemp.setFromCamera( {x:mouse.x,y:mouse.y}, camera );

        var objsToBeIntersected = trees.slice(0);
        objsToBeIntersected.push(meshFloor);
        var intersects = raycasterTemp.intersectObjects(objsToBeIntersected,true);

        if ( intersects.length > 0 ) {



            var intersect = intersects[intersects.length-1];

            treePositioningDummy.position.copy(intersect.point).add(intersect.face.normal);
            treePositioningDummy.position.x-=2
            treePositioningDummy.position.z-=5





            /*  Problemas con el RayCaster.. Creo que se esta creando mal, esto seria una mejora para la colision.
             var geo = new THREE.Geometry().fromBufferGeometry( treePositioningDummy.children[0].geometry);


             for (var vertexIndex = 0; vertexIndex < geo.vertices.length; vertexIndex++)
             {
             var localVertex = geo.vertices[vertexIndex].clone();
             var globalVertex = localVertex.applyMatrix3(treePositioningDummy.matrix);
             var directionVector = globalVertex.sub( treePositioningDummy.position );

             var treeDummyRay = new THREE.Raycaster( treePositioningDummy.position, directionVector.clone().normalize() );
             var collisionResults = treeDummyRay.intersectObjects( trees );

             if ( collisionResults.length > 0  ) {
             alert("collision")
             }
             }
             */



            if(intersects.length>1){

                if(treePositioningDummy.canPlant){
                    treePositioningDummy.canPlant=false;
                }

                for(i=0;i < treePositioningDummy.children[0].material.materials.length;i++ ){

                    treePositioningDummy.children[0].material.materials[i].color.setHex(0xfb3f00);
                    treePositioningDummy.children[0].material.materials[i].opacity=0.75;
                    treePositioningDummy.children[0].material.materials[i].transparent=true;

                }
            }else{
                if(!treePositioningDummy.canPlant){
                    treePositioningDummy.canPlant=true;

                    for(i=0;i < treePositioningDummy.children[0].material.materials.length;i++ ) {
                        treePositioningDummy.children[0].material.materials[i].color.setHex(treePositioningDummy.materialColors[i])
                    }
                }


            }

        }

    }

}


function addFlower(){
    var randomFlowerIndex = Math.random()*3 ;
    pathToModel="models/nature/flower/flower" + randomFlowerIndex.toFixed()
    var mtlLoader = new THREE.MTLLoader();

    mtlLoader.load(pathToModel + ".mtl",function(materials){

        materials.preload()
        objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials)

        objLoader.load(pathToModel + ".obj",function(mesh){

            mesh.traverse(function(node){
                if( node instanceof THREE.Mesh ){
                    //node.castShadow = true;
                    node.receiveShadow = true;
                    node.geometry.computeFaceNormals();
                }
            });

            mesh.position.set(randomInNegativeMirrorInterval(50), 2, randomInNegativeMirrorInterval(50));

            scene.add(mesh);

            mesh.scale.multiplyScalar(1.5)


        });

    });

}

function addFlowers(n){

    for(i=0; i<n; i++){
        addFlower()
    }

}








function mouseHoverCheck(){

    // find intersections

    // create a Ray with origin at the mouse position
    // and direction into the scene (camera direction)
    //var vector = new THREE.Vector3( mouse.x, mouse.y, 0 );
    //projector.unprojectVector( vector, camera );




    if(!isPlantingTree){
        // mouse hover on tree popup

        //var ray = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
        ray = new THREE.Raycaster()

        ray.setFromCamera( mouse, camera );


        // create an array containing all objects in the scene with which the ray intersects
        var intersects = ray.intersectObjects( trees,true);


        // INTERSECTED = the object in the scene currently closest to the camera
        //		and intersected by the Ray projected from the mouse position

        // if there is one (or more) intersections
        if ( intersects.length > 0 )
        {
            // if the closest object intersected is not the currently stored intersection object
            if ( intersects[ 0 ].object.parent != INTERSECTED )
            {

                removeTreeInfoPopUp();
                INTERSECTED = intersects[ 0 ].object.parent;
                if(INTERSECTED.isTree){
                    createTreeInfoPopUp(INTERSECTED.treeInfo,mouse)
                }

            }
        }
        else {
            removeTreeInfoPopUp();
            INTERSECTED = null;
        }

    }

}

