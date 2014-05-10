/**
* Graph.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    isRoot: 'boolean',
    name:'string',
    description:'string',
    
    project:{
        model:'project'
    },
    
    components:{
      collection: 'component',
      via: 'graph'
    },
    
    connections:{
      collection: 'connection',
      via: 'graph'
    }

  }
};

