#pragma strict

function Start () {
	Screen.SetResolution (2400, 2400, true);

}

function Update () {
    ScreenCapture.CaptureScreenshot("Screenshot.png");
}