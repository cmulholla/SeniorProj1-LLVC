'use strict';
// TODO: try to store all the tracks inside of a single broadcaster and filter through what I need
const { EventEmitter } = require('events');

const { broadcaster, broadcaster1 } = require('../communication/server');

function beforeOffer(peerConnection) {
  const audioTransceiver = peerConnection.addTransceiver('audio');
  const videoTransceiver = peerConnection.addTransceiver('video');
  const audioTrack = broadcaster1.audioTrack = audioTransceiver.receiver.track;
  const videoTrack =  broadcaster1.videoTrack = videoTransceiver.receiver.track;
  
  function onNewBroadcast({ audioTrack, videoTrack }) {
    audioTransceiver.sender.replaceTrack(audioTrack),
    videoTransceiver.sender.replaceTrack(videoTrack) 
    console.log("made new broadcast, replaced the tracks with the local ones");
  }

  broadcaster.on('newBroadcast', onNewBroadcast);

  if (broadcaster.audioTrack && broadcaster.videoTrack) {
    console.log("found new broadcast, found both tracks");
    onNewBroadcast(broadcaster);
  }

  console.log("There was a listener: " + broadcaster1.emit('newBroadcast', {
    audioTrack,
    videoTrack
  }));

  const { close } = peerConnection;
  peerConnection.close = function() {
    broadcaster.removeListener('newBroadcast', onNewBroadcast);
    audioTrack.stop()
    videoTrack.stop()
    return close.apply(this, arguments);
  };
}

module.exports = { 
  beforeOffer,
  broadcaster1
};
// grep for these
// grep -r (or -R to follow paths) <keyword> <path (.)>
// ex: `grep -r beforeOffer .`