class Boundary
  (left = 0,rigth = 0,top = 0,bottom = 0,component) ->
    if component.type is \file
      bottom += 100
    else
      bottom += 350
    this <<< { left, rigth, top, bottom, components: [component]}

  ## Factory constructors
  @fromXY = (x,y,component) -> new this(x,x,y,y,component)
  @fromPoint = (point,component) -> this.fromXY(point.x,point.y,component)
  @fromComponent = (component) -> this.fromPoint(component.position,component)
  @fromComponents = (components) ->
    return null if components.length == 0
    boundary = this.fromComponent components[0]
    for i from 1 to components.length - 1
      boundary.extend(this.fromComponent(components[i]))
    boundary


  extendXY: (x,y) !-> 
    this
      ..left   = x if x < boundary.left
      ..rigth  = x if x > boundary.rigth
      ..top    = y if y < boundary.top
      ..bottom = y if y > boundary.bottom
  extend: (boundary2) !-> 
    this
      ..left   = boundary2.left   if boundary2.left   < this.left
      ..rigth  = boundary2.rigth  if boundary2.rigth  > this.rigth
      ..top    = boundary2.top    if boundary2.top    < this.top
      ..bottom = boundary2.bottom if boundary2.bottom > this.bottom
      ..components ++= boundary2.components

  @translate = (boundary,x,y = 0) -> 
    boundary
      ..left   += x
      ..rigth  += x
      ..top    += y
      ..bottom += y
    for comp in boundary.components
      comp.position
        ..x += x
        ..y += y

  translate: (x, y = 0) !-> Boundary.translate(this,x,y)


getBoundaries = (components) -> Boundary.fromComponents(components)

function arrangeLayout(boundaries)
  maxX = 0
  prevBound = null
  components = []
  for boundary in boundaries when boundary
    maxX = Math.max(boundary.rigth, maxX)
    components ++= boundary.components

  for boundary in boundaries when boundary
    translateX = maxX - boundary.rigth
    translateY = if prevBound then prevBound.bottom - boundary.top else 0
    Boundary.translate boundary, translateX, translateY
    prevBound = boundary

  if boundaries.length
    x = maxX + 450
    y = Math.max((prevBound.bottom - 350) / 2, 0)
    bottom = Math.max(prevBound.bottom,350)
  else
    x = 0
    y = 0
    bottom = 350
  return [{left:0,rigth:x ,top:0 ,bottom,components},{x,y}]

exports <<< {
  getBoundaries
  arrangeLayout 
  translateBoundary: Boundary.translate
}