//ye pura webRTC ko connect krne wala h

import { useMemo, useEffect, useState, useCallback } from "react";
import React from "react";

const PeerContext = React.createContext(null);

export const usePeer = () => React.useContext(PeerContext);
export const PeerProvider = (props) => {
    const [remoteStream, setRemoteStream] = useState(null);
    const peer = useMemo(() => new RTCPeerConnection({
        iceServers: [
            {         //stun servers hmlg ko apna ip nikaal ke dega
                    url: 'turn:turn.anyfirewall.com:443?transport=tcp',
                    credential: 'webrtc',
                    username: 'webrtc'
                
            },
        ],
    }), 
    []
    );
    // isse dusra ko offer krenge
    const createOffer = async () => {
        const offer = await peer.createOffer();
        //but ye create hogya ab isko apna local description mein set krna hai
        await peer.setLocalDescription(offer);
        return offer;
    }

    //agla ab offer karega
    const createAnswer = async (offer) => {
        //agla mera offer apna ismein rakh rha hai
        await peer.setRemoteDescription(offer);
        const answer = await peer.createAnswer();
        //ab khud ka yaad kar rhe h
        await peer.setLocalDescription(answer);
        return answer;
    };
    
    //iska data ko apna local description mein save krlenge
    const setRemoteAns = async(ans) => {
        await peer.setRemoteDescription(ans);
    };

    const sendStream = async(stream) => {
        const tracks = stream.getTracks();
        for(const track of tracks) {
            peer.addTrack(track, stream);
        }
    }

    const handleTrackEvent = useCallback((ev) => {
        const streams = ev.streams;
        setRemoteStream(streams[0])
    }, [])

    useEffect(() => {
        peer.addEventListener('track', handleTrackEvent)
    return () => {
        peer.removeEventListener('track', handleTrackEvent)
    }   
    }, [handleTrackEvent, peer])

    return (
        <PeerContext.Provider value={{peer, createOffer, createAnswer,setRemoteAns, sendStream, remoteStream}}>{props.children}</PeerContext.Provider>
    )
}