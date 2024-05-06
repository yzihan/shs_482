$(document).ready(function() {
   var $required = $('form').find('[required], [aria-required]');
   var $form = $required.closest('form');
   var $fields = $form.find('input, textarea, select').not('[type=submit]');

   $form.on('submit', function(e) { // needed if HTML5 validation is not supported
      var bErr = false;

      // check all required fields
      $required.each(function(index) {
         bErr = !isValid($(this));
      });

      if (bErr) {
         $required.filter('[aria-invalid=true]').first().focus(); // set focus on first invalid field
         e.preventDefault(); // prevent the form from submitting
         return false;
      }
   });

   $required.on('invalid', function(e) { // Hook the HTML5 validation
       return !isValid($(this)); // validate the field
   });

   $fields.on('keyup blur', function(e) {
      validateField(e);
   });

});

function validateField(e) {
    e = e || window.event;
    var target = e.target || e.srcElement;
    var $field = $(target);

   // Ignore tab key or shift-tab if field is empty
   if ((e.keyCode == '9' || e.keyCode == '16') && $field.val().length === 0) {
      return false;
   }

   // Perform HTML5 native browser validation (if supported)
    if (typeof $field[0].checkValidity === 'function') {
       $field[0].checkValidity();
    }

    isValid($field);
    return true;
}

function isValid($field) {
   var errID = $field.attr('id') + '-err';
   var $errContainer = $('#' + errID);
   var func = null;
   var msg = $field.attr('data-errmsg');

   switch($field.attr('type')) {
      case 'text': {
         func = isValidLength;
         break;
      }
      case 'email': {
         func = isValidEmail;
         break;
      }
      case 'tel': {
         func = isValidTelephone;
         break;
      }
      case 'subject': {
         func = isValidLength;
         break;
      }
      default: {
         if ($field.prop('tagName').toLowerCase() !== 'textarea') {
            return true;
         }
         func = isValidLength;
      }
   }

   if (!func($field)) {
      if ($field.attr('aria-invalid') === 'true') {
         // do nothing if the field was already invalid
         return false;
      }

      // field is invalid: add the alert role and error message.
      $errContainer.attr('role', 'alert').html('<p id="' + errID + '-msg">' + msg + '</p>');

      // Set invalid attribute to true and associate the field with the error message.
      $field.attr({
         'aria-invalid': 'true',
         'aria-describedby': errID + '-msg'
      });

      return false;

   }
   else { // Field is valid
      // reset the invalid attribute and remove the describedby association.
      $field.removeAttr('aria-describedby')
         .attr('aria-invalid', 'false');

      // remove the alert role from the error message container and empty it.
      $errContainer.removeAttr('role').empty();
      return true;
   }
}


function isValidLength($field) { // check that there is data in the field
   var value = $field.val();
   if (value.length < 2) {
      return false;
   }
   return true;
}

function isValidEmail($field) { // check that email is valid

   var value = $field.val();

   if ((value.length === 0) || (/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(value) === false)) {
      return false;
   }
   return true;
}

function isValidTelephone($field) { // check that telephone is valid
    var value = $field.val();

    // Return true if the field is empty
    if (value.length === 0) {
        return true;
    }

    // Check for valid telephone number format
    if (/^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(value) === false) {
        return false;
    }
    return true;
}