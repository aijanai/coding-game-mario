var initScriptEngine = function(){

  //can you take a ladder?
  window.atLadder=false;

  //are you at the canyon?
  window.atCanyon=false;

  //are you at the princess?
  window.atPrincess=false;

  //have you got the ladder?
  window.hasLadder=false;

  //can you cross the canyon (because you put the ladder on it)?
  window.canyonTraversable=false;

  //where the ladder is
  window.ladderLocation=-3;

  //where the canyon is
  window.canyonLocation=11;

  //where the princess is
  window.princessLocation=14;

  //where the hero is
  window.heroLocation=0;

  //the code generated
  var plan='';

  //flag for syntax checking during code generation
  var inCondition=false;
  var justClosedWhile=false;

  //current execution step
  var currentStep=1;

  //list of actions for the B panel
  var planList=new Array();

  //call trace to move the viewPort
  var callTrace= new Array();

  //maximum execution steps allowed to prevent infinite loops
  var maxSteps=100;

  //victory flag, to fix final check
  gameOver=false;

  //container for current instruction
  var scriptedAction=$('<div>');

  //add visible element to script list
  $('#scriptContainer').append(scriptedAction);

  //printable actions map
  var stringActions=new Array();
  stringActions['takeLadder']= 'hai preso la scala';
  stringActions['dropLadder']= 'hai posato la scala';
  stringActions['walkRight']= 'cammini a destra';
  stringActions['walkLeft']= 'cammini a sinistra';
  stringActions['AtLadder']= 'sei alla scala, ';
  stringActions['AtCanyon']= 'sei al canyon, ';
  stringActions['AtPrincess']= 'sei alla principessa, ';
  stringActions['HasLadder']= 'hai la scala, ';


  //checks whether the player won
  function checkGameOutcome(){
    //if you are at the princess, announce victory
    if(AtPrincess()){
      message='you got at the princess: you won';
      gameLog(message);
      gameOver=true;

      //add to list function calls for the viewport (filter actions that have no graphical relevance)
      callTrace.push('winGame');
      viewportFunctions.playAnimation(['winGame']);
    }

    //if you reached maximum number of steps, terminate
    if(currentStep >= maxSteps){
      loseGame();
    }
  }

  //increments game step, checks if maximum has been reached and takes action;
  function incrementStepAndCheckExecutionTime(){
    //increment step and check if maximum;
    currentStep+=1;

    //checks victory
    checkGameOutcome();
  }

  //populate the output log
  function gameLog(message){
    //add to list of game events to be sent to B
    planList.push(message);

    //debug in panel A
    console.log(message);
  }

  //check if you have a ladder
  function HasLadder(){
    if(hasLadder) gameLog('you got the ladder');
    else gameLog('you have no ladder');

    return hasLadder;
  }


  //check if you are not at the princess
  function AtPrincess(){
    if(atPrincess) gameLog('you are at the princess');
    else gameLog('you are not yet at the princess');

    return atPrincess;
  }

  //check if you are not at the ladder
  function AtLadder(){
    if(atLadder) gameLog('you are at the ladder');
    else gameLog('you are not yet at the ladder');

    return atLadder;
  }

  //check if you are not at the canyon
  function AtCanyon(){
    if(atCanyon) gameLog('you are at the canyon');
    else gameLog('you are not yet at the canyon');

    return atCanyon;
  }

  //check if the player can reach ladder and canyon
  function updateSurroundingStatus(){
    atCanyon=heroLocation == canyonLocation;
    atLadder=heroLocation == ladderLocation;
    atPrincess=heroLocation == princessLocation;
  }

  //move right
  function walkRight(){
    //count time
    incrementStepAndCheckExecutionTime();

    //check whether you can move past the canyon
    if (atCanyon){
      if(canyonTraversable){
        //move past
        heroLocation+=1;

        //add to list function calls for the viewport
        callTrace.push(arguments.callee.name);

        //update log
        gameLog('you walk over the canyon');

        //winning status, perform check
        checkGameOutcome();
      }else{
        //deny the action
        gameLog('can\'t walk: there is a canyon');
      }
    }else{
      //move right
      heroLocation+=1;

      //add to list function calls for the viewport
      callTrace.push(arguments.callee.name);

      //output log
      gameLog('you walk right');
    }

    //if you have the ladder, the ladder moves with you
    if(hasLadder){
      //update ladder location
      ladderLocation=heroLocation;
    }

    //check what you have at reach
    updateSurroundingStatus();
  }

  //move left
  function walkLeft(){
    //count time
    incrementStepAndCheckExecutionTime();

    //move left
    heroLocation-=1;

    //add to list function calls for the viewport
    callTrace.push(arguments.callee.name);

    //if you have the ladder, the ladder moves with you
    if(hasLadder){
      //update ladder location
      ladderLocation=heroLocation;
    }

    //output log
    gameLog('you walk left');

    //check what you have at reach
    updateSurroundingStatus();
  }

  //take ladder, if you can
  function takeLadder(){
    //count time
    incrementStepAndCheckExecutionTime();

    //output log
    gameLog('you try to take the ladder');

    //check whether you can take the ladder
    if(atLadder){
      //take it
      hasLadder=true;

      //add to list function calls for the viewport
      callTrace.push(arguments.callee.name);

      //output log
      gameLog('you got the ladder');
    }else{
      //deny the action
      gameLog('there is no ladder to take');
    }
  }

  //drop ladder, if you have it
  function dropLadder(){
    //count time
    incrementStepAndCheckExecutionTime();

    //check if you have it
    if(hasLadder){
      //drop it
      hasLadder=false;

      //add to list function calls for the viewport (filter actions that have no graphical relevance)
      callTrace.push(arguments.callee.name);

      //update ladder location
      ladderLocation=heroLocation;

      //special case: dropping it on the canyon makes it traversable
      if(atCanyon){
        //update world status
        canyonTraversable=true;

        //output special log
        gameLog('you drop the ladder over the canyon');
      }else{
        //output log
        gameLog('you drop the ladder');
      }
    }else{
      //deny action
      gameLog('you didn\' have any ladder to drop');
    }

    //check what you have at reach
    updateSurroundingStatus();
  }



  //wheneven the player clicks on an action
  $('.play').on('click',function(){
    decodeAndExecute($(this))
  });

  function passControl(button){
    button=$(button)

    //hide button
    button.hide()
    button.removeClass('play')

    //enable button on next one
    let next_button=$("div.instructionContainerRow.virgin").first().children('button')
    next_button.addClass('play')

    //reveal next one
    $("div.instructionContainerRow.virgin").first().removeClass('virgin')

    //bind chain of events to current button
    next_button.bind('click',function(){

      decodeAndExecute($(this))
    })
  }

  function decodeAndExecute(button){

    //get action
    let input=button.siblings("input.action")

    //get action name
    let instruction=input.data("action");
    let value=input.val()
    let expected_instruction_as_id=input.attr("id")


    if (value == expected_instruction_as_id){

      console.log(value+" == "+expected_instruction_as_id)

      //instructionify
      current_instruction=instruction+'();'

      //execute
      eval(current_instruction);

      //log
      console.log(current_instruction);

      //play animation
      viewportFunctions.playAnimation([current_instruction]);

      //generate output in the log container
      scriptedAction.append($('<span>').text(stringActions[instruction]+", "));

      //enable next button
      passControl(button)
    }else{
      console.log(value+" != "+expected_instruction_as_id)
    }

    //check how it goes
    checkGameOutcome();
    console.log("ok")
  }

  //reset game
  $('#reset').on('click',function(){
    location.reload()
  });

};

window.initScriptEngine = initScriptEngine
