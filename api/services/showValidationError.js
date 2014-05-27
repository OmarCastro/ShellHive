/**
 * Takes a Sails Model object (e.g. User) and a ValidationError object and translates it into a friendly
 * object for sending via JSON to client-side frameworks.
 *
 * To use add a new object on your model describing what validation errors should be translated:
 *
 * module.exports = {
 *   attributes: {
 *     name: {
 *       type: 'string',
 *       required: true
 *     }
 *   },
 * 
 *   validation_messages: {
 *     name: {
 *       required: 'you have to specify a name or else'
 *     }
 *   }  
 * };
 *
 * Then in your controller you could write something like this:
 *
 * var validator = require('sails-validator-tool');
 *
 * Mymodel.create(options).done(function(error, mymodel) {
 *   if(error) {
 *     if(error.ValidationError) {
 *       error_object = validator(Mymodel, error.Validation);
 *       res.send({result: false, errors: error_object});
 *     }
 *   }
 * });
 *
 * @param model {Object} An instance of a Sails.JS model object.
 * @param validationErrors {Object} A standard Sails.JS validation object.
 *
 * @returns {Object} An object with friendly validation error conversions.
 */ 
module.exports = function(model, validationError) {
  var validation_response = {};
  var messages = model.validation_messages;
  validation_fields = Object.keys(messages);

  validation_fields.forEach(function(validation_field) {

    if(validationError[validation_field]) {
      sails.log(validationError, validation_field)
      var processField = validationError[validation_field];
      require("util").inspect(processField);
      processField.forEach(function(rule) {
        if(messages[validation_field][rule.rule]) {
          if(!(validation_response[validation_field] instanceof Array)) {
            validation_response[validation_field] = new Array();
          }

          var newMessage={};
          newMessage[rule.rule] = messages[validation_field][rule.rule];
          validation_response[validation_field].push(newMessage);
        }
      });

    }
  });

  return validation_response;
};