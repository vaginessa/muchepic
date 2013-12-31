module.exports = Flickr

var $ = require('jquery')(window)

function Flickr (opts) {
  this.key = opts.key
  this.secret = opts.secret
}

Flickr.prototype.api = function (method, params, cb) {
  method = encodeURIComponent(method)

  var q = ''
  for (var key in params) {
    var val = params[key]
    q += '&' + encodeURIComponent(key) + '=' + encodeURIComponent(val)
  }

  $.ajax({
    dataType: "json",
    url: 'http://api.flickr.com/services/rest/?method=' + method + '&api_key=' + this.key + q + '&format=json&jsoncallback=?',
    success: function (data) {
      if (data.stat !== 'ok') return cb(new Error(data.code + ': ' + data.message))
      cb(null, data)
    },
    error: function (jqXHR, textStatus, err) {
      cb(err)
    }
  })
}