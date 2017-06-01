var scene, camera, raycaster, renderer, mesh;
var meshFloor, ambientLight, directionalLight;
var mouse = {x:0,y:0}
var INTERSECTED;
var projector;
var trees=[]
var keyboard = {};
var player = { height:1.8, speed:0.5, turnSpeed:Math.PI*0.02 };
var USE_WIREFRAME = false;
var canMoveCamera=true;
var field = {h:200,w:200}
var zoom={MAX: 5,MIN:1}

var treePositioningDummy;

var isPlantingTree=false;

var squirles;


function init(){
    var docWidth=$(document).width()
    var docHeight = $(document).height()
    scene = new THREE.Scene();
    //camera = new THREE.PerspectiveCamera(90, docWidth/docHeight, 0.1, 1000);
    camera = new THREE.OrthographicCamera(-35,35,50,-0, 0, 100);

    meshFloor = new THREE.Mesh(
        new THREE.PlaneGeometry(field.w,field.h, 10,10),
        new THREE.MeshPhongMaterial({color:0x38761D, wireframe:USE_WIREFRAME})
    );
    meshFloor.rotation.x -= Math.PI / 2;
    meshFloor.receiveShadow = true;
    meshFloor.position.set(0,0,0)
    scene.add(meshFloor);




    ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);


    directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    directionalLight.position.set( 0, 100, 0 );
    directionalLight.castShadow=true;
    scene.add( directionalLight );

    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    var d = 100;
    directionalLight.shadow.camera.left = -d;
    directionalLight.shadow.camera.right = d;
    directionalLight.shadow.camera.top = d;
    directionalLight.shadow.camera.bottom = -d;
    directionalLight.shadow.camera.far = 3500;
    directionalLight.shadow.bias = -0.0001;


    // initialize object to perform world/screen calculations
    projector = new THREE.Projector();

    // when the mouse moves, call the given function
    document.addEventListener( 'mousemove', onDocumentMouseMove, false );




    camera.position.set(0,10, -10);
    camera.lookAt(new THREE.Vector3(0,0,0));

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(docWidth,docHeight );
    renderer.setClearColor(0xCCFFFF)

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.BasicShadowMap;

    for(i=0; i<10;i++){
        loadSquirle();
    }


    document.body.appendChild(renderer.domElement);

    animate();
}



function animate(){
    requestAnimationFrame(animate);

    if(canMoveCamera){
        if(keyboard[87]){ // W key
            camera.position.x -= Math.sin(camera.rotation.y) * player.speed;
            camera.position.z -= -Math.cos(camera.rotation.y) * player.speed;
        }
        if(keyboard[83]){ // S key
            camera.position.x += Math.sin(camera.rotation.y) * player.speed;
            camera.position.z += -Math.cos(camera.rotation.y) * player.speed;
        }
        if(keyboard[65]){ // A key
            camera.position.x += Math.sin(camera.rotation.y + Math.PI/2) * player.speed;
            camera.position.z += -Math.cos(camera.rotation.y + Math.PI/2) * player.speed;
        }
        if(keyboard[68]){ // D key
            camera.position.x += Math.sin(camera.rotation.y - Math.PI/2) * player.speed;
            camera.position.z += -Math.cos(camera.rotation.y - Math.PI/2) * player.speed;
        }

    }

    renderer.render(scene, camera);

    mouseHoverCheck()

}


function removeTreeInfoPopUp(){
    $('.treeInfoPopUp').remove();
}







window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', keyUp);

window.onload = init;


/**
 * @param info Object with keys {'x','y','name','ownerName','ownerLastname','created'}
 */
