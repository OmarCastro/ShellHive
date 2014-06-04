/**
* Component.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    graph:{
        model:'graph'
    },

    type:{
		type:'string',
		in:["file","command","macro"]
    },

    data:{
    	type:'json',
    	columnName: 'componentData'
    }

  }
};

