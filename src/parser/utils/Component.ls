exports.Component = class Component
  (@type) ->
    this.position = {x:0, y:0}

  setId: (id) !-> this.id = id
  setPosition: (x,y) !-> this.position <<< {x,y}


exports.Component.CommandComponent = class CommandComponent extends Component
    ->
      super(\command)

exports.Component.FileComponent = class CommandComponent extends Component
    ->
      super(\file)


