/**
* Graph.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {

    data:{
      type:'json',
      columnName: 'graphData'
    },

    type:{
      type:'string',
      'in':['root', 'macro', 'commandGraph'],
      required: true
    },

    
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
  },

  //toGraphMethod: function(){
  //  console.log("bohemian Raspsody")
  //}
};

