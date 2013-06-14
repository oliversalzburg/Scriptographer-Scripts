////////////////////////////////////////////////////////////////////////////////
// Note from the Scriptographer.org Team
//
// In Scriptographer 2.9, we switched to a top-down coordinate system and
// degrees for angle units as an easier alternative to radians.
// 
// For backward compatibility we offer the possibility to still use the old
// bottom-up coordinate system and radians for angle units, by setting the two
// values bellow. Read more about this transition on our website:
// http://scriptographer.org/news/version-2.9.064-arrived/

script.coordinateSystem = 'bottom-up';
script.angleUnits = 'radians';

var values = {
	numTeeth: 25,
	radius:   50,
	thinning: 0.5,
	depth:    6
};

function onOptions() {
	values = Dialog.prompt('Gears:', {
		numTeeth: { description: 'Teeth Count' },
		radius:   { description: 'Radius' },
		thinning: { description: 'Thinning (0 - 1)' },
		depth:    { description: 'Teeth depth' }
	}, values);
}

var path;

function onMouseDown(event) {
	path = new Path();
	
	var rotStep = (Math.PI * 2) / values.numTeeth;
	var thinningRot = (values.thinning / 4) * rotStep;

	for( var i = 0; i <= values.numTeeth * 2; i++ ) {
		
		var rotation = i/2 * rotStep;
		thinningRot = -thinningRot;
		
		var topPoint = event.point + getVector(rotation + thinningRot, values.radius);
		var bottomPoint = event.point + getVector(rotation, values.radius - values.depth);
		
		if(i.isOdd()) {
			path.lineTo(bottomPoint);
			path.lineTo(topPoint);
		} else {
			path.lineTo(topPoint);
			path.lineTo(bottomPoint);
		}
	}
}

function onMouseDrag( event ) {
	path.position = event.point;
}

function getVector(angle, length) {
	return new Point(0, 1) {
		length: length
	}.rotate(-angle);
}