function addTree(info){
    pathToModel="models/nature/tree"
    var mtlLoader = new THREE.MTLLoader();
    var x=null;
    var y=null;
    if(info){
        x=info['x']
        y=info['y']
    }

    mtlLoader.load(pathToModel + ".mtl",function(materials){

        materials.preload()
        objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials)

        objLoader.load(pathToModel + ".obj",function(mesh){

            mesh.traverse(function(node){
                if( node instanceof THREE.Mesh ){
                    node.castShadow = true;
                    node.receiveShadow = true;
                    node.geometry.computeFaceNormals();
                }
            });

            scene.add(mesh);
            if(x!=null && y!=null){
                mesh.position.set(x, 0, y);

            }else{
                mesh.position.set(randomInNegativeMirrorInterval(50), 0, randomInNegativeMirrorInterval(50));

            }

            mesh.rotation.y = -Math.PI/4;
            mesh.receiveShadow=true
            mesh.castShadow=true

            mesh.isTree=true;
            if(info){
                mesh.treeInfo=info
                mesh.treeInfo.created=new Date();

            }else{
                mesh.treeInfo={name:"La Gorda",owner:"Luis Gurmendez",created:"10/10/2016"}
            }

            mesh.scale.multiplyScalar(1.5)

            trees.push(mesh)



        });

    });


}


function render() {
    renderer.render( scene, camera );
}



function validateDonationInputs(){
    var valid = true;
    $('.donationModalInput').each(function(){

        var jThis=$(this)
        if(jThis.val()==''){
            valid=false;
            jThis.css({'border':'2px solid #ff6d6d'})
            setTimeout(function(){
                jThis.css({'border':'2px solid #1ba312'})
            },3000)
        }
    })


    return valid;





}








