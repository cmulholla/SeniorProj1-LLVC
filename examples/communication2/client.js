'use strict';

const createExample = require('../../lib/browser/example');

const description = 'Connect to a stream.\nYou\'ll be able to see and hear whoever is in comm1.';

const localVideo = document.createElement('video');
localVideo.autoplay = true;
localVideo.muted = true;

const remoteVideo = document.createElement('video');
remoteVideo.autoplay = true;

async function beforeAnswer(peerConnection) {
  
  console.log("peerConnection in beforeAnswer: " + peerConnection);
  // setup the remote stream
  const remoteStream = new MediaStream(peerConnection.getReceivers().map(receiver => receiver.track));
  remoteStream.getTracks().forEach(track => console.log(track.id, track.muted, track.kind, track.label));
  remoteVideo.srcObject = remoteStream;

  console.log("iceConnectionState in beforeAnswer: " + peerConnection.iceConnectionState);
  console.log("remoteStream in beforeAnswer: " + remoteStream.getTracks());

  // setup the local stream
  const localStream = await window.navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true
  });

  localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
  console.log("got streams in broadcaster (idk)");
  localVideo.srcObject = localStream;

  // NOTE(mroberts): This is a hack so that we can get a callback when the
  // RTCPeerConnection is closed. In the future, we can subscribe to
  // "connectionstatechange" events.
  const { close } = peerConnection;
  peerConnection.close = function() {
    localVideo.srcObject = null;

    localStream.getTracks().forEach(track => track.stop());

    remoteVideo.srcObject = null;

    return close.apply(this, arguments);
  };

}

createExample('communicator', description, { beforeAnswer });

const videos = document.createElement('div');
videos.className = 'grid';
videos.appendChild(localVideo);
videos.appendChild(remoteVideo);
document.body.appendChild(videos);