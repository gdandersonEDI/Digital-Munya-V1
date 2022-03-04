var cam: Camera;

private var player;
private var playerScript;

function OnTriggerEnter(other : Collider){
	//uses collision data to get player
	player = other.gameObject;
	playerScript = player.GetComponent(PlayerController);
	
	//stops player and camera
	playerScript.playerOn = false;
	cam.enabled = false;
	
	//starts item selection
	script = this.GetComponent(Question);
	script.Init(this);
}

function Finished(){
	//turns on player and camera again
	playerScript.playerOn = true;
	cam.enabled = true;
	
	//Destroys the collider
	Destroy(this.gameObject);
}