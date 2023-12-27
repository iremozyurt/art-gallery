//-------------------------------------------------
// Title: scene.js
// Author: Berkay Özek
// Author: Berke Öcal
// Section: 1
// Assignment: 10
//-------------------------------------------------
const animObjs = []
const objects = [];
let container, scene, camera, renderer, controls, stats;
let clock = new THREE.Clock();
let customUniforms, earthMesh;
let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;

// custom global variables
let cube;

// initialization
init();

// animation loop / game loop
animate();

///////////////
// FUNCTIONS //
///////////////

function init() {

	scene = new THREE.Scene();

	var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
	var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
	camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
	scene.add(camera);

	camera.position.set(0, 150, 400);
	camera.lookAt(scene.position);

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

	container = document.getElementById('ThreeJS');
	container.appendChild(renderer.domElement);

	controls = new THREE.PointerLockControls(camera, document.body);

	scene.add(controls.getObject());

	document.body.addEventListener('click', function () {

		controls.lock();

	}, false);

	const onKeyDown = function (event) {

		switch (event.code) {

			case 'ArrowUp':
			case 'KeyW':
				moveForward = true;
				break;

			case 'ArrowLeft':
			case 'KeyA':
				moveLeft = true;
				break;

			case 'ArrowDown':
			case 'KeyS':
				moveBackward = true;
				break;

			case 'ArrowRight':
			case 'KeyD':
				moveRight = true;
				break;

			case 'Space':
				if (canJump === true) velocity.y += 350;
				canJump = false;
				break;

		}
	};

	const onKeyUp = function (event) {
		switch (event.code) {

			case 'ArrowUp':
			case 'KeyW':
				moveForward = false;
				break;

			case 'ArrowLeft':
			case 'KeyA':
				moveLeft = false;
				break;

			case 'ArrowDown':
			case 'KeyS':
				moveBackward = false;
				break;

			case 'ArrowRight':
			case 'KeyD':
				moveRight = false;
				break;

		}

	};

	document.body.addEventListener('keydown', onKeyDown);
	document.body.addEventListener('keyup', onKeyUp);


	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.bottom = '0px';
	stats.domElement.style.zIndex = 100;
	container.appendChild(stats.domElement);

	///////////
	// LIGHT //
	///////////

	var light1 = new THREE.PointLight(0xfffaf4, 1);
	light1.position.set(0, 40, 0);
	scene.add(light1);

	var light1 = new THREE.PointLight(0xfffaf4, 1);
	light1.position.set(-350, 50, -450);
	scene.add(light1);

	const directionalLight = new THREE.DirectionalLight(0xfffaf4, 2);
	directionalLight.position.set(0, 200, 0)
	scene.add(directionalLight);

	const ambientLight = new THREE.AmbientLight(0xcccccc, 0.1);
	scene.add(ambientLight);

	//////////////
	// GEOMETRY //
	//////////////
	createArtTable(-300, 50, -450);
	createObjectOBJ("objects/Moon 2K.obj", -300, 150, -450, 30, [90, 90, 0], false);

	createArtTable(-100, 50, -450);
	createObjectOBJ("objects/Laptop_High-Polay_HP_BI_2_obj.obj", -100, 100, -450, 20, [0, 0, 0], false);


	createArtTable(100, 50, -450);
	createObjectOBJ("objects/091_W_Aya_100K.obj", 100, 50, -450, 0.1, [0, 0, 0], false);

	createArtTable(300, 50, -450);
	createObjectOBJ("objects/11091_FemaleHead_v4.obj", 300, 100, -450, 10, [0, 90, 0], true);


	createArtTable(-300, 50, 450);
	createObjectOBJ("objects/13906_Saturn_v1_l3.obj", -300, 120, 450, 0.1, [-90, 0, -180], true);

	createArtTable(-100, 50, 450);
	createObjectOBJ("objects/Clock_obj.obj", -100, 150, 450, 122, [0, 0, 0], false);

	createArtTable(100, 50, 450);
	createObjectOBJ("objects/car.obj", 100, 150, 450, 30, [-90, 180, 0], false);


	createArtTable(300, 50, 450);
	createObjectOBJ("objects/Vases.mtl", 290, 100, 450, 65, [0, 90, 0], false);


	///////////
	// FLOOR //
	///////////
	createFloorAndPlanes();


	let skybox = createSkyBox();
	scene.add(skybox);

	window.addEventListener('resize', onWindowResize);
	addShaderedWater();
}

function animate() {
	requestAnimationFrame(animate);
	render();
	update();
}

function update() {
	//controls.update();
	stats.update();

	var delta = clock.getDelta();
	customUniforms.time.value += 0.002;
	earthMesh.rotateY(0.0015)
	animObjs.forEach(obj => {
		obj.rotateZ(0.002)
	})

	pointerLockUpdate();
	stats.update();
}

