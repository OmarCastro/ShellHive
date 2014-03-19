
createBoundary = (left = 0,rigth = 0,top = 0,bottom = 0,component) -> 
  if component.type is \file
    bottom += 100
  else
    bottom += 350
  {left,rigth,top,bottom,components: [component]}
createBoundary.fromXY = (x,y,component) -> this(x,x,y,y,component)
createBoundary.fromPoint = (point,component) -> this.fromXY(point.x,point.y,component)

Boundary = {}
Boundary.extendXY = (boundary,x,y) !-> 
    boundary
      ..left   = x if x < boundary.left
      ..rigth  = x if x > boundary.rigth
      ..top    = y if y < boundary.top
      ..bottom = y if y > boundary.bottom

Boundary.extend = (boundary,boundary2) !-> 
    boundary
      ..left   = boundary2.left   if boundary2.left   < boundary.left
      ..rigth  = boundary2.rigth  if boundary2.rigth > boundary.rigth
      ..top    = boundary2.top    if boundary2.top < boundary.top
      ..bottom = boundary2.bottom if boundary2.bottom > boundary.bottom
      ..components = boundary.components ++ boundary2.components

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
  boundary = createBoundary.fromPoint firstPos,components[0]
  for i from 1 to components.length - 1
    component = components[i]
    Boundary.extend(boundary, createBoundary.fromPoint(component.position,component))
  return boundary



function arrangeLayout(boundaries)
  maxX = 0
  prevBound = null
  components = []
  for boundary in boundaries when boundary
    maxX = boundary.rigth if maxX < boundary.rigth
    components = components ++ boundary.components

  console.log \boundaries, boundaries

  for boundary in boundaries when boundary
    translateX = maxX - boundary.rigth
    translateY = if prevBound then prevBound.bottom - boundary.top else 0
    Boundary.translate boundary, translateX, translateY
    prevBound = boundary
  x = switch boundaries.length
    | 0 => 0
    | _ => maxX + 450

  y = switch boundaries.length
    | 0 => 0
    | _ => Math.max((prevBound.bottom - 350) / 2,0)

  bottom = switch boundaries.length
    | 0 => 350
    | _ => Math.max(prevBound.bottom,350)

  console.log \final-boundary, {left:0,rigth:x ,top:0 ,bottom,components}


  return [{left:0,rigth:x ,top:0 ,bottom,components},{x,y}]

exports <<< {
  getBoundaries
  arrangeLayout 
  translateBoundary: Boundary.translate
}