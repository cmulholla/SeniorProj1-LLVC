'use strict';

const { EventEmitter } = require('events');

const broadcaster = new EventEmitter();
const { on } = broadcaster;

function beforeOffer(peerConnection) {
  const audioTrack = broadcaster.audioTrack = peerConnection.addTransceiver('audio').receiver.track;
  const videoTrack = broadcaster.videoTrack = peerConnection.addTransceiver('video').receiver.track;
  const audioTransceiver = peerConnection.addTransceiver('audio');
  const videoTransceiver = peerConnection.addTransceiver('video');
  console.log("Before Offer");
  
  
  console.log("There was a listener: " + broadcaster.emit('newBroadcast', {
    audioTrack,
    videoTrack
  }));


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
  broadcaster
};
// grep for these
// grep -r (or -R to follow paths) <keyword> <path (.)>
// ex: `grep -r beforeOffer .`