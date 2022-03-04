
var cam1 : Camera;
var cam2 : Camera;

//the transforms of the target that can be selected
var target0: Transform;
var target1: Transform;
var target2: Transform;
var target3: Transform;

//the place you want to spawn selected item
var viewPoint: Transform;
var spawnPoint:  Transform;

//gui variables
//var myBox : GUIStyle;

//holds the transform of spotlights
var lamp: Transform;
var scaleRatio = 1.2;

//private vars
private var selection : Transform;
private var sel = 0;

//compiles targets into array for simplicity
private var targets = new Array(4);

//wrapper class for target that holds info
class myTarget{
	var obj;
	var ratio;
	var oldScale;
	var newScale;
	var offset;
	var oldY;
	
	//constructor to initialize target variables
	function myTarget(object, scaleRatio){
		obj = object;
		ratio = 0.0;  //current scale
		
		//holds original scale data
		oldScale = [object.localScale.x, 
								object.localScale.y, 
								object.localScale.z];
					
		//holds largest scale allowed
		newScale = [oldScale[0] * scaleRatio,
								oldScale[1] * scaleRatio,
								oldScale[2] * scaleRatio];
							
		//holds difference in scale factors
		offset = [newScale[0] - oldScale[0],
							newScale[1] - oldScale[1],
							newScale[2] - oldScale[2]];
							
		//holds original y coord
		oldY = object.position.y;
	
	}
}

//holds where to return to
private var returnPoint;
private var returnCam;

//adds data to objects
function Start(){
	
	targets[0] = new myTarget(target0, scaleRatio);
	targets[1] = new myTarget(target1, scaleRatio);
	targets[2] = new myTarget(target2, scaleRatio);
	targets[3] = new myTarget(target3, scaleRatio);
}

//creates a gui to instruct the user
function OffGUI(){
		//finds location to make box
		x = Screen.width / 2 - Screen.width/3;
		y = Screen.height / 2 + Screen.height/5;
		
		//creates a gui box with a message
		//GUI.Box(Rect(x, y, Screen.width/6, Screen.height/10), "Click on an object below!", myBox);
}


//checks every frame for hits
function Update () {
		var ray: Ray = Camera.main.ScreenPointToRay(Input.mousePosition);
		var hit: RaycastHit;
		//used to determine if target was hit
		var gotOne = false;
		
		//if ray hits something
		if (Physics.Raycast(ray, hit)){
			//check against all targets
			gotOne = CheckTargets(hit, gotOne);
				
		}
		
		
		//if a miss, moves lamps out of sight
		if (!gotOne){
			//moves it just right of scene
			lamp.position.x = 100;
			
			//destroy in other view
			if (sel == 1 ){
				Destroy(selection.gameObject);
				sel = 0;
			}
		}
		
	
}

//checks if a target was hit, if so, will scale, light, and put in other view
//returns true if hit, false if not
function CheckTargets(hit, flag){
	//iterates targets
	for (i = 0; i < targets.length; i++){
				
		//if it matches target
		if (hit.transform == targets[i].obj){
		
			//handles a hit object
			HitObject(targets[i]);
			//marks that object was hit
			flag = true;
			
		}//if it misses target and is enlarged
		else if (targets[i].ratio > 0){
		
			//Scales down missed objects
			ScaleDown(targets[i]);
		}
	}
	//returns 1 if hit a target, 0 if missed
	return flag;
}

//handles a hit object
function HitObject(tar){
	//moves lamp
	lamp.position.x = tar.obj.position.x;

	//if we haven't already made an object
	if (sel == 0){
		//make one at the spawn point
		selection = Instantiate(tar.obj, viewPoint.position, Quaternion.identity);
		selection.position.y += tar.oldScale[1]/2;
		sel = 1;
	}
	
	//if mouse is clicked on target
	if (Input.GetMouseButton(0)){
		//add object to spawn point
		//selection = Instantiate(tar.obj, spawnPoint.position, Quaternion.identity);
	
		//return to game
		GoBack();
	}

	//if not at final scaled position
	if (tar.ratio < 1.0){
		//scales up hit object
		ScaleUp(tar);
	}
}

//scales up hit object
function ScaleUp(tar){
	//finds ratio to use for smooth scaling
	tar.ratio = Mathf.Lerp(tar.ratio, 1, 4 * Time.deltaTime);
	
	ScaleIt(tar);
}

//scales down missed object
function ScaleDown(tar){
	//resets ratio
	tar.ratio = Mathf.Lerp(tar.ratio, 0, 4 * Time.deltaTime);
					
	ScaleIt(tar);
}

function ScaleIt(tar){
	//repositions target so it will still be above floor
	//tar.obj.position.y = tar.ratio * tar.offset[1]/2 + tar.oldY;
			
	//scales target
	tar.obj.localScale.x = tar.oldScale[0] + (tar.ratio * tar.offset[0]);
	tar.obj.localScale.y = tar.oldScale[1] + (tar.ratio * tar.offset[1]);
	tar.obj.localScale.z = tar.oldScale[2] + (tar.ratio * tar.offset[2]);
}

//starts this script and enables cameras
function StartChoose(script){
	//holds script as return point
	returnPoint = script;
	returnCam = returnPoint.cam;
	
	//turns on script and cameras
	enabled = true;
	cam1.enabled = true;
	cam2.enabled = true;

}

//returns to other portion of game, cancels this script
function GoBack(){
	//disables this script and cameras
	enabled = false;
	cam1.enabled = false;
	cam2.enabled = false;
	
	returnPoint.Finished();
}