$(document).ready(function(){

    $('#openDonationModalBtn').click(function(){

        $('#donationModal').show('slow')
        $('#donationBlackScreen').show();
        canMoveCamera=false;


    })

    function hideDonationModal(){

        $('#donationModal').hide('slow')
        $('#donationBlackScreen').hide();
        $('#donationModal .donationModalInput').val("")
        canMoveCamera=true;

    }

    $(document).mouseup(function (e) {
        var container = $("#donationModal");

        if (!container.is(e.target) && container.has(e.target).length === 0) {
            if($('#donationModal').is(":visible")){
                hideDonationModal();
            }
        }

        if(isPlantingTree){

            if(!treePositioningDummy.canPlant){
                alert("Can plant there")
            }else{
                var info={"tree[x]":treePositioningDummy.position.x,"tree[y]":treePositioningDummy.position.z,"tree[ownerName]":treePositioningDummy.info["tree[ownerName]"] ,"tree[ownerLastname]": treePositioningDummy.info["tree[ownerLastname]"],"tree[name]":treePositioningDummy.info["tree[name]"]}
                console.log(info)
                $.ajax({
                    url:"http://localhost:3000/tree/new",
                    type:"POST",
                    data:info,
                    success: function(data){
                        var infoObj={'x':info['tree[x]'],'y':info['tree[y]'],'ownerName': info['tree[ownerName]'],'ownerLastname':info['tree[ownerLastname]'],'name':info['tree[name]']}
                        addTree(infoObj)
                        scene.remove(treePositioningDummy)
                        delete treePositioningDummy
                        isPlantingTree=false

                    },
                    error: function(){
                        alert("Error occured")
                    }

                })

            }

        }



    });



    /*
    $('#addTreeBtn').click(function(){
        var rX=randomInNegativeMirrorInterval(50);
        var rY=randomInNegativeMirrorInterval(50);
        var info={"tree[x]":rX,"tree[y]":rY,"tree[ownerName]":$('.donationModalInput[name=ownerName]').val() ,"tree[ownerLastname]": $('.donationModalInput[name=ownerLastname]').val(),"tree[name]":$('.donationModalInput[name=treeName]').val()}
        $.ajax({
            url:"http://localhost:3000/tree/new",
            type:"POST",
            data:info,
            success: function(data){
                var infoObj={'x':info['tree[x]'],'y':info['tree[y]'],'ownerName': info['tree[ownerName]'],'ownerLastname':info['tree[ownerLastname]'],'name':info['tree[name]']}
                addTree(infoObj)
                moveCameraTo({x:infoObj['x'],y:infoObj['y']})
            },
            error: function(){
                alert("Error occured")
            }

        })
        hideDonationModal();
    })

    */



    $('#addTreeBtn').click(function(){


        if(validateDonationInputs()){
            // CREATES DUMMY TREE
            pathToModel="models/nature/tree"
            var mtlLoader = new THREE.MTLLoader();

            mtlLoader.load(pathToModel + ".mtl",function(materials){

                materials.preload()
                objLoader = new THREE.OBJLoader();
                objLoader.setMaterials(materials)

                objLoader.load(pathToModel + ".obj",function(mesh){

                    mesh.traverse(function(node){
                        if( node instanceof THREE.Mesh ){
                            node.castShadow = true;
                            node.receiveShadow = true;
                            node.geometry.computeFaceNormals();
                        }
                    });

                    treePositioningDummy=mesh;
                    treePositioningDummy.canPlant=true;
                    treePositioningDummy.canPlant=true;
                    isPlantingTree=true;
                    treePositioningDummy.materialColors=[]
                    for(i=0;i < treePositioningDummy.children[0].material.materials.length;i++ ) {
                        treePositioningDummy.materialColors[i]= treePositioningDummy.children[0].material.materials[i].color.getHex()
                        //treePositioningDummy.children[0].material.materials[i].color.setHex(0x006bff)
                        treePositioningDummy.children[0].material.materials[i].opacity=0.75;
                        treePositioningDummy.children[0].material.materials[i].transparent=true;

                    }

                    treePositioningDummy.info={"tree[ownerName]":$('.donationModalInput[name=ownerName]').val() ,"tree[ownerLastname]": $('.donationModalInput[name=ownerLastname]').val(),"tree[name]":$('.donationModalInput[name=treeName]').val()}
                    hideDonationModal();

                    scene.add(mesh);
                    mesh.rotation.y = -Math.PI/4;
                    mesh.scale.multiplyScalar(1.5)


                });

            });

        }

    })






    $('#zoomInBtn').click(function(){
        if(camera.zoom + 0.5 <= zoom.MAX ){
            $('#zoomOutBtn').removeClass('disable')
            camera.zoom+=0.5
            if(camera.zoom==zoom.MAX){
                $('#zoomInBtn').addClass('disable')
            }
        }
        console.log(camera.zoom)
        camera.updateProjectionMatrix();

    })

    $('#zoomOutBtn').click(function(){
        if(camera.zoom > zoom.MIN){
            $('#zoomInBtn').removeClass('disable')
            camera.zoom-=0.5
            if(camera.zoom==zoom.MIN){
                $('#zoomOutBtn').addClass('disable')
            }
        }
        console.log(camera.zoom)
        camera.updateProjectionMatrix();


    })

    $('#searchTree').focus(function(){
        $('.search-list-wrapper').fadeIn('slow');
        canMoveCamera=false;
    })

    $('#searchTree').focusout(function(){
        canMoveCamera=true;
        setTimeout(function(){
            $('.search-list-wrapper').fadeOut('slow',function(){$(this).empty()});
        },300)
    })

    $('#searchTree').on('focus change paste keyup',function(){
        searchQuery=$(this).val()
        if(searchQuery != ""){
            $.ajax({
                url:"http://localhost:3000/tree/search",
                type:"POST",
                data:{query:searchQuery},
                success: function(data){
                    searchList=""
                    data=data.data
                    for (i = 0; i < data.length; i++) {
                        searchList +="<div class='list-element' data-x='" + data[i]['x']+ "' data-y='" + data[i]['x']+ "'><span >" + data[i]['ownerName'] + " " + data[i]['ownerLastname'] + " <span style='padding-left:3px;color:grey'>" + data[i]['name'] +  "</span></span></div>"
                    }
                    $('.search-list-wrapper').empty();
                    $('.search-list-wrapper').append(searchList);
                    $('.list-element').click(function(){
                        moveCameraTo({"x":$(this).data("x"),"y":$(this).data("y")})
                    })

                }
            })
        }


    })

   function getAllTrees(){
       $.ajax({
           url:"http://localhost:3000/tree/get_all",
           type:"GET",
           success: function(data){
               data=data.data
               for(i=0;i< data.length;i++){
                   addTree(data[i])
               }
           },
           error : function(){alert("Error loading trees")}
       })
   }

    getAllTrees();




})