function pointerLockUpdate()
//-------------------------------------------------
// Summary: This Function Handles the keyboards input to controls camera.
//-------------------------------------------------
{
	const time = performance.now();

	//controls.update();
	if (controls.isLocked === true) {
		const delta = (time - prevTime) / 1000;

		console.log(velocity)

		velocity.x = 0
		velocity.z = 0;

		direction.z = Number(moveForward) - Number(moveBackward);
		direction.x = Number(moveRight) - Number(moveLeft);
		direction.normalize(); // this ensures consistent movements in all directions
		console.log(moveForward, moveBackward, moveLeft, moveRight)
		if (moveForward || moveBackward) velocity.z -= direction.z * 250;
		if (moveLeft || moveRight) velocity.x -= direction.x * 250;


		controls.moveRight(- velocity.x * delta);
		controls.moveForward(- velocity.z * delta);

		controls.getObject().position.y += (velocity.y * delta); // new behavior

	}

	prevTime = time;
}

function render() {
	renderer.render(scene, camera);
}


function createSkyBox()
//-------------------------------------------------
// Summary: It creates SkyBox from Cube Geometry.
// First we create MeshBasicMaterial Array for each 6 side of the cube.
// Then create CubeGeometry and cubeMaterial
// and it creates the Art Table for corresponding the x, y, z paramaters.
//-------------------------------------------------
{
	var cubeMaterials = [
		new THREE.MeshBasicMaterial({ map: new THREE.ImageUtils.loadTexture('images/skybox/arid2_ft.jpg'), side: THREE.DoubleSide }),
		new THREE.MeshBasicMaterial({ map: new THREE.ImageUtils.loadTexture('images/skybox/arid2_bk.jpg'), side: THREE.DoubleSide }),
		new THREE.MeshBasicMaterial({ map: new THREE.ImageUtils.loadTexture('images/skybox/arid2_up.jpg'), side: THREE.DoubleSide }),
		new THREE.MeshBasicMaterial({ map: new THREE.ImageUtils.loadTexture('images/skybox/arid2_dn.jpg'), side: THREE.DoubleSide }),
		new THREE.MeshBasicMaterial({ map: new THREE.ImageUtils.loadTexture('images/skybox/arid2_rt.jpg'), side: THREE.DoubleSide }),
		new THREE.MeshBasicMaterial({ map: new THREE.ImageUtils.loadTexture('images/skybox/arid2_lf.jpg'), side: THREE.DoubleSide }),
	];

	let skyboxGeometry = new THREE.CubeGeometry(10000, 10000, 10000, 1, 1, 1);
	let cubeMaterial = new THREE.MeshFaceMaterial(cubeMaterials);

	return new THREE.Mesh(skyboxGeometry, cubeMaterial);
}

function createFloorAndPlanes()
//-------------------------------------------------
// Summary: First it creates material by using "art-table.png" Texture, 
// and it creates the Art Table for corresponding the x, y, z paramaters.
//-------------------------------------------------
{
	var floorTexture = new THREE.ImageUtils.loadTexture('images/floor.jpg');
	// DoubleSide: render texture on both sides of mesh
	var floorMaterial = new THREE.MeshBasicMaterial({ map: floorTexture, side: THREE.DoubleSide });
	var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 1, 1);
	var floor = new THREE.Mesh(floorGeometry, floorMaterial);
	floor.position.y = -0.5;
	floor.rotation.x = Math.PI / 2;
	scene.add(floor);

	var cubeMaterialArray = [];
	// order to add materials: x+,x-,y+,y-,z+,z-
	var floorTexture = new THREE.ImageUtils.loadTexture('images/floor.jpg');

	for (var i = 0; i < 6; i++) {
		cubeMaterialArray.push(new THREE.MeshBasicMaterial({ map: floorTexture }));
	}
	var cubeMaterials = new THREE.MeshFaceMaterial(cubeMaterialArray);
	// Cube parameters: width (x), height (y), depth (z), 
	//        (optional) segments along x, segments along y, segments along z
	var cubeGeometry = new THREE.CubeGeometry(100, 100, 300, 1, 1, 1);
	// using THREE.MeshFaceMaterial() in the constructor below
	//   causes the mesh to use the materials stored in the geometry
	cube = new THREE.Mesh(cubeGeometry, cubeMaterials);
	cube.position.set(450, 50, -50);
	scene.add(cube);

	var geometry = new THREE.SphereGeometry(100, 100, 100)
	var material = new THREE.MeshPhongMaterial()
	earthMesh = new THREE.Mesh(geometry, material)
	earthMesh.position.set(0, 275, 0);
	earthMesh.rotateY(90)
	earthMesh.material.map = new THREE.ImageUtils.loadTexture('images/earthmap1k.jpg')
	earthMesh.material.bumpMap = new THREE.ImageUtils.loadTexture('images/earthbump1k.jpg')
	earthMesh.material.bumpScale = 0.05
	cube.add(earthMesh)
}

