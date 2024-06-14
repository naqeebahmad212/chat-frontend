import { io } from 'socket.io-client';

const socket = io('localhost:5000',{
    timeout: 20000, // Set the timeout for the client to 20 seconds
    reconnectionDelayMax: 10000, // Maximum delay between reconnection attempts
});

export default socket;