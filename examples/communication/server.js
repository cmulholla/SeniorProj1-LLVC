'use strict';

const { EventEmitter } = require('events');

let broadcaster1 = null;
let broadcaster2 = null;
let broadcaster = new EventEmitter();
let newBroadcaster = false;

function beforeOffer(peerConnection) {
  const audioTransceiver = peerConnection.addTransceiver('audio');
  const videoTransceiver = peerConnection.addTransceiver('video');
  const audioTrack = broadcaster.audioTrack = audioTransceiver.receiver.track;
  const videoTrack =  broadcaster.videoTrack = videoTransceiver.receiver.track;
  
  // Mute the audio track on the sender side
  audioTransceiver.muted = true;
  console.log("audioTransceiver.muted: " + audioTransceiver.muted);

  let currentAudioTrackId = null;
  let currentVideoTrackId = null;
  
  function onNewBroadcast({ audioTrack, videoTrack }, broadcaster) {
    console.log("onNewBroadcast");
    // Check if the new broadcast is from the same peer
    if (!audioTrack && !videoTrack) {
      console.log("no tracks");
      return;
    }
    if (audioTrack.id === currentAudioTrackId && videoTrack.id === currentVideoTrackId) {
      console.log("same peer");
      return;
    }

    const otherBroadcaster = broadcaster === broadcaster1 ? broadcaster2 : broadcaster1;
    if (!audioTrack && !videoTrack) {
        console.log("no tracks2");
        return;
    }
    console.log("rebroadcasting");
    console.log("emitting audioTrack: " + audioTrack.id);
    console.log("emitting videoTrack: " + videoTrack.id);
    console.log("otherBroadcaster: " + otherBroadcaster===broadcaster1 ? "broadcaster1" : "broadcaster2");
    if (otherBroadcaster && !newBroadcaster) {
      newBroadcaster = true;
      otherBroadcaster.emit('newBroadcast', {
        audioTrack,
        videoTrack
      });
    }
      
    audioTransceiver.sender.replaceTrack(audioTrack);
    videoTransceiver.sender.replaceTrack(videoTrack);
    console.log("made new broadcast, replaced the tracks with the local ones");
    currentAudioTrackId = audioTrack.id;
    currentVideoTrackId = videoTrack.id;
  }
  
  // When a new client connects
  if (!broadcaster1) {
    broadcaster1 = new EventEmitter();
    console.log("found new broadcast1");
    broadcaster1.on('newBroadcast', (tracks) => onNewBroadcast(tracks, broadcaster1));
    broadcaster = broadcaster1;
  } else if (!broadcaster2) {
    broadcaster2 = new EventEmitter();
    console.log("found new broadcast2");
    broadcaster2.on('newBroadcast', (tracks) => onNewBroadcast(tracks, broadcaster2));
    broadcaster = broadcaster2;
    broadcaster2.emit('newBroadcast', {
        audioTrack,
        videoTrack
    });
  }


  const { close } = peerConnection;
  peerConnection.close = function() {
    console.log("peerConnection is being closed");
    broadcaster.removeListener('newBroadcast', onNewBroadcast);
    broadcaster2.removeListener('newBroadcast', onNewBroadcast);
    audioTrack.stop()
    videoTrack.stop()
    newBroadcaster = false;
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