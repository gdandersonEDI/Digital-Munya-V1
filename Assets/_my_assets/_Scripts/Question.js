
//gui variables
var myBox : GUIStyle;

//variable for the bg image
var bg_image : Texture2D;

//starts off
enabled = false;

//holds where to return to
private var returnPoint;
private var returnCam;

//creates a gui to instruct the user
function OnGUI(){
		//creates a gui box with a message
		GUI.Box(Rect(0, 0, Screen.width, Screen.height), GUIContent("", bg_image), myBox);
}

//starts this script and enables cameras
function Init(script){
	//holds script as return point
	returnPoint = script;
	returnCam = returnPoint.cam;
	
	//turns on script and cameras
	enabled = true;
}

function Update()
{
	if(Input.GetButtonDown("Measure_Toggle"))
	{
		//disables this script and returns
		enabled = false;
		
		returnPoint.Finished();
	}

}