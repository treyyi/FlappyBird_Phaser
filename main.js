var highScore = 0;
var mainState = {

  preload: function() {
    // Load the bird and pipe image
    // 일단은 preload는 게임하는 동안 쓸 소스들을 로드하는거라고 보면 되겠다
    game.load.image('bird', 'assets/bird.png');
    game.load.image('pipe', 'assets/pipe.png');
  },

  create: function() {
    // change the background color to blue
    game.stage.backgroundColor = '#71c5cf';
    // Horizontally center the canvas
    game.scale.pageAlignHorizontally = true;

    // Set the built-in physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    // Initialize the location of the bird at x=100, y=245
    // 자바스크립트에서 this는 어떤 역할을 하는지 궁금하다
    // bird변수에는 'bird'라는 이름을 가진 이미지를 좌표에 추가되어있는것이다
    // this를 쓰면 var을 써서 변수라고 선언하지 않아도 되는건가?
    this.bird = game.add.sprite(100, 245, 'bird');

    // Apply physics system to the Bird
    // physics system: movement, gravitiy, collision, etc
    game.physics.arcade.enable(this.bird);

    // Apply gravity to the bird
    // bird의 속성에는 body말고 뭐가 있을까?
    // 중력을 y방향으로 적용하는건가? x방향이나 다른 방향으로 적용하게 하려면 어떻게 하는걸까?
    this.bird.body.gravity.y = 1000;

    // Call 'jump' function when the spacebar is hit
    // ('jump' is NOT BUILT-IN FUNCTION)
    // 먼저 스페이스키를 게임 키보드 인풋에 등록하고 spaceKey 변수에 저장한다
    // 키보드에 함수 적용하는 방법:
    //    game.input.keyboard.addKey(등록하고싶은 키)
    //    +키보드의 상태(여기서는 키보드를 눌렀을때)
    //    +적용할 built-in함수
    var spaceKey = game.input.keyboard.addKey(
                  Phaser.Keyboard.SPACEBAR);
    spaceKey.onDown.add(this.jump, this);
    // Add touch event for mobile device (work wtih mouse as well)
    game.input.onDown.add(this.jump, this)

    // Move the anchor to the left and downward
    // for a wide movement for changing angle
    this.bird.anchor.setTo(-0.2, 0.5);

    // Create an empty group
    // pipes변수를 만듬
    this.pipes = game.add.group();
    // Set a timer to the pipe move left every 1.5 seconds
    // 새로운 pipes row를 1.5초마다 만들어준다.
    // 왼쪽으로 움직이는 속도는 그대로 -350이다.
    this.timer = game.time.events.loop(1500, this.addRowOfPipes, this);

    // Initialize the score board
    this.score = 0;
    this.labelScore = game.add.text(20, 20,
                      "0", { font: "30px Arial", fill: "#ffffff"});

    // This is for a high score record
    this.labelHighScore = game.add.text(20, 50,
                      "HS: " + highScore, { font: "30px Arial", fill: "#0000FF"});

  },

  // Call 60 times every second
  update: function() {
    // If the bird is out of range of y
    // Call 'restartGame' function (NOT BUILT-IN FUNCTION)
    if (this.bird.y < 0 || this.bird.y > 490)
      this.restartGame();

    // Add angle to the bird (left bottom point will be going up)
    if (this.bird.angle < 20)
      this.bird.angle += 1;

    // Collision checking to restart the game
    game.physics.arcade.overlap(
      this.bird,
      this.pipes,
      this.hitPipe,
      null,
      this);
  },

  // If I'm right, Phraser call preload, create, and update function first
  // Therefore, now all the variables Initialized above can be used below
  jump: function() {
    // Prevent the bird
    if (this.bird.alive == false)
      return;

    // Vertical velocity
    this.bird.body.velocity.y = -350;

    // Create an animation on the bird for smooth angle changes
    var animation = game.add.tween(this.bird);

    // Change the angle to -20 in 0.1 second
    animation.to({angle: -20}, 100);
    animation.start();
  },

  // Add one pipe with physics system, velocity, and boundary checks applied
  addOnePipe: function(x, y) {
    // Set one pipe and its position
    var pipe = game.add.sprite(x, y, 'pipe');

    // Add one pipe to the pipes group
    this.pipes.add(pipe);

    // Apply physics system to the pipes
    // 1. 왜 pipe를 pipes에 먼저 추가한 다음에 물리엔진을 적용 시키는 걸까?
    // 2. group이 어떻게 구성된건지, add라는게 set에 원소하나를 추가하는건지..
    // 아니면 pipes라는 타이틀을 걸어준걸까?
    game.physics.arcade.enable(pipe);

    // Add velocity to the pipe to make it move left
    pipe.body.velocity.x = -200;

    // Autometically kill the pipe when it's no longer visible
    // 이 두개의 메소드들은 특히 나에게 더 magic으로 다가온다.
    // 일단 bound 체크는 알겠는데 worldbound는 뭐하는건지 모르겠다.
    pipe.checkWorldBounds = true;
    pipe.outOfBoundsKill = true;
  },

  // Add 6 pipes
  // Big deal은 아니지만, 가로로 파이프들이 생기는게 아니고,
  // 세로방향으로 생기는것이기 때문에 addColomnOfPipes가
  // 더 맞는 이름이지 않을까 생각된다.
  addRowOfPipes: function() {
    // Pick a number randomly in between 1 and 5
    // js random 메소드는 어떻게 사용되는지 궁금하다
    var hole = Math.floor(Math.random() * 5) + 1;

    // Add the 6 pipes
    // 마지막에 +10 해주는건, 각 pipe sprites의 간격이다
    // 어떻게 화면 밖에 그려도 에러가 안뜨는걸까?
    // x좌표가 400이 시작점인데, 화면크기의 x최대값이 400이다
    for (var i = 0; i < 8; i++)
      if (i != hole && i != hole +1)
        this.addOnePipe(400, i * 60 + 10);

    // Increase the score
    this.score += 1;
    this.labelScore.text = this.score;

    // Save the highest score
    if (this.score >= highScore) {
      highScore = this.score;
      this.labelHighScore.text = "HS: " + highScore;
    }

  },

  // create함수에서 overlap의 callback함수이다.
  // bird와 pipe가 충돌했을때, 즉 overlap이 true값을 반환할때,
  // hitPipe가 callback함수로써 호출된다.
  hitPipe: function() {
    // If the bird already hit a pipe, then do nothing
    if (this.bird.alive == false)
      return;

    // Set the bird's alive value to false
    // Why tho? 한번 hitPipe함수가 호출되면 그냥 바로 alive == false되는건데?
    this.bird.alive = false;

    // Prevent new pipes from apearing
    // 위에 create함수에서 만들었던 this.timer를 지움으로써
    // 파이프가 움직이지 않도록하고, 새로운 파이프가 생기는것을 방지한다.
    // 파이프가 왼쪽으로 움직이는것은 addOnePipe함수안에서 실행이 되고,
    // 새로운 row of pipes는 addRowOfPipes에서 만든다.
    game.time.events.remove(this.timer);

    // Stops each pipes from moving to left
    // parameter 'p' is each child that belongs to the group (pipes)
    this.pipes.forEach(function(p){
      p.body.velocity.x = 0;
    }, this);

  },

  restartGame: function() {
    // Simply start the game again
    game.state.start('main');
  },
};

// Global variable and the unit of the parameter is px
var game = new Phaser.Game(400, 490);

game.state.add('main', mainState);
game.state.start('main');
