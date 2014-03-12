
createBoundary = (left = 0,rigth = 0,top = 0,bottom = 0,components) -> {left,rigth,top,bottom,components}
createBoundary.fromXY = (x,y,components) -> this(x,x,y,y,components)
createBoundary.fromPoint = (point,components) -> this.fromXY(point.x,point.y,components)

Boundary = {}
Boundary.extend = (boundary,x,y) !-> 
    boundary
      ..left   = x if x < boundary.left
      ..rigth  = x if x > boundary.rigth
      ..top    = y if y < boundary.top
      ..bottom = y if y > boundary.bottom
Boundary.translate = (boundary,x,y = 0) !->
    boundary
      ..left   += x
      ..rigth  += x
      ..top    += y
      ..bottom += y
    for comp in boundary.components
      comp.position
        ..x += x
        ..y += y

function getBoundaries(components)
  return null if components.length == 0
  firstPos = components[0].position
  boundary = createBoundary.fromPoint firstPos,components
  for i from 1 to components.length - 1
    pos = components[i].position
    Boundary.extend(boundary,pos.x,pos.y)
  return boundary



function arrangeLayout(boundaries)
  maxX = 0
  prevBound = null
  components = []
  for boundary in boundaries when boundary
    maxX = boundary.rigth if maxX < boundary.rigth
    components = components ++ boundary.components
  for boundary in boundaries when boundary
    Boundary.translate boundary, maxX - boundary.rigth, 
      if prevBound then prevBound.bottom + 350 - boundary.top else 0
    prevBound = boundary
  x = switch boundaries.length
    | 0 => 0
    | _ => maxX + 450
  y = switch boundaries.length
    | 0 => 0
    | 1 => prevBound.bottom
    | _ => (prevBound.bottom) 

  return [{left:0,rigth:x ,top:0 ,bottom:y,components},{x,y:y/2}]

exports <<< {
  getBoundaries
  arrangeLayout 
  translateBoundary: Boundary.translate
}