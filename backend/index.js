const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: ['http://localhost:5173', 'https://pixematch.vercel.app', 'http://13.62.56.87:3001'], 
  credentials: true
}));

const io = socketIo(server, {
  cors: {
    origin: ['http://localhost:5173', 'https://pixematch.vercel.app', 'http://13.62.56.87:3001'], 
    methods: ["GET", "POST"],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

app.use(express.json());

// Simplified queue system - just one queue for everyone
const waitingQueue = [];

const activeMatches = new Map();

// Separate storage for video chat users and browsing users
const videoChatUsers = new Map(); // Users in video chat
const browsingUsers = new Map(); // Users just browsing/on matching page

// Friend request system
const friendRequests = new Map(); // requestId -> request data
const userSockets = new Map(); // userId -> socketId
const blockedPairs = new Set(); // Set of "userId1:userId2" pairs

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle browsing presence (for showing in matching list)
  socket.on('register-presence', (userData) => {
    const { name, age, gender, interests, values, personalityTags, bio, country, flag, mode } = userData;
    
    browsingUsers.set(socket.id, {
      id: socket.id,
      name,
      age: age || 25,
      gender: gender || 'other',
      interests: interests || [],
      values: values || [],
      personalityTags: personalityTags || [],
      bio: bio || `Hi, I'm ${name}!`,
      country: country || 'Unknown',
      flag: flag || '🌍',
      mode: mode || 'friendship',
      lastSeen: Date.now()
    });

    console.log(`User ${name} registered presence (browsing)`);
  });

  // Handle video chat join (existing functionality)
  socket.on('join', (userData) => {
    const { name, age, gender, interests, values, personalityTags, bio, country, flag, mode } = userData;
    
    if (!name || !age || !gender) {
      socket.emit('error', { message: 'Invalid user data' });
      return;
    }

    // Remove from browsing users if they were there
    browsingUsers.delete(socket.id);

    // Add to video chat users
    videoChatUsers.set(socket.id, {
      id: socket.id,
      name,
      age,
      gender: gender.toLowerCase(),
      interests: interests || [],
      values: values || [],
      personalityTags: personalityTags || [],
      bio: bio || '',
      country: country || 'Unknown',
      flag: flag || '🌍',
      mode: mode || 'friendship'
    });

    console.log(`User ${name} (${gender}) joined video chat`);

    addToQueueAndMatch(socket);
  });

  socket.on('offer', (data) => {
    const match = activeMatches.get(socket.id);
    if (match && match.partnerId) {
      io.to(match.partnerId).emit('offer', {
        offer: data.offer,
        from: socket.id
      });
    }
  });

  socket.on('answer', (data) => {
    const match = activeMatches.get(socket.id);
    if (match && match.partnerId) {
      io.to(match.partnerId).emit('answer', {
        answer: data.answer,
        from: socket.id
      });
    }
  });

  socket.on('ice-candidate', (data) => {
    const match = activeMatches.get(socket.id);
    if (match && match.partnerId) {
      io.to(match.partnerId).emit('ice-candidate', {
        candidate: data.candidate,
        from: socket.id
      });
    }
  });

  socket.on('chat-message', (message) => {
    console.log('Received chat message from', socket.id, ':', message);
    const match = activeMatches.get(socket.id);
    if (match && match.partnerId) {
      const user = videoChatUsers.get(socket.id);
      if (user) {
        console.log('Forwarding message to partner', match.partnerId);
        io.to(match.partnerId).emit('chat-message', {
          message,
          from: user.name,
          timestamp: Date.now()
        });
      } else {
        console.log('User not found in videoChatUsers');
      }
    } else {
      console.log('No active match found for', socket.id);
    }
  });

  socket.on('stop', () => {
    handleStop(socket);
  });

  // Friend Request System
  socket.on('register-friend-system', ({ userId }) => {
    userSockets.set(userId, socket.id);
    console.log(`User ${userId} registered for friend requests`);
  });

  socket.on('send-friend-request', ({ fromUserId, toUserId, toUserName, toUserAge }) => {
    const pairKey = `${fromUserId}:${toUserId}`;
    const reversePairKey = `${toUserId}:${fromUserId}`;
    
    // Check if users are blocked
    if (blockedPairs.has(pairKey) || blockedPairs.has(reversePairKey)) {
      console.log('Users are blocked from matching');
      return;
    }

    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fromUser = browsingUsers.get(userSockets.get(fromUserId)) || videoChatUsers.get(userSockets.get(fromUserId));
    
    if (!fromUser) return;

    const request = {
      id: requestId,
      fromUserId,
      fromUserName: fromUser.name,
      fromUserAge: fromUser.age,
      fromUserInterests: fromUser.interests || [],
      toUserId,
      timestamp: Date.now(),
      status: 'pending'
    };

    friendRequests.set(requestId, request);

    // Send to recipient
    const toSocketId = userSockets.get(toUserId);
    if (toSocketId) {
      io.to(toSocketId).emit('friend-request-received', request);
    }
  });

  socket.on('accept-friend-request', ({ requestId }) => {
    const request = friendRequests.get(requestId);
    if (!request) return;

    request.status = 'accepted';
    
    // Create a room for them
    const roomId = `room_${Date.now()}`;
    
    // Notify both users
    const fromSocketId = userSockets.get(request.fromUserId);
    const toSocketId = socket.id;
    
    if (fromSocketId) {
      io.to(fromSocketId).emit('friend-request-accepted', { requestId, roomId });
    }
    io.to(toSocketId).emit('friend-request-accepted', { requestId, roomId });

    // Clean up request
    friendRequests.delete(requestId);
  });

  socket.on('cancel-friend-request', ({ requestId }) => {
    const request = friendRequests.get(requestId);
    if (!request) return;

    request.status = 'cancelled';
    
    // Block this pair from future matching
    const pairKey = `${request.fromUserId}:${request.toUserId}`;
    blockedPairs.add(pairKey);
    
    // Notify the other user
    const fromSocketId = userSockets.get(request.fromUserId);
    if (fromSocketId) {
      io.to(fromSocketId).emit('friend-request-cancelled', { 
        requestId, 
        userId: request.toUserId 
      });
    }

    // Clean up request
    friendRequests.delete(requestId);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    handleDisconnect(socket);
    // Also remove from browsing users
    browsingUsers.delete(socket.id);
  });
});

function addToQueueAndMatch(socket) {
  const user = videoChatUsers.get(socket.id);
  if (!user) return;

  removeFromQueues(socket.id);
  removeFromMatch(socket.id);

  // Simple matching: if someone is waiting, match them
  if (waitingQueue.length > 0) {
    const partnerId = waitingQueue.shift();
    const partnerSocket = io.sockets.sockets.get(partnerId);
    
    if (partnerSocket) {
      createMatch(socket, partnerSocket);
    } else {
      // Partner disconnected, try next in queue
      if (waitingQueue.length > 0) {
        addToQueueAndMatch(socket);
      } else {
        waitingQueue.push(socket.id);
        socket.emit('waiting', { queuePosition: waitingQueue.length });
      }
    }
  } else {
    // No one waiting, add to queue
    waitingQueue.push(socket.id);
    socket.emit('waiting', { queuePosition: waitingQueue.length });
  }
}

function createMatch(socket1, socket2) {
  const user1 = videoChatUsers.get(socket1.id);
  const user2 = videoChatUsers.get(socket2.id);

  activeMatches.set(socket1.id, {
    partnerId: socket2.id,
    startTime: Date.now()
  });
  
  activeMatches.set(socket2.id, {
    partnerId: socket1.id,
    startTime: Date.now()
  });

  socket1.emit('matched', {
    partner: {
      name: user2.name,
      age: user2.age
    },
    initiator: true
  });

  socket2.emit('matched', {
    partner: {
      name: user1.name,
      age: user1.age
    },
    initiator: false
  });

  console.log(`Matched: ${user1.name} with ${user2.name}`);
}

function handleStop(socket) {
  const match = activeMatches.get(socket.id);
  
  if (match && match.partnerId) {
    const partnerSocket = io.sockets.sockets.get(match.partnerId);
    
    if (partnerSocket) {
      io.to(match.partnerId).emit('partner-disconnected');
      
      setTimeout(() => {
        if (io.sockets.sockets.get(match.partnerId)) {
          addToQueueAndMatch(partnerSocket);
        }
      }, 1000);
    }
    
    activeMatches.delete(socket.id);
    activeMatches.delete(match.partnerId);
  }
  
  addToQueueAndMatch(socket);
}

function handleDisconnect(socket) {
  const match = activeMatches.get(socket.id);
  
  if (match && match.partnerId) {
    io.to(match.partnerId).emit('partner-disconnected');
    activeMatches.delete(match.partnerId);
    
    const partnerSocket = io.sockets.sockets.get(match.partnerId);
    if (partnerSocket) {
      setTimeout(() => {
        if (io.sockets.sockets.get(match.partnerId)) {
          addToQueueAndMatch(partnerSocket);
        }
      }, 1000);
    }
  }
  
  removeFromQueues(socket.id);
  activeMatches.delete(socket.id);
  videoChatUsers.delete(socket.id);
}

function removeFromQueues(socketId) {
  const index = waitingQueue.indexOf(socketId);
  if (index > -1) waitingQueue.splice(index, 1);
}

function removeFromMatch(socketId) {
  const match = activeMatches.get(socketId);
  if (match && match.partnerId) {
    activeMatches.delete(match.partnerId);
  }
  activeMatches.delete(socketId);
}

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    activeUsers: videoChatUsers.size,
    browsingUsers: browsingUsers.size,
    totalUsers: videoChatUsers.size + browsingUsers.size,
    activeMatches: activeMatches.size / 2,
    waitingQueue: waitingQueue.length,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/stats', (req, res) => {
  res.json({
    totalUsers: videoChatUsers.size + browsingUsers.size,
    videoChatUsers: videoChatUsers.size,
    browsingUsers: browsingUsers.size,
    activeMatches: activeMatches.size / 2,
    waitingQueue: waitingQueue.length
  });
});

app.get('/api/users', (req, res) => {
  // Combine both browsing and video chat users
  const allUsers = [];
  
  // Add browsing users
  browsingUsers.forEach(user => {
    allUsers.push({
      id: user.id,
      name: user.name,
      age: user.age,
      gender: user.gender,
      online: true,
      interests: user.interests || [],
      values: user.values || [],
      personalityTags: user.personalityTags || [],
      bio: user.bio || '',
      country: user.country || 'Unknown',
      flag: user.flag || '🌍',
      mode: user.mode || 'friendship',
      status: 'browsing'
    });
  });
  
  // Add video chat users
  videoChatUsers.forEach(user => {
    allUsers.push({
      id: user.id,
      name: user.name,
      age: user.age,
      gender: user.gender,
      online: true,
      interests: user.interests || [],
      values: user.values || [],
      personalityTags: user.personalityTags || [],
      bio: user.bio || '',
      country: user.country || 'Unknown',
      flag: user.flag || '🌍',
      mode: user.mode || 'friendship',
      status: 'in-chat'
    });
  });
  
  res.json(allUsers);
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 WebRTC Signaling Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📈 Stats API: http://localhost:${PORT}/api/stats`);
});