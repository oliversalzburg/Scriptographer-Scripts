/**
 * Abstract Foliage Scriptographer Tool
 * by Oliver "gencha" Salzburg
 *
 * www.dirty-motherfucker.org
 */

tool.eventInterval = 1;

// Do you want the path of the mouse to be rendered?
var drawMousePath = true;

// The last point the mouse was at
var lastPoint = new Point( 0, 0 );

// The current direction of the mouse movement
var currentDirection = new Point( 0, 0 );

// The counter that keeps track of the mouse movement
var distanceCounter = 0;

// Use pointsToCurves( ) on finished branches?
var usePointsToCurves = false;

// If set to false, the size of sub branches and their curls is dependant on the speed of the mouse.
// If set to true, the size is only dependant on the values you set (see below).
// NOTE! If you set this to false, make sure the branch sizes are set to very low values!
var normalizeMouseSpeed = true;

var values = {
  // How far do you have to move the mouse until a new branch can be created?
  branchDistance      : 5,

  // The maximum life time of a branch
  maxLifeTime         : 100,

  // The minimum life time of a branch
  minLifeTime         : 80,

  // The maximum amount of branches that can live at any given time
  maxBranches         : 1000,

  /*******************************/
  /* Growth modification section */

  // Minimum branch size
  minBranchSize       : 2,

  // Maximum branch size
  maxBranchSize       : 10,

  // How likely is it that a branch will grow into the opposite movement direction?
  backBranchRate      : 0.35,

  /* Modifiers for branches that grow backwards */
  // The scaling to apply to the curling, higher values will create tighter and smaller curls
  backBranchCurlScale : 5,

  // The scaling to apply to the lifetime, lower values mean shorter life time
  backBranchLifeScale : 0.2,

  /**********************/
  /* Sub-branch section */

  // How likely is it that a branch can spawn another branch?
  // NOTE! This chance is equal in each growth state. Meaning each time the branch growth.
  // This is very often, so too high values will bring Illustrator to it's knees.
  // ...and the result won't look good anyway.
  branchBranchRate    : 0.1,

  // What is the highest age a branch can have so it can spawn another branch?
  // This value is relative to the branches total life time.
  maxBranchAgeToBranch: 0.3,

  // How old does a branch have to be so it can branch at all?
  // This is an absolute value and it should help to limit the branching of deep subbranches.
  minBranchAgeToBranch: 30,

  /*******************/
  /* Blossom section */
  blossomRate         : 0.9
};

function onOptions() {
  var returnValue = Dialog.prompt( 'Abstract Foliage:', {
    branchDistance      : {description: 'branchDistance'},
    maxLifeTime         : {description: 'maxLifeTime'},
    minLifeTime         : {description: 'minLifeTime'},
    maxBranches         : {description: 'maxBranches'},
    minBranchSize       : {description: 'minBranchSize'},
    maxBranchSize       : {description: 'maxBranchSize'},
    backBranchRate      : {description: 'backBranchRate'},
    backBranchCurlScale : {description: 'backBranchCurlScale'},
    backBranchLifeScale : {description: 'backBranchLifeScale'},
    branchBranchRate    : {description: 'branchBranchRate'},
    maxBranchAgeToBranch: {description: 'maxBranchAgeToBranch'},
    minBranchAgeToBranch: {description: 'minBranchAgeToBranch'},
    blossomRate         : {description: 'blossomRate'}
  }, values );

  if( null != returnValue ) values = returnValue;
}


function onMouseDown( event ) {
  lastPoint = event.point;

  branches = [];

  if( drawMousePath ) {
    mainBranch = new Path();
    mainBranch.moveTo( event.point );
    mainBranch.strokeWidth = 0.25;
  }

}

function onMouseUp( event ) {
  for( var i in branches ) {
    branches[ i ].finish();
  }

  if( drawMousePath ) {
    mainBranch.pointsToCurves();
  }
}

function onMouseDrag( event ) {
  if( drawMousePath ) {
    mainBranch.lineTo( event.point );
  }

  currentDirection = event.point - lastPoint;
  currentDirection = currentDirection.normalize() * (Math.random() * 10);

  // Spawn new branches
  if( canBranch() && distanceCounter > values.branchDistance ) {
    var group = new Group();

    // Determine curling direction
    var rotationDirection = ( Math.random() > 0.5 ) ? 1 : -1;

    // Determing branch life time
    var lifeTime = ( Math.random() * ( values.maxLifeTime - values.minLifeTime ) ) + values.minLifeTime;

    // Determine branch direction
    var branchDirection = currentDirection;
    if( Math.random() < values.backBranchRate ) {
      // Grow the branch in the backwards direction
      branchDirection = -branchDirection;

      // Apply back branch modifiers
      rotationDirection *= values.backBranchCurlScale;
      lifeTime *= values.backBranchLifeScale;
    }

    branches.push( new Branch( event.point, group, branchDirection, rotationDirection, lifeTime ) );

    distanceCounter = 0;
  }

  // Grow branches
  for( var i in branches ) {
    var retval = branches[ i ].grow();
    if( retval == false ) {
      branches[ i ].finish();
      branches.splice( i, 1 );
    }
  }

  distanceCounter += Math.abs( lastPoint.getDistance( event.point ) );

  lastPoint = event.point;
}

// Branch:

function Branch( point, group, direction, rotationDirection, life ) {
  this.point = point;

  this.vector = direction;
  if( normalizeMouseSpeed ) {
    this.vector = this.vector.normalize();
  }
  var vectorScale = ( Math.random() * ( values.maxBranchSize - values.minBranchSize ) ) + values.minBranchSize;
  this.vector = this.vector * vectorScale;

  this.rotate = rotationDirection * 0.573;
  this.rotationDirection = rotationDirection;
  this.life = life;
  this.lifeTime = life;

  this.path = new Path();
  this.path.moveTo( point );
  this.path.strokeWidth = 0.25;
  group.appendChild( this.path );

}

Branch.prototype.grow = function() {

  // Animate branch
  this.vector = this.vector.rotate( this.rotate );
  this.rotate += this.rotationDirection * 0.573;
  this.point = this.point + this.vector;
  this.path.lineTo( this.point );

  // Possibly die branch and blossom
  if( --this.life <= 0 ) {
    // Branch died, does it blossom?
    if( Math.random() < values.blossomRate ) {
      rect = new Rectangle( 0, 0, 3, 3 );
      rect.center = this.point;
      new Path.Oval( rect );
    }

    return false;
  }

  // Possibly create a new branch from this branch
  if( canBranch() && Math.random() < values.branchBranchRate && this.life < values.maxBranchAgeToBranch * this.lifeTime && this.life > values.minBranchAgeToBranch ) {
    branchBranch( this );
  }

}

Branch.prototype.finish = function() {
  if( usePointsToCurves ) {
    this.path.pointsToCurves();
  }
}

function branchBranch( branch ) {
  var group = new Group();
  branches.push( new Branch( branch.point, group, branch.vector * 0.5, branch.rotationDirection * -1, branch.life ) );
}

function canBranch() {
  return ( branches.length < values.maxBranches );
}