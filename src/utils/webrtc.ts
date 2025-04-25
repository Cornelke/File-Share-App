// WebRTC utilities for establishing connections and transferring files

// Configuration for STUN/TURN servers
const rtcConfig: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ],
  iceCandidatePoolSize: 10
};

// Create a new RTCPeerConnection
export const createPeerConnection = (mode: 'send' | 'receive') => {
  // Create the peer connection
  const pc = new RTCPeerConnection(rtcConfig);
  
  // Log ICE connection state changes
  pc.oniceconnectionstatechange = () => {
    console.log(`ICE connection state changed to: ${pc.iceConnectionState}`);
  };
  
  // Log connection state changes
  pc.onconnectionstatechange = () => {
    console.log(`Connection state changed to: ${pc.connectionState}`);
  };
  
  // Log ICE gathering state changes
  pc.onicegatheringstatechange = () => {
    console.log(`ICE gathering state changed to: ${pc.iceGatheringState}`);
  };
  
  // Log new ICE candidates
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      console.log(`New ICE candidate: ${event.candidate.candidate}`);
    }
  };
  
  // Create a data channel for 'send' mode
  let dc = null;
  if (mode === 'send') {
    dc = pc.createDataChannel('fileTransfer', {
      ordered: true
    });
  }
  
  return { pc, dc };
};

// Set up a data channel with message handling
export const setupDataChannel = (
  channel: RTCDataChannel,
  onMessage: (event: MessageEvent) => void
) => {
  // Set up data channel event handlers
  channel.onopen = () => {
    console.log(`Data channel is open`);
  };
  
  channel.onclose = () => {
    console.log(`Data channel is closed`);
  };
  
  channel.onerror = (error) => {
    console.error(`Data channel error: ${error}`);
  };
  
  channel.onmessage = onMessage;
  
  return channel;
};

// Exchange signaling data between peers
export const exchangeSignalingData = async (
  pc: RTCPeerConnection,
  mode: 'send' | 'receive',
  signalingData?: string
): Promise<string> => {
  if (mode === 'send') {
    // Create and send offer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    
    // Wait for ICE gathering to complete
    const completeOffer = await waitForIceComplete(pc);
    return JSON.stringify(completeOffer);
  } else {
    // Process offer and create answer
    if (!signalingData) {
      throw new Error('Signaling data is required for receive mode');
    }
    
    // Parse the offer
    const offer = JSON.parse(signalingData);
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    
    // Create and send answer
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    
    // Wait for ICE gathering to complete
    const completeAnswer = await waitForIceComplete(pc);
    return JSON.stringify(completeAnswer);
  }
};

// Wait for ICE gathering to complete
const waitForIceComplete = (pc: RTCPeerConnection): Promise<RTCSessionDescriptionInit> => {
  return new Promise((resolve) => {
    // If gathering is already complete, resolve immediately
    if (pc.iceGatheringState === 'complete') {
      resolve(pc.localDescription);
      return;
    }
    
    // Otherwise, set up a listener
    const checkState = () => {
      if (pc.iceGatheringState === 'complete') {
        pc.removeEventListener('icegatheringstatechange', checkState);
        resolve(pc.localDescription);
      }
    };
    
    pc.addEventListener('icegatheringstatechange', checkState);
    
    // Add a timeout just in case
    setTimeout(() => {
      pc.removeEventListener('icegatheringstatechange', checkState);
      resolve(pc.localDescription);
    }, 5000);
  });
};
