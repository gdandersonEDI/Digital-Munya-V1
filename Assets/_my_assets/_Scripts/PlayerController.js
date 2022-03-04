/* Requires 3 input parameters

- Horizontal - pos and neg axes
- Vertical - pos and neg axes
- Run - button toggle

*/

@script AddComponentMenu("MY Player-Control/Player Controller")

//public declarations (tweakables)
var speed : float = 2.0;
private var playerOn : boolean = true;	//ability to move or not

//private declarations
private var gravity = 9.8;
private var moveDirection : Vector3 = Vector3.zero;
private var charController : CharacterController;

//called when game loads to initialize stuffs
function Start()
{
	//gets character controller to hold around (and move)
    charController = GetComponent(CharacterController);
}

//called each frame to update position, fixed update because a physics motion
function FixedUpdate () 
{
	//if player can't move, immediately quit
	if (!playerOn){
		return;		//this only occurs if you're reading a question
	}
	
	//if character is touching ground
    if(charController.isGrounded == true)
    {
		//rotates you
        transform.eulerAngles.y += Input.GetAxis("Horizontal") * 2.5;
        //calculates the next move direction
        moveDirection = Vector3(0,0, Input.GetAxis("Vertical"));
        moveDirection = transform.TransformDirection(moveDirection);

    }

	//updates move direction for gravity
    moveDirection.y -= gravity * Time.deltaTime;
    
	//and moves you based on commands and gravity
    charController.Move(moveDirection * (Time.deltaTime * speed));
}