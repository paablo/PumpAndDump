import React from 'react';
import { Button, TextField } from '@material-ui/core';


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
        socket.current.emit('join_room', { room, name });
        setLoggedIn(true);
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
                <div className="rules-card">
                    <div className="rules-header">
                        <h2>🎮 How to Play</h2>
                    </div>
                    
                    <div className="rules-content">
                        <div className="rule-section">
                            <h3>🎯 Objective</h3>
                            <p>Buy stocks low, manipulate the market with events, and sell high to become the wealthiest trader!</p>
                        </div>

                        <div className="rule-section">
                            <h3>📊 Game Flow</h3>
                            <ul className="rules-list">
                                <li>Each round, players take turns making decisions</li>
                                <li>Buy stocks from the available market offerings</li>
                                <li>Watch as random events affect market indexes</li>
                                <li>Stock prices are tied to their sector's index</li>
                                <li>Sell your stocks when the price is right</li>
                            </ul>
                        </div>

                        <div className="rule-section">
                            <h3>💰 Market Mechanics</h3>
                            <ul className="rules-list">
                                <li><strong>Indexes:</strong> Track sector performance (Tech, Finance, Industrial, Health)</li>
                                <li><strong>Events:</strong> Random occurrences that change index prices</li>
                                <li><strong>Stocks:</strong> Each has dividends and growth rates</li>
                                <li><strong>Price Formula:</strong> Stock cost = Base + (Index - 10)</li>
                            </ul>
                        </div>

                        <div className="rule-section">
                            <h3>🏆 Winning</h3>
                            <p>The player with the most cash at the end of the game wins!</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default LoginPage;

