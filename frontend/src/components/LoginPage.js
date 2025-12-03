import React from 'react';
import { Button, TextField } from '@material-ui/core';
import GameRules from './GameRules';


const LoginPage = ({ socket, setLoggedIn, name, setName, room, setRoom }) => {

    const nameChangeHandler = (e) => {
        setName(e.target.value);
    };
    const roomChangeHandler = (e) => {
        setRoom(e.target.value);
    };

    const joinRoomHandler = () => {
        if (!name.trim()) {
            alert('Please enter your name');
            return;
        }
        if (!room.trim()) {
            alert('Please enter a room ID');
            return;
        }
        
        // Check if socket is connected
        if (!socket.current || !socket.current.connected) {
            alert('Not connected to server. Please wait and try again.');
            return;
        }
        
        // Only set loggedIn to true after server confirms join
        // Listen for player_count or player_names as confirmation
        let hasConfirmed = false;
        const handleJoinConfirmation = () => {
            if (!hasConfirmed) {
                hasConfirmed = true;
                setLoggedIn(true);
                socket.current.off('player_count', handleJoinConfirmation);
                socket.current.off('player_names', handleJoinConfirmation);
            }
        };
        
        // Set a timeout in case server doesn't respond
        const timeout = setTimeout(() => {
            if (!hasConfirmed) {
                socket.current.off('player_count', handleJoinConfirmation);
                socket.current.off('player_names', handleJoinConfirmation);
                alert('Failed to join room. Please check your connection and try again.');
            }
        }, 5000);
        
        const handleConfirmationWithTimeout = () => {
            clearTimeout(timeout);
            handleJoinConfirmation();
        };
        
        socket.current.once('player_count', handleConfirmationWithTimeout);
        socket.current.once('player_names', handleConfirmationWithTimeout);
        socket.current.emit('join_room', { room, name });
    };

    return (
        <div className="login-page">
            <div className="login-container">
                {/* Login Card */}
                <div className="login-card">
                    <div className="login-header">
                        <div className="logo">
                            <span className="logo-icon">📈</span>
                            <h1 className="logo-text">Pump & Dump</h1>
                        </div>
                        <p className="subtitle">The Stock Market Strategy Game</p>
                    </div>
                    
                    <div className="login-form">
                        <TextField
                            value={name}
                            onChange={nameChangeHandler}
                            className='login-textfield'
                            variant='outlined'
                            label='Your Name'
                            placeholder='Enter your name'
                            inputProps={{ maxLength: 25 }}
                            fullWidth
                        />
                        <TextField
                            value={room}
                            onChange={roomChangeHandler}
                            className='login-textfield'
                            variant='outlined'
                            label='Room Code'
                            placeholder='Enter or create room code'
                            inputProps={{ maxLength: 25 }}
                            fullWidth
                        />
                        <Button 
                            color="primary" 
                            variant="contained" 
                            onClick={joinRoomHandler}
                            className="join-button"
                            size="large"
                            fullWidth
                        >
                            Join Game
                        </Button>
                    </div>

                    <div className="login-footer">
                        <p>💡 Create a new room or join an existing one</p>
                    </div>
                </div>

                {/* How to Play Card */}
                <GameRules variant="card" />
            </div>
        </div>
    )
};

export default LoginPage;

