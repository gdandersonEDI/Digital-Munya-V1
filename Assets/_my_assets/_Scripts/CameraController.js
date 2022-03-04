/*requires 6 inputs

- CameraX - pos and neg axes
- CameraY - pos and neg axes
- CameraToggle1 - button
- CameraToggle3 - button
- CameraZoom - pos and neg axes

*/

//public declarations (tweakables)
var target : Transform;
var dist = 2.0;
var zoomMinLimit = 2.0;
var zoomMaxLimit = 4.0;

//private declarations
private var xSpeed = 180.0;
private var ySpeed = 140.0;
private var zoomSpeed = 600;
private var yMinLimit = 0;
private var yMaxLimit = 80;
private var cameraMode = "third";

//hold current position of camera (absolute)
private var xAngle = 0.0;
private var yAngle = 0.0;

//adds script to component menu
@script AddComponentMenu("Camera-Control/Camera Controller")

//called on initialization
function Start(){

	//loads initial position of camera to vars
	var angles = transform.eulerAngles;
	//angle of cam xAngle from global xAngle
	xAngle = angles.y;
	//angle of cam yAngle from global horizontal
	yAngle = angles.x;
	
	distance = 2.0;

}

//called once per frame after other updates
function LateUpdate(){
	cameraMode = "first";
	//puts distance to zero, placing camera at eyes
	dist = 0.0;



		
		//loads rotation of character
		characterRot = target.transform.eulerAngles.y;
		//forces angle of camera to the same
		xAngle = characterRot;
		
		//gets rotation between current and character view
		rotation = Quaternion.Slerp(
						transform.rotation,		//last position
						Quaternion.Euler(0, characterRot, 0),	//position of character
						Time.deltaTime * 3);	//movement speed
		
		//updates position
		position = rotation * Vector3(0.0, 0.0, -dist) //rot applied to distance
		+ target.position;  //added to targets position (making it relative)
		
		//applies transforms to camera
		transform.rotation = rotation;
		transform.position = position;
	
	
}

//forces angle between min and max values
function ClampAngle(angle : float, min : float, max : float){
	//ensures angles are in range
	if (angle < -360){
		angle += 360;
	}
	if (angle > 360){
		angle -= 360;
	}
	//and calls lib func
	return Mathf.Clamp(angle, min, max);
}