'use strict';

const { EventEmitter } = require('events');

const broadcaster = new EventEmitter();
const broadcaster1 = new EventEmitter();

function beforeOffer(peerConnection) {
  
  const audioTransceiver = peerConnection.addTransceiver('audio');
  const videoTransceiver = peerConnection.addTransceiver('video');
  const audioTrack = broadcaster.audioTrack = audioTransceiver.receiver.track;
  const videoTrack =  broadcaster.videoTrack = videoTransceiver.receiver.track;
  
  function onNewBroadcast({ audioTrack, videoTrack }) {
    audioTransceiver.sender.replaceTrack(audioTrack),
    videoTransceiver.sender.replaceTrack(videoTrack) 
    console.log("made new broadcast, replaced the tracks with the local ones");
  }
  
  broadcaster1.on('newBroadcast', onNewBroadcast);
  
  if (broadcaster1.audioTrack && broadcaster1.videoTrack) {
    console.log("found new broadcast, found both tracks");
    onNewBroadcast(broadcaster1);
  }
  
  console.log("There was a listener: " + broadcaster.emit('newBroadcast', {
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
  broadcaster,
  broadcaster1
};
// grep for these
// grep -r (or -R to follow paths) <keyword> <path (.)>
// ex: `grep -r beforeOffer .`