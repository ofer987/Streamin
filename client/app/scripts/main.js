console.log('\'Allo \'Allo!');

(function($) {
  var messagesContainer = $('div#messages');

  $('a#stream').click(function() {
    var i = 0;
    var es = new EventSource('http://localhost:5000/api/values');

    es.addEventListener('value', function(e) {
      var message = e.data || '';

      messagesContainer.append(message);
      if (e.data === '9') {
        es.close();
      }
    });

    es.onmessage = function(e) {
      var message = e.data || '';

      messagesContainer.append('<p>' + message + '</p>');

      if (i >= 10) {
        es.close();
      }
      i++;
    };
    es.onerror = function(e) {
      console.log(e);
    };
  });
}(jQuery));
