module.exports = class Component
  (@type) ->
    this.position = {x:0, y:0}

  setId: (id) !-> this.id = id


  @CommandComponent = class extends Component
    ->
      super(\command)


