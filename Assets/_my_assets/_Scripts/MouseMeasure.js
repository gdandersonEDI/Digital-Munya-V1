/*
Required Input:
	Mouse Movement + Left Button
	Toggle - Button to switch measure on and off
*/

//variables that need assignment from user
var line : LineRenderer;  //any old line renderer with 2 point components
var cam : Camera;  //main camera used for viewing scene when you want measuring

//holds the point when mouse was first pressed, and whether mouse is held
private var mousePress : Vector3;
private var mouseHeld : boolean = false;  //also used to determine whether or not to display distance
private var mPlayer;

//holds distance between points
private var dist : double = 0.0;

//small delta distance used to put tape measure on top of objects
private var delta : double = 0.1;

//creates GUI
function OnGUI(){
	//display distance (0.0 if nothing held)
	nDist = dist * 100;
	nDist = Mathf.Round(nDist);
	nDist = nDist / 100;
	GUI.Box (Rect (Screen.width - 110, 10,100,90), "" + nDist + " meters");
	
	//and display an exit measure button
	if (GUI.Button (Rect (10,10,100,80), "Exit")) {
        endMeasure();
    }
}

//called when measure is toggled on
function startMeasure(play){
	//holds player script around
	mPlayer = play;
	
	//enables this script
	this.enabled = true;

}

function endMeasure(){
	//disables this script
	this.enabled = false;
	
	mPlayer.playerOn = true;
}

//called every frame
function Update () {

	//checks for player hitting space to quit
	if (Input.GetButtonDown("Measure_Toggle")){
		endMeasure();
	}

	//if player isn't already holding mouse down
	if (!mouseHeld){
		
		//check to see if mouse was pressed
		if (Input.GetMouseButton(0)){
				
			//find raycast point and store it as original
			mousePress = MouseRayHit();
		
			//mark mouseHeld true, and turns on line
			mouseHeld = true;
			SetLine(0, mousePress);
		}
	
	
	}
	//if player was already holding mouse
	else{
		//if still held down
		if (Input.GetMouseButton(0)){
			line.enabled = true;
			//find raycast point 
			var point2 = MouseRayHit();
			
			//measure distance, and set line
			dist = Vector3.Distance(mousePress, point2);
			SetLine(1, point2);
		}
		//check to see if mouse was released
		else{
		
			//returns state to unheld mouse button
			mouseHeld = false;
			dist = 0.0;
			line.enabled = false;
		}
	
	}
	
}

//Returns point in 3D space that player clicks on
//if misses scene, turns off line
function MouseRayHit(){
	var ray : Ray = cam.ScreenPointToRay(Input.mousePosition);
	var hit:  RaycastHit;
	
	//if Ray hits something
	if (Physics.Raycast(ray, hit)){
		
		//return the point of the collision
		return hit.point;
	}else{
		Debug.Log("Hit nothing!!!");
		line.enabled = false;
	}
		
}

//will set a  point for the line renderer, slightly closer to camera
function SetLine(point : int, location : Vector3) {
	var newVec : Vector3;
	var mat = cam.cameraToWorldMatrix;
	
	//calculates offset towards camera
	//offset = mat.MultiplyPoint(Vector3(0, 0, -delta));
	
	//adds offset
	newVec = location;
	
	//sets new location of point on line
	line.SetPosition(point, newVec);

}