public var cam : Camera;
public var obj : GameObject;

private var player;
private var playerScript;

function OnTriggerEnter(other : Collider){
	//uses collision data to get player
	player = other.gameObject;
	playerScript = player.GetComponent(PlayerController);
	
	//stops player and camera
	playerScript.StopPlayer();
	cam.enabled = false;
	
	//starts item selection
	script = obj.GetComponent(MouseTarget);
	script.StartChoose(this);
}

function Finished(){
	//turns on player and camera again
	playerScript.playerOn = true;
	cam.enabled = true;
	
	//Destroys the collider
	Destroy(this.gameObject);

}