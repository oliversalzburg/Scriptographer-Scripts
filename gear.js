var values = {
  numTeeth: 25,
  radius  : 50,
  thinning: 0.5,
  depth   : 6
};

function onOptions() {
  values = Dialog.prompt( 'Gears:', {
    numTeeth: { description: 'Teeth Count' },
    radius  : { description: 'Radius' },
    thinning: { description: 'Thinning (0 - 1)' },
    depth   : { description: 'Teeth depth' }
  }, values );
}

var path;

function onMouseDown( event ) {
  path = new Path();

  var rotStep = 360 / values.numTeeth;
  var thinningRot = (values.thinning / 4) * rotStep;

  for( var teethIndex = 0; teethIndex <= values.numTeeth * 2; teethIndex++ ) {

    var rotation = teethIndex / 2 * rotStep;
    thinningRot = -thinningRot;

    var topPoint = event.point + getVector( rotation + thinningRot, values.radius );
    var bottomPoint = event.point + getVector( rotation, values.radius - values.depth );

    if( teethIndex.isOdd() ) {
      path.lineTo( bottomPoint );
      path.lineTo( topPoint );
    } else {
      path.lineTo( topPoint );
      path.lineTo( bottomPoint );
    }
  }
}

function onMouseDrag( event ) {
  path.position = event.point;
}

function getVector( angle, length ) {
  return new Point( 0, 1 )
  {
    length: length
  }
.
  rotate( -angle );
}