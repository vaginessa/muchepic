// TODO: consider switching to google/bing images for better results

var $ = require('jquery')(window)
var async = require('async')
var Flickr = require('./lib/flickr')
var secret = require('./secret')

var CONCURRENT_REQS = 3
var PHOTOS_TO_PRELOAD = 2
var TOTAL_PHOTOS = 15

var f = new Flickr(secret.flickr)

function search (q, cb) {
  f.api('flickr.photos.search', {
    text: q,
    tag: q,
    per_page: TOTAL_PHOTOS,
    sort: 'relevance'
  }, function (err, data) {
    if (err) return cb(err)
    cb(null, data.photos.photo)
  })
}

function getPhoto (photoId, cb) {
  f.api('flickr.photos.getSizes', { photo_id: photoId }, function (err, data) {
    if (err) return cb(err)
    var photoSizes = data.sizes.size
    var photo = photoSizes[Math.min(8, photoSizes.length - 1)]
    cb(null, photo)
  })
}

function getPhotoUrls (q, cb) {
  search(q, function (err, photos) {
    if (err) throw err

    var ids = photos.map(function (photo) { return photo.id })

    async.mapLimit(ids, CONCURRENT_REQS, function (id, cb) {
      getPhoto(id, function (err, photo) {
        if (err) return cb(err)
        var url = photo.source

        if (ids.indexOf(id) < PHOTOS_TO_PRELOAD)
          preloadPhoto(url)
        cb(null, url)
      })
    }, cb)
  })
}

function preloadPhoto () {
  for (var i = 0; i < arguments.length; i++) {
    $('<img />').attr('src', arguments[i])
  }
}

function main () {
  getPhotoUrls('aurora', function (err, photoUrls) {
    photoUrls.forEach(function (url) {
      $('body').append($('<img />').attr('src', url))
    })
  })
}
main()
