import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../providers/Socket";
import { usePeer } from "../providers/Peer";
import ReactPlayer from 'react-player';
const RoomPage = () => {
 const {socket} = useSocket();
 const {peer, createOffer, createAnswer, setRemoteAns, sendStream, remoteStream } = usePeer();
    
    const [myStream, setMyStream] = useState(null);
    // negotiation ke liye
    const [remoteEmailId, setRemoteEmailId] = useState();

    const handleNewUserJoined = useCallback(
        async (data) => {
        const {emailId} = data;
        console.log("New user joined room", emailId);
        const offer = await createOffer();
      //hmlg ko offer bhej rhe neeche ka line se
        socket.emit('call-user', {emailId, offer});
    // negotisation ke liye
    setRemoteEmailId(emailId)
    },
    [createOffer, socket]
    );

    const handleIncomingCall = useCallback( async (data) => {
        const {from, offer} = data
        console.log('Incoming Call from', from, offer)
        const ans = await createAnswer(offer);
        socket.emit("call-accepted", {emailId: from, ans});
        //negotisation ke liye
        setRemoteEmailId(from)
    }, [createAnswer, socket]);

    const handleCallAccepted = useCallback(
        async(data) => {
        const {ans} = data;
        console.log("Call got accepted", ans);
        await setRemoteAns(ans);
    }, 
    [setRemoteAns]
    );

    const getUserMediaStream = useCallback(async() => {
        const stream = await navigator.mediaDevices.getUserMedia({audio: true, video: true})
        setMyStream(stream);
    }, []);

    const handlenegosiation = useCallback(() => {
        const localOffer = peer.localDescription;
        socket.emit('call-user', { emailId: remoteEmailId, offer: localOffer})
    }, [peer.localDescription, remoteEmailId, socket]);

    useEffect(() => {
    socket.on('user-joined', handleNewUserJoined);
    socket.on('incoming-call', handleIncomingCall);
    socket.on('call-accepted', handleCallAccepted);
    return () => {
        socket.off('user-joined', handleNewUserJoined);
        socket.off('incoming-call', handleIncomingCall);
        socket.off('call-accpeted', handleCallAccepted);
    }
 }, [handleCallAccepted, handleIncomingCall, handleNewUserJoined, socket])
    
//negotiationneeded
 useEffect(() => {
    peer.addEventListener("negotiationneeded", handlenegosiation);
    return ()=> {
        peer.removeEventListener("negotiationneeded", handlenegosiation);
    }
 }, [handlenegosiation, peer])
 
 useEffect(() => {
        getUserMediaStream();
    },[getUserMediaStream])
  
    return (
        <div className="room-page-container">
            <h1>Room Page</h1>
            <h4>You are connected to {remoteEmailId}</h4>
            <button onClick={(e) => sendStream(myStream)}>Send My video</button>
            <ReactPlayer url={myStream} playing/>
            <ReactPlayer url={remoteStream} playing/>
        </div>
    )
}

export default RoomPage;