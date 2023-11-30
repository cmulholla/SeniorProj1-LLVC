'use strict';

const { EventEmitter } = require('events');

const broadcaster = new EventEmitter();
const { on } = broadcaster;

function beforeOffer(peerConnection) {
  const audioTransceiver = peerConnection.addTransceiver('audio');
  const videoTransceiver = peerConnection.addTransceiver('video');

  
  // Mute the audio track on the sender side
  audioTransceiver.muted = true;
  console.log("audioTransceiver.muted: " + audioTransceiver.muted);
  
  const audioTrack = broadcaster.audioTrack = audioTransceiver.receiver.track;
  const videoTrack = broadcaster.videoTrack = videoTransceiver.receiver.track;
  console.log("audioTrack: " + audioTrack.id);
  console.log("videoTrack: " + videoTrack.id);
  console.log("peerConnection: " + peerConnection.id);
  console.log("Before Offer");
  
  
  const newBroadcaster = broadcaster.emit('newBroadcast', {
    audioTrack,
    videoTrack
  });

  let currentAudioTrackId = null;
  let currentVideoTrackId = null;

  console.log("newBroadcaster: " + newBroadcaster);
  function onNewBroadcast({ audioTrack, videoTrack }) {
    // Check if the new broadcast is from the same peer
      if (audioTrack.id === currentAudioTrackId && videoTrack.id === currentVideoTrackId) {
          return;
      }
      audioTransceiver.sender.replaceTrack(audioTrack),
      videoTransceiver.sender.replaceTrack(videoTrack) 
      console.log("made new broadcast, replaced the tracks with the local ones");
      currentAudioTrackId = audioTrack.id;
      currentVideoTrackId = videoTrack.id;
  }
  
  broadcaster.on('newBroadcast', onNewBroadcast);
  if (broadcaster.audioTrack && broadcaster.videoTrack && newBroadcaster) {
      console.log("found new broadcast, found both tracks");
      onNewBroadcast(broadcaster);
      console.log("iceConnectionState: " + peerConnection.iceConnectionState);
  }


  const { close } = peerConnection;
  peerConnection.close = function() {
    console.log("peerConnection is being closed");
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