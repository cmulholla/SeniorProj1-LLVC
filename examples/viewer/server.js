'use strict';

const { broadcaster } = require('../broadcaster/server')

function beforeOffer(peerConnection) {
  const audioTransceiver = peerConnection.addTransceiver('audio');
  const videoTransceiver = peerConnection.addTransceiver('video');
  
  function onNewBroadcast({ audioTrack, videoTrack }) {
    audioTransceiver.sender.replaceTrack(audioTrack),
    videoTransceiver.sender.replaceTrack(videoTrack) 
    console.log("made new broadcast, replaced the tracks with the local ones");
  }

  broadcaster.on('newBroadcast', onNewBroadcast)

  if (broadcaster.audioTrack && broadcaster.videoTrack) {
    console.log("found new broadcast, found both tracks");
    onNewBroadcast(broadcaster);
  }
  else if (broadcaster.audioTrack) {
    console.log("only found audio track");
  }
  else if (broadcaster.videoTrack) {
    console.log("only found video track");
  }
  else {
    console.log("found no tracks to replace");
  }

  const { close } = peerConnection;
  peerConnection.close = function() {
    broadcaster.removeListener('newBroadcast', onNewBroadcast);
    console.log("removed the tracks");
    return close.apply(this, arguments);
  }
}

module.exports = { beforeOffer };
