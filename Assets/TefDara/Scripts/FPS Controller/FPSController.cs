using System.Collections.Generic;
using UnityEngine;
using System;
using System.Collections;
using TefDara.MouseLook;
using TefDara.OK.Input;

public enum PlayerMoveState { Idle, Walking, Running, Airborn, Landing, Crouching }
public enum CurveControllerBobCallBackType { Horizontal, Vertical }

public delegate void CurveControlBobCallBack();

[Serializable]
public class CurveControlledBobEvent
{
    public float Time = 0f;
    public CurveControlBobCallBack Function = null;
    public CurveControllerBobCallBackType Type = CurveControllerBobCallBackType.Vertical;
}

[Serializable]
public class CurveControlledBob
{
    [SerializeField] AnimationCurve bobCurve = new AnimationCurve();

    [SerializeField] float horizontalMultiplier = 0.01f;
    [SerializeField] float verticalMultiplier = 0.02f;
    [SerializeField] float verticaltoHorizontalSpeedRatio = 2.0f;
    [SerializeField] float baseInterval = 1f;

    private float prevXPlayhead;
    private float prevYPlayhead;
    private float xPlayHead;
    private float yPlayHead;
    private float curveEndTime;
    private List<CurveControlledBobEvent> events = new List<CurveControlledBobEvent>();

    public void Init()
    {
        curveEndTime = bobCurve[bobCurve.length - 1].time;
        xPlayHead = 0f;
        yPlayHead = 0f;
        prevXPlayhead = 0f;
        prevYPlayhead = 0f;
    }

    public void RegisterEventCallBack(float time, CurveControlBobCallBack function, CurveControllerBobCallBackType type)
    {
        CurveControlledBobEvent ccbeEvent = new CurveControlledBobEvent();
        ccbeEvent.Time = time;
        ccbeEvent.Function = function;
        ccbeEvent.Type = type;
        events.Add(ccbeEvent);

        events.Sort(
            delegate (CurveControlledBobEvent t1, CurveControlledBobEvent t2)
            {
                return (t1.Time.CompareTo(t2.Time));
            }
            );
    }

    public Vector3 GetVectorOffset(float speed)
    {
        xPlayHead += (speed * Time.deltaTime) / baseInterval;
        yPlayHead += ((speed * Time.deltaTime) / baseInterval) * verticaltoHorizontalSpeedRatio;

        if (xPlayHead > curveEndTime) xPlayHead -= curveEndTime;
        if (yPlayHead > curveEndTime) yPlayHead -= curveEndTime;

        for (int i = 0; i < events.Count; i++)
        {
            CurveControlledBobEvent ev = events[i];
            if (ev != null)
            {
                if (ev.Type == CurveControllerBobCallBackType.Vertical)
                {
                    if ((prevYPlayhead < ev.Time && yPlayHead >= ev.Time) || (prevYPlayhead > yPlayHead && (ev.Time > prevYPlayhead || ev.Time <= yPlayHead)))
                    {
                        ev.Function();
                    }
                }
                else
                {
                    if ((prevXPlayhead < ev.Time && xPlayHead >= ev.Time) || (prevXPlayhead > xPlayHead && (ev.Time > prevXPlayhead || ev.Time <= xPlayHead)))
                    {
                        ev.Function();
                    }
                }
            }
        }

        float xPos = bobCurve.Evaluate(xPlayHead) * horizontalMultiplier;
        float yPos = bobCurve.Evaluate(yPlayHead) * verticalMultiplier;

        prevXPlayhead = xPlayHead;
        prevYPlayhead = yPlayHead;

        return new Vector3(xPos, yPos, 0f);

    }
}


[RequireComponent(typeof(CharacterController))]
public class FPSController : MonoBehaviour
{
    public List<AudioSource> audioSources = new List<AudioSource>();
    private int audioToUse = 0;

    public Camera Camera { get => _camera; set => _camera = value;}

    [SerializeField] private float walkingSpeed = 1.0f;
    [SerializeField] private float runSpeed = 5.0f;
    [SerializeField] private float jumpSpeed = 7.5f;
    [SerializeField] private float stickToGroundForce = 5.0f;
    [SerializeField] private float gravityMultiplayer = 2.5f;
    //[SerializeField] private float runStepLengthen = 0.5f;
    [SerializeField] Camera _camera;

    public MouseLookMod mouseLook;

    [SerializeField] CurveControlledBob curveControlledBob = new CurveControlledBob();
    // this is so we can record the camera's initial localspace position 
    private Vector3 localSpaceCameraPos = Vector3.zero;

    private bool jumpButtonPressed = false;
    private Vector3 inputVector = Vector3.zero;
    private Vector3 moveDirection = Vector3.zero;

   

    //inputAxis
    private float horizontal;
    private float vertical;
    public InputListener inputListener;

    private bool previouslyGrounded = false;

    private bool isWalking = true;

    private bool isJumping = false;

    private float fallingTimer = 0.0f;

    private CharacterController characterController;
    private PlayerMoveState playerMoveState = PlayerMoveState.Idle;

    public PlayerMoveState moveState { get { return playerMoveState; } }
    public float WalkSpeed { get { return walkingSpeed; } }
    public float RunSpeed { get { return runSpeed; } }

    public bool CanMove { get => _canMove; set => _canMove = value; }