function createArtTable(x, y, z)
//-------------------------------------------------
// Summary: First it creates material by using "art-table.png" Texture, 
// and it creates the Art Table for corresponding the x, y, z paramaters.
//-------------------------------------------------
{
	var material = new THREE.MeshBasicMaterial({
		map: new THREE.ImageUtils.loadTexture('images/art-table.png'),
		wireframe: false
	});

	const geometry = new THREE.CubeGeometry(50, 100, 50);
	const cube = new THREE.Mesh(geometry, material);
	cube.position.set(x, y, z);
	scene.add(cube);
}

function addShaderedWater()
//-------------------------------------------------
// Summary: This method adds Shadered Water into scene.
//-------------------------------------------------
{
	var noiseTexture = new THREE.ImageUtils.loadTexture('images/cloud.png');
	noiseTexture.wrapS = noiseTexture.wrapT = THREE.RepeatWrapping;

	var waterTexture = new THREE.ImageUtils.loadTexture('images/water.jpg');
	waterTexture.wrapS = waterTexture.wrapT = THREE.RepeatWrapping;

	// use "this." to create global object
	customUniforms = {
		baseTexture: { type: "t", value: waterTexture },
		baseSpeed: { type: "f", value: 1.15 },
		noiseTexture: { type: "t", value: noiseTexture },
		noiseScale: { type: "f", value: 0.2 },
		alpha: { type: "f", value: 0.8 },
		time: { type: "f", value: 1.0 }
	};

	// create custom material from the shader code above
	//   that is within specially labeled script tags
	var customMaterial2 = new THREE.ShaderMaterial(
		{
			uniforms: customUniforms,
			vertexShader: document.getElementById('vertexShader').textContent,
			fragmentShader: document.getElementById('fragmentShader').textContent
		});

	// other material properties
	customMaterial2.side = THREE.DoubleSide;
	customMaterial2.transparent = true;

	// apply the material to a surface
	var flatGeometry = new THREE.PlaneGeometry(1000, 1000);
	var surface = new THREE.Mesh(flatGeometry, customMaterial2);
	surface.position.set(0, 5, 0);
	surface.rotation.set(THREE.Math.degToRad(90), THREE.Math.degToRad(0), THREE.Math.degToRad(0));
	scene.add(surface);
}

function createObjectFBX(path, x, y, z, scale, rotate, isAnimate)
//-------------------------------------------------
// Summary: It Loads the FBX object into scene.
// This method also sets position, scale and rotation of the loaded object.
//-------------------------------------------------
{
	const fbxLoader = new THREE.FBXLoader()
	fbxLoader.load(
		path,
		(object) => {
			console.log(object)
			object.position.set(x, y, z);
			object.scale.set(scale, scale, scale);
			object.name = path;
			object.rotation.set(THREE.Math.degToRad(rotate[0]), THREE.Math.degToRad(rotate[1]), THREE.Math.degToRad(rotate[2]));
			scene.add(object)

			if (isAnimate) {
				animObjs.push(object)
			}
		},
		(xhr) => {
			console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
		},
		(error) => {
			console.log(error)
		}
	)
}

function createObjectOBJ(path, x, y, z, scale, rotate, isAnimate)
//-------------------------------------------------
// Summary: It Loads the OBJ object into scene.
// This method also sets position, scale and rotation of the loaded object.
//-------------------------------------------------
{
	// load a resource
	let mtlLoader = new THREE.MTLLoader();
	mtlLoader.baseUrl = "objects/"
	var materialURL = path.replace(".obj", ".mtl");
	console.log(materialURL, path)
	mtlLoader.load(materialURL, (materials) => {

		materials.preload();
		var objLoader = new THREE.OBJLoader();
		objLoader.setMaterials(materials);
		objLoader.load(path, (object) => {

			object.position.set(x, y, z);
			object.scale.set(scale, scale, scale);
			object.name = path;
			object.rotation.set(THREE.Math.degToRad(rotate[0]), THREE.Math.degToRad(rotate[1]), THREE.Math.degToRad(rotate[2]));
			object.materials = materials;
			scene.add(object);
			if (isAnimate) {
				animObjs.push(object)
			}
		}, (xhr) => {
			console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
		},
			(error) => {
				console.log(error)
			});

	}, (xhr) => {
		console.log((xhr.loaded / xhr.total) * 100 + '% loaded Material')
	},
		(error) => {
			console.log(error)
		});
}

function onWindowResize()
//-------------------------------------------------
// Summary: When the window of the browser changed this function will executed.
//-------------------------------------------------
{

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}