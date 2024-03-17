import React, {useState, useEffect, useCallback} from "react";
import {useSocket} from "../providers/Socket";
import {useNavigate} from "react-router-dom"; 

const Homepage = () => {
    const {socket} = useSocket();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [roomId, setRoomId] = useState('');

    const handleRoomJoined = useCallback(({ roomId }) => {
        navigate(`/room/${roomId}`)
    }, [navigate]);

    useEffect(()=> {
            socket.on('joined-room', handleRoomJoined);
            return() => {
                socket.off("joined-room", handleRoomJoined);
            }
    }, [handleRoomJoined, socket]);

    const handleJoinRoom = () => {
       socket.emit("join-room", {emailId: email, roomId}); 
       console.log(socket);
    };

    return (
        <div className="homepage-container">
            <div className="input-container">
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email here" />
                <input value={roomId} onChange={e => setRoomId(e.target.value)} placeholder="Enter Room Code" />
                <button onClick={handleJoinRoom}>Enter Room </button>
            </div>
        </div>
    )
}

export default Homepage;