    public bool doesPause = true;

    [SerializeField] float crouchSmoothing = 1f;
    IEnumerator LerpCharacterHeightRef;
    private float characterInitialHeight;
    private float characterHeight;
    private bool isCrouching = false;
    private bool wasCrouching = false;
    private bool _canMove;
    //private bool _isBelowGround = false;

    private void Awake()
    {
        inputListener.OnMove += v => OnMove(v);
        inputListener.OnLook += v => OnLook(v);
        inputListener.OnRun += b => OnRunButoonPressed(b);
        inputListener.OnJump += OnJump;
        // inputListener.CrouchEvent += b => OnCrouch(b);
    }
    
    private void OnEnable()
    {
        mouseLook.Init(transform, _camera.transform);
        Cursor.lockState = CursorLockMode.Locked;
    }

    private void OnDisable()
    {
        //_camera.transform.rotation = Quaternion.identity;
    }

    private void Start()
    {
        characterController = GetComponent<CharacterController>();
        playerMoveState = PlayerMoveState.Idle;

        fallingTimer = 0.0f;

        localSpaceCameraPos = _camera.transform.localPosition;

        characterInitialHeight = characterController.height;
        characterHeight = characterInitialHeight;

        curveControlledBob.Init();
        curveControlledBob.RegisterEventCallBack(1.5f, PlayFootStepSound, CurveControllerBobCallBackType.Vertical);

        _canMove = true;

    }

    
    private void Update()
    {
        if (characterController.isGrounded) fallingTimer = 0.0f;
        else { fallingTimer += Time.deltaTime; }

        if (Time.timeScale > Mathf.Epsilon)
        {
            mouseLook.LookRotation(transform, _camera.transform);
        }

        if (!previouslyGrounded && characterController.isGrounded)
        {
            if (fallingTimer > 0.5f)
            {
                //play landing animation
            }

            moveDirection.y = 0f;
            isJumping = false;
            playerMoveState = PlayerMoveState.Landing;
        }
        else if (!characterController.isGrounded)
        {
            playerMoveState = PlayerMoveState.Airborn;
        }
        else if (characterController.velocity.sqrMagnitude < 0.01f)
        {
            playerMoveState = PlayerMoveState.Idle;
        }
        else if (isCrouching) playerMoveState = PlayerMoveState.Crouching;
        else if (isWalking) playerMoveState = PlayerMoveState.Walking;
        else playerMoveState = PlayerMoveState.Running;

        previouslyGrounded = characterController.isGrounded;



    }

    private void FixedUpdate()
    {
        bool wasWalking = isWalking;

        float speed = isWalking ? walkingSpeed : runSpeed;

        inputVector = new Vector2(horizontal, vertical);

        if (inputVector.sqrMagnitude > 1) inputVector.Normalize();

        Vector3 desiredMove = transform.forward * inputVector.y + transform.right * inputVector.x;

        RaycastHit hitInfo;

        if (Physics.SphereCast(transform.position, characterController.radius, Vector3.down, out hitInfo, characterController.height / 2f, 1))
        {
            desiredMove = Vector3.ProjectOnPlane(desiredMove, hitInfo.normal).normalized;
        }

        moveDirection.x = desiredMove.x * speed;
        moveDirection.z = desiredMove.z * speed;

        if (characterController.isGrounded)
        {
            moveDirection.y = -stickToGroundForce;

            if (jumpButtonPressed)
            {
                moveDirection.y = jumpSpeed;
                jumpButtonPressed = false;
                isJumping = true;
            }

            if (isCrouching)
            {
                if (LerpCharacterHeightRef != null)
                    StopCoroutine(LerpCharacterHeightRef);

                characterHeight = characterInitialHeight / 2;
                wasCrouching = true;

            }
            if (!isCrouching && wasCrouching)
            {
                if (LerpCharacterHeightRef != null)
                    StopCoroutine(LerpCharacterHeightRef);

                LerpCharacterHeightRef = LerpCharacterHeight();
                StartCoroutine(LerpCharacterHeightRef);
                characterHeight = characterInitialHeight;
                wasCrouching = false;
            }
        }
           

        else
        {
            moveDirection += Physics.gravity * gravityMultiplayer * Time.fixedDeltaTime;
        }

        characterController.height = characterHeight;

        characterController.Move(moveDirection * Time.fixedDeltaTime);
        


    }

    IEnumerator LerpCharacterHeight()
    {
        while (characterHeight < characterInitialHeight)
        {
            characterHeight = Mathf.Lerp(characterHeight, characterInitialHeight, crouchSmoothing * Time.deltaTime);
            yield return null;
        }
        yield break;

    }

    void PlayFootStepSound()
    {
        audioSources[audioToUse].Play();
        audioToUse = (audioToUse == 0) ? 1 : 0;
    }
    private void OnCrouch(bool crouch)
    {
        isCrouching = crouch;
    }

    private void OnJump()
    {
       jumpButtonPressed = true;
    }

    private void OnRunButoonPressed(bool onRun)
    {
        isWalking = !onRun;
    }

    private void OnLook(Vector3 rot)
    {
        mouseLook.MoveRotation = rot;
    }

    private void OnMove(Vector3 moveDir)
    {
        Debug.Log(moveDir);
         horizontal = moveDir.x;
         vertical = moveDir.z;
    }
}
