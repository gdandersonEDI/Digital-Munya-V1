private var activeTexture : int = 0;

public var maxTextures : int;
public var texNumber : int;

function Update () {

	if (Input.GetButtonDown("Wall_Toggle"))
	{
		activeTexture++;
		activeTexture = activeTexture % maxTextures;
		
		if (activeTexture == texNumber)
		{
			GetComponent.<Renderer>().enabled = true;
		}
		else
		{
			GetComponent.<Renderer>().enabled = false;
		}
	}
}